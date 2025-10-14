import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  QrCode,
  Navigation,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { cardHover, fadeInUp } from "../../lib/motion";

const TicketCard = ({
  ticket,
  onCheckIn,
  onCancel,
  onViewDetails,
  onGetDirections,
  showActions = true,
  variant = "default",
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    _id,
    ticketNumber,
    status,
    queuePosition,
    estimatedWaitTime,
    appointmentTime,
    hospital,
    counter,
    patientInfo,
    createdAt,
  } = ticket;

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "checked-in":
        return "text-green-600 bg-green-50 border-green-200";
      case "in-progress":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      case "missed":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "checked-in":
        return <CheckCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "missed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityAnimation = (status) => {
    if (status === "in-progress") {
      return {
        animate: {
          scale: [1, 1.02, 1],
          boxShadow: [
            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            "0 10px 15px -3px rgba(59, 130, 246, 0.2)",
            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          ],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };
    }
    return {};
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const appointmentDateTime = formatDateTime(appointmentTime);

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const queuePositionVariants = {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className={cn("group cursor-pointer", className)}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={() => setIsExpanded(!isExpanded)}
      {...getPriorityAnimation(status)}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        {/* Priority indicator for in-progress tickets */}
        {status === "in-progress" && (
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <motion.div
                className="flex items-center mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <QrCode className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-lg font-bold text-gray-900">
                  {ticketNumber}
                </span>
              </motion.div>

              <motion.h3
                className="text-xl font-semibold text-gray-900 truncate mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                {hospital?.name}
              </motion.h3>

              <motion.p
                className="text-gray-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {counter?.name} - {counter?.department}
              </motion.p>
            </div>

            {/* Status Badge */}
            <motion.div
              className={cn(
                "flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                getStatusColor(status)
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {getStatusIcon(status)}
              <span className="ml-1 capitalize">{status.replace("-", " ")}</span>
            </motion.div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <motion.div
              className="flex items-center text-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              <div>
                <div className="text-sm font-medium">{appointmentDateTime.date}</div>
                <div className="text-xs text-gray-500">Date</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center text-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Clock className="h-4 w-4 mr-2" />
              <div>
                <div className="text-sm font-medium">{appointmentDateTime.time}</div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
            </motion.div>

            {queuePosition && (
              <motion.div
                className="flex items-center text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <User className="h-4 w-4 mr-2" />
                <div>
                  <motion.div
                    className="text-sm font-medium"
                    variants={queuePositionVariants}
                    animate={status === "checked-in" ? "animate" : ""}
                  >
                    #{queuePosition}
                  </motion.div>
                  <div className="text-xs text-gray-500">Queue Position</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Wait Time Indicator */}
          {estimatedWaitTime && status !== "completed" && status !== "cancelled" && (
            <motion.div
              className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center text-blue-700">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Estimated wait time</span>
              </div>
              <motion.span
                className="text-lg font-bold text-blue-600"
                key={estimatedWaitTime}
                initial={{ scale: 1.2, color: "#10b981" }}
                animate={{ scale: 1, color: "#2563eb" }}
                transition={{ duration: 0.3 }}
              >
                {estimatedWaitTime} min
              </motion.span>
            </motion.div>
          )}

          {/* Expanded Details */}
          <motion.div
            variants={expandVariants}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Patient Information
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-2" />
                      {patientInfo?.name}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {patientInfo?.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Hospital Details
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-start">
                      <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{hospital?.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {patientInfo?.reason && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {patientInfo.reason}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          {showActions && (
            <motion.div
              className="flex gap-2 pt-4 border-t border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {status === "confirmed" && (
                <Button
                  size="sm"
                  variant="success"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckIn?.(ticket);
                  }}
                >
                  Check In
                </Button>
              )}

              {(status === "confirmed" || status === "checked-in") && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel?.(ticket);
                  }}
                >
                  Cancel
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onGetDirections?.(hospital?.coordinates);
                }}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Directions
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(ticket);
                }}
              >
                Details
              </Button>
            </motion.div>
          )}

          {/* Live updates indicator */}
          {(status === "checked-in" || status === "in-progress") && (
            <motion.div
              className="absolute top-4 right-4 flex items-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full mr-1"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-xs text-green-600 font-medium">Live</span>
            </motion.div>
          )}

          {/* Hover gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Progress indicator for in-progress tickets */}
          {status === "in-progress" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-lg"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TicketCard;
