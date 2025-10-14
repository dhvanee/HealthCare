import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { searchHospitals, getNearbyHospitals } from "../../services/hospitalService";

const HospitalSearch = ({ onSearchResults, userLocation, onLocationSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState("name"); // "name" or "location"
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (query, type = "name") => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      let results = [];

      if (type === "name") {
        // Search by hospital name or specialty
        const lat = userLocation ? userLocation[0] : 37.7749;
        const lng = userLocation ? userLocation[1] : -122.4194;
        results = await searchHospitals(query, lat, lng);
      } else {
        // Search by location (geocoding would go here)
        // For now, we'll simulate location-based search
        console.log("Location search not fully implemented yet");
        results = [];
      }

      setSuggestions(results);
      setShowSuggestions(true);

      if (onSearchResults) {
        onSearchResults(results);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [userLocation, onSearchResults]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce the search
    const timeoutId = setTimeout(() => {
      performSearch(value, searchType);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [performSearch, searchType]);

  const handleSuggestionClick = (hospital) => {
    setSearchQuery(hospital.name);
    setShowSuggestions(false);
    if (onSearchResults) {
      onSearchResults([hospital]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    performSearch(searchQuery, searchType);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSearchResults) {
      onSearchResults([]);
    }
  };

  // Quick search filters
  const quickFilters = [
    { label: "Emergency", icon: "🚨", search: "emergency" },
    { label: "Cardiology", icon: "❤️", search: "cardiology" },
    { label: "Pediatrics", icon: "👶", search: "pediatrics" },
    { label: "Orthopedics", icon: "🦴", search: "orthopedics" },
  ];

  const handleQuickFilter = (filterSearch) => {
    setSearchQuery(filterSearch);
    performSearch(filterSearch, "name");
  };

  return (
    <div className="relative">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <div className="flex">
            {/* Search Type Toggle */}
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-background-dark/80 text-white border border-gray-600 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="name">Name</option>
              <option value="location">Location</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder={
                  searchType === "name"
                    ? "Search hospitals, specialties..."
                    : "Search by location..."
                }
                className="w-full pl-10 pr-12 py-2 bg-background-dark/80 text-white placeholder-gray-400 border border-gray-600 border-l-0 focus:outline-none focus:border-primary"
              />

              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="text-gray-400 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>

              {/* Loading/Clear Button */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isSearching ? (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-background-dark font-medium px-4 py-2 rounded-r-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Quick Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => handleQuickFilter(filter.search)}
              className="flex items-center space-x-2 bg-gray-700/50 hover:bg-primary/20 text-white text-sm px-3 py-1.5 rounded-full transition-colors"
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-background-dark border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((hospital) => (
            <button
              key={hospital.id}
              onClick={() => handleSuggestionClick(hospital)}
              className="w-full text-left px-4 py-3 hover:bg-gray-700/50 border-b border-gray-700 last:border-b-0 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-white">{hospital.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{hospital.address}</div>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-primary text-sm">📍 {hospital.distance}</span>
                    <span className="text-yellow-400 text-sm">⭐ {hospital.rating}</span>
                    <span className="text-green-400 text-sm">⏱️ {hospital.waitTime}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                    {hospital.type}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search Results Info */}
      {suggestions.length > 0 && !showSuggestions && (
        <div className="mb-4 text-sm text-gray-400">
          Found {suggestions.length} hospital{suggestions.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </div>
      )}

      {/* No Results */}
      {showSuggestions && suggestions.length === 0 && searchQuery && !isSearching && (
        <div className="absolute top-full left-0 right-0 z-50 bg-background-dark border border-gray-600 rounded-lg shadow-xl p-4">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <p>No hospitals found matching "{searchQuery}"</p>
            <p className="text-sm mt-1">Try a different search term or location</p>
          </div>
        </div>
      )}
    </div>
  );
};

HospitalSearch.propTypes = {
  onSearchResults: PropTypes.func,
  userLocation: PropTypes.array,
  onLocationSearch: PropTypes.func,
};

export default HospitalSearch;
