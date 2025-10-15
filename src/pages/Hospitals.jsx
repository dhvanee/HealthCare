import { useState, useEffect } from "react";
import {
  getNearbyHospitals,
  getNearbyHospitalsWithDebug,
} from "../services/hospitalService";
import { useAuth } from "../context/AuthContext";

const Hospitals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const { user } = useAuth();

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
          },
          (err) => {
            console.warn("Geolocation failed:", err);
            // Use default location (San Francisco)
            setUserLocation([37.7749, -122.4194]);
          },
        );
      } else {
        setUserLocation([37.7749, -122.4194]);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch hospitals when location is available
  useEffect(() => {
    const fetchHospitals = async () => {
      if (!userLocation) return;

      setLoading(true);
      setError(null);

      try {
        const hospitalData = await getNearbyHospitalsWithDebug(
          userLocation[0],
          userLocation[1],
          {
            radius: 10000, // 10km radius for hospitals page
            useDemo: false, // Use real API data
            forceRealData: true,
            maxResults: 20,
          },
        );

        // Add default images to hospitals that don't have them
        const hospitalsWithImages = hospitalData.map((hospital, index) => ({
          ...hospital,
          image: hospital.image || getDefaultHospitalImage(index),
          departments: hospital.departments ||
            hospital.specialties || ["General Medicine"],
        }));

        setHospitals(hospitalsWithImages);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
        setError("Failed to load hospitals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [userLocation]);

  // Get default hospital image based on index
  const getDefaultHospitalImage = (index) => {
    const images = [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=300&h=200&fit=crop",
    ];
    return images[index % images.length];
  };

  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hospital.departments &&
        hospital.departments.some((dept) =>
          dept.toLowerCase().includes(searchQuery.toLowerCase()),
        )) ||
      (hospital.specialties &&
        hospital.specialties.some((spec) =>
          spec.toLowerCase().includes(searchQuery.toLowerCase()),
        )),
  );

  const getWaitTimeBadge = (waitTime) => {
    const minutes = parseInt(waitTime);
    if (minutes <= 20)
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (minutes <= 35)
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading hospitals near you...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg max-w-md mx-auto">
            <h2 className="font-semibold mb-2">Error Loading Hospitals</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4">
          Find Hospitals Near You
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Discover nearby hospitals with real-time wait times and book your
          preferred time slot.
        </p>
        {userLocation && (
          <p className="text-sm text-primary mt-2">
            📍 Showing hospitals near your location
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search hospitals, departments..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="mb-6">
          <p className="text-gray-300">
            Found {filteredHospitals.length} hospitals
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Hospitals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-gray-800/50 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={hospital.image}
                alt={hospital.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="bg-primary/20 backdrop-blur-sm text-primary px-2 py-1 rounded-full text-xs font-semibold border border-primary/30">
                  {hospital.distance}
                </span>
                <span
                  className={`backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold border ${getWaitTimeBadge(
                    hospital.waitTime,
                  )}`}
                >
                  {hospital.waitTime}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-1 text-white">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium">{hospital.rating}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {hospital.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3">{hospital.address}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Departments:</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    hospital.departments ||
                    hospital.specialties || ["General Medicine"]
                  ).map((dept, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs border border-primary/20"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-background-dark font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-primary/20">
                  Book Now
                </button>
                <button
                  className="px-4 py-2.5 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                  title="View Hospital Details"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                {hospital.phone && hospital.phone !== "Phone not available" && (
                  <button
                    className="px-4 py-2.5 border border-green-600 hover:border-green-500 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-800/20 transition-colors"
                    title="Call Hospital"
                    onClick={() => window.open(`tel:${hospital.phone}`)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.618M15 6.306A7.962 7.962 0 0112 5c-2.34 0-4.29 1.007-5.824 2.618"
            />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">
            No hospitals found
          </h3>
          <p className="text-gray-400">
            Try adjusting your search criteria or search for different keywords.
          </p>
        </div>
      )}
    </div>
  );
};

export default Hospitals;
