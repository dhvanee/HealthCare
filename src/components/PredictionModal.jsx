import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";

const PredictionModal = ({ isOpen, onClose }) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 35,
    seconds: 20,
  });

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else if (prev.hours > 0) {
            return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          }
          return prev;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleBookTicket = () => {
    if (selectedTimeSlot) {
      console.log("Booking ticket for:", selectedTimeSlot);
      onClose();
    }
  };

  // eslint-disable-next-line react/prop-types
  const CircularProgress = ({ value, maxValue, label }) => {
    const percentage = (value / maxValue) * 100;
    const strokeDasharray = 289.027;
    const strokeDashoffset =
      strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
      <div className="text-center">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              className="text-gray-700"
              cx="50"
              cy="50"
              fill="transparent"
              r="46"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              className="text-primary"
              cx="50"
              cy="50"
              fill="transparent"
              r="46"
              stroke="currentColor"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="8"
              style={{
                filter: "drop-shadow(0 0 6px rgba(0, 212, 255, 0.5))",
              }}
            />
          </svg>
          <span className="absolute text-2xl font-bold text-white">
            {value.toString().padStart(2, "0")}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-400">{label}</p>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Select Your Preferred Time
        </h2>
        <p className="text-gray-400 mb-8">
          Choose a time slot to book your hospital ticket.
        </p>

        {/* Countdown Timer */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <CircularProgress
            value={timeLeft.hours}
            maxValue={24}
            label="Hours"
          />
          <CircularProgress
            value={timeLeft.minutes}
            maxValue={60}
            label="Minutes"
          />
          <CircularProgress
            value={timeLeft.seconds}
            maxValue={60}
            label="Seconds"
          />
        </div>

        {/* Time Slot Selection */}
        <div className="mb-6">
          <label className="sr-only" htmlFor="time-slot">
            Choose a time slot
          </label>
          <select
            className="w-full bg-gray-800/50 border border-gray-600/50 text-white rounded-lg focus:ring-primary focus:border-primary p-4 appearance-none"
            id="time-slot"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300d4ff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">Choose a time slot</option>
            <option value="1">
              10:00 AM - 10:30 AM (Predicted wait: ~15 mins)
            </option>
            <option value="2">
              10:30 AM - 11:00 AM (Predicted wait: ~25 mins)
            </option>
            <option value="3">
              11:00 AM - 11:30 AM (Predicted wait: ~20 mins)
            </option>
            <option value="4">
              11:30 AM - 12:00 PM (Predicted wait: ~10 mins)
            </option>
          </select>
        </div>

        {/* Book Button */}
        <button
          onClick={handleBookTicket}
          disabled={!selectedTimeSlot}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-background-dark font-bold py-4 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none shadow-lg shadow-primary/30 disabled:shadow-none disabled:cursor-not-allowed"
        >
          Book Ticket
        </button>
      </div>
    </Modal>
  );
};

PredictionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PredictionModal;
