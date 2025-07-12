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
🔗 [Demo Video Link](https://drive.google.com/drive/folders/1e2cHtJG6Mhq1sFvWUb3NtpKhH37zGSIx?usp=sharing)

### 💻 Technologies Used
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + JWT + Google OAuth
- **Deployment**: Vercel/Heroku/Railway

---

A modern, full-stack skill exchange platform that connects users to teach and learn skills from each other. Built with TypeScript, React, Node.js, and Supabase.

## 🌟 Features

### 🔐 Authentication & Security
- **Multi-provider Authentication**: Email/password and Google OAuth
- **JWT-based Session Management**: Secure token-based authentication
- **Row-Level Security**: Database-level access controls
- **Password Recovery**: Secure password reset functionality

### 👤 User Management
- **Comprehensive Profiles**: Name, location, avatar, visibility settings
- **Skill Portfolio**: Manage skills you can teach with proficiency levels (1-5)
- **Learning Goals**: Track skills you want to learn with priority levels
- **Availability Scheduling**: Set weekly availability slots
- **Rating System**: Community-driven user ratings

### 🎯 Intelligent Matching
- **Smart Compatibility Analysis**: Multi-factor matching algorithm
- **Skill-based Discovery**: Find users by specific skills
- **Location-based Filtering**: Connect with nearby users
- **Bidirectional Matching**: Find perfect skill exchanges
- **Personalized Recommendations**: AI-powered skill suggestions

### 📋 Swap Management
- **Swap Requests**: Create and manage skill exchange requests
- **Status Tracking**: Track pending, accepted, and cancelled swaps
- **Messaging System**: Include messages with swap requests
- **History Management**: View complete swap history

### ⭐ Feedback System
- **Post-Swap Reviews**: Rate and review completed exchanges
- **Comprehensive Analytics**: View feedback statistics and insights
- **Community Trust**: Build reputation through quality exchanges
- **Detailed Feedback**: Star ratings with optional comments

### 🔍 Discovery & Search
- **Advanced Search**: Multi-criteria user discovery
- **Popular Skills**: Trending skills on the platform
- **Filtering Options**: By rating, location, availability, proficiency
- **Sorting Options**: By relevance, rating, recent activity

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth + JWT
- **ORM**: Supabase Client
- **Security**: Helmet, CORS, Row-Level Security
- **Logging**: Morgan

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Fetch API

### Database
- **Primary Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (for avatars)
- **Migrations**: SQL-based migrations

### Development & Deployment
- **Package Manager**: pnpm
- **Monorepo**: pnpm workspaces
- **Development**: nodemon, ts-node
- **Build**: TypeScript Compiler
- **Testing**: Postman collections
- **Environment**: dotenv

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- pnpm (recommended) or npm
- Supabase account
- Google Cloud Console account (for OAuth)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/skillswap-platform.git
cd skillswap-platform
```

### 2. Install Dependencies
```bash
# Install all dependencies (backend + frontend)
pnpm install

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cd backend
cp env.template .env
```

Edit `.env` with your Supabase credentials:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 4. Database Setup
```bash
# Apply migrations via Supabase CLI
supabase db push

# Or manually run SQL files in Supabase Dashboard:
# - backend/supabase/migrations/0001_init.sql
# - backend/supabase/migrations/0002_auth_policies.sql
# - backend/supabase/migrations/0003_swap_requests_fixes.sql
# - backend/supabase/migrations/0004_sample_skills.sql
# - backend/supabase/migrations/0005_fix_swap_rls.sql
# - backend/supabase/migrations/0006_feedback_rating_trigger.sql
```

### 5. Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Create OAuth 2.0 credentials
4. In Supabase Dashboard:
   - Go to Authentication > Settings > Auth Providers
   - Enable Google provider
   - Add your Google Client ID and Secret
   - Configure redirect URLs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback`

### 6. Run the Application
```bash
# Start backend (from backend directory)
cd backend
npm run dev

# Start frontend (from frontend directory)
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📊 Database Schema

### Core Tables
- **users**: User profiles and settings
- **skills**: Master skills catalog
- **user_skills**: Skills users can teach (with proficiency)
- **desired_skills**: Skills users want to learn (with priority)
- **availability_slots**: Weekly availability schedules
- **swap_requests**: Skill exchange requests
- **feedback**: Post-swap reviews and ratings
- **admin_logs**: Administrative action logs

### Key Relationships
- Users can have multiple skills to teach and learn
- Swap requests connect two users with specific skills
- Feedback is linked to completed swaps
- Availability slots support flexible scheduling

## 🔗 API Documentation

### Authentication API
- [AUTH_API_DOCS.md](./AUTH_API_DOCS.md) - Complete authentication endpoints

### Core APIs
- [PROFILE_MANAGEMENT_API.md](./PROFILE_MANAGEMENT_API.md) - User profile management
- [SWAP_REQUEST_API_DOCUMENTATION.md](./SWAP_REQUEST_API_DOCUMENTATION.md) - Swap request system
- [FEEDBACK_API_DOCUMENTATION.md](./FEEDBACK_API_DOCUMENTATION.md) - Feedback and ratings
- [DISCOVERY_MATCHING_API_GUIDE.md](./DISCOVERY_MATCHING_API_GUIDE.md) - Discovery and matching
- [PUBLIC_DISCOVERY_API_DOCUMENTATION.md](./PUBLIC_DISCOVERY_API_DOCUMENTATION.md) - Public discovery

### API Base URLs
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

### Authentication
All protected endpoints require JWT token:
```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

### Postman Collections
Import the provided Postman collections for comprehensive API testing:
- `postman_collection.json` - Main API collection
- `SkillSwap Platform - Test Data Creator.postman_collection.json` - Test data setup
- `SkillSwap_Feedback_System_Testing.postman_collection.json` - Feedback system
- `SkillSwap_Public_Discovery_API_Testing.postman_collection.json` - Discovery API
- `SkillSwap_SwapRequest_Complete_Testing_FIXED.postman_collection.json` - Swap requests

### Manual Testing
```bash
# Test authentication
cd backend
node test-auth.js

# Test API endpoints
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-token>"
```

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code:
```bash
cd backend
npm run build
```

2. Deploy to your preferred platform:
- **Vercel**: Use serverless functions
- **Heroku**: Deploy with Procfile
- **Railway**: Direct deployment
- **AWS/GCP**: Use Docker containers

### Frontend Deployment
1. Build the React app:
```bash
cd frontend
npm run build
```

2. Deploy static files:
- **Vercel**: Automatic deployment
- **Netlify**: Drag & drop or Git integration
- **AWS S3**: Static website hosting
- **GitHub Pages**: For open source projects

### Environment Variables
Set these in your production environment:
```env
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
SUPABASE_JWT_SECRET=your-production-jwt-secret
```

## 🛣️ Development Workflow

### Code Structure
```
skillswap-platform/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   ├── supabase/
│   │   └── migrations/     # Database migrations
│   └── scripts/            # Utility scripts
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── lib/           # Utilities
│   │   └── config/        # Configuration
│   └── public/            # Static assets
└── docs/                  # API documentation
```

### Available Scripts

#### Backend
```bash
npm run dev        # Development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm run start      # Start production server
```

#### Frontend
```bash
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Git Workflow
1. Create feature branches from `main`
2. Follow conventional commit format
3. Submit pull requests for review
4. Merge to `main` after approval

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
4. **Follow the code style**
   - Use TypeScript for type safety
   - Follow existing naming conventions
   - Add JSDoc comments for functions
   - Use Prettier for formatting

5. **Test your changes**
   - Run existing tests
   - Add new tests for new features
   - Test API endpoints with Postman

6. **Commit your changes**
```bash
git commit -m "feat: add amazing feature"
```

7. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

8. **Create a Pull Request**

### Code Style Guidelines
- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add appropriate TypeScript types
- Use consistent naming conventions

## 📋 Roadmap

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Profile management
- [x] Skill management
- [x] Basic matching
- [x] Swap requests
- [x] Feedback system

### Phase 2: Enhanced Features 🚧
- [ ] Real-time messaging
- [ ] Video call integration
- [ ] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Calendar integration

### Phase 3: Advanced Features 🔮
- [ ] AI-powered recommendations
- [ ] Skill verification badges
- [ ] Community groups
- [ ] Skill marketplace
- [ ] Analytics dashboard
- [ ] Multi-language support

## 🐛 Known Issues

1. **OAuth Callback**: Ensure redirect URLs match exactly
2. **Database Permissions**: RLS policies need proper setup
3. **CORS**: Configure for production domains
4. **Rate Limiting**: Not implemented yet
5. **File Upload**: Avatar uploads need storage setup

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Quick Start Guide](./QUICK_START.md)
- [API Documentation](./AUTH_API_DOCS.md)
- [Testing Guide](./FEEDBACK_SYSTEM_TESTING_GUIDE.md)
- [Environment Setup](./frontend/ENVIRONMENT_SETUP.md)

### Getting Help
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Discord**: Join our community server
- **Email**: support@skillswap.com

### Common Issues
- Check the [Quick Start Guide](./QUICK_START.md) for setup issues
- Verify environment variables are set correctly
- Ensure database migrations are applied
- Check Supabase project settings

---

**Happy Skill Swapping! 🎉**

Built with ❤️ by the SkillSwap Team



