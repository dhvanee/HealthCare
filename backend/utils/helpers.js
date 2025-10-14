const crypto = require('crypto');

/**
 * Response helper functions for consistent API responses
 */
const responseHelpers = {
    success: (res, message, data = null, statusCode = 200) => {
        const response = {
            success: true,
            message,
            timestamp: new Date().toISOString()
        };

        if (data) {
            response.data = data;
        }

        return res.status(statusCode).json(response);
    },

    error: (res, message, errors = null, statusCode = 400) => {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (errors) {
            response.errors = errors;
        }

        return res.status(statusCode).json(response);
    },

    validationError: (res, errors) => {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString()
        });
    },

    notFound: (res, resource = 'Resource') => {
        return res.status(404).json({
            success: false,
            message: `${resource} not found`,
            timestamp: new Date().toISOString()
        });
    },

    unauthorized: (res, message = 'Unauthorized access') => {
        return res.status(401).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    },

    forbidden: (res, message = 'Access forbidden') => {
        return res.status(403).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    },

    serverError: (res, message = 'Internal server error') => {
        return res.status(500).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Date and time utility functions
 */
const dateHelpers = {
    // Check if a date is today
    isToday: (date) => {
        const today = new Date();
        const checkDate = new Date(date);
        return today.toDateString() === checkDate.toDateString();
    },

    // Check if a date is in the past
    isPast: (date) => {
        return new Date(date) < new Date();
    },

    // Check if a date is in the future
    isFuture: (date) => {
        return new Date(date) > new Date();
    },

    // Get start of day
    getStartOfDay: (date = new Date()) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        return startOfDay;
    },

    // Get end of day
    getEndOfDay: (date = new Date()) => {
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay;
    },

    // Add minutes to a date
    addMinutes: (date, minutes) => {
        return new Date(date.getTime() + (minutes * 60000));
    },

    // Get difference in minutes between two dates
    getMinutesDiff: (date1, date2) => {
        return Math.round((date2 - date1) / (1000 * 60));
    },

    // Format date to readable string
    formatDateTime: (date, timezone = 'Asia/Kolkata') => {
        return new Date(date).toLocaleString('en-IN', {
            timeZone: timezone,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get day of week name
    getDayName: (date) => {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    },

    // Check if date is a weekend
    isWeekend: (date) => {
        const day = new Date(date).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    }
};

/**
 * String utility functions
 */
const stringHelpers = {
    // Generate random string
    generateRandomString: (length = 8) => {
        return crypto.randomBytes(length).toString('hex').slice(0, length);
    },

    // Generate random number string
    generateRandomNumber: (length = 6) => {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Capitalize first letter
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Convert to title case
    toTitleCase: (str) => {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    // Generate slug from string
    generateSlug: (str) => {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    },

    // Mask sensitive data
    maskString: (str, visibleChars = 4, maskChar = '*') => {
        if (!str || str.length <= visibleChars) return str;
        const visiblePart = str.slice(-visibleChars);
        const maskedPart = maskChar.repeat(str.length - visibleChars);
        return maskedPart + visiblePart;
    },

    // Extract initials from name
    getInitials: (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    }
};

/**
 * Array utility functions
 */
const arrayHelpers = {
    // Remove duplicates from array
    removeDuplicates: (arr) => {
        return [...new Set(arr)];
    },

    // Remove duplicates from array of objects by key
    removeDuplicatesByKey: (arr, key) => {
        const seen = new Set();
        return arr.filter(item => {
            const keyValue = item[key];
            if (seen.has(keyValue)) {
                return false;
            }
            seen.add(keyValue);
            return true;
        });
    },

    // Shuffle array
    shuffle: (arr) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Group array by key
    groupBy: (arr, key) => {
        return arr.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    },

    // Sort array of objects by key
    sortBy: (arr, key, direction = 'asc') => {
        return arr.sort((a, b) => {
            const valueA = a[key];
            const valueB = b[key];

            if (direction === 'desc') {
                return valueB > valueA ? 1 : -1;
            }
            return valueA > valueB ? 1 : -1;
        });
    }
};

/**
 * Validation utility functions
 */
const validationHelpers = {
    // Check if string is valid email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Check if string is valid phone number (Indian format)
    isValidIndianPhone: (phone) => {
        const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    },

    // Check if string is valid MongoDB ObjectId
    isValidObjectId: (id) => {
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        return objectIdRegex.test(id);
    },

    // Check if coordinates are valid
    isValidCoordinates: (lat, lng) => {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    },

    // Check if password meets criteria
    isValidPassword: (password) => {
        // At least 6 characters, contains letter and number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        return passwordRegex.test(password);
    }
};

/**
 * Mathematical utility functions
 */
const mathHelpers = {
    // Calculate distance between two coordinates using Haversine formula
    calculateDistance: (lat1, lon1, lat2, lon2, unit = 'km') => {
        const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    },

    // Generate random number between min and max
    randomBetween: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Round to specified decimal places
    roundTo: (num, decimals = 2) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    // Calculate percentage
    percentage: (value, total) => {
        return total === 0 ? 0 : Math.round((value / total) * 100 * 100) / 100;
    }
};

/**
 * Object utility functions
 */
const objectHelpers = {
    // Deep clone object
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // Pick specific keys from object
    pick: (obj, keys) => {
        const result = {};
        keys.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
        });
        return result;
    },

    // Omit specific keys from object
    omit: (obj, keys) => {
        const result = { ...obj };
        keys.forEach(key => {
            delete result[key];
        });
        return result;
    },

    // Check if object is empty
    isEmpty: (obj) => {
        return Object.keys(obj).length === 0;
    },

    // Flatten nested object
    flatten: (obj, prefix = '') => {
        const flattened = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    Object.assign(flattened, objectHelpers.flatten(obj[key], newKey));
                } else {
                    flattened[newKey] = obj[key];
                }
            }
        }
        return flattened;
    }
};

/**
 * Pagination utility functions
 */
const paginationHelpers = {
    // Calculate pagination metadata
    getPaginationMeta: (page, limit, total) => {
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 10;
        const totalPages = Math.ceil(total / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, total);

        return {
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: total,
            startIndex,
            endIndex,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            nextPage: currentPage < totalPages ? currentPage + 1 : null,
            prevPage: currentPage > 1 ? currentPage - 1 : null
        };
    },

    // Get skip value for database queries
    getSkip: (page, limit) => {
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 10;
        return (currentPage - 1) * itemsPerPage;
    }
};

/**
 * URL and query parameter helpers
 */
const urlHelpers = {
    // Build query string from object
    buildQueryString: (params) => {
        return Object.keys(params)
            .filter(key => params[key] !== undefined && params[key] !== null)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    },

    // Parse query string to object
    parseQueryString: (queryString) => {
        const params = {};
        const pairs = queryString.split('&');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        return params;
    }
};

/**
 * Cache helpers for common caching patterns
 */
const cacheHelpers = {
    // Generate cache key
    generateCacheKey: (...parts) => {
        return parts.filter(Boolean).join(':');
    },

    // Get TTL in seconds
    getTTL: (duration) => {
        const durations = {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '30m': 1800,
            '1h': 3600,
            '6h': 21600,
            '12h': 43200,
            '24h': 86400,
            '1d': 86400,
            '7d': 604800
        };
        return durations[duration] || 300; // Default 5 minutes
    }
};

module.exports = {
    responseHelpers,
    dateHelpers,
    stringHelpers,
    arrayHelpers,
    validationHelpers,
    mathHelpers,
    objectHelpers,
    paginationHelpers,
    urlHelpers,
    cacheHelpers
};
