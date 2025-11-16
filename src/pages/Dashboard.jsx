import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MapWithHospitals from "../components/map/MapWithHospitals";
import HospitalSearch from "../components/map/HospitalSearch";
import ErrorBoundary from "../components/ErrorBoundary";
import { predictionService } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedHospital, setSelectedHospital] = useState(null);
  
  // Wait time predictions for each department
  const [waitTimeData, setWaitTimeData] = useState({
    general: null,
    opd: null,
    emergency: null
  });
  const [isPredictingWaitTime, setIsPredictingWaitTime] = useState(false);
  
  // Best slots modal state
  const [showBestSlotsModal, setShowBestSlotsModal] = useState(false);
  const [bestSlots, setBestSlots] = useState([]);
  const [isLoadingBestSlots, setIsLoadingBestSlots] = useState(false);
  
  // Historical data for visualization
  const [historicalData, setHistoricalData] = useState([]);

  // Static departments as per requirements
  const departments = [
    { id: 'general', title: 'General', color: 'primary' },
    { id: 'opd', title: 'Outpatient (OPD)', color: 'green' },
    { id: 'emergency', title: 'Emergency Room', color: 'red' }
  ];

  // Predict wait time for all departments when hospital is selected
  useEffect(() => {
    const predictWaitTimes = async () => {
      if (!selectedHospital || (!selectedHospital.id && !selectedHospital._id)) return;
      
      setIsPredictingWaitTime(true);
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const predictionPayload = {
        date,
        time,
        current_queue_length: 12, // Static
        staff_count: 3, // Static
        historical_throughput: 6.2, // Static
        is_holiday: 0
      };
      
      try {
        const result = await predictionService.predictWaitTime(predictionPayload);
        
        if (result.success) {
          const waitTime = Math.round(result.predicted_wait_time_minutes);
          // Use same prediction for all departments (can be customized later)
          setWaitTimeData({
            general: waitTime,
            opd: waitTime,
            emergency: waitTime
          });
          
          // Generate historical data for visualization
          generateHistoricalData(waitTime);
        }
      } catch (error) {
        console.error('Error predicting wait time:', error);
      } finally {
        setIsPredictingWaitTime(false);
      }
    };
    
    predictWaitTimes();
  }, [selectedHospital]);

  // Generate sample historical data
  const generateHistoricalData = (currentWaitTime) => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        waitTime: Math.max(5, currentWaitTime + (Math.random() * 20 - 10)), // Vary around current
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    setHistoricalData(data);
  };

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    // Reset wait time data when hospital changes
    setWaitTimeData({ general: null, opd: null, emergency: null });
  };

  // Handle "Get Best Time to Visit" button
  const handleGetBestTimeToVisit = async () => {
    setIsLoadingBestSlots(true);
    setBestSlots([]);
    
    try {
      const today = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[today.getDay()];
      
      const result = await predictionService.getBestSlots(dayName);
      
      if (result.success && result.best_slots) {
        setBestSlots(result.best_slots);
        setShowBestSlotsModal(true);
      }
    } catch (error) {
      console.error('Error getting best slots:', error);
      alert('Failed to get time recommendations. Please try again.');
    } finally {
      setIsLoadingBestSlots(false);
    }
  };

  const handleLocationUpdate = (location) => {
    setUserLocation(location);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Map Section */}
      <div className="w-1/3 flex flex-col border-r border-gray-700/50">
        <div className="p-4 flex-shrink-0">
          <HospitalSearch
            onSearchResults={handleSearchResults}
            userLocation={userLocation}
          />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative overflow-hidden">
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
      <div className="w-2/3 flex flex-col h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          {selectedHospital ? (
          <>
            <div>
              <h2 className="text-3xl font-bold text-white">
                {selectedHospital.name || 'Select a Hospital'}
              </h2>
              <p className="text-gray-400 mt-1">{selectedHospital.address || ''}</p>
              {selectedHospital.phone && (
                <p className="text-gray-400 text-sm mt-1">
                  📞 {selectedHospital.phone}
                </p>
              )}
              <div className="flex items-center mt-2 space-x-4">
                {selectedHospital.distance && (
                  <span className="text-primary font-semibold">
                    🚗 {selectedHospital.distance}
                  </span>
                )}
                {selectedHospital.rating && (
                  <span className="text-yellow-400 font-semibold">
                    ⭐ {selectedHospital.rating}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              Select a Hospital
            </h3>
            <p className="text-gray-400">
              Click on a hospital marker on the map to view details and wait times
            </p>
          </div>
        )}

        {/* Wait Time Cards */}
        {selectedHospital && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
            const waitTime = waitTimeData[dept.id];
            const progress = waitTime ? Math.min(100, (waitTime / 60) * 100) : 0;
            const colorClass = dept.color === 'primary' ? 'bg-primary' : dept.color === 'green' ? 'bg-green-500' : 'bg-red-500';
            
            return (
              <motion.div
                key={dept.id}
                className="bg-gray-800/50 border border-primary/20 rounded-xl p-5 backdrop-blur-lg shadow-2xl shadow-primary/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dept.id === 'general' ? 0 : dept.id === 'opd' ? 0.1 : 0.2 }}
              >
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg text-white">{dept.title}</h3>
                  {isPredictingWaitTime && !waitTime ? (
                    <div className="flex items-center mt-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      <span className="text-gray-400 text-sm">Predicting...</span>
                    </div>
                  ) : waitTime ? (
                    <>
                      <p className="text-3xl font-bold text-primary mt-2">
                        {waitTime}{" "}
                        <span className="text-base font-medium text-gray-400">
                          mins
                        </span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Predicted Wait Time</p>
                    </>
                  ) : (
                    <p className="text-gray-400 mt-2 text-sm">Select a hospital to see wait time</p>
                  )}
                  <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-4">
                    <motion.div
                      className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}

        {/* Historical Chart Section */}
        {selectedHospital && (
          <div className="pt-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Historical Wait Times (Last 7 Days)
            </h3>
            <div className="mt-4 bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              {historicalData.length > 0 ? (
              <div className="aspect-video relative">
                {/* Simple bar chart */}
                <div className="h-full flex items-end justify-between gap-2">
                  {historicalData.map((item, index) => {
                    const maxWait = Math.max(...historicalData.map(d => d.waitTime));
                    const height = (item.waitTime / maxWait) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end">
                        <div className="w-full flex flex-col items-center">
                          <div
                            className="w-full bg-primary rounded-t transition-all duration-500 hover:bg-primary/80"
                            style={{ height: `${height}%`, minHeight: '10px' }}
                            title={`${item.waitTime} mins`}
                          ></div>
                          <div className="text-xs text-gray-400 mt-2 text-center">
                            <div className="font-semibold">{item.waitTime}m</div>
                            <div className="text-gray-500">{item.day}</div>
                            <div className="text-gray-600 text-[10px]">{item.date}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
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
                  <p className="text-gray-400">Select a hospital to view historical data</p>
                </div>
              </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 opacity-0 animate-fade-slide-in">
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <div className="text-sm text-gray-400">
                Welcome back,{" "}
                <span className="text-primary font-semibold">
                  {user.firstName}
                </span>
                !
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  My Profile
                </button>
                <button
                  onClick={handleGetBestTimeToVisit}
                  disabled={isLoadingBestSlots}
                  className="bg-primary text-background-dark font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoadingBestSlots ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background-dark mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Get Best Time to Visit
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetBestTimeToVisit}
                  disabled={isLoadingBestSlots}
                  className="bg-primary text-background-dark font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoadingBestSlots ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background-dark mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Get Best Time to Visit
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Best Slots Modal */}
      <AnimatePresence>
        {showBestSlotsModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBestSlotsModal(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-primary" />
                    Best Time Slots to Visit
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Recommended time slots for today ({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })})
                  </p>
                </div>
                <button
                  onClick={() => setShowBestSlotsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {bestSlots.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-gray-300 mb-4">
                      Here are the top 5 best time slots with lowest predicted wait times:
                    </p>
                    {bestSlots.map((slot, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-primary/50 transition-all"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/20 text-primary rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="text-xl font-bold text-white">{slot.time}</span>
                              </div>
                              <p className="text-sm text-gray-400 mt-1">
                                {slot.hour_of_day < 12 ? 'Morning' : slot.hour_of_day < 17 ? 'Afternoon' : 'Evening'} slot
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {slot.predicted_wait} <span className="text-sm text-gray-400">min</span>
                            </div>
                            <p className="text-xs text-gray-400">Predicted wait</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No time slots available</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700 flex justify-end">
                <Button
                  onClick={() => setShowBestSlotsModal(false)}
                  className="bg-primary hover:bg-primary/90 text-background-dark"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
