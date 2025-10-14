import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MapPin, Clock, Star, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { fadeInUp, listContainer, listItem } from "../../lib/motion";

const HospitalSearch = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  loading = false,
  suggestions = [],
  recentSearches = [],
}) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    emergencyServices: false,
    maxDistance: 50,
    minRating: 0,
    specialties: [],
    ...initialFilters,
  });

  const specialtyOptions = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Emergency Medicine",
    "Radiology",
    "Surgery",
    "Internal Medicine",
    "Dermatology",
    "Psychiatry",
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "general", label: "General Hospital" },
    { value: "specialty", label: "Specialty Hospital" },
    { value: "emergency", label: "Emergency Center" },
  ];

  const distanceOptions = [
    { value: 5, label: "5 km" },
    { value: 10, label: "10 km" },
    { value: 25, label: "25 km" },
    { value: 50, label: "50 km" },
    { value: 100, label: "100 km" },
  ];

  const ratingOptions = [
    { value: 0, label: "Any Rating" },
    { value: 3, label: "3+ Stars" },
    { value: 4, label: "4+ Stars" },
    { value: 4.5, label: "4.5+ Stars" },
  ];

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || Object.values(filters).some(v => v)) {
        onSearch?.(query, filters);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters, onSearch]);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Specialty toggle
  const toggleSpecialty = (specialty) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    handleFilterChange("specialties", newSpecialties);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      type: "",
      emergencyServices: false,
      maxDistance: 50,
      minRating: 0,
      specialties: [],
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.emergencyServices) count++;
    if (filters.maxDistance !== 50) count++;
    if (filters.minRating > 0) count++;
    if (filters.specialties.length > 0) count++;
    return count;
  }, [filters]);

  const searchVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const filterPanelVariants = {
    initial: { opacity: 0, height: 0 },
    animate: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const suggestionVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="w-full space-y-4"
      variants={searchVariants}
      initial="initial"
      animate="animate"
    >
      {/* Search Bar */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className={cn(
                "h-5 w-5 transition-colors duration-200",
                loading ? "text-blue-500 animate-pulse" : "text-gray-400"
              )} />
            </div>

            <motion.input
              type="text"
              placeholder="Search hospitals, doctors, or specialties..."
              className="w-full pl-10 pr-20 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            />

            <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
              {query && (
                <motion.button
                  onClick={() => setQuery("")}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}

              <Button
                variant={showFilters ? "medical" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filter
                {activeFilterCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {activeFilterCount}
                  </motion.span>
                )}
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
              <motion.div
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                variants={suggestionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs text-gray-500 mb-2">Suggestions</p>
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => {
                          setQuery(suggestion);
                          setShowSuggestions(false);
                        }}
                        variants={listItem}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                      >
                        <Search className="h-4 w-4 text-gray-400 inline mr-2" />
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div className="p-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Recent Searches</p>
                    {recentSearches.map((search, index) => (
                      <motion.button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors text-sm text-gray-600"
                        onClick={() => {
                          setQuery(search);
                          setShowSuggestions(false);
                        }}
                        variants={listItem}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                      >
                        <Clock className="h-4 w-4 text-gray-400 inline mr-2" />
                        {search}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            variants={filterPanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Hospital Type */}
                  <motion.div variants={listItem}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange("type", e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Distance */}
                  <motion.div variants={listItem}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Distance
                    </label>
                    <select
                      value={filters.maxDistance}
                      onChange={(e) => handleFilterChange("maxDistance", parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {distanceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Rating */}
                  <motion.div variants={listItem}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange("minRating", parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ratingOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Emergency Services */}
                  <motion.div variants={listItem}>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.emergencyServices}
                        onChange={(e) => handleFilterChange("emergencyServices", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Emergency Services
                      </span>
                    </label>
                  </motion.div>
                </div>

                {/* Specialties */}
                <motion.div variants={listItem}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Specialties
                  </label>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    variants={listContainer}
                  >
                    {specialtyOptions.map(specialty => (
                      <motion.button
                        key={specialty}
                        onClick={() => toggleSpecialty(specialty)}
                        className={cn(
                          "px-3 py-1 text-sm rounded-full border transition-all duration-200",
                          filters.specialties.includes(specialty)
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-500"
                        )}
                        variants={listItem}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {specialty}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Quick Filters */}
                <motion.div variants={listItem}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quick Filters
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filters.emergencyServices ? "emergency" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange("emergencyServices", !filters.emergencyServices)}
                    >
                      Emergency Care
                    </Button>
                    <Button
                      variant={filters.minRating >= 4 ? "success" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange("minRating", filters.minRating >= 4 ? 0 : 4)}
                    >
                      Highly Rated (4+)
                    </Button>
                    <Button
                      variant={filters.maxDistance <= 10 ? "medical" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange("maxDistance", filters.maxDistance <= 10 ? 50 : 10)}
                    >
                      Nearby (≤10km)
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            className="flex flex-wrap gap-2"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {filters.type && (
              <motion.span
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                Type: {typeOptions.find(t => t.value === filters.type)?.label}
                <button
                  onClick={() => handleFilterChange("type", "")}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            )}

            {filters.emergencyServices && (
              <motion.span
                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                Emergency Services
                <button
                  onClick={() => handleFilterChange("emergencyServices", false)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            )}

            {filters.minRating > 0 && (
              <motion.span
                className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Star className="h-3 w-3 mr-1" />
                {filters.minRating}+ Rating
                <button
                  onClick={() => handleFilterChange("minRating", 0)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            )}

            {filters.specialties.map(specialty => (
              <motion.span
                key={specialty}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {specialty}
                <button
                  onClick={() => toggleSpecialty(specialty)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HospitalSearch;
