# Queue Prediction Management System - Backend API

A comprehensive healthcare queue management system backend built with Express.js, MongoDB, and Machine Learning integration for predicting hospital wait times and recommending optimal appointment slots.

## 🚀 Features

- **User Authentication**: JWT-based signup/login system
- **Hospital Management**: Search nearby hospitals, view details and counters
- **Smart Booking**: Book appointments with ML-powered wait time predictions
- **Queue Predictions**: LightGBM model for real-time wait time estimation
- **Time Slot Recommendations**: RandomForest model for optimal appointment scheduling
- **Real-time Updates**: Live queue status and predictions
- **Comprehensive API**: RESTful endpoints for all healthcare operations

## 🛠️ Tech Stack

- **Backend Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, bcrypt password hashing
- **ML Integration**: Python models (LightGBM, RandomForest) with fallback logic
- **Environment Management**: dotenv

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm (v8.0.0 or higher)

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   cd HealthCare/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   MONGO_URI=mongodb://localhost:27017/queue-prediction-db
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRE=7d
   MODEL_PATH_LIGHTGBM=./models/wait_time_model.pkl
   MODEL_PATH_RANDOMFOREST=./models/slot_recommend_model.pkl
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗂️ Project Structure

```
backend/
├── server.js                 # Main application entry point
├── routes/                   # API route definitions
│   ├── authRoutes.js        # Authentication routes
│   ├── hospitalRoutes.js    # Hospital-related routes
│   └── ticketRoutes.js      # Booking and ticket routes
├── controllers/             # Business logic controllers
│   ├── authController.js    # User authentication logic
│   ├── hospitalController.js # Hospital operations
│   └── ticketController.js  # Ticket management
├── services/                # External services
│   └── mlService.js         # Machine learning predictions
├── database/                # Database configuration
│   ├── connection.js        # MongoDB connection setup
│   └── models/             # Mongoose data models
│       ├── User.js         # User schema
│       ├── Hospital.js     # Hospital schema
│       └── Ticket.js       # Ticket schema
├── middleware/              # Custom middleware
│   └── auth.js             # JWT authentication middleware
├── utils/                   # Utility functions
│   └── validation.js       # Input validation schemas
├── seeds/                   # Database seed files
│   ├── index.js            # Main seeder
│   └── hospitalSeeds.js    # Hospital sample data
└── models/                  # ML model files (placeholder)
    ├── wait_time_model.pkl
    └── slot_recommend_model.pkl
```

## 🔗 API Endpoints

### Authentication APIs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/logout` | User logout | Private |

### Hospital APIs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/hospitals/nearby` | Find nearby hospitals | Public |
| GET | `/api/hospitals/search` | Search hospitals | Public |
| GET | `/api/hospitals/:id` | Get hospital details | Public |
| GET | `/api/hospitals/:id/counters` | Get hospital counters | Public |
| GET | `/api/hospitals/:id/counters/:counterId/wait-time` | Get wait time prediction | Public |
| GET | `/api/hospitals/:id/counters/:counterId/recommended-slots` | Get recommended time slots | Private |

### Booking APIs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/tickets/book` | Book appointment | Private |
| GET | `/api/tickets/:user_id` | Get user tickets | Private |
| GET | `/api/tickets/details/:id` | Get ticket details | Private |
| PUT | `/api/tickets/:id/status` | Update ticket status | Private |
| POST | `/api/tickets/:id/checkin` | Check-in for appointment | Private |
| POST | `/api/tickets/:id/rating` | Rate service | Private |

## 📊 ML Integration

The system includes two machine learning models:

### 1. Wait Time Prediction (LightGBM)
- **Purpose**: Predict current waiting time for hospital counters
- **Features**: Queue length, time of day, counter type, weather, etc.
- **Fallback**: Rule-based calculation when model unavailable

### 2. Time Slot Recommendation (RandomForest)
- **Purpose**: Recommend optimal appointment times
- **Features**: Historical data, counter availability, user preferences
- **Fallback**: Time-based scoring algorithm

## 🔐 Authentication & Security

- **JWT Tokens**: Secure stateless authentication
- **Password Hashing**: bcrypt with configurable salt rounds
- **Input Validation**: Joi schema validation for all endpoints
- **Rate Limiting**: Configurable request throttling
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for Express.js

## 🗄️ Database Schema

### User Model
- Personal information and medical history
- Location data for nearby hospital searches
- Preferences and notification settings
- Authentication credentials

### Hospital Model
- Hospital details and contact information
- Geospatial location data
- Counter configurations and working hours
- Ratings and facilities information

### Ticket Model
- Appointment booking details
- Queue position and wait time estimates
- Payment and insurance information
- Service ratings and feedback

## 🚀 Getting Started

1. **Register a new user**
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123",
       "phone": "+91-9876543210",
       "dateOfBirth": "1990-01-01",
       "gender": "male"
     }'
   ```

2. **Find nearby hospitals**
   ```bash
   curl -X GET "http://localhost:5000/api/hospitals/nearby?latitude=28.6139&longitude=77.2090&radius=10"
   ```

3. **Book an appointment**
   ```bash
   curl -X POST http://localhost:5000/api/tickets/book \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "hospitalId": "HOSPITAL_ID",
       "counterId": "COUNTER_ID",
       "appointmentDateTime": "2024-01-20T10:00:00Z",
       "reasonForVisit": "Regular checkup"
     }'
   ```

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | No |
| `PORT` | Server port | 5000 | No |
| `MONGO_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | Token expiration time | 7d | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 | No |
| `MODEL_PATH_LIGHTGBM` | LightGBM model file path | ./models/wait_time_model.pkl | No |
| `MODEL_PATH_RANDOMFOREST` | RandomForest model path | ./models/slot_recommend_model.pkl | No |

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📦 NPM Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🔧 Development

### Adding New Endpoints
1. Create controller function in appropriate controller file
2. Add route definition in routes file
3. Add validation schema in `utils/validation.js`
4. Update this README with endpoint documentation

### Database Migrations
- Use MongoDB's flexible schema for easy updates
- Update model files and run seeder for major changes
- Maintain backward compatibility when possible

## 📈 Performance Considerations

- **Database Indexing**: Geospatial and query optimization indexes
- **Caching**: Consider Redis for frequently accessed data
- **Rate Limiting**: Prevent API abuse
- **Connection Pooling**: MongoDB connection optimization
- **ML Model Loading**: Models loaded once at startup

## 🚨 Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@queueprediction.com
- Documentation: [API Docs](http://localhost:5000/api/docs)

## 🔄 Version History

- **v1.0.0** - Initial MVP release with core functionality
- **v1.1.0** - ML model integration and predictions
- **v1.2.0** - Enhanced security and validation

---

Built with ❤️ for better healthcare management