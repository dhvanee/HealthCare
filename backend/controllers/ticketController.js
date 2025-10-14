const Ticket = require('../database/models/Ticket');
const Hospital = require('../database/models/Hospital');
const User = require('../database/models/User');
const mlService = require('../services/mlService');
const { sanitize } = require('../utils/validation');

/**
 * Book Ticket Controller
 * POST /api/tickets/book
 */
const bookTicket = async (req, res) => {
    try {
        const userId = req.user._id;
        const ticketData = sanitize.object(req.body);

        const {
            hospitalId,
            counterId,
            appointmentDateTime,
            reasonForVisit,
            symptoms = [],
            patientType = 'new',
            priority = 'normal',
            insurance = {}
        } = ticketData;

        // Verify hospital exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        if (!hospital.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Hospital is currently inactive'
            });
        }

        // Verify counter exists
        const counter = hospital.counters.id(counterId);
        if (!counter) {
            return res.status(404).json({
                success: false,
                message: 'Counter not found'
            });
        }

        if (!counter.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Counter is currently inactive'
            });
        }

        // Validate appointment time
        const appointmentTime = new Date(appointmentDateTime);
        const now = new Date();
        const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

        if (appointmentTime < minTime) {
            return res.status(400).json({
                success: false,
                message: 'Appointment time must be at least 30 minutes from now'
            });
        }

        // Check if appointment is within counter working hours
        const appointmentHour = appointmentTime.getHours();
        const startHour = parseInt(counter.workingHours.start.split(':')[0]);
        const endHour = parseInt(counter.workingHours.end.split(':')[0]);

        if (appointmentHour < startHour || appointmentHour >= endHour) {
            return res.status(400).json({
                success: false,
                message: `Appointment must be between ${counter.workingHours.start} and ${counter.workingHours.end}`
            });
        }

        // Check for existing appointments at the same time
        const existingAppointment = await Ticket.findOne({
            user: userId,
            appointmentDateTime: {
                $gte: new Date(appointmentTime.getTime() - 30 * 60000), // 30 minutes before
                $lte: new Date(appointmentTime.getTime() + 30 * 60000)  // 30 minutes after
            },
            status: { $in: ['booked', 'confirmed', 'in_progress'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'You already have an appointment around this time'
            });
        }

        // Get wait time prediction
        let estimatedWaitTime = counter.averageServiceTime * counter.currentQueueLength;

        try {
            const prediction = await mlService.predictWaitTime({
                hospitalId,
                counterId,
                currentQueueLength: counter.currentQueueLength,
                timeOfDay: appointmentTime.getHours(),
                dayOfWeek: appointmentTime.getDay(),
                counterType: counter.type,
                doctorAvailable: true,
                weatherCondition: 'clear',
                isHoliday: isHoliday(appointmentTime)
            });

            if (prediction.success) {
                estimatedWaitTime = prediction.waitTime;
            }
        } catch (predictionError) {
            console.error('Prediction error during booking:', predictionError);
        }

        // Create ticket
        const ticket = new Ticket({
            user: userId,
            hospital: hospitalId,
            counter: counterId,
            appointmentDateTime: appointmentTime,
            reasonForVisit,
            symptoms,
            patientType,
            priority,
            estimatedWaitTime,
            insurance: {
                hasInsurance: insurance.hasInsurance || false,
                provider: insurance.provider,
                policyNumber: insurance.policyNumber
            },
            consultationFee: {
                amount: getConsultationFee(counter.type, patientType),
                currency: 'INR'
            }
        });

        await ticket.save();

        // Update counter queue length
        counter.currentQueueLength += 1;
        await hospital.save();

        // Populate ticket data for response
        await ticket.populate([
            {
                path: 'user',
                select: 'name phone email'
            },
            {
                path: 'hospital',
                select: 'name address phone'
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Ticket booked successfully',
            data: {
                ticket,
                counter: {
                    name: counter.name,
                    type: counter.type,
                    department: counter.department
                },
                recommendations: {
                    arrivalTime: new Date(appointmentTime.getTime() - 15 * 60000).toISOString(),
                    estimatedServiceTime: counter.averageServiceTime,
                    documentsNeeded: getRequiredDocuments(counter.type, patientType)
                }
            }
        });

    } catch (error) {
        console.error('Book ticket error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to book ticket'
        });
    }
};

/**
 * Get User Tickets Controller
 * GET /api/tickets/:user_id
 */
