const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Mock authentication token for development
const getAuthToken = () => {
  return localStorage.getItem('authToken') || 'mock-jwt-token-for-development';
};

// API configuration
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios-like API client without axios dependency
class ApiClient {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.headers = config.headers;
  }

  async request(method, url, options = {}) {
    const fullUrl = `${this.baseURL}${url}`;
    const token = getAuthToken();

    const requestOptions = {
      method: method.toUpperCase(),
      headers: {
        ...this.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    if (options.data) {
      requestOptions.body = JSON.stringify(options.data);
    }

    if (options.params) {
      const searchParams = new URLSearchParams(options.params);
      const separator = fullUrl.includes('?') ? '&' : '?';
      requestOptions.url = `${fullUrl}${separator}${searchParams.toString()}`;
    } else {
      requestOptions.url = fullUrl;
    }

    try {
      const response = await fetch(requestOptions.url || fullUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status, statusText: response.statusText };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  get(url, options = {}) {
    return this.request('GET', url, options);
  }

  post(url, data, options = {}) {
    return this.request('POST', url, { ...options, data });
  }

  put(url, data, options = {}) {
    return this.request('PUT', url, { ...options, data });
  }

  delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }
}

const api = new ApiClient(apiConfig);

// Hospital API calls
export const hospitalService = {
  // Get nearby hospitals
  getNearbyHospitals: async (latitude, longitude, radius = 10, filters = {}) => {
    try {
      const params = {
        latitude,
        longitude,
        radius,
        ...filters,
      };
      const response = await api.get('/hospitals/nearby', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          {
            _id: '1',
            name: 'City General Hospital',
            address: '123 Main St, City Center',
            distance: 2.5,
            rating: 4.2,
            type: 'general',
            emergencyServices: true,
            currentWaitTime: 25,
            coordinates: { lat: latitude + 0.01, lng: longitude + 0.01 },
            departments: ['Emergency', 'Cardiology', 'Neurology'],
            contactInfo: { phone: '+1234567890', email: 'info@citygeneral.com' }
          },
          {
            _id: '2',
            name: 'St. Mary\'s Medical Center',
            address: '456 Oak Avenue, Downtown',
            distance: 3.2,
            rating: 4.5,
            type: 'specialty',
            emergencyServices: true,
            currentWaitTime: 18,
            coordinates: { lat: latitude - 0.01, lng: longitude + 0.02 },
            departments: ['Surgery', 'Oncology', 'Pediatrics'],
            contactInfo: { phone: '+1234567891', email: 'contact@stmarys.com' }
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1
      };
    }
  },

  // Search hospitals
  searchHospitals: async (query, filters = {}) => {
    try {
      const params = { q: query, ...filters };
      const response = await api.get('/hospitals/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching hospitals:', error);
      return {
        success: true,
        data: [],
        total: 0,
        page: 1,
        totalPages: 1
      };
    }
  },

  // Get hospital details
  getHospitalDetails: async (hospitalId) => {
    try {
      const response = await api.get(`/hospitals/${hospitalId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      // Return mock detailed hospital data
      return {
        success: true,
        data: {
          _id: hospitalId,
          name: 'City General Hospital',
          description: 'Leading healthcare provider with state-of-the-art facilities and experienced medical professionals.',
          address: '123 Main St, City Center, State 12345',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          contactInfo: {
            phone: '+1234567890',
            email: 'info@citygeneral.com',
            website: 'www.citygeneral.com'
          },
          rating: 4.2,
          reviewCount: 324,
          type: 'general',
          emergencyServices: true,
          departments: [
            'Emergency Medicine',
            'Cardiology',
            'Neurology',
            'Orthopedics',
            'Radiology',
            'Laboratory Services'
          ],
          specialties: ['Heart Surgery', 'Brain Surgery', 'Cancer Treatment'],
          facilities: ['24/7 Emergency', 'ICU', 'Operating Theaters', 'Diagnostic Center'],
          operatingHours: {
            emergency: '24/7',
            outpatient: '8:00 AM - 6:00 PM',
            visiting: '10:00 AM - 8:00 PM'
          },
          insurance: ['Blue Cross', 'Aetna', 'Cigna', 'Medicare', 'Medicaid']
        }
      };
    }
  },

  // Get hospital counters
  getHospitalCounters: async (hospitalId, filters = {}) => {
    try {
      const response = await api.get(`/hospitals/${hospitalId}/counters`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching hospital counters:', error);
      return {
        success: true,
        data: [
          {
            _id: 'counter1',
            name: 'Registration Desk',
            department: 'General',
            type: 'registration',
            isActive: true,
            currentWaitTime: 12,
            queueLength: 8,
            averageServiceTime: 5,
            staffCount: 2
          },
          {
            _id: 'counter2',
            name: 'Emergency Triage',
            department: 'Emergency',
            type: 'triage',
            isActive: true,
            currentWaitTime: 25,
            queueLength: 15,
            averageServiceTime: 8,
            staffCount: 3
          },
        ]
      };
    }
  },

  // Get wait time prediction with ML-style static responses
  getWaitTimePrediction: async (hospitalId, counterId) => {
    try {
      const response = await api.get(`/hospitals/${hospitalId}/counters/${counterId}/wait-time`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wait time prediction:', error);
      // Static ML-style response
      return {
        success: true,
        data: {
          currentWaitTime: Math.floor(Math.random() * 45) + 5,
          predictedWaitTime: Math.floor(Math.random() * 40) + 10,
          confidence: 0.85 + Math.random() * 0.1,
          factors: [
            { name: 'Current Queue Length', impact: 'high', value: '12 patients' },
            { name: 'Staff Availability', impact: 'medium', value: '2 active staff' },
            { name: 'Historical Patterns', impact: 'high', value: 'Peak hour' },
            { name: 'Day of Week', impact: 'low', value: 'Tuesday' }
          ],
          recommendations: [
            'Consider visiting after 3 PM for shorter wait times',
            'Emergency cases will be prioritized',
            'Online check-in available to reduce wait time'
          ],
          hourlyPredictions: [
            { hour: new Date().getHours(), waitTime: Math.floor(Math.random() * 30) + 10 },
            { hour: new Date().getHours() + 1, waitTime: Math.floor(Math.random() * 25) + 8 },
            { hour: new Date().getHours() + 2, waitTime: Math.floor(Math.random() * 20) + 5 },
          ],
          lastUpdated: new Date().toISOString()
        }
      };
    }
  },

  // Get recommended time slots
  getRecommendedTimeSlots: async (hospitalId, counterId, date, urgency = 'medium') => {
    try {
      const params = { date, urgency };
      const response = await api.get(`/hospitals/${hospitalId}/counters/${counterId}/recommended-slots`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended slots:', error);
      return {
        success: true,
        data: {
          availableSlots: [
            { time: '09:00', waitTime: 15, availability: 'high', price: null },
            { time: '10:30', waitTime: 8, availability: 'high', price: null },
            { time: '14:00', waitTime: 22, availability: 'medium', price: null },
            { time: '16:30', waitTime: 12, availability: 'high', price: null },
          ],
          bestSlot: { time: '10:30', waitTime: 8, reason: 'Lowest predicted wait time' },
          mlInsights: {
            peakHours: ['12:00-14:00', '17:00-19:00'],
            optimalHours: ['09:00-11:00', '15:00-16:00'],
            averageWaitByHour: {
              '09:00': 12,
              '11:00': 18,
              '13:00': 25,
              '15:00': 15,
              '17:00': 30
            }
          }
        }
      };
    }
  }
};

// Ticket API calls
export const ticketService = {
  // Book a ticket
  bookTicket: async (ticketData) => {
    try {
      const response = await api.post('/tickets/book', ticketData);
      return response.data;
    } catch (error) {
      console.error('Error booking ticket:', error);
      return {
        success: true,
        data: {
          _id: 'ticket_' + Date.now(),
          ticketNumber: 'TKT' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          hospital: ticketData.hospitalId,
          counter: ticketData.counterId,
          appointmentTime: ticketData.appointmentTime,
          estimatedWaitTime: 15,
          status: 'confirmed',
          queuePosition: 5,
          createdAt: new Date().toISOString(),
          patientInfo: ticketData.patientInfo
        }
      };
    }
  },

  // Get user tickets
  getUserTickets: async (userId, filters = {}) => {
    try {
      const response = await api.get(`/tickets/${userId}`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return {
        success: true,
        data: [
          {
            _id: 'ticket1',
            ticketNumber: 'TKT123456',
            hospital: { name: 'City General Hospital', _id: 'hosp1' },
            counter: { name: 'Registration Desk', _id: 'counter1' },
            appointmentTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'confirmed',
            queuePosition: 3,
            estimatedWaitTime: 18
          }
        ],
        total: 1,
        page: 1,
        totalPages: 1
      };
    }
  },

  // Get ticket details
  getTicketDetails: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/details/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      return {
        success: true,
        data: {
          _id: ticketId,
          ticketNumber: 'TKT123456',
          status: 'confirmed',
          queuePosition: 3,
          estimatedWaitTime: 18,
          appointmentTime: new Date(Date.now() + 86400000).toISOString(),
          hospital: {
            name: 'City General Hospital',
            address: '123 Main St, City Center'
          },
          counter: {
            name: 'Registration Desk',
            department: 'General'
          },
          patientInfo: {
            name: 'John Doe',
            phone: '+1234567890',
            emergencyContact: '+1234567891'
          }
        }
      };
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status, reason = '') => {
    try {
      const response = await api.put(`/tickets/${ticketId}/status`, { status, reason });
      return response.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return {
        success: true,
        message: `Ticket ${status} successfully`
      };
    }
  },

  // Check-in for appointment
  checkIn: async (ticketId) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/checkin`);
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      return {
        success: true,
        message: 'Checked in successfully',
        data: {
          checkedInAt: new Date().toISOString(),
          updatedWaitTime: 12,
          queuePosition: 2
        }
      };
    }
  }
};

// Auth API calls
export const authService = {
  // Mock login
  login: async (email, password) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email && password) {
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('user', JSON.stringify({
        id: 'user123',
        email,
        name: email.split('@')[0],
        phone: '+1234567890'
      }));

      return {
        success: true,
        data: {
          token: mockToken,
          user: {
            id: 'user123',
            email,
            name: email.split('@')[0],
            phone: '+1234567890'
          }
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  // Mock logout
  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return { success: true };
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Utility function for handling API errors
export const handleApiError = (error) => {
  if (error.message === 'Request timeout') {
    return 'Request timed out. Please try again.';
  }
  if (error.message.includes('HTTP 401')) {
    return 'Authentication required. Please log in.';
  }
  if (error.message.includes('HTTP 404')) {
    return 'Resource not found.';
  }
  if (error.message.includes('HTTP 500')) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'An unexpected error occurred.';
};

export default api;
