import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import PropTypes from "prop-types";
import "leaflet/dist/leaflet.css";
import { getNearbyHospitals } from "../../services/hospitalService";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom hospital icon
const hospitalIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="#ef4444" width="32" height="32">
      <circle cx="16" cy="16" r="15" fill="#ef4444" stroke="white" stroke-width="2"/>
      <rect x="12" y="8" width="8" height="2" fill="white"/>
      <rect x="15" y="5" width="2" height="8" fill="white"/>
      <rect x="12" y="19" width="8" height="2" fill="white"/>
      <rect x="15" y="16" width="2" height="8" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom user location icon
const userIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00d4ff" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="#00d4ff" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Sample hospital data
const sampleHospitals = [
  {
    id: 1,
    name: "City General Hospital",
    address: "123 Health St, Wellness City",
    phone: "+1 234-567-8900",
    distance: "0.8 km",
    waitTime: "25 mins",
    specialties: ["Emergency", "Cardiology", "Neurology"],
    rating: 4.5,
    lat: 37.7749,
    lng: -122.4194,
    type: "hospital",
  },
  {
    id: 2,
    name: "Metro Medical Center",
    address: "456 Care Ave, Health Town",
    phone: "+1 234-567-8901",
    distance: "1.2 km",
    waitTime: "15 mins",
    specialties: ["Pediatrics", "Orthopedics", "Dermatology"],
    rating: 4.3,
    lat: 37.7849,
    lng: -122.4094,
    type: "clinic",
  },
  {
    id: 3,
    name: "Emergency Care Unit",
    address: "789 Quick Response Rd",
    phone: "+1 234-567-8902",
    distance: "2.1 km",
    waitTime: "45 mins",
    specialties: ["Emergency", "Trauma", "ICU"],
    rating: 4.7,
    lat: 37.7649,
    lng: -122.4294,
    type: "emergency",
  },
  {
    id: 4,
    name: "Wellness Medical Plaza",
    address: "321 Healing Blvd",
    phone: "+1 234-567-8903",
    distance: "1.8 km",
    waitTime: "20 mins",
    specialties: ["Family Medicine", "Internal Medicine"],
    rating: 4.2,
    lat: 37.7949,
    lng: -122.4394,
    type: "clinic",
  },
];

const MapWithHospitals = ({
  onHospitalSelect,
  onLocationUpdate,
  searchResults,
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("prompt");
  const [mapCenter] = useState([37.7749, -122.4194]);
  const [mapZoom] = useState(13);
  const [useRealData, setUseRealData] = useState(true);

  const generateNearbyHospitals = useCallback((lat, lng) => {
    return sampleHospitals.map((hospital, index) => ({
      ...hospital,
      id: hospital.id + index,
      lat: lat + (Math.random() - 0.5) * 0.02,
      lng: lng + (Math.random() - 0.5) * 0.02,
      distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
      waitTime: `${Math.floor(Math.random() * 60 + 10)} mins`,
    }));
  }, []);

  const fetchRealHospitals = useCallback(
    async (lat, lng) => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching hospitals for coordinates: ${lat}, ${lng}`);

        const hospitalData = await getNearbyHospitals(lat, lng, {
          radius: 5000, // 5km radius
          useDemo: !useRealData,
          forceRealData: useRealData,
          maxResults: 15,
        });

        console.log(`Found ${hospitalData.length} hospitals`);
        setHospitals(hospitalData);

        if (hospitalData.length === 0) {
          setError(
            "No hospitals found in this area. Try expanding your search radius.",
          );
        }
      } catch (err) {
        console.error("Error fetching hospitals:", err);
        setError(`Failed to load hospitals: ${err.message}`);

        // Fallback to demo data
        const fallbackHospitals = generateNearbyHospitals(lat, lng);
        setHospitals(fallbackHospitals);
      } finally {
        setLoading(false);
      }
    },
    [useRealData, generateNearbyHospitals],
  );

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = [latitude, longitude];

        setUserLocation(location);
        setPermissionStatus("granted");

        // Notify parent component of location update
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }

        // Fetch real hospitals
        fetchRealHospitals(latitude, longitude);
      },
      (err) => {
        console.error("Error getting location:", err);
        setPermissionStatus("denied");

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access denied by user.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An unknown error occurred.");
            break;
        }

        // Load hospitals for default location
        fetchRealHospitals(37.7749, -122.4194);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, [fetchRealHospitals]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const refreshHospitals = useCallback(async () => {
    if (userLocation) {
      await fetchRealHospitals(userLocation[0], userLocation[1]);
    } else {
      await fetchRealHospitals(37.7749, -122.4194);
    }
  }, [userLocation, fetchRealHospitals]);

  // Update hospitals when search results change
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setHospitals(searchResults);
    }
  }, [searchResults]);

  const handleHospitalClick = useCallback(
    (hospital) => {
      if (onHospitalSelect) {
        onHospitalSelect(hospital);
      }
    },
    [onHospitalSelect],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-dark/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading map and nearby hospitals...</p>
          <p className="text-gray-400 text-sm mt-2">
            Requesting location permission
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-900/90 backdrop-blur-sm text-white p-4 rounded-lg border border-red-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={requestLocation}
              className="ml-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <MapContainer
        center={userLocation || mapCenter}
        zoom={userLocation ? 14 : mapZoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-primary">Your Location</div>
                <div className="text-sm text-gray-600 mt-1">You are here</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hospital markers */}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.lat, hospital.lng]}
            icon={hospitalIcon}
            eventHandlers={{
              click: () => handleHospitalClick(hospital),
            }}
          >
            <Popup>
              <div className="min-w-[250px] p-2">
                <div className="font-semibold text-lg text-gray-800 mb-2">
                  {hospital.name}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <svg
                      className="w-4 h-4 mr-2 mt-0.5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-600">{hospital.address}</span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-gray-600">{hospital.phone}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <div>
                      <div className="text-primary font-semibold">
                        Wait Time: {hospital.waitTime}
                      </div>
                      <div className="text-gray-500">
                        Distance: {hospital.distance}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">{hospital.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-gray-500 mb-1">
                      Specialties:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleHospitalClick(hospital)}
                    className="w-full mt-3 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Location permission prompt */}
      {permissionStatus === "denied" && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-yellow-900/90 backdrop-blur-sm text-white p-4 rounded-lg border border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">
                Enable location access for better results
              </span>
            </div>
            <button
              onClick={requestLocation}
              className="ml-4 bg-primary hover:bg-primary/90 px-3 py-1 rounded text-sm transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-background-dark/80 backdrop-blur-sm rounded-lg p-3 shadow-xl">
          <div className="text-white text-sm font-semibold mb-2">
            🏥 {hospitals.length} hospitals nearby
          </div>
          {userLocation && (
            <div className="text-green-400 text-xs flex items-center mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
              Location enabled
            </div>
          )}
          <div className="flex items-center text-xs">
            <input
              type="checkbox"
              id="realData"
              checked={useRealData}
              onChange={(e) => setUseRealData(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="realData" className="text-gray-300">
              Use real data
            </label>
          </div>
        </div>
      </div>

      {/* Refresh button */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={refreshHospitals}
          disabled={loading}
          className="p-3 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors text-white shadow-lg"
          title="Refresh hospitals"
        >
          {loading ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </button>

        <button
          onClick={requestLocation}
          disabled={loading}
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 transition-colors text-white shadow-lg"
          title="Get my location"
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

MapWithHospitals.propTypes = {
  onHospitalSelect: PropTypes.func,
  onLocationUpdate: PropTypes.func,
  searchResults: PropTypes.array,
};

export default MapWithHospitals;
