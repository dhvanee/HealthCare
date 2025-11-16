import { ticketService as apiTicketService } from './api';

/**
 * Ticket/Booking Service
 * Handles all ticket booking and management operations
 */

/**
 * Book an appointment at a hospital
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.hospitalId - Hospital ID (MongoDB ObjectId)
 * @param {string} bookingData.counterId - Counter ID (MongoDB ObjectId)
 * @param {string} bookingData.appointmentDateTime - Appointment date and time (ISO format)
 * @param {string} bookingData.reasonForVisit - Reason for the visit (max 500 chars)
 * @param {string[]} bookingData.symptoms - Array of symptoms
 * @param {string} bookingData.patientType - Patient type: 'new', 'follow_up', 'emergency'
 * @param {string} bookingData.priority - Priority level: 'low', 'normal', 'high', 'emergency'
 * @param {Object} bookingData.insurance - Insurance information
 * @returns {Promise<Object>} Booking response with ticket details
 */
export const bookAppointment = async (bookingData) => {
  try {
    const response = await apiTicketService.bookTicket(bookingData);
    return response;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

/**
 * Get all tickets for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @param {string|string[]} filters.status - Ticket status(es) to filter by
 * @param {string} filters.hospitalId - Hospital ID to filter by
 * @param {string} filters.startDate - Start date for filtering
 * @param {string} filters.endDate - End date for filtering
 * @param {number} filters.limit - Number of results per page
 * @param {number} filters.page - Page number
 * @returns {Promise<Object>} User tickets
 */
export const getUserTickets = async (userId, filters = {}) => {
  try {
    const response = await apiTicketService.getUserTickets(userId, filters);
    return response;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific ticket
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Object>} Ticket details
 */
export const getTicketDetails = async (ticketId) => {
  try {
    const response = await apiTicketService.getTicketDetails(ticketId);
    return response;
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
};

/**
 * Update appointment date/time and details
 * @param {string} ticketId - Ticket ID
 * @param {Object} appointmentData - Appointment update data
 * @param {string} appointmentData.appointmentDateTime - New appointment date and time (ISO format)
 * @param {string} appointmentData.reasonForVisit - Updated reason for visit
 * @param {string[]} appointmentData.symptoms - Updated symptoms array
 * @returns {Promise<Object>} Update response
 */
export const updateAppointment = async (ticketId, appointmentData) => {
  try {
    const response = await apiTicketService.updateAppointment(ticketId, appointmentData);
    return response;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

/**
 * Update ticket status
 * @param {string} ticketId - Ticket ID
 * @param {Object} statusData - Status update data
 * @param {string} statusData.status - New status: 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
 * @param {string} statusData.cancellationReason - Required if status is 'cancelled'
 * @param {Object} statusData.notes - Optional notes
 * @returns {Promise<Object>} Update response
 */
export const updateTicketStatus = async (ticketId, statusData) => {
  try {
    const response = await apiTicketService.updateTicketStatus(ticketId, statusData);
    return response;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

/**
 * Cancel an appointment
 * @param {string} ticketId - Ticket ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelAppointment = async (ticketId, reason) => {
  try {
    const response = await apiTicketService.cancelAppointment(ticketId, reason);
    return response;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

/**
 * Check in for an appointment
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Object>} Check-in response
 */
export const checkInForAppointment = async (ticketId) => {
  try {
    const response = await apiTicketService.checkIn(ticketId);
    return response;
  } catch (error) {
    console.error('Error checking in:', error);
    throw error;
  }
};

/**
 * Rate service after appointment completion
 * @param {string} ticketId - Ticket ID
 * @param {Object} ratingData - Rating information
 * @param {number} ratingData.serviceRating - Service rating (1-5)
 * @param {number} ratingData.doctorRating - Doctor rating (1-5)
 * @param {number} ratingData.facilityRating - Facility rating (1-5)
 * @param {number} ratingData.overallRating - Overall rating (1-5) - Required
 * @param {string} ratingData.feedback - Optional feedback (max 1000 chars)
 * @returns {Promise<Object>} Rating response
 */
export const rateService = async (ticketId, ratingData) => {
  try {
    const response = await apiTicketService.rateService(ticketId, ratingData);
    return response;
  } catch (error) {
    console.error('Error rating service:', error);
    throw error;
  }
};

export default {
  bookAppointment,
  getUserTickets,
  getTicketDetails,
  updateAppointment,
  updateTicketStatus,
  cancelAppointment,
  checkInForAppointment,
  rateService,
};
