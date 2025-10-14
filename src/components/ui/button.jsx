import React from "react";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
        medical: "bg-blue-600 text-white hover:bg-blue-700",
        emergency: "bg-red-600 text-white hover:bg-red-700 animate-pulse",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        hover: "transition-all duration-200 hover:scale-105",
        press: "active:scale-95 transition-transform duration-100",
        bounce: "hover:animate-bounce",
        pulse: "hover:animate-pulse",
        shake: "hover:animate-[shake_0.5s_ease-in-out]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "press",
    },
  },
);

// Animation variants for Framer Motion
const motionVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  disabled: {
    scale: 1,
    opacity: 0.5,
  },
};

const loadingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const MotionButton = motion(
  React.forwardRef(
    (
      { className, variant, size, animation, asChild = false, ...props },
      ref,
    ) => {
      const Comp = asChild ? Slot : "button";
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, animation, className }),
          )}
          ref={ref}
          {...props}
        />
      );
    },
  ),
);

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      animation = "press",
      asChild = false,
      loading = false,
      loadingText = "Loading...",
      disabled = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const [ripples, setRipples] = React.useState([]);

    // Handle ripple effect
    const handleClick = (e) => {
      if (loading || disabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple = {
        x,
        y,
        size,
        id: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) =>
          prev.filter((ripple) => ripple.id !== newRipple.id),
        );
      }, 600);

      onClick?.(e);
    };

    const isDisabled = disabled || loading;

    const LoadingSpinner = () => (
      <motion.div
        className="w-4 h-4 border-2 border-current border-r-transparent rounded-full mr-2"
        variants={loadingVariants}
        animate="animate"
      />
    );

    return (
      <MotionButton
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, animation }),
          "relative overflow-hidden",
          isDisabled && "cursor-not-allowed opacity-50",
          className,
        )}
        variants={motionVariants}
        initial="initial"
        whileHover={!isDisabled ? "hover" : undefined}
        whileTap={!isDisabled && animation === "press" ? "tap" : undefined}
        disabled={isDisabled}
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        asChild={asChild}
        {...props}
      >
        {/* Ripple effect */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* Button content */}
        <span className="relative z-10 flex items-center">
          {loading && <LoadingSpinner />}
          {loading ? loadingText : children}
        </span>

        {/* Focus ring */}
        <motion.div
          className="absolute inset-0 rounded-md ring-2 ring-blue-500 ring-opacity-0"
          animate={{
            ringOpacity: isPressed ? 0.3 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </MotionButton>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
