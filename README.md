# AIrWAVE: AI-Powered Digital Asset Production Platform

AIrWAVE is a comprehensive platform that streamlines the creation, management, and deployment of digital marketing assets using AI-powered generation tools. It enables marketing teams to quickly produce high-quality content variations for multi-channel campaigns.

## Features

- **Client-Centric Architecture**: Manage multiple clients with dedicated workspaces, branding, and assets
- **Asset Management**: Upload, organize, and search various asset types (images, videos, copy, voiceovers)
- **AI-Powered Generation**: Create copy, images, and voiceovers using advanced AI models
- **Visual Matrix**: Configure dynamic templates with interchangeable assets for automated ad production
- **Execution Generation**: Automatically generate hundreds of ad variations based on matrix configurations
- **Client Approval Workflow**: Streamlined review and feedback process for client sign-off
- **Performance Tracking**: Monitor and optimize campaign performance

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (for database and authentication)
- API keys for AI services (OpenAI, ElevenLabs, Runway)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX.git
   cd AIRWAVE_0525_CODEX
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   
   a. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   b. Update `.env.local` with your actual values:
   ```env
   # Application
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NODE_ENV=development

   # Authentication
   JWT_SECRET=your-secure-jwt-secret-min-32-chars
   JWT_EXPIRY=7d
   REFRESH_TOKEN_EXPIRY=30d

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key

   # AI Services
   OPENAI_API_KEY=sk-your-openai-key
   ELEVENLABS_API_KEY=your-elevenlabs-key
   RUNWAY_API_KEY=your-runwayml-key

   # Creatomate (for video rendering)
   CREATOMATE_API_KEY=your-creatomate-key

   # Storage
   STORAGE_BUCKET=airwave-assets
   MAX_FILE_SIZE=52428800

   # Email (optional, for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

   **Note**: `SUPABASE_SERVICE_KEY` is only required when running maintenance scripts such as `create-test-users.js`.

4. Set up the database:
   ```bash
   # Run database migrations (if using Supabase)
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
AIRWAVE/
├── public/          # Static assets
├── scripts/         # Build and maintenance scripts
├── src/             # Source code
│   ├── components/  # Reusable React components
│   ├── contexts/    # React context providers
│   ├── db/          # Database utilities
│   ├── lib/         # Library code and utilities
│   ├── middleware/  # Next.js middleware
│   ├── pages/       # Next.js pages and API routes
│   │   ├── api/     # API endpoints
│   │   └── ...      # Application pages
│   ├── styles/      # Global styles
│   ├── test/        # Test utilities and setup
│   ├── types/       # TypeScript type definitions
│   └── utils/       # Utility functions
├── supabase/        # Supabase configuration
├── .env.example     # Example environment variables
├── .eslintrc.json   # ESLint configuration
├── .gitignore       # Git ignore file
├── .prettierrc      # Prettier configuration
├── Dockerfile       # Docker configuration
├── next.config.js   # Next.js configuration
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── vitest.config.ts # Vitest test configuration
```

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material UI v5
- **State Management**: React Context API, React Query, Zustand
- **Database & Auth**: Supabase
- **AI Integration**: 
  - OpenAI API (GPT-4 for text generation)
  - ElevenLabs (voice synthesis)
  - DALL-E/Flux (image generation)
  - Runway (advanced image generation)
- **Video Rendering**: Creatomate API
- **Testing**: Vitest, React Testing Library
- **Styling**: Emotion, Material UI Theme
- **Code Quality**: ESLint, Prettier, Husky

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run validate` - Run all validation checks

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request

## Troubleshooting

### Common Issues

1. **Missing dependencies error**
   - Run `npm install` to ensure all dependencies are installed
   - Check that you're using Node.js 18.x or higher

2. **Environment variable errors**
   - Ensure `.env.local` exists and contains all required variables
   - Check that API keys are valid and have necessary permissions

3. **Test failures**
   - Run `npm run test:watch` to debug failing tests
   - Check test setup in `src/test/setup.ts`

## License

This project is proprietary. See the LICENSE file for details.

## Acknowledgments

- OpenAI for AI text generation
- ElevenLabs for voice synthesis
- Material UI for component library
- Supabase for backend infrastructure
