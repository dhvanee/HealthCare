import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Predictions = () => {
  const [selectedHospital, setSelectedHospital] = useState('City Hospital');
  const [selectedDepartment, setSelectedDepartment] = useState('Emergency');
  
  // Mock data for hospitals and departments
  const hospitals = ['City Hospital', 'General Medical Center', 'St. Mary\'s Hospital', 'Community Care Hospital'];
  const departments = ['Emergency', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology'];
  
  // Mock data for prediction timeline
  const timelineData = [
    { time: '8 AM', predicted: 15, actual: 18, confidence: 92 },
    { time: '9 AM', predicted: 20, actual: 22, confidence: 90 },
    { time: '10 AM', predicted: 25, actual: 24, confidence: 94 },
    { time: '11 AM', predicted: 30, actual: 32, confidence: 89 },
    { time: '12 PM', predicted: 35, actual: 33, confidence: 91 },
    { time: '1 PM', predicted: 30, actual: 28, confidence: 93 },
    { time: '2 PM', predicted: 25, actual: 26, confidence: 95 },
    { time: '3 PM', predicted: 20, actual: 21, confidence: 94 },
    { time: '4 PM', predicted: 15, actual: 16, confidence: 92 },
    { time: '5 PM', predicted: 10, actual: 12, confidence: 90 },
  ];

  // Current prediction data
  const currentPrediction = {
    waitTime: '24 min',
    confidence: '87%',
    errorMargin: '±5 min',
    lastUpdated: '2 min ago',
    factors: [
      { name: 'Time of day', impact: 'High' },
      { name: 'Staff availability', impact: 'Medium' },
      { name: 'Patient volume', impact: 'High' },
      { name: 'Procedure complexity', impact: 'Low' },
    ]
  };

  return (
    <div className="pt-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Wait Time Prediction</h1>
        <p className="text-gray-600 mt-2">Get accurate predictions for hospital wait times</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Hospital</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
          >
            {hospitals.map(hospital => (
              <option key={hospital} value={hospital}>{hospital}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map(department => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Predicted vs Actual Wait Times</CardTitle>
              <CardDescription>Today's data for {selectedHospital} - {selectedDepartment}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="actual" stroke="#4A90E2" strokeWidth={2} name="Actual Wait" />
                  <Line type="monotone" dataKey="predicted" stroke="#00C4CC" strokeWidth={2} name="Predicted Wait" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Current Prediction</CardTitle>
              <CardDescription>Last updated {currentPrediction.lastUpdated}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">{currentPrediction.waitTime}</div>
                <div className="text-sm text-gray-500 mb-6">Estimated wait time</div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: currentPrediction.confidence }}
                  ></div>
                </div>
                <div className="flex justify-between w-full text-xs text-gray-500 mb-6">
                  <span>Prediction confidence: {currentPrediction.confidence}</span>
                  <span>MAE: {currentPrediction.errorMargin}</span>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4">
                  Get Queue Token
                </Button>
                
                <button className="text-blue-600 text-sm hover:underline">
                  View model information
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Prediction Confidence Over Time</CardTitle>
            <CardDescription>Confidence levels for predictions throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[50, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="confidence" stroke="#00C4CC" fill="#00C4CC" fillOpacity={0.2} name="Confidence %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Key Factors Influencing Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPrediction.factors.map((factor, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    factor.impact === 'High' ? 'bg-red-500' : 
                    factor.impact === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{factor.name}</h4>
                  </div>
                  <div className={`text-xs font-medium ${
                    factor.impact === 'High' ? 'text-red-600' : 
                    factor.impact === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {factor.impact} Impact
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Predictions;