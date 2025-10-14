const express = require('express');
const { authenticate, resourceOwner } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { ticketValidation } = require('../utils/validation');
const {
    bookTicket,
    getUserTickets,
    getTicketDetails,
    updateTicketStatus,
    checkIn,
    rateService
} = require('../controllers/ticketController');

const router = express.Router();

/**
 * @route   POST /api/tickets/book
 * @desc    Book a ticket for a hospital counter and time slot
 * @access  Private
 */
router.post('/book',
    authenticate,
    validate(ticketValidation.bookTicket),
    bookTicket
);

/**
 * @route   GET /api/tickets/:user_id
 * @desc    Get all tickets for a particular user
 * @access  Private (user can only access their own tickets)
 * @params  status, hospital, startDate, endDate, limit, page
 */
router.get('/:user_id',
    authenticate,
    resourceOwner('user_id'),
    validate(ticketValidation.getUserTickets, 'params'),
    getUserTickets
);

/**
 * @route   GET /api/tickets/details/:id
 * @desc    Get detailed information about a specific ticket
 * @access  Private (user can only access their own tickets)
 */
router.get('/details/:id',
    authenticate,
    getTicketDetails
);

/**
 * @route   PUT /api/tickets/:id/status
 * @desc    Update ticket status (confirm, cancel, complete, etc.)
 * @access  Private
 */
router.put('/:id/status',
    authenticate,
    validate(ticketValidation.updateTicketStatus),
    updateTicketStatus
);

/**
 * @route   POST /api/tickets/:id/checkin
 * @desc    Check-in for an appointment
 * @access  Private
 */
router.post('/:id/checkin',
    authenticate,
    validate(ticketValidation.checkIn, 'params'),
    checkIn
);

/**
 * @route   POST /api/tickets/:id/rating
 * @desc    Rate the service after appointment completion
 * @access  Private
 */
router.post('/:id/rating',
    authenticate,
    validate(ticketValidation.rateService),
    rateService
);

module.exports = router;
