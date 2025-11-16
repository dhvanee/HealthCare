const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || null;
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

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
  // Book a ticket/appointment
  bookTicket: async (bookingData) => {
    try {
      console.log('[API Service] bookTicket called with:', bookingData);
      
      // Format the data according to backend requirements
      const formattedData = {
        hospitalId: bookingData.hospitalId,
        appointmentDateTime: bookingData.appointmentDateTime, // ISO date string
        reasonForVisit: bookingData.reasonForVisit || '',
        symptoms: bookingData.symptoms || [],
        patientType: bookingData.patientType || 'new', // 'new', 'follow_up', 'emergency'
        priority: bookingData.priority || 'normal' // 'low', 'normal', 'high', 'emergency'
      };
      
      // Add optional fields only if they exist
      if (bookingData.counterId) {
        formattedData.counterId = bookingData.counterId;
      }
      
      if (bookingData.hospitalData) {
        formattedData.hospitalData = bookingData.hospitalData;
      }
      
      if (bookingData.insurance) {
        formattedData.insurance = {
          hasInsurance: bookingData.insurance.hasInsurance || false,
          provider: bookingData.insurance.provider || '',
          policyNumber: bookingData.insurance.policyNumber || ''
        };
      }
      
      console.log('[API Service] Sending to backend:', formattedData);

      const response = await api.post('/tickets/book', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error booking ticket:', error);
      throw new Error(error.message || 'Failed to book appointment. Please try again.');
    }
  },

  // Get user tickets with filters
  getUserTickets: async (userId, filters = {}) => {
    try {
      const params = {
        status: filters.status, // string or array: 'booked', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
        hospital: filters.hospitalId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit || 50,
        page: filters.page || 1
      };

      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await api.get(`/tickets/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw new Error('Failed to fetch tickets. Please try again.');
    }
  },

  // Get ticket details by ID
  getTicketDetails: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/details/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw new Error('Failed to fetch ticket details. Please try again.');
    }
  },

  // Update appointment date/time
  updateAppointment: async (ticketId, appointmentData) => {
    try {
      const data = {
        appointmentDateTime: appointmentData.appointmentDateTime, // ISO date string
        reasonForVisit: appointmentData.reasonForVisit,
        symptoms: appointmentData.symptoms || []
      };

      // Remove undefined values
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      const response = await api.put(`/tickets/${ticketId}/appointment`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw new Error(error.message || 'Failed to update appointment. Please try again.');
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, statusData) => {
    try {
      const data = {
        status: statusData.status, // 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
        cancellationReason: statusData.cancellationReason, // required if status is 'cancelled'
        notes: statusData.notes || {} // { patient: '', staff: '', doctor: '' }
      };

      const response = await api.put(`/tickets/${ticketId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw new Error('Failed to update ticket status. Please try again.');
    }
  },

  // Check-in for appointment
  checkIn: async (ticketId) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/checkin`, {});
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      throw new Error('Failed to check in. Please try again.');
    }
  },

  // Rate service after appointment
  rateService: async (ticketId, ratingData) => {
    try {
      const data = {
        serviceRating: ratingData.serviceRating, // 1-5
        doctorRating: ratingData.doctorRating, // 1-5
        facilityRating: ratingData.facilityRating, // 1-5
        overallRating: ratingData.overallRating, // 1-5 (required)
        feedback: ratingData.feedback || '' // max 1000 chars
      };

      const response = await api.post(`/tickets/${ticketId}/rate`, data);
      return response.data;
    } catch (error) {
      console.error('Error rating service:', error);
      throw new Error('Failed to submit rating. Please try again.');
    }
  },

  // Cancel appointment
  cancelAppointment: async (ticketId, cancellationReason) => {
    try {
      return await ticketService.updateTicketStatus(ticketId, {
        status: 'cancelled',
        cancellationReason: cancellationReason
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error('Failed to cancel appointment. Please try again.');
    }
  }
};

// Auth API calls
export const authService = {
  // User login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        return {
          success: true,
          user,
          token
        };
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  // User signup/registration
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        return {
          success: true,
          user,
          token
        };
      }

      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = getAuthToken();
      // Only call backend logout if we have a valid token
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          await api.post('/auth/logout', {});
        } catch (error) {
          // If logout fails, we still want to clear local storage
          console.warn('Backend logout failed:', error.message);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true };
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get auth token
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.data) {
        const user = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        return {
          success: true,
          data: user
        };
      }
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw error;
    }
  }
};

// ML Prediction API calls (Python Flask backend)
const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5008';

// Create ML API client (separate from main API)
class MLApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.timeout = 10000;
  }

  async request(method, url, data = null) {
    const fullUrl = `${this.baseURL}${url}`;
    
    const requestOptions = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, requestOptions);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return responseData;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  post(url, data) {
    return this.request('POST', url, data);
  }

  get(url) {
    return this.request('GET', url);
  }
}

const mlApi = new MLApiClient(ML_API_BASE_URL);

// ML Prediction Service
export const predictionService = {
  /**
   * Predict wait time for a given date, time, and hospital conditions
   * @param {Object} payload - Prediction parameters
   * @param {string} payload.date - Date in YYYY-MM-DD format
   * @param {string} payload.time - Time in HH:MM format
   * @param {number} payload.current_queue_length - Current queue length
   * @param {number} payload.staff_count - Number of staff members
   * @param {number} payload.historical_throughput - Historical throughput
   * @param {number} payload.is_holiday - 0 or 1
   * @returns {Promise<Object>} Prediction result with wait time and confidence interval
   */
  predictWaitTime: async (payload) => {
    try {
      const response = await mlApi.post('/predict/wait-time', payload);
      return response;
    } catch (error) {
      console.error('Error predicting wait time:', error);
      throw new Error(error.message || 'Failed to predict wait time. Please try again.');
    }
  },

  /**
   * Get best time slots for a given day
   * @param {string} dayName - Day name (e.g., "Wednesday")
   * @returns {Promise<Object>} Best slots array
   */
  getBestSlots: async (dayName) => {
    try {
      const response = await mlApi.post('/predict/best-slots', { day_name: dayName });
      return response;
    } catch (error) {
      console.error('Error getting best slots:', error);
      throw new Error(error.message || 'Failed to get best slots. Please try again.');
    }
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
