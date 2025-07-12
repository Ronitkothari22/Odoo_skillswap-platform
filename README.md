# 🎯 SkillSwap Platform

## 📋 Project Information

### 🎯 Problem Statement
A modern, full-stack skill exchange platform that connects users to teach and learn skills from each other, addressing the need for peer-to-peer skill sharing and learning opportunities.

### 👥 Team Members
- **Maharshi Kachhi** - kachhimaharshi20@gmail.com
- **Abhishek Parmar** - abhishekparmar2904@gmail.com
- **Denis Ruparel** - deniskalpeshbhai436@gmail.com
- **Ronit Kothari** - ronitkothari22@gmail.com

### 🎬 Demo Video
🔗 [Demo Video Link](https://drive.google.com/drive/folders/1JdT7ihlIr3Drv87ECeEToDocGflxsgEu)

### 💻 Technologies Used
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + JWT + Google OAuth
- **Deployment**: Vercel/Heroku/Railway

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Multi-Provider Authentication**: Seamless login with email/password or Google OAuth
- **JWT-Based Sessions**: Secure token-based authentication with automatic refresh
- **Row-Level Security**: Database-level access controls ensuring data privacy
- **Password Recovery**: Secure password reset functionality via email

### 👤 User Profile Management
- **Comprehensive Profiles**: Complete user information including name, location, avatar, and bio
- **Skills Portfolio**: Manage skills you can teach with proficiency levels (1-5 stars)
- **Learning Goals**: Track skills you want to learn with priority levels
- **Availability Scheduling**: Set weekly availability slots for flexible scheduling
- **Privacy Controls**: Manage profile visibility and contact preferences

### 🎯 Intelligent Matching System
- **Smart Compatibility Analysis**: Advanced algorithm considering multiple factors
- **Skill-Based Discovery**: Find users by specific skills with filtering options
- **Location-Based Matching**: Connect with users in your area or remotely
- **Bidirectional Matching**: Find perfect skill exchanges where both parties benefit
- **Compatibility Scoring**: Percentage-based matching scores for better decisions

### 📋 Swap Request Management
- **Request Creation**: Create detailed swap requests with specific skills and messages
- **Status Tracking**: Track pending, accepted, completed, and cancelled swaps
- **Messaging System**: Built-in messaging for swap coordination
- **History Management**: Complete history of all swap activities
- **Notification System**: Real-time updates on swap status changes

### ⭐ Feedback & Rating System
- **Post-Swap Reviews**: Rate and review completed skill exchanges
- **Comprehensive Analytics**: View detailed feedback statistics and insights
- **Community Trust Building**: Build reputation through quality exchanges
- **Detailed Feedback**: 5-star ratings with optional written comments
- **Rating Aggregation**: Automatic calculation of overall user ratings

### 🔍 Advanced Discovery & Search
- **Multi-Criteria Search**: Search by skills, location, rating, and availability
- **Popular Skills Tracking**: See trending skills on the platform
- **Advanced Filtering**: Filter by proficiency level, location radius, and user rating
- **Sorting Options**: Sort results by relevance, rating, or recent activity
- **Skill Suggestions**: Get personalized skill recommendations


### Environment Variables
Edit `backend/.env` with your Supabase credentials:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## 🛠️ Architecture & Tech Stack

### Frontend Architecture
- **React 19**: Modern React with latest features and hooks
- **TypeScript**: Type-safe development with full IntelliSense
- **Tailwind CSS**: Utility-first styling for rapid UI development
- **Vite**: Lightning-fast build tool and development server
- **Radix UI**: Accessible, unstyled UI components
- **React Hook Form + Zod**: Form handling with validation
- **React Router**: Client-side routing

### Backend Architecture
- **Node.js + Express**: Robust server framework
- **TypeScript**: Type-safe server-side development
- **Supabase Client**: Database operations and real-time features
- **JWT Authentication**: Secure token-based auth
- **Middleware Stack**: CORS, Helmet, Morgan logging
- **Error Handling**: Centralized error management

### Database Design
- **PostgreSQL (Supabase)**: Robust relational database
- **Row-Level Security**: Fine-grained access controls
- **Real-time Subscriptions**: Live data updates
- **Automatic Migrations**: Version-controlled schema changes

## 📊 Database Schema

### Core Tables
- **`users`**: User profiles, settings, and authentication data
- **`skills`**: Master catalog of available skills
- **`user_skills`**: Skills users can teach with proficiency levels
- **`desired_skills`**: Skills users want to learn with priority
- **`availability_slots`**: Weekly availability schedules
- **`swap_requests`**: Skill exchange requests and status
- **`feedback`**: Post-swap reviews and ratings
- **`admin_logs`**: Administrative actions and system logs

### Key Relationships
- Users can teach multiple skills and want to learn multiple skills
- Swap requests connect two users for specific skill exchanges
- Feedback is linked to completed swaps for trust building
- Availability slots enable flexible scheduling

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Password reset

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/skills` - Add user skills
- `GET /api/users/skills` - Get user skills
- `DELETE /api/users/skills/:id` - Remove user skill

### Discovery & Matching
- `GET /api/discovery/users` - Search users by skills
- `GET /api/discovery/skills` - Get available skills
- `GET /api/matching/suggestions` - Get personalized matches
- `POST /api/matching/compatibility` - Calculate compatibility

### Swap Requests
- `POST /api/swap-requests` - Create swap request
- `GET /api/swap-requests` - Get user's swap requests
- `PUT /api/swap-requests/:id` - Update swap request
- `DELETE /api/swap-requests/:id` - Cancel swap request

### Feedback System
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/user/:id` - Get user feedback
- `GET /api/feedback/stats` - Get feedback statistics


## 🎯 What Makes It Special

### 🧠 Intelligent Matching Algorithm
Our proprietary matching system considers:
- **Skill Compatibility**: Matching skills you want to learn with skills others teach
- **Proficiency Levels**: Ensuring appropriate skill level matches
- **Location Preferences**: Connecting users based on location preferences
- **Availability Overlap**: Finding users with compatible schedules
- **Rating Compatibility**: Matching users with similar rating levels

### 🔒 Enterprise-Grade Security
- **Row-Level Security**: Database-level access controls
- **JWT Token Management**: Secure authentication with automatic refresh
- **Input Validation**: Comprehensive request validation and sanitization
- **CORS Configuration**: Proper cross-origin request handling
- **Rate Limiting**: API protection against abuse

### 🚀 Real-Time Features
- **Live Notifications**: Instant updates on swap requests and messages
- **Real-Time Matching**: Dynamic compatibility updates
- **Live Status Updates**: Real-time swap request status changes
- **Instant Messaging**: Real-time communication between users

### 📱 Mobile-First Design
- **Responsive Layout**: Works seamlessly on all device sizes
- **Touch-Friendly Interface**: Optimized for mobile interaction
- **Progressive Web App**: App-like experience in the browser
- **Offline Capability**: Basic functionality available offline

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
cd frontend
pnpm run build
# Deploy to Vercel
```

### Backend Deployment (Railway/Heroku)
```bash
cd backend
pnpm run build
# Deploy to your preferred platform
```

### Environment Setup
Set production environment variables:
```env
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
SUPABASE_JWT_SECRET=your-production-jwt-secret
```

## 📈 Performance & Scalability

### Frontend Optimization
- **Code Splitting**: Lazy loading for optimal performance
- **Image Optimization**: Responsive images with proper formats
- **Caching Strategy**: Efficient client-side caching
- **Bundle Analysis**: Optimized build sizes

### Backend Optimization
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching Layer**: Redis caching for frequently accessed data
- **API Rate Limiting**: Protection against abuse

### Monitoring & Analytics
- **Error Tracking**: Comprehensive error monitoring
- **Performance Metrics**: Real-time performance tracking
- **User Analytics**: User behavior and engagement tracking
- **System Health**: Database and server health monitoring

---




