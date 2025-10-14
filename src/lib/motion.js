// Motion variants and animation utilities for consistent animations across the app

// Reduced motion check
export const useReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Base animation configurations
export const springConfig = {
  type: "spring",
  damping: 25,
  stiffness: 120,
  mass: 0.8
};

export const smoothConfig = {
  type: "tween",
  duration: 0.3,
  ease: "easeOut"
};

export const fastConfig = {
  type: "tween",
  duration: 0.2,
  ease: "easeOut"
};

export const slowConfig = {
  type: "tween",
  duration: 0.6,
  ease: "easeOut"
};

// Common motion variants
export const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothConfig
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: fastConfig
  }
};

export const fadeInDown = {
  initial: {
    opacity: 0,
    y: -20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothConfig
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: fastConfig
  }
};

export const fadeInLeft = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothConfig
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: fastConfig
  }
};

export const fadeInRight = {
  initial: {
    opacity: 0,
    x: 20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothConfig
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: fastConfig
  }
};

export const scaleIn = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springConfig
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: fastConfig
  }
};

export const slideInUp = {
  initial: {
    y: "100%",
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: springConfig
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: smoothConfig
  }
};

export const slideInDown = {
  initial: {
    y: "-100%",
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: springConfig
  },
  exit: {
    y: "-100%",
    opacity: 0,
    transition: smoothConfig
  }
};

// Card animations
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300
    }
  }
};

export const cardPress = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Button animations
export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

// List animations
export const listContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const listItem = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothConfig
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: fastConfig
  }
};

// Stagger animations for grids
export const gridContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const gridItem = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: smoothConfig
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: fastConfig
  }
};

// Modal/Dialog animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const modalContent = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springConfig
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: smoothConfig
  }
};

// Loading animations
export const spinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const skeleton = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// Navigation animations
export const navItem = {
  rest: {
    x: 0,
    backgroundColor: "transparent"
  },
  hover: {
    x: 4,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    transition: { duration: 0.2 }
  },
  active: {
    x: 8,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRight: "3px solid rgb(59, 130, 246)"
  }
};

// Notification/Toast animations
export const toast = {
  initial: {
    opacity: 0,
    x: "100%",
    scale: 0.95
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springConfig
  },
  exit: {
    opacity: 0,
    x: "100%",
    scale: 0.95,
    transition: smoothConfig
  }
};

// Progress animations
export const progressBar = {
  initial: { scaleX: 0 },
  animate: (progress) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

// Chart/Graph animations
export const chartEnter = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Medical/Healthcare specific animations
export const heartbeat = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const medicalAlert = {
  initial: {
    opacity: 0,
    scale: 0.8,
    borderColor: "transparent"
  },
  animate: {
    opacity: 1,
    scale: 1,
    borderColor: ["#ef4444", "#f97316", "#ef4444"],
    transition: {
      borderColor: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      },
      default: springConfig
    }
  }
};

// Queue/Wait time specific animations
export const queueUpdate = {
  initial: {
    opacity: 0,
    y: -10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  }
};

export const waitTimeCounter = {
  animate: {
    color: ["#10b981", "#f59e0b", "#ef4444"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Utility function to get reduced motion variants
export const getMotionVariant = (variant) => {
  if (useReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };
  }
  return variant;
};

// Accessibility-aware animation wrapper
export const accessibleMotion = (variants, reducedVariants = null) => {
  return useReducedMotion()
    ? (reducedVariants || { initial: {}, animate: {}, exit: {} })
    : variants;
};

// Animation presets for common UI patterns
export const presets = {
  fadeIn: fadeInUp,
  slideIn: slideInUp,
  scaleIn: scaleIn,
  cardHover: cardHover,
  buttonPress: buttonTap,
  listStagger: { container: listContainer, item: listItem },
  gridStagger: { container: gridContainer, item: gridItem },
  modal: { backdrop: modalBackdrop, content: modalContent },
  page: pageTransition,
  toast: toast,
  loading: { spinner, pulse, skeleton },
  medical: { heartbeat, alert: medicalAlert, queueUpdate }
};

export default presets;
