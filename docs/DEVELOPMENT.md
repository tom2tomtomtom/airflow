# Development Setup & Repository Maintenance

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

## Repository Maintenance

### Clean Repository
```bash
# Run the cleanup script to remove temporary files
chmod +x scripts/cleanup-repo.sh
./scripts/cleanup-repo.sh
```

### Code Quality Checks
```bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run all validation checks
npm run validate
```

## Common Issues & Fixes

### TypeScript Issues
- Remove `tsconfig.tsbuildinfo` (should be gitignored)
- Run `npm run type-check` to validate TypeScript

### Import/Export Issues
- Check for malformed import statements
- Ensure consistent quote usage (prefer single quotes)
- Verify all exports are properly formatted

### Duplicate Files
The following files should be removed as they're duplicates:
- `strategic-content-fixed.tsx` (duplicate of `strategic-content.tsx`)
- `matrix.tsx.new` (duplicate of `matrix.tsx`)
- All `fix_*.js` scripts (should be run once then deleted)

## Environment Variables Required

```env
NEXT_PUBLIC_API_URL=your_api_url
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```
