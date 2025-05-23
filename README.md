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

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX.git
   cd AIRWAVE_0525_CODEX
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with required environment variables:
   ```
   NEXT_PUBLIC_API_URL=your_api_url
   OPENAI_API_KEY=your_openai_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

   `SUPABASE_SERVICE_KEY` is only required when running maintenance scripts such as `create-test-users.js`.

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
AIrWAVE/
├── public/          # Static assets
├── src/             # Source code
│   ├── api/         # API handlers
│   ├── components/  # Reusable components
│   ├── contexts/    # React context providers
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Next.js pages
│   ├── styles/      # Global styles
│   └── utils/       # Utility functions
├── .env.example     # Example environment variables
├── .gitignore       # Git ignore file
├── next.config.js   # Next.js configuration
├── package.json     # Dependencies and scripts
└── tsconfig.json    # TypeScript configuration
```

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Material UI
- **State Management**: React Context API, React Query, Zustand
- **AI Integration**: OpenAI API, ElevenLabs, DALL-E/Flux
- **Video Rendering**: Creatomate API
- **Styling**: Emotion, Material UI Theme

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for AI text generation
- ElevenLabs for voice synthesis
- Material UI for component library