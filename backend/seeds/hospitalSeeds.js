const Hospital = require('../database/models/Hospital');
const mongoose = require('mongoose');

const sampleHospitals = [
    {
        name: "City General Hospital",
        email: "info@citygeneralhospital.com",
        phone: "+91-11-2345-6789",
        address: {
            street: "123 MG Road",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110001",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [77.2090, 28.6139] // [longitude, latitude] for New Delhi
        },
        type: "Government",
        category: "Tertiary",
        specialties: ["Cardiology", "Neurology", "Orthopedics", "General Surgery", "Emergency Medicine"],
        facilities: ["ICU", "Emergency Room", "Pharmacy", "Laboratory", "Radiology", "Blood Bank"],
        counters: [
            {
                name: "General OPD",
                type: "OPD",
                department: "General Medicine",
                isActive: true,
                currentQueueLength: 12,
                averageServiceTime: 15,
                workingHours: { start: "09:00", end: "17:00" },
                maxCapacityPerHour: 20,
                specialization: "General Consultation"
            },
            {
                name: "Cardiology Counter",
                type: "Specialist",
                department: "Cardiology",
                isActive: true,
                currentQueueLength: 8,
                averageServiceTime: 25,
                workingHours: { start: "10:00", end: "16:00" },
                maxCapacityPerHour: 12,
                specialization: "Heart Diseases"
            },
            {
                name: "Emergency Counter",
                type: "Emergency",
                department: "Emergency Medicine",
                isActive: true,
                currentQueueLength: 5,
                averageServiceTime: 10,
                workingHours: { start: "00:00", end: "23:59" },
                maxCapacityPerHour: 60,
                specialization: "Emergency Care"
            },
            {
                name: "Pharmacy Counter",
                type: "Pharmacy",
                department: "Pharmacy",
                isActive: true,
                currentQueueLength: 3,
                averageServiceTime: 5,
                workingHours: { start: "08:00", end: "20:00" },
                maxCapacityPerHour: 40,
                specialization: "Medicine Dispensing"
            }
        ],
        operatingHours: {
            monday: { open: "08:00", close: "20:00", isOpen: true },
            tuesday: { open: "08:00", close: "20:00", isOpen: true },
            wednesday: { open: "08:00", close: "20:00", isOpen: true },
            thursday: { open: "08:00", close: "20:00", isOpen: true },
            friday: { open: "08:00", close: "20:00", isOpen: true },
            saturday: { open: "08:00", close: "14:00", isOpen: true },
            sunday: { open: "10:00", close: "14:00", isOpen: true }
        },
        emergencyServices: true,
        bedCapacity: { total: 500, available: 45, icu: 50, general: 450 },
        rating: { average: 4.2, totalReviews: 1250 },
        website: "https://citygeneralhospital.com",
        isVerified: true,
        isActive: true,
        registrationNumber: "DL/GOV/2023/001",
        establishedYear: 1985,
        doctorsCount: 120,
        nursesCount: 300
    },
    {
        name: "Apollo Healthcare Center",
        email: "contact@apollohealthcare.com",
        phone: "+91-11-9876-5432",
        address: {
            street: "456 Nehru Place",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110019",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [77.2502, 28.5494] // Nehru Place coordinates
        },
        type: "Private",
        category: "Secondary",
        specialties: ["Gynecology", "Pediatrics", "Dermatology", "ENT", "Ophthalmology"],
        facilities: ["ICU", "NICU", "Pharmacy", "Laboratory", "Ultrasound", "X-Ray"],
        counters: [
            {
                name: "Pediatrics OPD",
                type: "Specialist",
                department: "Pediatrics",
                isActive: true,
                currentQueueLength: 6,
                averageServiceTime: 20,
                workingHours: { start: "09:00", end: "17:00" },
                maxCapacityPerHour: 15,
                specialization: "Child Healthcare"
            },
            {
                name: "Gynecology Counter",
                type: "Specialist",
                department: "Gynecology",
                isActive: true,
                currentQueueLength: 10,
                averageServiceTime: 30,
                workingHours: { start: "10:00", end: "18:00" },
                maxCapacityPerHour: 10,
                specialization: "Women's Health"
            },
            {
                name: "General Counter",
                type: "General",
                department: "General Medicine",
                isActive: true,
                currentQueueLength: 15,
                averageServiceTime: 12,
                workingHours: { start: "08:00", end: "18:00" },
                maxCapacityPerHour: 25,
                specialization: "General Consultation"
            },
            {
                name: "Lab Counter",
                type: "Lab",
                department: "Laboratory",
                isActive: true,
                currentQueueLength: 4,
                averageServiceTime: 8,
                workingHours: { start: "07:00", end: "19:00" },
                maxCapacityPerHour: 50,
                specialization: "Blood Tests & Diagnostics"
            }
        ],
        operatingHours: {
            monday: { open: "08:00", close: "20:00", isOpen: true },
            tuesday: { open: "08:00", close: "20:00", isOpen: true },
            wednesday: { open: "08:00", close: "20:00", isOpen: true },
            thursday: { open: "08:00", close: "20:00", isOpen: true },
            friday: { open: "08:00", close: "20:00", isOpen: true },
            saturday: { open: "08:00", close: "16:00", isOpen: true },
            sunday: { open: "09:00", close: "13:00", isOpen: true }
        },
        emergencyServices: false,
        bedCapacity: { total: 200, available: 25, icu: 20, general: 180 },
        rating: { average: 4.5, totalReviews: 890 },
        website: "https://apollohealthcare.com",
        isVerified: true,
        isActive: true,
        registrationNumber: "DL/PVT/2023/002",
        establishedYear: 2010,
        doctorsCount: 45,
        nursesCount: 80
    },
    {
        name: "Fortis Memorial Hospital",
        email: "info@fortismemorial.com",
        phone: "+91-11-4567-8901",
        address: {
            street: "789 Sector 62",
            city: "Gurugram",
            state: "Haryana",
            zipCode: "122102",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [77.0688, 28.4595] // Gurugram coordinates
        },
        type: "Private",
        category: "Tertiary",
        specialties: ["Oncology", "Cardiology", "Neurosurgery", "Gastroenterology", "Urology"],
        facilities: ["ICU", "CCU", "NICU", "OT", "Pharmacy", "Laboratory", "MRI", "CT Scan"],
        counters: [
            {
                name: "Oncology OPD",
                type: "Specialist",
                department: "Oncology",
                isActive: true,
                currentQueueLength: 4,
                averageServiceTime: 35,
                workingHours: { start: "09:00", end: "17:00" },
                maxCapacityPerHour: 8,
                specialization: "Cancer Treatment"
            },
            {
                name: "Cardiology Counter",
                type: "Specialist",
                department: "Cardiology",
                isActive: true,
                currentQueueLength: 7,
                averageServiceTime: 25,
                workingHours: { start: "08:00", end: "18:00" },
                maxCapacityPerHour: 12,
                specialization: "Heart Diseases"
            },
            {
                name: "Emergency Room",
                type: "Emergency",
                department: "Emergency Medicine",
                isActive: true,
                currentQueueLength: 8,
                averageServiceTime: 15,
                workingHours: { start: "00:00", end: "23:59" },
                maxCapacityPerHour: 40,
                specialization: "Emergency Care"
            },
            {
                name: "Radiology Counter",
                type: "Radiology",
                department: "Radiology",
                isActive: true,
                currentQueueLength: 2,
                averageServiceTime: 20,
                workingHours: { start: "07:00", end: "21:00" },
                maxCapacityPerHour: 20,
                specialization: "Medical Imaging"
            }
        ],
        operatingHours: {
            monday: { open: "24/7", close: "24/7", isOpen: true },
            tuesday: { open: "24/7", close: "24/7", isOpen: true },
            wednesday: { open: "24/7", close: "24/7", isOpen: true },
            thursday: { open: "24/7", close: "24/7", isOpen: true },
            friday: { open: "24/7", close: "24/7", isOpen: true },
            saturday: { open: "24/7", close: "24/7", isOpen: true },
            sunday: { open: "24/7", close: "24/7", isOpen: true }
        },
        emergencyServices: true,
        bedCapacity: { total: 400, available: 35, icu: 60, general: 340 },
        rating: { average: 4.7, totalReviews: 2100 },
        website: "https://fortismemorial.com",
        isVerified: true,
        isActive: true,
        registrationNumber: "HR/PVT/2023/003",
        establishedYear: 2005,
        doctorsCount: 85,
        nursesCount: 200
    },
    {
        name: "Max Super Specialty Hospital",
        email: "contact@maxhealthcare.com",
        phone: "+91-11-2468-1357",
        address: {
            street: "321 Saket District Center",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110017",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [77.2066, 28.5245] // Saket coordinates
        },
        type: "Private",
        category: "Tertiary",
        specialties: ["Transplant Surgery", "Robotic Surgery", "Interventional Cardiology", "Neurology"],
        facilities: ["ICU", "CCU", "NICU", "Cath Lab", "OT", "Pharmacy", "Laboratory", "PET Scan"],
        counters: [
            {
                name: "Neurology OPD",
                type: "Specialist",
                department: "Neurology",
                isActive: true,
                currentQueueLength: 9,
                averageServiceTime: 30,
                workingHours: { start: "09:00", end: "17:00" },
                maxCapacityPerHour: 10,
                specialization: "Brain & Nerve Disorders"
            },
            {
                name: "General Medicine",
                type: "OPD",
                department: "General Medicine",
                isActive: true,
                currentQueueLength: 18,
                averageServiceTime: 18,
                workingHours: { start: "08:00", end: "20:00" },
                maxCapacityPerHour: 18,
                specialization: "General Consultation"
            },
            {
                name: "Emergency Department",
                type: "Emergency",
                department: "Emergency Medicine",
                isActive: true,
                currentQueueLength: 6,
                averageServiceTime: 12,
                workingHours: { start: "00:00", end: "23:59" },
                maxCapacityPerHour: 50,
                specialization: "Emergency Care"
            }
        ],
        operatingHours: {
            monday: { open: "24/7", close: "24/7", isOpen: true },
            tuesday: { open: "24/7", close: "24/7", isOpen: true },
            wednesday: { open: "24/7", close: "24/7", isOpen: true },
            thursday: { open: "24/7", close: "24/7", isOpen: true },
            friday: { open: "24/7", close: "24/7", isOpen: true },
            saturday: { open: "24/7", close: "24/7", isOpen: true },
            sunday: { open: "24/7", close: "24/7", isOpen: true }
        },
        emergencyServices: true,
        bedCapacity: { total: 350, available: 40, icu: 45, general: 305 },
        rating: { average: 4.6, totalReviews: 1800 },
        website: "https://maxhealthcare.com",
        isVerified: true,
        isActive: true,
        registrationNumber: "DL/PVT/2023/004",
        establishedYear: 2001,
        doctorsCount: 95,
        nursesCount: 220
    },
    {
        name: "AIIMS Community Health Center",
        email: "info@aiimschc.com",
        phone: "+91-11-1357-2468",
        address: {
            street: "654 Ring Road",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110029",
            country: "India"
        },
        location: {
            type: "Point",
            coordinates: [77.2077, 28.5672] // AIIMS area coordinates
        },
        type: "Government",
        category: "Primary",
        specialties: ["Family Medicine", "Preventive Care", "Vaccination", "Basic Surgery"],
        facilities: ["OPD", "Pharmacy", "Basic Laboratory", "X-Ray", "Minor OT"],
        counters: [
            {
                name: "Family Medicine OPD",
                type: "OPD",
                department: "Family Medicine",
                isActive: true,
                currentQueueLength: 25,
                averageServiceTime: 10,
                workingHours: { start: "08:00", end: "16:00" },
                maxCapacityPerHour: 30,
                specialization: "Primary Healthcare"
            },
            {
                name: "Vaccination Counter",
                type: "General",
                department: "Preventive Care",
                isActive: true,
                currentQueueLength: 8,
                averageServiceTime: 5,
                workingHours: { start: "09:00", end: "15:00" },
                maxCapacityPerHour: 60,
                specialization: "Immunization"
            },
            {
                name: "Medicine Counter",
                type: "Pharmacy",
                department: "Pharmacy",
                isActive: true,
                currentQueueLength: 12,
                averageServiceTime: 3,
                workingHours: { start: "08:00", end: "18:00" },
                maxCapacityPerHour: 80,
                specialization: "Medicine Dispensing"
            }
        ],
        operatingHours: {
            monday: { open: "08:00", close: "18:00", isOpen: true },
            tuesday: { open: "08:00", close: "18:00", isOpen: true },
            wednesday: { open: "08:00", close: "18:00", isOpen: true },
            thursday: { open: "08:00", close: "18:00", isOpen: true },
            friday: { open: "08:00", close: "18:00", isOpen: true },
            saturday: { open: "08:00", close: "14:00", isOpen: true },
            sunday: { open: "10:00", close: "13:00", isOpen: false }
        },
        emergencyServices: false,
        bedCapacity: { total: 50, available: 10, icu: 0, general: 50 },
        rating: { average: 3.8, totalReviews: 650 },
        website: "https://aiimschc.gov.in",
        isVerified: true,
        isActive: true,
        registrationNumber: "DL/GOV/2023/005",
        establishedYear: 2015,
        doctorsCount: 20,
        nursesCount: 35
    }
];

const seedHospitals = async () => {
    try {
        console.log('🏥 Seeding hospitals...');

        // Clear existing hospitals
        await Hospital.deleteMany({});
        console.log('🗑️  Cleared existing hospitals');

        // Insert new hospitals
        const hospitals = await Hospital.insertMany(sampleHospitals);
        console.log(`✅ Successfully seeded ${hospitals.length} hospitals`);

        // Log hospital names and IDs
        hospitals.forEach(hospital => {
            console.log(`   - ${hospital.name} (${hospital._id})`);
        });

        return hospitals;
    } catch (error) {
        console.error('❌ Error seeding hospitals:', error);
        throw error;
    }
};

module.exports = { seedHospitals, sampleHospitals };
