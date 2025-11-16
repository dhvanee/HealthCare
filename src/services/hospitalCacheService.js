/**
 * Hospital Cache Service
 * Implements Hybrid Caching with DB Persistence
 * Flow: localStorage → MongoDB → External API
 */

import { storeHospital as storeInLocalStorage, getStoredHospital, clearStoredHospital } from './hospitalStorage';
import api from './api';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Sync hospital to backend database
 * @param {Object} hospital - Hospital data from Maps API
 * @returns {Promise<Object>} - Synced hospital with DB ID
 */
export const syncHospitalToDatabase = async (hospital) => {
  try {
    if (!hospital) {
      throw new Error('Hospital data is required');
    }

    // Extract external ID (place_id is primary identifier)
    const externalId = hospital.place_id || hospital.id || hospital._id;
    
    if (!externalId) {
      console.warn('No external ID found for hospital:', hospital);
      return hospital; // Return as-is if no ID
    }

    // Extract location coordinates with multiple fallbacks
    let location = null;
    if (hospital.location && hospital.location.lat && hospital.location.lng) {
      location = {
        lat: hospital.location.lat,
        lng: hospital.location.lng
      };
    } else if (hospital.geometry?.location) {
      const geoLoc = hospital.geometry.location;
      location = {
        lat: geoLoc.lat || geoLoc.latitude,
        lng: geoLoc.lng || geoLoc.longitude
      };
    } else if (hospital.coordinates) {
      location = {
        lat: hospital.coordinates.lat || hospital.coordinates[1],
        lng: hospital.coordinates.lng || hospital.coordinates[0]
      };
    }

    // If no location found, skip sync and return original hospital
    if (!location || !location.lat || !location.lng) {
      console.warn('No valid location coordinates found for hospital, skipping sync:', hospital.name);
      return hospital; // Return as-is without syncing
    }

    // Prepare data for backend
    const hospitalPayload = {
      externalId,
      place_id: hospital.place_id,
      name: hospital.name || 'Unknown Hospital',
      address: hospital.address || hospital.vicinity || hospital.formatted_address || '',
      phone: hospital.phone || hospital.formatted_phone_number || hospital.international_phone_number || '',
      location: location,
      geometry: hospital.geometry,
      rating: hospital.rating || null,
      specialties: hospital.departments || hospital.specialties || ['General Medicine'],
      formatted_address: hospital.formatted_address || hospital.address,
      vicinity: hospital.vicinity
    };

    // Call backend to sync/get hospital
    const response = await api.post('/hospitals/get-or-create', hospitalPayload);
    
    const syncedHospital = response.data?.hospital || response.hospital;
    
    if (syncedHospital) {
      // Merge original data with DB data
      return {
        ...hospital,
        ...syncedHospital,
        _id: syncedHospital._id,
        id: syncedHospital._id,
        fromDatabase: true,
        syncedAt: new Date().toISOString()
      };
    }

    return hospital;
  } catch (error) {
    console.error('Error syncing hospital to database:', error);
    // Return original hospital data if sync fails
    return hospital;
  }
};

/**
 * Get hospital by ID - tries cache first, then DB, then API
 * @param {string} hospitalId - Hospital ID (MongoDB ID or place_id)
 * @returns {Promise<Object|null>} - Hospital data
 */
export const getHospitalById = async (hospitalId) => {
  try {
    if (!hospitalId) {
      return null;
    }

    // Try backend first
    try {
      const response = await api.get(`/hospitals/${hospitalId}`);
      const hospital = response.data?.hospital || response.hospital;
      
      if (hospital) {
        // Cache in localStorage for future use
        storeInLocalStorage(hospital);
        return hospital;
      }
    } catch (error) {
      console.log('Hospital not found in database, trying external ID lookup:', hospitalId);
    }

    // If not found by MongoDB ID, try searching by external ID
    try {
      const response = await api.post('/hospitals/get-or-create', {
        externalId: hospitalId,
        place_id: hospitalId
      });
      
      const hospital = response.data?.hospital || response.hospital;
      if (hospital) {
        storeInLocalStorage(hospital);
        return hospital;
      }
    } catch (error) {
      console.error('Hospital not found by external ID:', error);
    }

    return null;
  } catch (error) {
    console.error('Error getting hospital by ID:', error);
    return null;
  }
};

