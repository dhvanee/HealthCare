import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, User, Phone, Mail, AlertCircle, CheckCircle, FileText, Activity } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { modalBackdrop, modalContent, fadeInUp, listContainer, listItem } from "../../lib/motion";
import { ticketService, authService, predictionService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { getHospitalWithCache, clearHospitalCache, prepareHospitalForBooking } from "../../services/hospitalCacheService";
import { updateAppointment } from "../../services/ticketService";

const BookingModal = ({
  isOpen,
  onClose,
  hospital,
  counter,
  onBookingSuccess,
  availableSlots = [],
  loading = false,
  isEditMode = false,
  existingTicket = null,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [currentHospital, setCurrentHospital] = useState(hospital);
  const [bookingData, setBookingData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    emergencyContact: "",
    reasonForVisit: "",
    symptoms: "",
    patientType: "new",
    priority: "normal",
    hasInsurance: false,
    insuranceProvider: "",
    policyNumber: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [predictedWaitTime, setPredictedWaitTime] = useState(null);
  const [isPredictingWaitTime, setIsPredictingWaitTime] = useState(false);
  const [bestSlots, setBestSlots] = useState([]);
  const [isLoadingBestSlots, setIsLoadingBestSlots] = useState(false);

  // Check if user is authenticated
  const checkAuthentication = () => {
    const token = authService.getAuthToken();
    if (!token) {
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  // Quick login/signup for testing
  const handleQuickAuth = async () => {
    setAuthLoading(true);
    try {
      // Try to login with test credentials or create a test account
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = "Test@123456";
      
      // First try to signup
      try {
        const signupData = {
          name: bookingData.name || "Test User",
          email: testEmail,
          password: testPassword,
          phone: bookingData.phone || "1234567890"
        };
        
        const signupResult = await authService.signup(signupData);
        
        if (signupResult.success) {
          setShowAuthPrompt(false);
          return;
        }
      } catch (signupError) {
        // Signup failed, try login
      }
      
      // If signup fails, use existing test account
      const loginResult = await authService.login({
        email: "test@example.com",
        password: "Test@123456"
      });
      if (loginResult.success) {
        setShowAuthPrompt(false);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ auth: 'Failed to authenticate. Please try again.' });
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset form when modal opens/closes and retrieve hospital data
  useEffect(() => {
    const loadHospitalData = async () => {
      if (isOpen) {
        setStep(1);
        setErrors({});
        setBookingResult(null);
        
        // If edit mode, pre-fill with existing ticket data
        if (isEditMode && existingTicket) {
          const appointmentDate = new Date(existingTicket.appointmentDateTime);
          setSelectedDate(appointmentDate.toISOString().split('T')[0]);
          setSelectedTime(appointmentDate.toTimeString().slice(0, 5)); // HH:MM format
          
          setBookingData({
            name: user?.name || "",
            phone: user?.phone || "",
            email: user?.email || "",
            emergencyContact: "",
            reasonForVisit: existingTicket.reasonForVisit || "",
            symptoms: Array.isArray(existingTicket.symptoms) 
              ? existingTicket.symptoms.join(', ') 
              : existingTicket.symptoms || "",
            patientType: existingTicket.patientType || "new",
            priority: existingTicket.priority || "normal",
            hasInsurance: existingTicket.insurance?.hasInsurance || false,
            insuranceProvider: existingTicket.insurance?.provider || "",
            policyNumber: existingTicket.insurance?.policyNumber || ""
          });
        } else {
          // New booking mode
          setSelectedDate("");
          setSelectedTime("");
          setBookingData({
            name: user?.name || "",
            phone: user?.phone || "",
            email: user?.email || "",
            emergencyContact: "",
            reasonForVisit: "",
            symptoms: "",
            patientType: "new",
            priority: "normal",
            hasInsurance: false,
            insuranceProvider: "",
            policyNumber: ""
          });
        }
        
        // Retrieve hospital using hybrid caching
        if (!hospital) {
          // Try to get from cache or database
          const hospitalId = new URLSearchParams(window.location.search).get('hospitalId');
          if (hospitalId) {
            const cachedHospital = await getHospitalWithCache(hospitalId);
            if (cachedHospital) {
              setCurrentHospital(cachedHospital);
            } else {
              setCurrentHospital(null);
              console.warn('Hospital not found in cache or database');
            }
          } else {
            setCurrentHospital(null);
          }
        } else {
          setCurrentHospital(hospital);
        }
      }
    };
    
    loadHospitalData();
  }, [isOpen, user, hospital, isEditMode, existingTicket]);

  // Generate next 7 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        isToday: i === 0
      });
    }
    return dates;
  };

  // Predict wait time when date is selected
  const handleDateSelection = async (date) => {
    setSelectedDate(date);
    setPredictedWaitTime(null);
    
    // If time is also selected, predict wait time
    if (selectedTime) {
      await predictWaitTimeForDateTime(date, selectedTime);
    }
  };

  // Predict wait time for selected date and time
  const predictWaitTimeForDateTime = async (date, time) => {
    if (!date || !time) return;
    
    setIsPredictingWaitTime(true);
    try {
      // Get current date to check if it's a holiday (simplified - you might want to use a holiday API)
      const dateObj = new Date(date);
      const isHoliday = 0; // Static for now, can be enhanced with holiday API
      
      // Static values for now (as per requirements)
      const currentQueueLength = 12; // Static queue length
      const staffCount = 3; // Static staff count
      const historicalThroughput = 6.2; // Static historical throughput
      
      const predictionPayload = {
        date,
        time,
        current_queue_length: currentQueueLength,
        staff_count: staffCount,
        historical_throughput: historicalThroughput,
        is_holiday: isHoliday
      };
      
      const result = await predictionService.predictWaitTime(predictionPayload);
      
      if (result.success) {
        setPredictedWaitTime({
          minutes: result.predicted_wait_time_minutes,
          confidence: result.confidence_interval
        });
      }
    } catch (error) {
      console.error('Error predicting wait time:', error);
      // Don't show error to user, just log it
    } finally {
      setIsPredictingWaitTime(false);
    }
  };

  // Get best time slots for selected day
  const handleGetTimeRecommendation = async () => {
    if (!selectedDate) {
      setErrors({ date: 'Please select a date first' });
      return;
    }
    
    setIsLoadingBestSlots(true);
    setBestSlots([]);
    
    try {
      const dateObj = new Date(selectedDate);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[dateObj.getDay()];
      
      const result = await predictionService.getBestSlots(dayName);
      
      if (result.success && result.best_slots) {
        setBestSlots(result.best_slots);
        
        // Update available slots with best slots
        const updatedSlots = result.best_slots.map(slot => ({
          time: slot.time,
          waitTime: Math.round(slot.predicted_wait),
          availability: slot.predicted_wait < 20 ? 'high' : slot.predicted_wait < 30 ? 'medium' : 'low'
        }));
        
        // Note: availableSlots is passed as prop, so we can't directly set it
        // The parent component should handle this, or we can use a callback
        // For now, we'll store it in state and the parent can access it via a ref or callback
      }
    } catch (error) {
      console.error('Error getting best slots:', error);
      setErrors({ slots: 'Failed to get time recommendations. Please try again.' });
    } finally {
      setIsLoadingBestSlots(false);
    }
  };

  // Update wait time prediction when time is selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      predictWaitTimeForDateTime(selectedDate, selectedTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTime]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!bookingData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!bookingData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(bookingData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!bookingData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(bookingData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!selectedDate) {
      newErrors.date = "Please select a date";
    }

    if (!selectedTime) {
      newErrors.time = "Please select a time slot";
    }

    if (!bookingData.reasonForVisit.trim()) {
      newErrors.reasonForVisit = "Please provide a reason for visit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Check authentication first
    if (!checkAuthentication()) {
      return;
    }
    
    // Use currentHospital (from props or localStorage)
    const hospitalToUse = currentHospital || hospital;
    
    if (!validateForm()) {
      return;
    }

    if (!hospitalToUse || (!hospitalToUse._id && !hospitalToUse.id)) {
      console.error('Missing hospital ID:', { 
        fullHospital: hospitalToUse,
        currentHospital,
        hospital
      });
      setErrors({ submit: "Invalid hospital information. Please try again." });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate date and time
      if (!selectedDate || !selectedTime) {
        throw new Error('Please select both date and time');
      }
      
      // Clean and validate the time format (should be HH:MM)
      const timeMatch = selectedTime.match(/^(\d{2}):(\d{2})$/);
      if (!timeMatch) {
        throw new Error('Invalid time format. Expected HH:MM');
      }
      
      // Parse date and time components
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      // Create date in LOCAL timezone (not UTC)
      const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      // Validate the date is valid
      if (isNaN(appointmentDate.getTime())) {
        throw new Error('Invalid date or time selected. Please try again.');
      }
      
      // Check if appointment is in the past
      const now = new Date();
      const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
      
      if (appointmentDate < minTime) {
        throw new Error('Appointment time must be at least 30 minutes from now. Please select a future time slot.');
      }
      
      const appointmentDateTime = appointmentDate.toISOString();

      // Parse symptoms if provided
      const symptomsArray = bookingData.symptoms
        ? bookingData.symptoms.split(',').map(s => s.trim()).filter(s => s)
        : [];

      // Prepare hospital data using helper function
      const hospitalDataForAPI = prepareHospitalForBooking(hospitalToUse);
      
      // Ensure hospitalId is a string
      const hospitalId = String(hospitalDataForAPI._id || hospitalDataForAPI.id || hospitalDataForAPI.place_id || 'external');
      
      const apiBookingData = {
        hospitalId: hospitalId,
        hospitalData: hospitalDataForAPI,
        appointmentDateTime,
        reasonForVisit: bookingData.reasonForVisit || '',
        symptoms: symptomsArray,
        patientType: bookingData.patientType,
        priority: bookingData.priority
      };
      
      // Only add counterId if it exists
      if (counter?._id || counter?.id) {
        apiBookingData.counterId = String(counter._id || counter.id);
      }
      
      // Only add insurance if user has insurance
      if (bookingData.hasInsurance) {
        apiBookingData.insurance = {
          hasInsurance: true,
          provider: bookingData.insuranceProvider || '',
          policyNumber: bookingData.policyNumber || ''
        };
      }

      let response;
      if (isEditMode && existingTicket) {
        // Update existing appointment
        response = await updateAppointment(existingTicket._id, {
          appointmentDateTime: apiBookingData.appointmentDateTime,
          reasonForVisit: apiBookingData.reasonForVisit,
          symptoms: apiBookingData.symptoms
        });
        
        // Handle update response
        const responseData = response.data || response;
        const ticketData = responseData.ticket || responseData;
        
        if (ticketData && ticketData._id) {
          // Clear hospital cache after successful update
          clearHospitalCache();
          
          // Store the complete ticket data for display
          setBookingResult(ticketData);
          setStep(4); // Success step
          
          // Notify parent component if callback provided
          if (onBookingSuccess) {
            onBookingSuccess({
              ...apiBookingData,
              appointmentDateTime: apiBookingData.appointmentDateTime,
              selectedDate,
              selectedTime
            });
          }
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        // Create new booking
        response = await ticketService.bookTicket(apiBookingData);
        
        // Handle backend response format
        // Backend returns: { success: true, data: { ticket: {...}, counter: {...}, recommendations: {...} } }
        const responseData = response.data || response;
        const ticketData = responseData.ticket || responseData;
        
        if (ticketData && (ticketData.ticketNumber || ticketData._id)) {
          // Clear hospital cache after successful booking
          clearHospitalCache();
          
          // Store the complete ticket data for display
          setBookingResult({
            ...ticketData,
            counter: responseData.counter,
            recommendations: responseData.recommendations
          });
          setStep(4); // Success step
          
          // Notify parent component if callback provided
          if (onBookingSuccess) {
            onBookingSuccess(ticketData);
          }
        } else {
          throw new Error('Invalid response from server');
        }
      }
    } catch (error) {
      console.error("Booking failed with error:", error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('token')) {
        setShowAuthPrompt(true);
        setErrors({ submit: 'Authentication required. Please log in to continue.' });
      } else {
        setErrors({ 
          submit: error.message || 'Failed to book appointment. Please try again.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
      setErrors({}); // Clear any previous errors
    } else if (step === 2) {
      if (validateForm()) {
        setStep(3);
      }
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const slotVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        variants={modalBackdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          variants={modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <motion.h2
                className="text-2xl font-bold text-gray-900"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {isEditMode ? 'Modify Appointment' : 'Book Appointment'}
              </motion.h2>
              <motion.p
                className="text-gray-600 mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {(currentHospital || hospital)?.name || 'Hospital'} - {counter?.name || 'Counter'}
              </motion.p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <motion.div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                      stepNum <= step
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    )}
                    animate={{
                      backgroundColor: stepNum <= step ? "#3b82f6" : "#e5e7eb",
                      color: stepNum <= step ? "#ffffff" : "#9ca3af"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {stepNum < step ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      stepNum
                    )}
                  </motion.div>
                  {stepNum < 4 && (
                    <motion.div
                      className={cn(
                        "flex-1 h-1 mx-2 rounded",
                        stepNum < step ? "bg-blue-500" : "bg-gray-200"
                      )}
                      animate={{
                        backgroundColor: stepNum < step ? "#3b82f6" : "#e5e7eb"
                      }}
                      transition={{ duration: 0.3, delay: stepNum * 0.1 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Select Date & Time</span>
              <span>Patient Info</span>
              <span>Review</span>
              <span>Confirmation</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Auth Prompt */}
            {showAuthPrompt && (
              <motion.div
                className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Authentication Required
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      You need to be logged in to book an appointment. Click below to create a test account.
                    </p>
                    <Button
                      onClick={handleQuickAuth}
                      disabled={authLoading}
                      loading={authLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      size="sm"
                    >
                      {authLoading ? 'Authenticating...' : 'Continue with Test Account'}
                    </Button>
                    {errors.auth && (
                      <p className="text-xs text-red-600 mt-2">{errors.auth}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            <AnimatePresence mode="wait">
              {/* Step 1: Date & Time Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Date Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Select Date
                    </h3>
                    <motion.div
                      className="grid grid-cols-7 gap-2"
                      variants={listContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {getAvailableDates().map((date) => (
                        <motion.button
                          key={date.value}
                          className={cn(
                            "p-3 rounded-lg border text-center transition-all duration-200",
                            selectedDate === date.value
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:bg-blue-50",
                            date.isToday && "ring-2 ring-blue-200"
                          )}
                          onClick={() => handleDateSelection(date.value)}
                          variants={listItem}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <div className="text-sm font-medium">{date.label.split(' ')[0]}</div>
                          <div className="text-xs">{date.label.split(' ').slice(1).join(' ')}</div>
                          {date.isToday && <div className="text-xs text-blue-500 font-medium">Today</div>}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Select Time Slot
                        </h3>
                        <Button
                          onClick={handleGetTimeRecommendation}
                          disabled={isLoadingBestSlots || !selectedDate}
                          loading={isLoadingBestSlots}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          {isLoadingBestSlots ? 'Loading...' : 'Get Time Recommendation'}
                        </Button>
                      </div>
                      
                      {/* Predicted Wait Time Display */}
                      {predictedWaitTime && selectedTime && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Activity className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-blue-900">
                                Predicted Wait Time:
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-blue-600">
                                {Math.round(predictedWaitTime.minutes)} min
                              </span>
                              {predictedWaitTime.confidence && (
                                <div className="text-xs text-blue-600">
                                  ({Math.round(predictedWaitTime.confidence.lower_bound)} - {Math.round(predictedWaitTime.confidence.upper_bound)} min)
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {isPredictingWaitTime && (
                        <div className="mb-4 text-sm text-gray-500 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                          Predicting wait time...
                        </div>
                      )}
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSlots.map((slot, index) => (
                          <motion.button
                            key={slot.time}
                            className={cn(
                              "p-3 rounded-lg border text-center transition-all duration-200",
                              selectedTime === slot.time
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                            )}
                            onClick={() => setSelectedTime(slot.time)}
                            variants={slotVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            whileTap="tap"
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="font-medium">{slot.time}</div>
                            <div className="text-xs text-gray-500">{slot.waitTime} min wait</div>
                            <div className={cn(
                              "text-xs mt-1 px-2 py-1 rounded-full",
                              slot.availability === "high" && "bg-green-100 text-green-700",
                              slot.availability === "medium" && "bg-yellow-100 text-yellow-700",
                              slot.availability === "low" && "bg-red-100 text-red-700"
                            )}>
                              {slot.availability}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {errors.date && (
                    <motion.p
                      className="text-red-500 text-sm flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.date}
                    </motion.p>
                  )}
                  {errors.time && (
                    <motion.p
                      className="text-red-500 text-sm flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.time}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Step 2: Patient Information */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Patient Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        className={cn(
                          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                          errors.name ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="Enter full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        className={cn(
                          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                          errors.phone ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="Enter phone number"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        className={cn(
                          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                          errors.email ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        value={bookingData.emergencyContact}
                        onChange={(e) => setBookingData({ ...bookingData, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Emergency contact number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Type *
                      </label>
                      <select
                        value={bookingData.patientType}
                        onChange={(e) => setBookingData({ ...bookingData, patientType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="new">New Patient</option>
                        <option value="follow_up">Follow-up</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level *
                      </label>
                      <select
                        value={bookingData.priority}
                        onChange={(e) => setBookingData({ ...bookingData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit *
                    </label>
                    <textarea
                      value={bookingData.reasonForVisit}
                      onChange={(e) => setBookingData({ ...bookingData, reasonForVisit: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                        errors.reasonForVisit ? "border-red-500" : "border-gray-300"
                      )}
                      rows={2}
                      placeholder="Brief description of the reason for your visit..."
                      maxLength={500}
                    />
                    {errors.reasonForVisit && (
                      <p className="text-red-500 text-xs mt-1">{errors.reasonForVisit}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms (comma separated)
                    </label>
                    <input
                      type="text"
                      value={bookingData.symptoms}
                      onChange={(e) => setBookingData({ ...bookingData, symptoms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Fever, Headache, Cough"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple symptoms with commas</p>
                  </div>

                  {/* Insurance Information */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-md font-semibold mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Insurance Information (Optional)
                    </h4>
                    
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="hasInsurance"
                        checked={bookingData.hasInsurance}
                        onChange={(e) => setBookingData({ ...bookingData, hasInsurance: e.target.checked })}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="hasInsurance" className="text-sm font-medium text-gray-700">
                        I have health insurance
                      </label>
                    </div>

                    {bookingData.hasInsurance && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Insurance Provider
                          </label>
                          <input
                            type="text"
                            value={bookingData.insuranceProvider}
                            onChange={(e) => setBookingData({ ...bookingData, insuranceProvider: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Provider name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Policy Number
                          </label>
                          <input
                            type="text"
                            value={bookingData.policyNumber}
                            onChange={(e) => setBookingData({ ...bookingData, policyNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Policy number"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Review Your Appointment</h3>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Hospital:</span>
                        <span className="font-medium text-gray-900">{(currentHospital || hospital)?.name || 'Unknown Hospital'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Department:</span>
                        <span className="font-medium text-gray-900">{counter?.name || counter?.type}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Date:</span>
                        <span className="font-medium text-gray-900 text-right">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Time:</span>
                        <span className="font-medium text-gray-900">{selectedTime}</span>
                      </div>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Patient:</span>
                        <span className="font-medium text-gray-900">{bookingData.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Contact:</span>
                        <span className="font-medium text-gray-900">{bookingData.phone}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Email:</span>
                        <span className="font-medium text-gray-900 text-sm">{bookingData.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Patient Type:</span>
                        <span className="font-medium text-gray-900 capitalize">{bookingData.patientType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Priority:</span>
                        <span className={cn(
                          "font-medium capitalize px-3 py-1 rounded-full text-xs",
                          bookingData.priority === 'emergency' && "bg-red-100 text-red-700 border border-red-300",
                          bookingData.priority === 'high' && "bg-orange-100 text-orange-700 border border-orange-300",
                          bookingData.priority === 'normal' && "bg-blue-100 text-blue-700 border border-blue-300",
                          bookingData.priority === 'low' && "bg-gray-100 text-gray-700 border border-gray-300"
                        )}>
                          {bookingData.priority}
                        </span>
                      </div>
                      
                      {bookingData.reasonForVisit && (
                        <div className="py-2">
                          <span className="text-gray-600 text-sm block mb-2">Reason for Visit:</span>
                          <span className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{bookingData.reasonForVisit}</span>
                        </div>
                      )}
                      
                      {bookingData.symptoms && (
                        <div className="py-2">
                          <span className="text-gray-600 text-sm block mb-2">Symptoms:</span>
                          <div className="flex flex-wrap gap-2">
                            {bookingData.symptoms.split(',').map((symptom, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200">
                                {symptom.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {bookingData.hasInsurance && (
                        <>
                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 text-sm">Insurance:</span>
                            <span className="font-medium text-gray-900">{bookingData.insuranceProvider}</span>
                          </div>
                          {bookingData.policyNumber && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 text-sm">Policy #:</span>
                              <span className="font-medium text-gray-900 text-sm">{bookingData.policyNumber}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {errors.submit && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-sm text-red-800 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errors.submit}
                      </p>
                    </motion.div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Please arrive 15 minutes early for check-in.
                      A confirmation will be sent to your email address.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-center py-8"
                >
                  <motion.div
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isEditMode ? 'Appointment Updated Successfully!' : 'Appointment Booked Successfully!'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isEditMode 
                      ? 'Your appointment has been updated successfully.'
                      : 'Your appointment has been confirmed. A confirmation email will be sent shortly.'}
                  </p>
                  
                  {bookingResult && (
                    <div className="mb-6 text-left bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium text-sm">Ticket Number:</span>
                          <span className="font-bold text-blue-600 text-lg">{bookingResult.ticketNumber}</span>
                        </div>
                        {bookingResult.queuePosition && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 text-sm">Queue Position:</span>
                            <span className="font-semibold text-gray-900 text-lg">#{bookingResult.queuePosition}</span>
                          </div>
                        )}
                        {bookingResult.estimatedWaitTime && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 text-sm">Estimated Wait:</span>
                            <span className="font-semibold text-gray-900">{bookingResult.estimatedWaitTime} minutes</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 text-sm">Status:</span>
                          <span className="font-medium capitalize px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs border border-green-300">
                            {bookingResult.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={onClose} 
                      size="lg" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
                    >
                      Done
                    </Button>
                    <Button 
                      onClick={() => {
                        onClose();
                        // Navigate to My Tickets page
                        window.location.href = '/tickets';
                      }} 
                      variant="outline" 
                      size="lg" 
                      className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 font-medium"
                    >
                      View My Tickets
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {step < 4 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={step === 1 ? onClose : prevStep}
                disabled={isSubmitting}
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 font-medium"
              >
                {step === 1 ? "Cancel" : "Back"}
              </Button>

              <Button
                onClick={nextStep}
                disabled={
                  isSubmitting ||
                  (step === 1 && (!selectedDate || !selectedTime)) ||
                  (step === 2 && (!bookingData.name.trim() || !bookingData.phone.trim() || !bookingData.email.trim() || !bookingData.reasonForVisit.trim()))
                  // Step 3 should never be disabled (unless submitting)
                }
                loading={isSubmitting}
                loadingText="Booking..."
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 3 ? (isEditMode ? "Update Appointment" : "Confirm Booking") : "Continue"}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
