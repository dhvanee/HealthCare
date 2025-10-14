import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, User, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";
import { modalBackdrop, modalContent, fadeInUp, listContainer, listItem } from "../../lib/motion";

const BookingModal = ({
  isOpen,
  onClose,
  hospital,
  counter,
  onBookAppointment,
  availableSlots = [],
  loading = false,
}) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    phone: "",
    email: "",
    emergencyContact: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate("");
      setSelectedTime("");
      setPatientInfo({
        name: "",
        phone: "",
        email: "",
        emergencyContact: "",
        reason: "",
      });
      setErrors({});
    }
  }, [isOpen]);

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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!patientInfo.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!patientInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(patientInfo.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!patientInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(patientInfo.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!selectedDate) {
      newErrors.date = "Please select a date";
    }

    if (!selectedTime) {
      newErrors.time = "Please select a time slot";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onBookAppointment({
        hospitalId: hospital._id,
        counterId: counter._id,
        appointmentTime: `${selectedDate}T${selectedTime}:00`,
        patientInfo,
      });
      setStep(4); // Success step
    } catch (error) {
      console.error("Booking failed:", error);
      // Handle error - could show error step
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    } else if (step === 2 && validateForm()) {
      setStep(3);
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
                Book Appointment
              </motion.h2>
              <motion.p
                className="text-gray-600 mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {hospital?.name} - {counter?.name}
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
                          onClick={() => setSelectedDate(date.value)}
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
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Select Time Slot
                      </h3>
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
                        value={patientInfo.name}
                        onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
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
                        value={patientInfo.phone}
                        onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
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
                        value={patientInfo.email}
                        onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
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
                        value={patientInfo.emergencyContact}
                        onChange={(e) => setPatientInfo({ ...patientInfo, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit
                    </label>
                    <textarea
                      value={patientInfo.reason}
                      onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Brief description of the reason for your visit..."
                    />
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
                  <h3 className="text-lg font-semibold mb-4">Review Your Appointment</h3>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hospital:</span>
                        <span className="font-medium">{hospital?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{counter?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patient:</span>
                        <span className="font-medium">{patientInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-medium">{patientInfo.phone}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-blue-50 p-4 rounded-lg">
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
                    Appointment Booked Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your appointment has been confirmed. A confirmation email will be sent shortly.
                  </p>
                  <Button onClick={onClose} variant="medical" size="lg">
                    Done
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {step < 4 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={step === 1 ? onClose : prevStep}
                disabled={isSubmitting}
              >
                {step === 1 ? "Cancel" : "Back"}
              </Button>

              <Button
                onClick={nextStep}
                disabled={
                  isSubmitting ||
                  (step === 1 && (!selectedDate || !selectedTime)) ||
                  (step === 2 && !patientInfo.name.trim())
                }
                loading={isSubmitting}
                loadingText="Booking..."
                variant="medical"
              >
                {step === 3 ? "Confirm Booking" : "Continue"}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
