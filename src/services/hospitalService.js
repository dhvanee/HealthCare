// Hospital Service - Handles fetching hospital data from various APIs
// This service can integrate with Google Places API, OpenStreetMap Overpass API, or other location services

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org";

// Default hospitals for fallback/demo purposes
const DEFAULT_HOSPITALS = [
  {
    id: 1,
    name: "City General Hospital",
    address: "123 Health St, Wellness City",
    phone: "+1 234-567-8900",
    distance: "0.8 km",
    waitTime: "25 mins",
    specialties: ["Emergency", "Cardiology", "Neurology"],
    rating: 4.5,
    lat: 37.7749,
    lng: -122.4194,
    type: "hospital",
    website: "https://citygeneralhospital.com",
    emergencyServices: true,
    beds: 250,
    departments: ["Emergency", "ICU", "Surgery", "Cardiology", "Neurology"],
  },
  {
    id: 2,
    name: "Metro Medical Center",
    address: "456 Care Ave, Health Town",
    phone: "+1 234-567-8901",
    distance: "1.2 km",
    waitTime: "15 mins",
    specialties: ["Pediatrics", "Orthopedics", "Dermatology"],
    rating: 4.3,
    lat: 37.7849,
    lng: -122.4094,
    type: "clinic",
    website: "https://metromedical.com",
    emergencyServices: false,
    beds: 150,
    departments: [
      "Pediatrics",
      "Orthopedics",
      "Dermatology",
      "General Medicine",
    ],
  },
  {
    id: 3,
    name: "Emergency Care Unit",
    address: "789 Quick Response Rd",
    phone: "+1 234-567-8902",
    distance: "2.1 km",
    waitTime: "45 mins",
    specialties: ["Emergency", "Trauma", "ICU"],
    rating: 4.7,
    lat: 37.7649,
    lng: -122.4294,
    type: "emergency",
    website: "https://emergencycare.com",
    emergencyServices: true,
    beds: 100,
    departments: ["Emergency", "Trauma", "ICU", "Surgery"],
  },
  {
    id: 4,
    name: "Wellness Medical Plaza",
    address: "321 Healing Blvd",
    phone: "+1 234-567-8903",
    distance: "1.8 km",
    waitTime: "20 mins",
    specialties: ["Family Medicine", "Internal Medicine"],
    rating: 4.2,
    lat: 37.7949,
    lng: -122.4394,
    type: "clinic",
    website: "https://wellnessmedical.com",
    emergencyServices: false,
    beds: 80,
    departments: ["Family Medicine", "Internal Medicine", "Preventive Care"],
  },
];

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate random wait time based on hospital type and time of day
 * @param {string} type - Hospital type (hospital, clinic, emergency)
 * @returns {string} Wait time string
 */
function generateWaitTime(type) {
  const hour = new Date().getHours();
  let baseWaitTime;

  switch (type) {
    case "emergency":
      baseWaitTime = 30 + Math.random() * 60; // 30-90 minutes
      break;
    case "hospital":
      baseWaitTime = 15 + Math.random() * 30; // 15-45 minutes
      break;
    case "clinic":
      baseWaitTime = 5 + Math.random() * 20; // 5-25 minutes
      break;
    default:
      baseWaitTime = 15 + Math.random() * 30;
  }

  // Increase wait times during peak hours (9-11 AM, 2-4 PM)
  if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) {
    baseWaitTime *= 1.5;
  }

  return `${Math.round(baseWaitTime)} mins`;
}

/**
 * Fetch hospitals from OpenStreetMap Overpass API
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Array>} Array of hospitals
 */
