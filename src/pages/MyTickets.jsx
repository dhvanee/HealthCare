import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ticketService } from "../services/api";
import { updateAppointment } from "../services/ticketService";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, AlertCircle, Loader2 } from "lucide-react";
import BookingModal from "../components/booking/BookingModal";
import { storeHospitalWithSync } from "../services/hospitalCacheService";

const MyTickets = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modify appointment modal state
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch tickets on mount and when user changes
  useEffect(() => {
    if (user?._id) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ticketService.getUserTickets(user._id);
      
      if (response.success && response.data && response.data.tickets) {
        setTickets(response.data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Map backend status to frontend display status
  const mapStatus = (backendStatus) => {
    const statusMap = {
      'booked': 'upcoming',
      'confirmed': 'active',
      'in_progress': 'active',
      'completed': 'completed',
      'cancelled': 'canceled',
      'no_show': 'canceled'
    };
    return statusMap[backendStatus] || 'upcoming';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: "bg-primary/20",
        text: "text-primary",
        border: "border-primary/30",
        label: "Active",
      },
      completed: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30",
        label: "Completed",
      },
      upcoming: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
        label: "Upcoming",
      },
      canceled: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30",
        label: "Canceled",
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        {status === "active" && (
          <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
        )}
        {config.label}
      </span>
    );
  };

  const getTicketButton = (ticket) => {
    const displayStatus = mapStatus(ticket.status);
    
    switch (displayStatus) {
      case "active":
        return (
          <button className="w-full bg-primary/20 hover:bg-primary/30 text-primary py-2.5 text-sm font-semibold rounded-lg transition-colors border border-primary/30">
            View Live Status
          </button>
        );
      case "upcoming":
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleModifyTicket(ticket)}
              className="flex-1 bg-primary hover:bg-primary/90 text-background-dark font-semibold py-2.5 text-sm rounded-lg transition-colors"
            >
              Modify
            </button>
            <button 
              onClick={() => handleCancelTicket(ticket._id)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2.5 text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        );
      default:
        return (
          <button className="w-full bg-gray-700/50 hover:bg-gray-700/70 text-gray-400 py-2.5 text-sm font-medium rounded-lg transition-colors">
            View Details
          </button>
        );
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await ticketService.updateTicketStatus(ticketId, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by patient'
      });
      
      // Refresh tickets
      fetchTickets();
    } catch (err) {
      console.error('Error cancelling ticket:', err);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleModifyTicket = async (ticket) => {
    // Prepare hospital data from ticket
    const hospitalData = ticket.hospital ? {
      _id: ticket.hospital._id,
      id: ticket.hospital._id,
      name: ticket.hospital.name,
      address: ticket.hospital.address,
      phone: ticket.hospital.phone
    } : ticket.externalHospital ? {
      _id: ticket.externalHospital.id,
      id: ticket.externalHospital.id,
      name: ticket.externalHospital.name,
      address: ticket.externalHospital.address,
      phone: ticket.externalHospital.phone,
      location: ticket.externalHospital.location
    } : null;

    if (!hospitalData) {
      alert('Cannot modify appointment: Hospital information not available.');
      return;
    }

    // Store hospital with hybrid caching
    await storeHospitalWithSync(hospitalData);

    // Set selected ticket for modify modal
    setSelectedTicket(ticket);
    setIsModifyModalOpen(true);
  };

  const handleModifySuccess = async (bookingData) => {
    if (!selectedTicket) return;

    try {
      // Extract date and time from booking data
      const appointmentDate = new Date(bookingData.appointmentDateTime || bookingData.selectedDate + 'T' + bookingData.selectedTime);
      
      await updateAppointment(selectedTicket._id, {
        appointmentDateTime: appointmentDate.toISOString(),
        reasonForVisit: bookingData.reasonForVisit,
        symptoms: bookingData.symptoms || []
      });

      // Close modal and refresh tickets
      setIsModifyModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
      
      alert('Appointment updated successfully!');
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment. Please try again.');
    }
  };

  const closeModifyModal = () => {
    setIsModifyModalOpen(false);
    setSelectedTicket(null);
  };

  // Transform tickets to include display status
  const transformedTickets = tickets.map(ticket => {
    // Extract hospital name - check both hospital object and externalHospital object
    // Handle both populated hospital and externalHospital cases
    let hospitalName = 'Unknown Hospital';
    
    // Check if hospital is populated (internal hospital)
    if (ticket.hospital) {
      if (typeof ticket.hospital === 'object' && ticket.hospital.name) {
        hospitalName = ticket.hospital.name;
      } else if (typeof ticket.hospital === 'string') {
        // Hospital is just an ID, check externalHospital
        if (ticket.externalHospital && ticket.externalHospital.name) {
          hospitalName = ticket.externalHospital.name;
        }
      }
    } 
    // Check externalHospital (external hospitals)
    else if (ticket.externalHospital) {
      if (ticket.externalHospital.name && ticket.externalHospital.name !== 'Unknown Hospital') {
        hospitalName = ticket.externalHospital.name;
      }
    }
    
    // Extract hospital address
    let hospitalAddress = '';
    if (ticket.hospital && typeof ticket.hospital === 'object' && ticket.hospital.address) {
      hospitalAddress = ticket.hospital.address;
    } else if (ticket.externalHospital && ticket.externalHospital.address) {
      hospitalAddress = ticket.externalHospital.address;
    }
    
    return {
      ...ticket,
      displayStatus: mapStatus(ticket.status),
      displayDate: formatDate(ticket.appointmentDateTime),
      displayTime: formatTime(ticket.appointmentDateTime),
      hospitalName: hospitalName,
      hospitalAddress: hospitalAddress,
      counterName: ticket.counter?.name || ticket.counter?.type || 'General'
    };
  });

  const filteredTickets = transformedTickets.filter((ticket) =>
    filter === "all" ? true : ticket.displayStatus === filter
  );

  const filterButtons = [
    { key: "all", label: "All Tickets", count: transformedTickets.length },
    {
      key: "active",
      label: "Active",
      count: transformedTickets.filter((t) => t.displayStatus === "active").length,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: transformedTickets.filter((t) => t.displayStatus === "upcoming").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: transformedTickets.filter((t) => t.displayStatus === "completed").length,
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-400">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Please Log In
          </h3>
          <p className="text-gray-400 mb-6">
            You need to be logged in to view your tickets.
          </p>
          <a
            href="/login"
            className="bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Error Loading Tickets
          </h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchTickets}
            className="bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl mb-4">
          Your Hospital Tickets
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Manage and track your upcoming and past hospital visits.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {filterButtons.map((button) => (
          <button
            key={button.key}
            onClick={() => setFilter(button.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === button.key
                ? "bg-primary text-background-dark"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
            }`}
          >
            {button.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === button.key
                  ? "bg-background-dark/20 text-background-dark"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {button.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredTickets.map((ticket) => (
          <motion.div
            key={ticket._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 group"
          >
            {/* Status and Date */}
            <div className="flex justify-between items-start mb-4">
              {getStatusBadge(ticket.displayStatus)}
              <span className="text-sm text-gray-400">{ticket.displayDate}</span>
            </div>

            {/* Hospital Info */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {ticket.hospitalName}
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-gray-300">{ticket.counterName}</span>
                </p>
                <p className="text-sm font-medium text-primary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {ticket.displayTime}
                </p>
                {ticket.ticketNumber && (
                  <p className="text-xs text-gray-400">
                    Ticket: <span className="font-mono text-primary">{ticket.ticketNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Additional Status Info */}
            {ticket.displayStatus === "active" && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                {ticket.queuePosition && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Queue Position:</span>
                    <span className="text-primary font-semibold">
                      #{ticket.queuePosition}
                    </span>
                  </div>
                )}
                {ticket.estimatedWaitTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Estimated Wait:</span>
                    <span className="text-primary font-semibold">
                      {ticket.estimatedWaitTime} min
                    </span>
                  </div>
                )}
              </div>
            )}

            {ticket.displayStatus === "upcoming" && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                {ticket.estimatedWaitTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Estimated Wait:</span>
                    <span className="text-blue-400 font-semibold">
                      {ticket.estimatedWaitTime} min
                    </span>
                  </div>
                )}
                {ticket.reasonForVisit && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Reason: </span>
                    <span className="text-gray-300">{ticket.reasonForVisit}</span>
                  </div>
                )}
              </div>
            )}

            {ticket.displayStatus === "completed" && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Completed at:</span>
                  <span className="text-green-400 font-semibold">
                    {ticket.completedAt ? formatTime(ticket.completedAt) : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {ticket.displayStatus === "canceled" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <div className="text-sm">
                  <span className="text-gray-300 block mb-1">Canceled</span>
                  {ticket.cancellationReason && (
                    <span className="text-red-400 text-xs">
                      {ticket.cancellationReason}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div>{getTicketButton(ticket)}</div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.618M15 6.306A7.962 7.962 0 0112 5c-2.34 0-4.29 1.007-5.824 2.618"
            />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">
            No {filter !== "all" ? filter : ""} tickets found
          </h3>
          <p className="text-gray-400 mb-6">
            {filter === "all"
              ? "You haven't booked any appointments yet."
              : `You don't have any ${filter} tickets.`}
          </p>
          <a
            href="/hospitals"
            className="inline-block bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Book New Appointment
          </a>
        </div>
      )}

      {/* Quick Stats */}
      {transformedTickets.length > 0 && (
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {transformedTickets.filter((t) => t.displayStatus === "active").length}
            </div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {transformedTickets.filter((t) => t.displayStatus === "upcoming").length}
            </div>
            <div className="text-sm text-gray-400">Upcoming</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {transformedTickets.filter((t) => t.displayStatus === "completed").length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{transformedTickets.length}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
        </div>
      )}

      {/* Modify Appointment Modal */}
      {selectedTicket && (
        <BookingModal
          isOpen={isModifyModalOpen}
          onClose={closeModifyModal}
          hospital={selectedTicket.hospital || selectedTicket.externalHospital ? {
            _id: selectedTicket.hospital?._id || selectedTicket.externalHospital?.id,
            id: selectedTicket.hospital?._id || selectedTicket.externalHospital?.id,
            name: selectedTicket.hospital?.name || selectedTicket.externalHospital?.name,
            address: selectedTicket.hospital?.address || selectedTicket.externalHospital?.address,
            phone: selectedTicket.hospital?.phone || selectedTicket.externalHospital?.phone
          } : null}
          counter={selectedTicket.counter ? {
            _id: selectedTicket.counter._id || selectedTicket.counter.id,
            name: selectedTicket.counter.name,
            type: selectedTicket.counter.type
          } : null}
          onBookingSuccess={handleModifySuccess}
          availableSlots={[]}
          isEditMode={true}
          existingTicket={selectedTicket}
        />
      )}
    </div>
  );
};

export default MyTickets;
