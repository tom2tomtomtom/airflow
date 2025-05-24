# AIrWAVE - AI-Powered Digital Asset Production Platform

AIrWAVE is a comprehensive content management platform that leverages AI to streamline digital asset creation, management, and optimization.

## Demo Mode

The application now includes a fully functional demo mode that allows you to explore all features without setting up authentication or backend services.

### Quick Start

1. Visit the deployed application on Netlify
2. On the login page, click **"Continue with Demo"**
3. The app will automatically log you in with a demo account and sample client data
4. You can now explore all features including:
   - AI-powered content generation
   - Asset management
   - Template library
   - Client management
   - Content matrix
   - Strategic content planning

### Features

- **AI Integration**: Generate images using DALL-E 3, create content with GPT-4
- **Asset Management**: Upload, organize, and manage digital assets
- **Template System**: Pre-built templates for various content types
- **Client Management**: Manage multiple clients and their brand guidelines
- **Content Matrix**: Strategic content planning and execution
- **Approval Workflows**: Streamline content approval processes

## Development Setup

### Prerequisites

- Node.js 18+
- npm 10+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX.git
cd AIRWAVE_0525_CODEX
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
   - Add your OpenAI API key for AI features
   - Configure Supabase credentials for database
   - Add other service API keys as needed

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application is configured for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Environment Variables

Required for full functionality:
- `OPENAI_API_KEY` - For AI content generation
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key

Optional:
- `ELEVENLABS_API_KEY` - For AI voice generation
- `CREATOMATE_API_KEY` - For video rendering

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI**: Material-UI (MUI)
- **State Management**: React Context API, Zustand
- **Authentication**: Supabase Auth (with demo mode)
- **Database**: Supabase (PostgreSQL)
- **AI Services**: OpenAI (GPT-4, DALL-E 3)
- **Deployment**: Netlify

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ using Next.js and AI