/**
 * Store hospital with hybrid caching
 * @param {Object} hospital - Hospital data
 * @returns {Promise<Object>} - Enhanced hospital data with DB ID
 */
export const storeHospitalWithSync = async (hospital) => {
  try {
    if (!hospital) {
      throw new Error('Hospital data is required');
    }

    // 1. Store immediately in localStorage (fast)
    const localId = storeInLocalStorage(hospital);

    // 2. Sync to database in background (don't wait)
    syncHospitalToDatabase(hospital)
      .then(syncedHospital => {
        // Update localStorage with synced data
        if (syncedHospital._id) {
          storeInLocalStorage(syncedHospital);
        }
      })
      .catch(err => console.error('Background sync failed:', err));

    return {
      ...hospital,
      localId
    };
  } catch (error) {
    console.error('Error storing hospital with sync:', error);
    return hospital;
  }
};

/**
 * Get hospital with hybrid caching
 * Priority: localStorage → MongoDB → Return null
 * @param {string} hospitalId - Hospital ID
 * @returns {Promise<Object|null>} - Hospital data
 */
export const getHospitalWithCache = async (hospitalId) => {
  try {
    // 1. Try localStorage first (fastest)
    const cachedHospital = getStoredHospital();
    if (cachedHospital && (
      cachedHospital._id === hospitalId || 
      cachedHospital.id === hospitalId || 
      cachedHospital.place_id === hospitalId
    )) {
      console.log('✓ Hospital found in localStorage cache');
      return cachedHospital;
    }

    console.log('✗ Hospital not in cache, fetching from database...');

    // 2. Try database
    const dbHospital = await getHospitalById(hospitalId);
    if (dbHospital) {
      console.log('✓ Hospital found in database');
      storeInLocalStorage(dbHospital);
      return dbHospital;
    }

    console.log('✗ Hospital not found in database');
    return null;
  } catch (error) {
    console.error('Error getting hospital with cache:', error);
    return null;
  }
};

/**
 * Prepare hospital data for booking
 * Ensures all necessary fields are present
 * @param {Object} hospital - Hospital object
 * @returns {Object} - Formatted hospital data for API
 */
export const prepareHospitalForBooking = (hospital) => {
  if (!hospital) {
    throw new Error('Hospital data is required');
  }

  const hospitalId = hospital._id || hospital.id || hospital.place_id || 'unknown';
  
  // Extract location coordinates
  let location = null;
  if (hospital.location) {
    location = hospital.location;
  } else if (hospital.geometry?.location) {
    location = {
      lat: hospital.geometry.location.lat || hospital.geometry.location.latitude,
      lng: hospital.geometry.location.lng || hospital.geometry.location.longitude
    };
  } else if (hospital.coordinates) {
    location = {
      lat: hospital.coordinates.lat || hospital.coordinates[1],
      lng: hospital.coordinates.lng || hospital.coordinates[0]
    };
  }

  // Ensure place_id is always a string if it exists and is not empty
  let placeId = null;
  if (hospital.place_id && String(hospital.place_id).trim() !== '') {
    placeId = String(hospital.place_id).trim();
  } else if (hospitalId && hospitalId !== 'unknown' && String(hospitalId).trim() !== '') {
    placeId = String(hospitalId).trim();
  }

  const result = {
    id: hospitalId,
    _id: hospital._id || hospitalId,
    name: hospital.name || 'Unknown Hospital',
    address: hospital.address || hospital.vicinity || hospital.formatted_address || '',
    phone: hospital.phone || hospital.formatted_phone_number || hospital.international_phone_number || '',
    location,
    rating: hospital.rating || null,
    distance: hospital.distance || null,
    departments: hospital.departments || hospital.specialties || []
  };

  // Only include place_id if it exists and is not empty
  if (placeId) {
    result.place_id = placeId;
  }

  return result;
};

/**
 * Clear hospital cache
 */
export const clearHospitalCache = () => {
  clearStoredHospital();
};

export default {
  syncHospitalToDatabase,
  getHospitalById,
  storeHospitalWithSync,
  getHospitalWithCache,
  prepareHospitalForBooking,
  clearHospitalCache
};
