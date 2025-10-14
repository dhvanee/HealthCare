import { useState } from "react";
import MapWithHospitals from "../components/map/MapWithHospitals";
import HospitalSearch from "../components/map/HospitalSearch";
import ErrorBoundary from "../components/ErrorBoundary";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState({
    id: 1,
    name: "City General Hospital",
    address: "123 Health St, Wellness City",
    phone: "+1 234-567-8900",
    distance: "0.8 km",
    waitTime: "25 mins",
    specialties: ["Emergency", "Cardiology", "Neurology"],
    rating: 4.5,
  });

  const waitTimeCards = [
    {
      id: 1,
      title: "Outpatient (OPD)",
      waitTime: 25,
      unit: "mins",
      description: "Current Wait Time",
      progress: 45,
      color: "primary",
    },
    {
      id: 2,
      title: "General Check-in",
      waitTime: 15,
      unit: "mins",
      description: "Current Wait Time",
      progress: 25,
      color: "green",
    },
    {
      id: 3,
      title: "Emergency Room",
      waitTime: 45,
      unit: "mins",
      description: "Critical Wait Time",
      progress: 75,
      color: "red",
    },
  ];

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
  };

  const handleLocationUpdate = (location) => {
    setUserLocation(location);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Map Section */}
      <div className="w-1/3 flex flex-col border-r border-gray-700/50">
        <div className="p-4">
          <HospitalSearch
            onSearchResults={handleSearchResults}
            userLocation={userLocation}
          />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <ErrorBoundary>
            <MapWithHospitals
              onHospitalSelect={handleHospitalSelect}
              onLocationUpdate={handleLocationUpdate}
              searchResults={searchResults}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Hospital Details Section */}
      <div className="w-2/3 flex flex-col p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-3xl font-bold text-white">
            {selectedHospital.name}
          </h2>
          <p className="text-gray-400 mt-1">{selectedHospital.address}</p>
          {selectedHospital.phone && (
            <p className="text-gray-400 text-sm mt-1">
              📞 {selectedHospital.phone}
            </p>
          )}
          <div className="flex items-center mt-2 space-x-4">
            <span className="text-primary font-semibold">
              🚗 {selectedHospital.distance}
            </span>
            <span className="text-yellow-400 font-semibold">
              ⭐ {selectedHospital.rating}
            </span>
          </div>
        </div>

        {/* Wait Time Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {waitTimeCards.map((card) => (
            <div
              key={card.id}
              className="bg-gray-800/50 border border-primary/20 rounded-xl p-5 backdrop-blur-lg shadow-2xl shadow-primary/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg text-white">{card.title}</h3>
                <p className="text-3xl font-bold text-primary mt-2">
                  {card.waitTime}{" "}
                  <span className="text-base font-medium text-gray-400">
                    {card.unit}
                  </span>
                </p>
                <p className="text-sm text-gray-400 mt-1">{card.description}</p>
                <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-4">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${card.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Historical Chart Section */}
        <div className="pt-6">
          <h3 className="text-xl font-bold text-white">
            Historical Wait Times
          </h3>
          <div className="mt-4 bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-gray-400">Historical data visualization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 opacity-0 animate-fade-slide-in">
          <button className="bg-primary text-background-dark font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30">
            Get Best Time to Visit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
