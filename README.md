# AIrWAVE - AI-Powered Campaign Management Platform

A comprehensive digital marketing platform that leverages AI to streamline campaign creation, asset management, and content generation.

## 🚀 Features

### ✅ Implemented Features

- **Client Management System**
  - Client listing page with search and filtering
  - Detailed client profiles with editing capabilities
  - Client selector for easy switching between clients
  - Brand guidelines management

- **Campaign Management**
  - Campaign listing with status tracking
  - Budget and timeline visualization
  - Platform-specific campaign targeting

- **AI-Powered Tools**
  - DALL-E 3 image generation with customizable parameters
  - Demo mode for testing without API keys
  - Prompt enhancement for better results

- **Asset Management**
  - Centralized asset library
  - AI-generated asset tracking
  - Multi-file upload support (in progress)

- **UI/UX Enhancements**
  - Loading spinners and skeleton screens
  - User-friendly error messages
  - Global notification system
  - Responsive design

### 🚧 In Progress

- Campaign creation and editing
- Template marketplace
- Matrix functionality improvements
- Real-time collaboration features
- Analytics dashboard

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: Zustand, React Query
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API (DALL-E 3)
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX.git
cd AIRWAVE_0525_CODEX
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
# For demo mode (no external services required)
NEXT_PUBLIC_DEMO_MODE=true

# For production mode
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎮 Demo Mode

The application includes a comprehensive demo mode that allows you to explore all features without setting up external services:

- Demo clients with brand guidelines
- Sample campaigns and assets
- Simulated AI image generation
- Mock data for all features

To enable demo mode, set `NEXT_PUBLIC_DEMO_MODE=true` in your environment variables.

## 📚 Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React contexts for global state
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── pages/           # Next.js pages and API routes
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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Implementation Progress

### Week 1: Critical Fixes ✅
- Fixed navigation and routing
- Implemented AI image generation
- Added demo mode with sample data
- Created reusable UI components

### Week 2: Core Features 🚧
- Client Management System ✅
- Campaign Management (partial)
- Matrix functionality (existing)

### Upcoming Phases
- Week 3: UI/UX & Integrations
- Week 4-5: Missing Features
- Week 6: Performance & Security

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for DALL-E 3 API
- Supabase for backend infrastructure
- Material-UI for component library
- Vercel/Next.js team for the framework
