import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

// Fix for Leaflet marker icons in React
import L from 'leaflet';

// Create a Map component to handle client-side rendering
const Map = ({ center, zoom, children }) => {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      {children}
    </MapContainer>
  );
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Hospitals = () => {
  // Mock data for hospitals
  const hospitals = [
    { 
      id: 1, 
      name: 'City Hospital', 
      position: [51.505, -0.09], 
      distance: '1.2 km', 
      queueLength: 15, 
      waitTime: '25 min',
      address: '123 Main St, London',
      contact: '+44 20 1234 5678',
      departments: ['Emergency', 'Cardiology', 'Pediatrics']
    },
    { 
      id: 2, 
      name: 'General Medical Center', 
      position: [51.51, -0.1], 
      distance: '2.5 km', 
      queueLength: 8, 
      waitTime: '15 min',
      address: '456 Park Ave, London',
      contact: '+44 20 2345 6789',
      departments: ['Emergency', 'Orthopedics', 'Neurology']
    },
    { 
      id: 3, 
      name: 'St. Mary\'s Hospital', 
      position: [51.515, -0.08], 
      distance: '3.1 km', 
      queueLength: 22, 
      waitTime: '40 min',
      address: '789 Oak St, London',
      contact: '+44 20 3456 7890',
      departments: ['Emergency', 'Oncology', 'Maternity']
    },
    { 
      id: 4, 
      name: 'Community Care Hospital', 
      position: [51.5, -0.095], 
      distance: '1.8 km', 
      queueLength: 5, 
      waitTime: '10 min',
      address: '101 Elm St, London',
      contact: '+44 20 4567 8901',
      departments: ['Emergency', 'Family Medicine', 'Psychiatry']
    },
  ];

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');

  const departments = ['All', 'Emergency', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Oncology', 'Maternity', 'Family Medicine', 'Psychiatry'];

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || hospital.departments.includes(filterDepartment);
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="pt-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Find Hospitals Near You</h1>
        <p className="text-gray-600 mt-2">Locate and check wait times at hospitals in your area</p>
      </motion.div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search hospitals..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="h-[500px]">
            <div className="h-full w-full">
              {typeof window !== 'undefined' && (
                <Map center={[51.505, -0.09]} zoom={13}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {hospitals.map(hospital => (
                    <Marker 
                      key={hospital.id} 
                      position={hospital.position}
                      eventHandlers={{
                        click: () => {
                          setSelectedHospital(hospital);
                        },
                      }}
                    >
                      <Popup>
                        <div>
                          <h3 className="font-bold">{hospital.name}</h3>
                          <p>Wait time: {hospital.waitTime}</p>
                          <p>Queue: {hospital.queueLength} patients</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </Map>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4 h-[500px] overflow-y-auto pr-2"
        >
          {filteredHospitals.map(hospital => (
            <Card 
              key={hospital.id} 
              className={`cursor-pointer transition-all ${selectedHospital?.id === hospital.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedHospital(hospital)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{hospital.name}</h3>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{hospital.distance}</span>
                  <span>{hospital.waitTime} wait</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (hospital.queueLength / 30) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>{hospital.queueLength} in queue</span>
                    <span>30 capacity</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to predictions page with this hospital
                  }}
                >
                  View Predictions
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      {selectedHospital && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>{selectedHospital.name} Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Address</h4>
                  <p>{selectedHospital.address}</p>
                  
                  <h4 className="font-medium text-gray-700 mt-4">Contact</h4>
                  <p>{selectedHospital.contact}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Departments</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedHospital.departments.map(dept => (
                      <span key={dept} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {dept}
                      </span>
                    ))}
                  </div>
                  
                  <h4 className="font-medium text-gray-700 mt-4">Current Status</h4>
                  <div className="flex items-center mt-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Open</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Hospitals;