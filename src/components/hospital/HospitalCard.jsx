import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, Phone, Users, Activity } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { cardHover, fadeInUp } from "../../lib/motion";

const HospitalCard = React.forwardRef(
  (
    {
      hospital,
      onViewDetails,
      onBookAppointment,
      onGetDirections,
      showActions = true,
      variant = "default",
      className,
      ...props
    },
    ref,
  ) => {
    const {
      _id,
      name,
      address,
      distance,
      rating,
      reviewCount,
      type,
      emergencyServices,
      currentWaitTime,
      departments = [],
      contactInfo = {},
      coordinates,
    } = hospital;

    const getWaitTimeColor = (waitTime) => {
      if (waitTime <= 15) return "text-green-600 bg-green-50";
      if (waitTime <= 30) return "text-yellow-600 bg-yellow-50";
      return "text-red-600 bg-red-50";
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case "emergency":
          return <Activity className="w-4 h-4" />;
        case "specialty":
          return <Users className="w-4 h-4" />;
        default:
          return <Activity className="w-4 h-4" />;
      }
    };

    const getTypeColor = (type) => {
      switch (type) {
        case "emergency":
          return "bg-red-100 text-red-700";
        case "specialty":
          return "bg-blue-100 text-blue-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    const cardVariants = {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: "easeOut",
        },
      },
      hover: {
        y: -8,
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

    const iconVariants = {
      initial: { scale: 0, rotate: -180 },
      animate: {
        scale: 1,
        rotate: 0,
        transition: {
          delay: 0.2,
          type: "spring",
          stiffness: 200,
        },
      },
      hover: {
        scale: 1.1,
        rotate: 5,
        transition: { duration: 0.2 },
      },
    };

    const waitTimeVariants = {
      initial: { scale: 0.8, opacity: 0 },
      animate: {
        scale: 1,
        opacity: 1,
        transition: {
          delay: 0.3,
          type: "spring",
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        className={cn("group cursor-pointer", className)}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        onClick={onViewDetails}
        {...props}
      >
        <Card className="relative overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          {/* Emergency indicator */}
          {emergencyServices && (
            <motion.div
              className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-500"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="absolute -top-4 -right-1 text-white text-xs font-bold"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ER
              </motion.div>
            </motion.div>
          )}

          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <motion.h3
                  className="text-xl font-semibold text-gray-900 truncate mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {name}
                </motion.h3>

                <motion.div
                  className="flex items-center text-gray-500 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm truncate">{address}</span>
                </motion.div>

                {distance && (
                  <motion.p
                    className="text-sm text-blue-600 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {distance} km away
                  </motion.p>
                )}
              </div>

              {/* Hospital type badge */}
              <motion.div
                className={cn(
                  "flex items-center px-2 py-1 rounded-full text-xs font-medium ml-3 flex-shrink-0",
                  getTypeColor(type),
                )}
                variants={iconVariants}
              >
                {getTypeIcon(type)}
                <span className="ml-1 capitalize">{type}</span>
              </motion.div>
            </div>

            {/* Rating and wait time */}
            <div className="flex items-center justify-between mb-4">
              {/* Rating */}
              {rating && (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-900">
                      {rating}
                    </span>
                    {reviewCount && (
                      <span className="ml-1 text-sm text-gray-500">
                        ({reviewCount})
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Wait time */}
              {currentWaitTime !== undefined && (
                <motion.div
                  className={cn(
                    "flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    getWaitTimeColor(currentWaitTime),
                  )}
                  variants={waitTimeVariants}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  <motion.span
                    key={currentWaitTime}
                    initial={{ scale: 1.2, color: "#10b981" }}
                    animate={{ scale: 1, color: "inherit" }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentWaitTime} min wait
                  </motion.span>
                </motion.div>
              )}
            </div>

            {/* Departments */}
            {departments.length > 0 && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-gray-500 mb-2">Departments:</p>
                <div className="flex flex-wrap gap-1">
                  {departments.slice(0, 3).map((dept, index) => (
                    <motion.span
                      key={dept}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{
                        backgroundColor: "#e5e7eb",
                        scale: 1.05,
                      }}
                    >
                      {dept}
                    </motion.span>
                  ))}
                  {departments.length > 3 && (
                    <motion.span
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      +{departments.length - 3} more
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Contact info */}
            {contactInfo.phone && (
              <motion.div
                className="flex items-center text-gray-500 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">{contactInfo.phone}</span>
              </motion.div>
            )}

            {/* Actions */}
            {showActions && (
              <motion.div
                className="flex gap-2 pt-4 border-t border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  size="sm"
                  variant="medical"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookAppointment?.(hospital);
                  }}
                >
                  Book Appointment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGetDirections?.(coordinates);
                  }}
                >
                  Directions
                </Button>
              </motion.div>
            )}

            {/* Live indicator for active hospitals */}
            <motion.div
              className="absolute top-4 left-4 flex items-center"
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

            {/* Hover gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Wait time animation background */}
            {currentWaitTime !== undefined && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-b-lg opacity-20"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: currentWaitTime / 60 }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  },
);

HospitalCard.displayName = "HospitalCard";

export default HospitalCard;
