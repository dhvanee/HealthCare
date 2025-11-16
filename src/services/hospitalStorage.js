/**
 * Hospital Storage Service
 * Manages hospital data in localStorage for booking flow
 */

const STORAGE_KEY = 'selectedHospital';
const STORAGE_EXPIRY = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a unique hospital ID if not present
 */
const generateHospitalId = (hospital) => {
  return hospital._id || hospital.id || hospital.place_id || `hospital-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Store hospital data in localStorage
 * @param {Object} hospital - Hospital object to store
 * @returns {string} - Hospital ID
 */
export const storeHospital = (hospital) => {
  try {
    if (!hospital) {
      console.error('Cannot store null/undefined hospital');
      return null;
    }

    // Generate or use existing hospital ID
    const hospitalId = generateHospitalId(hospital);
    
    // Prepare hospital data with all necessary fields
    const hospitalData = {
      id: hospitalId,
      _id: hospitalId,
      name: hospital.name || 'Unknown Hospital',
      address: hospital.address || hospital.vicinity || hospital.formatted_address || '',
      phone: hospital.phone || hospital.formatted_phone_number || hospital.international_phone_number || '',
      location: hospital.location || hospital.geometry?.location || null,
      coordinates: hospital.coordinates || (hospital.geometry?.location ? {
        lat: hospital.geometry.location.lat || hospital.geometry.location.latitude,
        lng: hospital.geometry.location.lng || hospital.geometry.location.longitude
      } : null),
      rating: hospital.rating || null,
      distance: hospital.distance || null,
      waitTime: hospital.waitTime || null,
      departments: hospital.departments || hospital.specialties || [],
      image: hospital.image || null,
      place_id: hospital.place_id || hospitalId,
      // Store all original fields to preserve data
      ...hospital
    };

    const storageData = {
      hospital: hospitalData,
      timestamp: Date.now(),
      hospitalId: hospitalId
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    
    return hospitalId;
  } catch (error) {
    console.error('Error storing hospital in localStorage:', error);
    return null;
  }
};

/**
 * Retrieve hospital data from localStorage
 * @returns {Object|null} - Hospital object or null if not found/expired
 */
export const getStoredHospital = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const storageData = JSON.parse(stored);
    
    // Check if data has expired
    const now = Date.now();
    if (now - storageData.timestamp > STORAGE_EXPIRY) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return storageData.hospital;
  } catch (error) {
    console.error('Error retrieving hospital from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

/**
 * Get hospital ID from localStorage
 * @returns {string|null} - Hospital ID or null
 */
export const getStoredHospitalId = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const storageData = JSON.parse(stored);
    return storageData.hospitalId || null;
  } catch (error) {
    console.error('Error retrieving hospital ID from localStorage:', error);
    return null;
  }
};

/**
 * Clear stored hospital data
 */
export const clearStoredHospital = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing hospital from localStorage:', error);
  }
};

/**
 * Check if hospital data exists in localStorage
 * @returns {boolean}
 */
export const hasStoredHospital = () => {
  return getStoredHospital() !== null;
};

export default {
  storeHospital,
  getStoredHospital,
  getStoredHospitalId,
  clearStoredHospital,
  hasStoredHospital
};