export async function fetchHospitalsFromOSM(lat, lng, radius = 5000) {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      relation["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
      relation["amenity"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="doctors"](around:${radius},${lat},${lng});
      way["amenity"="doctors"](around:${radius},${lat},${lng});
      node["healthcare"="hospital"](around:${radius},${lat},${lng});
      way["healthcare"="hospital"](around:${radius},${lat},${lng});
      node["healthcare"="clinic"](around:${radius},${lat},${lng});
      way["healthcare"="clinic"](around:${radius},${lat},${lng});
      node["healthcare"="centre"](around:${radius},${lat},${lng});
      way["healthcare"="centre"](around:${radius},${lat},${lng});
      node["healthcare"="doctor"](around:${radius},${lat},${lng});
      way["healthcare"="doctor"](around:${radius},${lat},${lng});
      node["building"="hospital"](around:${radius},${lat},${lng});
      way["building"="hospital"](around:${radius},${lat},${lng});
    );
    out center meta;
  `;

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error(
        `Overpass API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.elements || data.elements.length === 0) {
      console.warn("No hospitals found in the specified area");
      return [];
    }

    return data.elements
      .map((element, index) => {
        const hospitalLat = element.lat || element.center?.lat;
        const hospitalLng = element.lon || element.center?.lon;

        if (!hospitalLat || !hospitalLng) {
          return null; // Skip elements without valid coordinates
        }

        const distance = calculateDistance(lat, lng, hospitalLat, hospitalLng);

        // Build address from available components
        const addressParts = [];
        if (element.tags?.["addr:housenumber"])
          addressParts.push(element.tags["addr:housenumber"]);
        if (element.tags?.["addr:street"])
          addressParts.push(element.tags["addr:street"]);
        if (element.tags?.["addr:city"])
          addressParts.push(element.tags["addr:city"]);

        const address =
          element.tags?.["addr:full"] ||
          (addressParts.length > 0
            ? addressParts.join(" ")
            : "Address not available");

        return {
          id: element.id || `hospital-${index}`,
          name:
            element.tags?.name ||
            element.tags?.["name:en"] ||
            `Medical Facility ${index + 1}`,
          address: address,
          phone:
            element.tags?.phone ||
            element.tags?.["contact:phone"] ||
            "Phone not available",
          distance: `${distance.toFixed(1)} km`,
          waitTime: generateWaitTime(
            element.tags?.amenity || element.tags?.healthcare,
          ),
          specialties: element.tags?.speciality
            ? element.tags.speciality.split(";").map((s) => s.trim())
            : ["General Medicine"],
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)), // Random rating between 3.5-5.0
          lat: hospitalLat,
          lng: hospitalLng,
          type: element.tags?.amenity || element.tags?.healthcare || "hospital",
          website:
            element.tags?.website || element.tags?.["contact:website"] || null,
          emergencyServices:
            element.tags?.emergency === "yes" ||
            element.tags?.amenity === "hospital" ||
            element.tags?.healthcare === "hospital",
          beds: element.tags?.beds ? parseInt(element.tags.beds) : null,
          departments: element.tags?.speciality
            ? element.tags.speciality.split(";").map((s) => s.trim())
            : ["General Medicine"],
          operator: element.tags?.operator || null,
          openingHours: element.tags?.opening_hours || "24/7",
        };
      })
      .filter((hospital) => hospital && hospital.distance !== "0.0 km"); // Filter out null and invalid locations
  } catch (error) {
    console.error("Error fetching hospitals from OSM:", error);
    throw error;
  }
}

/**
 * Fetch hospitals using Google Places API (requires API key)
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {string} apiKey - Google Places API key
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Array>} Array of hospitals
 */
export async function fetchHospitalsFromGoogle(
  lat,
  lng,
  apiKey,
  radius = 5000,
) {
  if (!apiKey) {
    throw new Error("Google Places API key is required");
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch from Google Places API");
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return data.results.map((place) => {
      const distance = calculateDistance(
        lat,
        lng,
        place.geometry.location.lat,
        place.geometry.location.lng,
      );

      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        phone: "Call for information",
        distance: `${distance.toFixed(1)} km`,
        waitTime: generateWaitTime("hospital"),
        specialties: place.types.filter((type) =>
          ["hospital", "doctor", "health", "medical"].some((keyword) =>
            type.includes(keyword),
          ),
        ),
        rating: place.rating || 4.0,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        type: "hospital",
        website: null,
        emergencyServices: true,
        beds: null,
        departments: ["General Medicine"],
      };
    });
  } catch (error) {
    console.error("Error fetching hospitals from Google Places:", error);
    throw error;
  }
}

/**
 * Get nearby hospitals using the best available method
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Array of hospitals
 */
