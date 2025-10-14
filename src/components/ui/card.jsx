import React from "react";
import { motion } from "framer-motion";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { cardHover, scaleIn, fadeInUp } from "../../lib/motion";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-md hover:shadow-lg",
        outlined: "border-2",
        ghost: "border-transparent shadow-none",
        medical: "border-l-4 border-l-blue-500 bg-blue-50/50",
        warning: "border-l-4 border-l-yellow-500 bg-yellow-50/50",
        success: "border-l-4 border-l-green-500 bg-green-50/50",
        danger: "border-l-4 border-l-red-500 bg-red-50/50",
        emergency: "border-2 border-red-500 bg-red-50 animate-pulse",
      },
      size: {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-md transition-shadow duration-200",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  },
);

const MotionDiv = motion.div;

const Card = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      interactive = false,
      hoverable = false,
      loading = false,
      animate = true,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const isClickable = interactive || onClick;

    const cardMotionProps = animate
      ? {
          initial: "initial",
          animate: "animate",
          variants: fadeInUp,
          ...(hoverable || isClickable
            ? {
                whileHover: "hover",
                variants: {
                  ...fadeInUp,
                  hover: cardHover.hover,
                  rest: cardHover.rest,
                },
              }
            : {}),
          ...(isClickable
            ? {
                whileTap: { scale: 0.98 },
              }
            : {}),
        }
      : {};

    const LoadingSkeleton = () => (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );

    return (
      <MotionDiv
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive: isClickable }),
          className,
        )}
        onClick={onClick}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e);
                }
              }
            : undefined
        }
        {...cardMotionProps}
        {...props}
      >
        {loading ? <LoadingSkeleton /> : children}
      </MotionDiv>
    );
  },
);

Card.displayName = "Card";

const CardHeader = React.forwardRef(
  ({ className, animate = true, ...props }, ref) => {
    const MotionComponent = animate ? motion.div : "div";

    return (
      <MotionComponent
        ref={ref}
        className={cn("flex flex-col space-y-1.5 pb-6", className)}
        {...(animate
          ? {
              initial: { opacity: 0, y: -10 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.1, duration: 0.3 },
            }
          : {})}
        {...props}
      />
    );
  },
);

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(
  ({ className, animate = true, children, ...props }, ref) => {
    const MotionComponent = animate ? motion.h3 : "h3";

    return (
      <MotionComponent
        ref={ref}
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight",
          className,
        )}
        {...(animate
          ? {
              initial: { opacity: 0, x: -10 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: 0.2, duration: 0.3 },
            }
          : {})}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  },
);

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(
  ({ className, animate = true, children, ...props }, ref) => {
    const MotionComponent = animate ? motion.p : "p";

    return (
      <MotionComponent
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...(animate
          ? {
              initial: { opacity: 0, x: -10 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: 0.3, duration: 0.3 },
            }
          : {})}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  },
);

CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(
  ({ className, animate = true, ...props }, ref) => {
    const MotionComponent = animate ? motion.div : "div";

    return (
      <MotionComponent
        ref={ref}
        className={cn("pt-0", className)}
        {...(animate
          ? {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.4, duration: 0.3 },
            }
          : {})}
        {...props}
      />
    );
  },
);

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(
  ({ className, animate = true, ...props }, ref) => {
    const MotionComponent = animate ? motion.div : "div";

    return (
      <MotionComponent
        ref={ref}
        className={cn("flex items-center pt-6", className)}
        {...(animate
          ? {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.5, duration: 0.3 },
            }
          : {})}
        {...props}
      />
    );
  },
);

CardFooter.displayName = "CardFooter";

// Specialized healthcare cards
const MedicalCard = React.forwardRef(
  ({ priority = "normal", status, children, ...props }, ref) => {
    const getVariant = () => {
      switch (priority) {
        case "emergency":
          return "emergency";
        case "urgent":
          return "warning";
        case "low":
          return "success";
        default:
          return "medical";
      }
    };

    const getPulseAnimation = () => {
      if (priority === "emergency") {
        return {
          animate: {
            scale: [1, 1.02, 1],
            boxShadow: [
              "0 4px 6px -1px rgba(239, 68, 68, 0.1)",
              "0 8px 15px -3px rgba(239, 68, 68, 0.3)",
              "0 4px 6px -1px rgba(239, 68, 68, 0.1)",
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

    return (
      <motion.div {...getPulseAnimation()}>
        <Card ref={ref} variant={getVariant()} hoverable {...props}>
          {status && (
            <div className="absolute top-2 right-2">
              <motion.div
                className={cn(
                  "w-3 h-3 rounded-full",
                  status === "active" && "bg-green-500",
                  status === "waiting" && "bg-yellow-500",
                  status === "busy" && "bg-red-500",
                  status === "offline" && "bg-gray-400",
                )}
                animate={
                  status === "active"
                    ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          )}
          {children}
        </Card>
      </motion.div>
    );
  },
);

MedicalCard.displayName = "MedicalCard";

const StatCard = React.forwardRef(
  ({ title, value, change, trend, icon, loading = false, ...props }, ref) => {
    const getTrendColor = () => {
      if (!trend) return "text-gray-500";
      return trend === "up" ? "text-green-600" : "text-red-600";
    };

    const getTrendIcon = () => {
      if (!trend) return null;
      return trend === "up" ? "↗" : "↘";
    };

    return (
      <Card ref={ref} variant="elevated" hoverable animate {...props}>
        <CardContent className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {title}
                  </p>
                  <motion.div
                    className="text-2xl font-bold"
                    key={value}
                    initial={{ scale: 1.1, color: "#10b981" }}
                    animate={{ scale: 1, color: "inherit" }}
                    transition={{ duration: 0.3 }}
                  >
                    {value}
                  </motion.div>
                  {change && (
                    <div
                      className={cn(
                        "text-xs flex items-center",
                        getTrendColor(),
                      )}
                    >
                      <span className="mr-1">{getTrendIcon()}</span>
                      {change}
                    </div>
                  )}
                </div>
                {icon && (
                  <motion.div
                    className="text-muted-foreground"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {icon}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    );
  },
);

StatCard.displayName = "StatCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  MedicalCard,
  StatCard,
  cardVariants,
};
