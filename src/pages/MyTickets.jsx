import { useState } from "react";

const MyTickets = () => {
  const [filter, setFilter] = useState("all");

  const tickets = [
    {
      id: 1,
      status: "active",
      hospital: "City General Hospital",
      counter: "Counter 3",
      time: "10:00 AM - 10:15 AM",
      date: "Today",
      department: "Cardiology",
      estimatedWait: "15 mins",
      queuePosition: 5,
    },
    {
      id: 2,
      status: "completed",
      hospital: "County Medical Center",
      counter: "Counter 1",
      time: "09:00 AM - 09:15 AM",
      date: "Yesterday",
      department: "General Practice",
      completedAt: "09:12 AM",
    },
    {
      id: 3,
      status: "upcoming",
      hospital: "Regional Health Clinic",
      counter: "Counter 2",
      time: "11:00 AM - 11:15 AM",
      date: "Tomorrow",
      department: "Dermatology",
      estimatedWait: "20 mins",
    },
    {
      id: 4,
      status: "canceled",
      hospital: "St. Mary's Hospital",
      counter: "Counter 4",
      time: "02:00 PM - 02:15 PM",
      date: "Dec 10",
      department: "Orthopedics",
      canceledAt: "Dec 8, 3:30 PM",
    },
  ];

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
    switch (ticket.status) {
      case "active":
        return (
          <button className="w-full bg-primary/20 hover:bg-primary/30 text-primary py-2.5 text-sm font-semibold rounded-lg transition-colors border border-primary/30">
            View Live Status
          </button>
        );
      case "upcoming":
        return (
          <div className="flex gap-2">
            <button className="flex-1 bg-primary hover:bg-primary/90 text-background-dark font-semibold py-2.5 text-sm rounded-lg transition-colors">
              Modify
            </button>
            <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2.5 text-sm font-semibold rounded-lg transition-colors">
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

  const filteredTickets = tickets.filter((ticket) =>
    filter === "all" ? true : ticket.status === filter
  );

  const filterButtons = [
    { key: "all", label: "All Tickets", count: tickets.length },
    {
      key: "active",
      label: "Active",
      count: tickets.filter((t) => t.status === "active").length,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: tickets.filter((t) => t.status === "upcoming").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: tickets.filter((t) => t.status === "completed").length,
    },
  ];

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
          <div
            key={ticket.id}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 group"
          >
            {/* Status and Date */}
            <div className="flex justify-between items-start mb-4">
              {getStatusBadge(ticket.status)}
              <span className="text-sm text-gray-400">{ticket.date}</span>
            </div>

            {/* Hospital Info */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {ticket.hospital}
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">
                  <span className="text-gray-300">{ticket.counter}</span> •{" "}
                  {ticket.department}
                </p>
                <p className="text-sm font-medium text-primary">
                  {ticket.time}
                </p>
              </div>
            </div>

            {/* Additional Status Info */}
            {ticket.status === "active" && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Queue Position:</span>
                  <span className="text-primary font-semibold">
                    #{ticket.queuePosition}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Estimated Wait:</span>
                  <span className="text-primary font-semibold">
                    {ticket.estimatedWait}
                  </span>
                </div>
              </div>
            )}

            {ticket.status === "upcoming" && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Estimated Wait:</span>
                  <span className="text-blue-400 font-semibold">
                    {ticket.estimatedWait}
                  </span>
                </div>
              </div>
            )}

            {ticket.status === "completed" && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Completed at:</span>
                  <span className="text-green-400 font-semibold">
                    {ticket.completedAt}
                  </span>
                </div>
              </div>
            )}

            {ticket.status === "canceled" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Canceled:</span>
                  <span className="text-red-400 font-semibold">
                    {ticket.canceledAt}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div>{getTicketButton(ticket)}</div>
          </div>
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
          <button className="bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-6 rounded-lg transition-colors">
            Book New Appointment
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {tickets.length > 0 && (
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {tickets.filter((t) => t.status === "active").length}
            </div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {tickets.filter((t) => t.status === "upcoming").length}
            </div>
            <div className="text-sm text-gray-400">Upcoming</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {tickets.filter((t) => t.status === "completed").length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{tickets.length}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