const getUserTickets = async (req, res) => {
    try {
        const { user_id } = req.params;
        const {
            status,
            hospital,
            startDate,
            endDate,
            limit = 50,
            page = 1
        } = req.query;

        // Check if user is accessing their own tickets or is admin
        if (req.user._id.toString() !== user_id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own tickets.'
            });
        }

        const query = { user: user_id };

        // Apply filters
        if (status) {
            query.status = Array.isArray(status)
                ? { $in: status }
                : status;
        }

        if (hospital) {
            query.hospital = hospital;
        }

        if (startDate || endDate) {
            query.appointmentDateTime = {};
            if (startDate) query.appointmentDateTime.$gte = new Date(startDate);
            if (endDate) query.appointmentDateTime.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [tickets, total] = await Promise.all([
            Ticket.find(query)
                .populate('hospital', 'name address phone type')
                .sort({ appointmentDateTime: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Ticket.countDocuments(query)
        ]);

        // Add counter information and additional computed fields
        const ticketsWithDetails = tickets.map(ticket => {
            const hospital = ticket.hospital;
            const counter = hospital.counters?.find(c => c._id.toString() === ticket.counter.toString());

            return {
                ...ticket,
                counter: counter ? {
                    id: counter._id,
                    name: counter.name,
                    type: counter.type,
                    department: counter.department
                } : null,
                canBeCancelled: canTicketBeCancelled(ticket),
                canCheckIn: canTicketCheckIn(ticket),
                timeUntilAppointment: getTimeUntilAppointment(ticket.appointmentDateTime),
                status: getTicketStatus(ticket)
            };
        });

        res.json({
            success: true,
            message: 'User tickets retrieved successfully',
            data: {
                tickets: ticketsWithDetails,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / parseInt(limit)),
                    count: ticketsWithDetails.length,
                    totalRecords: total
                },
                summary: {
                    upcoming: tickets.filter(t => new Date(t.appointmentDateTime) > new Date() && t.status !== 'cancelled').length,
                    completed: tickets.filter(t => t.status === 'completed').length,
                    cancelled: tickets.filter(t => t.status === 'cancelled').length
                }
            }
        });

    } catch (error) {
        console.error('Get user tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve tickets'
        });
    }
};

/**
 * Get Ticket Details Controller
 * GET /api/tickets/details/:id
 */
const getTicketDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await Ticket.findById(id)
            .populate('user', 'name phone email')
            .populate('hospital', 'name address phone counters')
            .lean();

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check access permissions
        if (req.user._id.toString() !== ticket.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get counter details
        const counter = ticket.hospital.counters.find(c => c._id.toString() === ticket.counter.toString());

        // Add computed fields
        const ticketDetails = {
            ...ticket,
            counter: counter ? {
                id: counter._id,
                name: counter.name,
                type: counter.type,
                department: counter.department,
                workingHours: counter.workingHours
            } : null,
            canBeCancelled: canTicketBeCancelled(ticket),
            canCheckIn: canTicketCheckIn(ticket),
            timeUntilAppointment: getTimeUntilAppointment(ticket.appointmentDateTime),
            status: getTicketStatus(ticket),
            qrCode: generateQRCodeData(ticket)
        };

        res.json({
            success: true,
            message: 'Ticket details retrieved successfully',
            data: { ticket: ticketDetails }
        });

    } catch (error) {
        console.error('Get ticket details error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve ticket details'
        });
    }
};