export async function getNearbyHospitals(lat, lng, options = {}) {
  const {
    radius = 10000, // Increased default radius to 10km
    googleApiKey = null,
    useDemo = false,
    maxResults = 20,
    forceRealData = false,
  } = options;

  console.log("getNearbyHospitals called with:", { lat, lng, options });

  // If demo mode is enabled and not forcing real data, return modified default data
  if (useDemo && !forceRealData) {
    console.log("Using demo mode - returning static hospitals");
    return DEFAULT_HOSPITALS.map((hospital) => ({
      ...hospital,
      lat: lat + (Math.random() - 0.5) * 0.02,
      lng: lng + (Math.random() - 0.5) * 0.02,
      distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
      waitTime: generateWaitTime(hospital.type),
    })).slice(0, maxResults);
  }

  let hospitals = [];

  // Try Google Places API first if API key is provided
  if (googleApiKey) {
    try {
      console.log("Fetching hospitals from Google Places API...");
      hospitals = await fetchHospitalsFromGoogle(
        lat,
        lng,
        googleApiKey,
        radius,
      );
      console.log(`Google Places API returned ${hospitals.length} hospitals`);
    } catch (error) {
      console.warn(
        "Google Places API failed, falling back to OpenStreetMap:",
        error,
      );
    }
  } else {
    console.log("No Google API key provided, skipping Google Places API");
  }

  // Fall back to OpenStreetMap if Google Places failed or no API key
  if (hospitals.length === 0) {
    try {
      console.log("Fetching hospitals from OpenStreetMap...");
      hospitals = await fetchHospitalsFromOSM(lat, lng, radius);
      console.log(`OpenStreetMap API returned ${hospitals.length} hospitals`);

      // If still no results, try with a larger radius
      if (hospitals.length === 0 && radius < 15000) {
        console.log("No hospitals found, trying with larger radius...");
        hospitals = await fetchHospitalsFromOSM(lat, lng, 15000);
        console.log(
          `OpenStreetMap API with larger radius returned ${hospitals.length} hospitals`,
        );
      }
    } catch (error) {
      console.warn("OpenStreetMap API failed, using default hospitals:", error);
      console.log("Falling back to default static hospitals");
      // Final fallback to default hospitals
      hospitals = DEFAULT_HOSPITALS.map((hospital) => ({
        ...hospital,
        lat: lat + (Math.random() - 0.5) * 0.02,
        lng: lng + (Math.random() - 0.5) * 0.02,
        distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
        waitTime: generateWaitTime(hospital.type),
      }));
    }
  }

  console.log(`Final result: ${hospitals.length} hospitals to return`);

  // Sort by distance and limit results
  return hospitals
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, maxResults);
}

/**
 * Debug version of getNearbyHospitals with enhanced logging
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Array of hospitals with debug info
 */
export async function getNearbyHospitalsWithDebug(lat, lng, options = {}) {
  console.group("🏥 Hospital Service Debug");
  console.log("📍 Location:", { lat, lng });
  console.log("⚙️ Options:", options);

  try {
    const result = await getNearbyHospitals(lat, lng, options);
    console.log("✅ Success:", result.length, "hospitals found");
    console.table(
      result.map((h) => ({
        name: h.name,
        distance: h.distance,
        type: h.type,
        source: h.id.toString().includes("hospital-") ? "Static" : "API",
      })),
    );
    console.groupEnd();
    return result;
  } catch (error) {
    console.error("❌ Error:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * Get hospital details by ID
 * @param {string|number} hospitalId - Hospital ID
 * @returns {Promise<Object|null>} Hospital details or null if not found
 */
export async function getHospitalDetails(hospitalId) {
  // In a real implementation, this would fetch detailed information from an API
  // For now, return extended information from our default data
  const hospital = DEFAULT_HOSPITALS.find(
    (h) => h.id.toString() === hospitalId.toString(),
  );

  if (!hospital) {
    return null;
  }

  // Add additional details that might come from a detailed API call
  return {
    ...hospital,
    operatingHours: {
      monday: "24/7",
      tuesday: "24/7",
      wednesday: "24/7",
      thursday: "24/7",
      friday: "24/7",
      saturday: "24/7",
      sunday: "24/7",
    },
    services: [
      "Emergency Care",
      "Inpatient Care",
      "Outpatient Care",
      "Diagnostic Services",
      "Laboratory Services",
      "Radiology",
      "Pharmacy",
    ],
    insurance: [
      "Medicare",
      "Medicaid",
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "UnitedHealthcare",
    ],
    parking: {
      available: true,
      free: false,
      hourlyRate: "$3.00",
      validationAvailable: true,
    },
    accessibility: {
      wheelchairAccessible: true,
      elevators: true,
      disabledParking: true,
    },
  };
}

/**
 * Search hospitals by name or specialty
 * @param {string} query - Search query
 * @param {number} lat - User latitude (for distance calculation)
 * @param {number} lng - User longitude (for distance calculation)
 * @returns {Promise<Array>} Array of matching hospitals
 */
export async function searchHospitals(query, lat, lng) {
  const lowercaseQuery = query.toLowerCase();

  return DEFAULT_HOSPITALS.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(lowercaseQuery) ||
      hospital.specialties.some((specialty) =>
        specialty.toLowerCase().includes(lowercaseQuery),
      ) ||
      hospital.departments.some((dept) =>
        dept.toLowerCase().includes(lowercaseQuery),
      ),
  )
    .map((hospital) => ({
      ...hospital,
      distance: `${calculateDistance(lat, lng, hospital.lat, hospital.lng).toFixed(1)} km`,
      waitTime: generateWaitTime(hospital.type),
    }))
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

export default {
  getNearbyHospitals,
  getNearbyHospitalsWithDebug,
  getHospitalDetails,
  searchHospitals,
  fetchHospitalsFromOSM,
  fetchHospitalsFromGoogle,
};
