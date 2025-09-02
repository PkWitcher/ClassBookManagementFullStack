# 🎓 ClassBook - Class Booking Management System

A modern, full-stack web application for managing class bookings, sessions, and user registrations.

## ✨ Features

- **User Authentication**: Secure login/registration system
- **Class Management**: Create and manage different classes
- **Session Booking**: Book sessions with real-time capacity tracking
- **Admin Dashboard**: Comprehensive admin tools for managing the system
- **Audit Logging**: Track all system activities
- **Responsive Design**: Modern UI that works on all devices

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Router DOM** for navigation
- **React Query** for data fetching and caching
- **Custom CSS** with modern design principles

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma** as ORM
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ClassBook
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set up environment variables
Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/classbook"
JWT_SECRET="your-secret-key"
PORT=5001
```

**Frontend (.env):**
```env
VITE_API_URL="http://localhost:5001"
```

### 4. Set up database
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Start development servers
```bash
# Start all services (from project root)
./start-dev.sh

# Or start individually:
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Frontend (Vercel)
1. Build the frontend: `npm run build`
2. Deploy to Vercel using their dashboard
3. Set environment variables in Vercel

### Backend (Railway/Render/Heroku)
1. Set up environment variables
2. Deploy using your preferred platform
3. Update frontend API URL to point to deployed backend

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Browse Classes**: View available classes
3. **Book Sessions**: Reserve spots in upcoming sessions
4. **Manage Bookings**: View and cancel your bookings
5. **Admin Features**: Manage classes, sessions, and users (admin only)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes for authenticated users
- Admin-only access for sensitive operations
- Input validation and sanitization

## 📊 Database Schema

- **Users**: Authentication and role management
- **Classes**: Class definitions and descriptions
- **Sessions**: Time slots for classes with capacity limits
- **Bookings**: User reservations for sessions
- **Audit Logs**: System activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for modern class management**
