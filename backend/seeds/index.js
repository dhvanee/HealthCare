const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedHospitals } = require('./hospitalSeeds');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
    try {
        console.log('🚀 Starting database seeding...');
        console.log('📊 Environment:', process.env.NODE_ENV || 'development');

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`📦 Connected to MongoDB: ${conn.connection.host}`);

        // Seed hospitals
        await seedHospitals();

        console.log('✅ Database seeding completed successfully!');
        console.log('📝 Summary:');
        console.log('   - 5 sample hospitals created');
        console.log('   - Multiple counters per hospital');
        console.log('   - Various hospital types (Government, Private)');
        console.log('   - Different categories (Primary, Secondary, Tertiary)');
        console.log('   - Sample queue data for testing ML predictions');

    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔐 Database connection closed');
        process.exit(0);
    }
};

// Run seeder if this file is executed directly
if (require.main === module) {
    console.log('🌱 Queue Prediction Management System - Database Seeder');
    console.log('================================================');
    seedDatabase();
}

module.exports = { seedDatabase };
