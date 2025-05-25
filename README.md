# AIrWAVE - AI-Powered Campaign Management Platform

A comprehensive digital marketing platform that leverages AI to streamline campaign creation, asset management, and content generation.

## 🚀 Project Status: 85% Complete

## ✨ Features

### ✅ Implemented Features

#### Phase 1: Core Functionality
- **Asset Management System**
  - Drag & drop file upload with preview
  - Asset categorization and filtering
  - Asset library with search functionality
  - Support for images, videos, and audio files

- **Template Management**
  - Browse and filter templates by platform
  - Template preview and selection
  - Performance metrics display
  - Template CRUD operations

- **Sign-Off System**
  - Approval workflow UI
  - Client review interface
  - Feedback collection
  - Real-time approval status tracking
  - Integration with campaigns and assets

#### Phase 2: Content Generation
- **Strategic Content & Brief System**
  - Comprehensive brief submission workflow
  - AI-powered content generation based on briefs
  - Strategic content planning tools
  - Brief history and versioning

- **Matrix System Enhancement**
  - Advanced variation management
  - Asset selection and assignment
  - Combination generation
  - Performance tracking and predictions

#### Phase 3: Export & Integration
- **Platform Export System**
  - Multi-platform export UI
  - Campaign execution workflow
  - Platform-specific formatting
  - Export history tracking

#### Phase 4: Analytics & Real-time
- **Analytics Dashboard**
  - Comprehensive performance metrics
  - ROI tracking and analysis
  - Custom reports with data visualization
  - Platform distribution insights

- **Real-time Features**
  - Activity feed with live updates
  - Real-time notifications
  - Collaborative features
  - User presence indicators

#### Phase 5: Admin & Polish
- **User Management**
  - Complete admin panel
  - Role-based access control (RBAC)
  - User CRUD operations
  - Audit logs and activity tracking
  - Permission management

### Additional Features
- **Client Management System**
  - Client profiles with brand guidelines
  - Multi-client support with easy switching
  - Client-specific asset isolation

- **Campaign Management**
  - Campaign creation and tracking
  - Budget and timeline visualization
  - Platform-specific targeting

- **AI-Powered Tools**
  - DALL-E 3 image generation
  - Prompt enhancement
  - Demo mode for testing

- **UI/UX Enhancements**
  - Loading states and skeleton screens
  - Global notification system
  - Responsive design
  - Dark mode support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: Zustand, React Query
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API (DALL-E 3)
- **Real-time**: WebSocket integration
- **Charts**: Recharts
- **Deployment**: Netlify

## 🚀 Deployment on Netlify

This application is deployed on Netlify with all necessary environment variables configured.

### Environment Variables (Set in Netlify)

All required API keys and environment variables are already configured in the Netlify deployment:

```env
# Core Configuration
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_URL=https://your-app.netlify.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Creatomate Configuration (for video generation)
CREATOMATE_API_KEY=your_creatomate_api_key

# Social Media APIs (for publishing)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
TWITTER_API_KEY=your_twitter_key
TWITTER_API_SECRET=your_twitter_secret
LINKEDIN_CLIENT_ID=your_linkedin_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret

# Analytics & Monitoring
SENTRY_DSN=your_sentry_dsn
GOOGLE_ANALYTICS_ID=your_ga_id

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
```

> **Note**: All these environment variables are already configured in the Netlify deployment settings. No additional setup is required for the deployed version.

## 📦 Local Development

1. Clone the repository:
```bash
git clone https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX.git
cd AIRWAVE_0525_CODEX
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables for local development:
```bash
cp .env.example .env.local
```

4. Configure your local environment variables (or use demo mode):
```env
# For demo mode (no external services required)
NEXT_PUBLIC_DEMO_MODE=true

# For full functionality, add your own API keys
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎮 Demo Mode

The application includes a comprehensive demo mode for testing without API keys:

- Demo clients with brand guidelines
- Sample campaigns and assets  
- Simulated AI image generation
- Mock data for all features
- Simulated real-time updates

To enable demo mode locally, set `NEXT_PUBLIC_DEMO_MODE=true` in your `.env.local` file.

## 📚 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ActivityFeed  # Real-time activity component
│   ├── AIImageGenerator
│   ├── AssetUploadModal
│   └── ...
├── contexts/         # React contexts for global state
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── pages/           # Next.js pages and API routes
│   ├── admin/       # Admin pages (user management)
│   ├── api/         # API endpoints
│   └── ...
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run validate` - Run all validation checks

## 📋 Remaining Features (15%)

The following features require backend infrastructure or API integrations:

- **Video Generation** - Creatomate API integration
- **Social Media Publishing** - Direct platform API integrations
- **Advanced Caching** - Redis/CDN integration
- **Email Notifications** - SendGrid integration
- **Advanced Analytics** - Google Analytics integration
- **Webhooks** - External service integrations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

### Latest Updates
- ✅ Asset upload functionality with drag & drop
- ✅ Complete template management system
- ✅ Sign-off approval workflow
- ✅ Strategic content with brief submission
- ✅ Enhanced matrix system with variations
- ✅ Campaign execution and export
- ✅ Comprehensive analytics dashboard
- ✅ Real-time activity feed
- ✅ User management with RBAC

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for DALL-E 3 API
- Supabase for backend infrastructure
- Material-UI for component library
- Vercel/Next.js team for the framework
- Netlify for hosting and deployment
