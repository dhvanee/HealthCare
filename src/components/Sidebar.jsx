import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Hospital,
  Brain,
  Calendar,
  Info,
  Stethoscope,
  Activity,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview and metrics",
    },
    {
      path: "/hospitals",
      label: "Find Hospitals",
      icon: Hospital,
      description: "Search nearby facilities",
    },
    {
      path: "/predictions",
      label: "AI Predictions",
      icon: Brain,
      description: "Wait time forecasts",
    },
    {
      path: "/bookings",
      label: "My Bookings",
      icon: Calendar,
      description: "Manage appointments",
    },
    {
      path: "/about",
      label: "About",
      icon: Info,
      description: "Learn more",
    },
  ];

  const sidebarVariants = {
    initial: { x: -250, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { x: -20, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
    hover: {
      x: 8,
      transition: { duration: 0.2 },
    },
  };

  const logoVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.aside
      className="hidden md:flex flex-col w-72 h-screen bg-white border-r border-gray-200 shadow-lg overflow-y-auto"
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex flex-col justify-between flex-1">
        {/* Logo and Brand */}
        <div className="p-6">
          <motion.div
            className="flex items-center mb-8"
            variants={logoVariants}
          >
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3"
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 },
              }}
            >
              <Stethoscope className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HealthCare
              </h2>
              <p className="text-xs text-gray-500">Smart Queue System</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Link
                    to={item.path}
                    className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                        layoutId="activeIndicator"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Icon with animation */}
                    <motion.div
                      className={`flex-shrink-0 mr-3 ${active ? "text-white" : "text-gray-400"}`}
                      whileHover={{
                        scale: 1.1,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm ${active ? "text-white" : "text-gray-900"}`}
                      >
                        {item.label}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${active ? "text-blue-100" : "text-gray-500"}`}
                      >
                        {item.description}
                      </div>
                    </div>

                    {/* Hover effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                    />

                    {/* Notification badge (example for bookings) */}
                    {item.path === "/bookings" && (
                      <motion.div
                        className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="p-6 border-t border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* Live Status */}
          <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full mr-2"
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
              <span className="text-sm font-medium text-green-800">
                System Online
              </span>
            </div>
            <Activity className="h-4 w-4 text-green-600" />
          </div>

          {/* User Info */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
              U
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                Guest User
              </div>
              <div className="text-xs text-gray-500">Demo Mode</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