/**
 * Update Ticket Status Controller
 * PUT /api/tickets/:id/status
 */
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancellationReason, notes } = req.body;

        const ticket = await Ticket.findById(id)
            .populate('hospital', 'counters');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check permissions
        if (req.user._id.toString() !== ticket.user.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Validate status transition
        if (!isValidStatusTransition(ticket.status, status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${ticket.status} to ${status}`
            });
        }

        // Handle cancellation
        if (status === 'cancelled') {
            if (!canTicketBeCancelled(ticket)) {
                return res.status(400).json({
                    success: false,
                    message: 'This ticket cannot be cancelled'
                });
            }

            ticket.cancellationReason = cancellationReason;
            ticket.cancelledAt = new Date();
            ticket.cancelledBy = req.user._id;

            // Update counter queue length
            const counter = ticket.hospital.counters.id(ticket.counter);
            if (counter && counter.currentQueueLength > 0) {
                counter.currentQueueLength -= 1;
                await ticket.hospital.save();
            }
        }

        // Handle completion
        if (status === 'completed') {
            ticket.serviceEndTime = new Date();
            if (ticket.serviceStartTime) {
                ticket.actualWaitTime = Math.round(
                    (ticket.serviceEndTime - ticket.serviceStartTime) / (1000 * 60)
                );
            }
        }

        // Handle in-progress
        if (status === 'in_progress') {
            ticket.serviceStartTime = new Date();
        }

        ticket.status = status;

        if (notes) {
            ticket.notes = { ...ticket.notes, ...notes };
        }

        await ticket.save();

        await ticket.populate('user', 'name phone email');

        res.json({
            success: true,
            message: 'Ticket status updated successfully',
            data: { ticket }
        });

    } catch (error) {
        console.error('Update ticket status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update ticket status'
        });
    }
};

/**
 * Check-in Controller
 * POST /api/tickets/:id/checkin
 */
const checkIn = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check permissions
        if (req.user._id.toString() !== ticket.user.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (ticket.isCheckedIn) {
            return res.status(400).json({
                success: false,
                message: 'Already checked in'
            });
        }

        if (!canTicketCheckIn(ticket)) {
            return res.status(400).json({
                success: false,
                message: 'Check-in not allowed at this time'
            });
        }

        ticket.isCheckedIn = true;
        ticket.checkInTime = new Date();
        ticket.status = 'confirmed';

        await ticket.save();

        res.json({
            success: true,
            message: 'Checked in successfully',
            data: { ticket }
        });

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Check-in failed'
        });
    }
};

/**
 * Rate Service Controller
 * POST /api/tickets/:id/rating
 */
const rateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceRating, doctorRating, facilityRating, overallRating, feedback } = req.body;

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check permissions
        if (req.user._id.toString() !== ticket.user.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (ticket.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only rate completed appointments'
            });
        }

        ticket.rating = {
            serviceRating,
            doctorRating,
            facilityRating,
            overallRating,
            feedback,
            ratedAt: new Date()
        };

        await ticket.save();

        res.json({
            success: true,
            message: 'Rating submitted successfully',
            data: { rating: ticket.rating }
        });

    } catch (error) {
        console.error('Rate service error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating'
        });
    }
};

/**
 * Helper Functions
 */

// Get consultation fee based on counter type and patient type
function getConsultationFee(counterType, patientType) {
    const baseFees = {
        'OPD': 500,
        'General': 300,
        'Emergency': 1000,
        'Specialist': 800,
        'Pharmacy': 0,
        'Lab': 200,
        'Radiology': 600,
        'Billing': 0
    };

    let fee = baseFees[counterType] || 300;

    if (patientType === 'follow_up') {
        fee *= 0.7; // 30% discount for follow-up
    }

    return Math.round(fee);
}

// Get required documents based on counter type and patient type
function getRequiredDocuments(counterType, patientType) {
    const documents = ['Valid ID proof', 'Insurance card (if applicable)'];

    if (patientType === 'new') {
        documents.push('Previous medical records (if any)');
    } else if (patientType === 'follow_up') {
        documents.push('Previous prescription');
        documents.push('Test reports (if any)');
    }

    if (counterType === 'Emergency') {
        documents.push('Emergency contact information');
    }

    return documents;
}

// Check if ticket can be cancelled
function canTicketBeCancelled(ticket) {
    if (ticket.status === 'cancelled' || ticket.status === 'completed') {
        return false;
    }

    const now = new Date();
    const appointmentTime = new Date(ticket.appointmentDateTime);
    const timeDiff = appointmentTime - now;

    // Allow cancellation up to 30 minutes before appointment
    return timeDiff > (30 * 60 * 1000);
}

// Check if patient can check in
function canTicketCheckIn(ticket) {
    if (ticket.isCheckedIn || ticket.status !== 'booked') {
        return false;
    }

    const now = new Date();
    const appointmentTime = new Date(ticket.appointmentDateTime);
    const timeDiff = appointmentTime - now;

    // Allow check-in 30 minutes before and 15 minutes after appointment time
    return timeDiff >= -(15 * 60 * 1000) && timeDiff <= (30 * 60 * 1000);
}

// Get time until appointment in minutes
function getTimeUntilAppointment(appointmentDateTime) {
    const now = new Date();
    const appointmentTime = new Date(appointmentDateTime);
    const diffMs = appointmentTime - now;

    if (diffMs <= 0) return 0;
    return Math.round(diffMs / (1000 * 60));
}

// Get ticket status with additional logic
function getTicketStatus(ticket) {
    const now = new Date();
    const appointmentTime = new Date(ticket.appointmentDateTime);

    if (ticket.status === 'cancelled') return 'cancelled';
    if (ticket.status === 'completed') return 'completed';
    if (ticket.status === 'no_show') return 'no_show';

    if (appointmentTime < now) {
        if (ticket.status === 'booked' || ticket.status === 'confirmed') {
            return 'overdue';
        }
    }

    return ticket.status;
}

// Validate status transitions
function isValidStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
        'booked': ['confirmed', 'cancelled', 'no_show'],
        'confirmed': ['in_progress', 'cancelled', 'no_show'],
        'in_progress': ['completed', 'cancelled'],
        'completed': [], // No transitions from completed
        'cancelled': [], // No transitions from cancelled
        'no_show': []    // No transitions from no_show
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
}

// Generate QR code data
function generateQRCodeData(ticket) {
    return {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        userId: ticket.user._id,
        hospitalId: ticket.hospital._id,
        appointmentDateTime: ticket.appointmentDateTime,
        checkInAllowed: canTicketCheckIn(ticket)
    };
}

// Check if a date is a holiday
function isHoliday(date) {
    const holidays = [
        '01-01', // New Year's Day
        '01-26', // Republic Day
        '08-15', // Independence Day
        '10-02', // Gandhi Jayanti
    ];

    const monthDay = (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    date.getDate().toString().padStart(2, '0');

    return holidays.includes(monthDay);
}

module.exports = {
    bookTicket,
    getUserTickets,
    getTicketDetails,
    updateTicketStatus,
    checkIn,
    rateService
};
