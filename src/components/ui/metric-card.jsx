import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";

const MetricCard = React.forwardRef(
  (
    {
      title,
      value,
      icon,
      trend,
      trendValue,
      description,
      variant = "default",
      size = "default",
      loading = false,
      animate = true,
      className,
      ...props
    },
    ref,
  ) => {
    const getTrendColor = () => {
      switch (trend) {
        case "up":
          return "text-green-600 bg-green-50";
        case "down":
          return "text-red-600 bg-red-50";
        case "neutral":
          return "text-gray-600 bg-gray-50";
        default:
          return "text-gray-600 bg-gray-50";
      }
    };

    const getTrendIcon = () => {
      switch (trend) {
        case "up":
          return (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          );
        case "down":
          return (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          );
        default:
          return null;
      }
    };

    const getVariantStyles = () => {
      switch (variant) {
        case "medical":
          return "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white";
        case "emergency":
          return "border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white";
        case "success":
          return "border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white";
        case "warning":
          return "border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white";
        default:
          return "bg-white border border-gray-200";
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return "p-4";
        case "lg":
          return "p-8";
        default:
          return "p-6";
      }
    };

    const LoadingSkeleton = () => (
      <div className="animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    );

    const cardVariants = animate
      ? {
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
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            transition: {
              duration: 0.2,
              ease: "easeOut",
            },
          },
        }
      : {};

    const iconVariants = animate
      ? {
          initial: { scale: 0, rotate: -180 },
          animate: {
            scale: 1,
            rotate: 0,
            transition: {
              delay: 0.2,
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            },
          },
          hover: {
            scale: 1.1,
            rotate: 5,
            transition: {
              duration: 0.2,
            },
          },
        }
      : {};

    const valueVariants = animate
      ? {
          initial: { scale: 0.8, opacity: 0 },
          animate: {
            scale: 1,
            opacity: 1,
            transition: {
              delay: 0.3,
              duration: 0.4,
              type: "spring",
            },
          },
        }
      : {};

    const trendVariants = animate
      ? {
          initial: { x: -10, opacity: 0 },
          animate: {
            x: 0,
            opacity: 1,
            transition: {
              delay: 0.4,
              duration: 0.3,
            },
          },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg shadow-sm transition-all duration-200",
          getVariantStyles(),
          getSizeStyles(),
          "hover:shadow-md cursor-pointer",
          className,
        )}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        {...props}
      >
        {/* Background pattern for medical variants */}
        {variant !== "default" && (
          <div className="absolute inset-0 opacity-5">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <motion.h3
                className="text-sm font-medium text-gray-600"
                initial={animate ? { opacity: 0, x: -10 } : {}}
                animate={animate ? { opacity: 1, x: 0 } : {}}
                transition={animate ? { delay: 0.1, duration: 0.3 } : {}}
              >
                {title}
              </motion.h3>

              {icon && (
                <motion.div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    variant === "medical" && "bg-blue-100 text-blue-600",
                    variant === "emergency" && "bg-red-100 text-red-600",
                    variant === "success" && "bg-green-100 text-green-600",
                    variant === "warning" && "bg-yellow-100 text-yellow-600",
                    variant === "default" && "bg-gray-100 text-gray-600",
                  )}
                  variants={iconVariants}
                  whileHover="hover"
                >
                  {icon}
                </motion.div>
              )}
            </div>

            {/* Value */}
            <motion.div className="mb-3" variants={valueVariants}>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {value}
              </div>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
            </motion.div>

            {/* Trend */}
            {trend && trendValue && (
              <motion.div
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                  getTrendColor(),
                )}
                variants={trendVariants}
              >
                {getTrendIcon()}
                <span className="ml-1">{trendValue}</span>
              </motion.div>
            )}

            {/* Pulse animation for emergency */}
            {variant === "emergency" && (
              <motion.div
                className="absolute inset-0 border-2 border-red-400 rounded-lg"
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Heartbeat animation for medical */}
            {variant === "medical" && value && (
              <motion.div
                className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </div>
        )}

        {/* Hover gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-lg opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    );
  },
);

MetricCard.displayName = "MetricCard";

export default MetricCard;
