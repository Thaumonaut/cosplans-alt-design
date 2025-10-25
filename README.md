# Cosplay Tracker - SvelteKit

A comprehensive cosplay project tracking application built with SvelteKit and Svelte 5.

## 🚀 Features

- **Project Management**: Track cosplay projects from idea to completion
- **Character Database**: Organize characters with difficulty levels and tags
- **Resource Management**: Track props, materials, accessories, and equipment
- **Timeline & Planning**: Visual timeline and planning tools
- **Budget Tracking**: Monitor expenses and budget allocation
- **Team Collaboration**: Team management and messaging
- **Event Management**: Track conventions and photoshoots
- **Portfolio**: Showcase completed projects and services

## 🛠 Tech Stack

- **Framework**: SvelteKit with Svelte 5
- **UI Components**: Flowbite Svelte
- **Styling**: Tailwind CSS with custom design system
- **TypeScript**: Full TypeScript support
- **Build System**: Vite with optimized configuration
- **Testing**: Vitest (unit) + Playwright (E2E)

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd cosplay-tracker

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open http://localhost:5173
```

## 🔧 Development

```bash
# Development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Type checking
pnpm run check

# Run tests
pnpm run test          # Unit tests
pnpm run test:e2e      # E2E tests
pnpm run test:all      # All tests

# Linting
pnpm run lint
```

## 📁 Project Structure

```
src/
├── app.css                 # Global styles
├── app.html               # HTML template
├── lib/
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI components
│   │   └── *.svelte      # Feature components
│   ├── stores/           # Global state management
│   ├── types/            # TypeScript type definitions
│   ├── api/              # API client and data loading
│   └── utils.ts          # Utility functions
├── routes/               # SvelteKit routes
│   ├── +layout.svelte    # Root layout
│   ├── +page.svelte      # Dashboard
│   ├── characters/       # Character management
│   ├── projects/         # Project management
│   ├── planning/         # Planning tools
│   ├── budget/           # Budget tracking
│   ├── timeline/         # Timeline view
│   ├── marketplace/      # Service marketplace
│   ├── messages/         # Team messaging
│   ├── profile/          # User profile
│   └── settings/         # Application settings
└── test/                 # Test configuration

static/                   # Static assets
tests/                    # E2E tests
```

## 🎨 Design System

The application uses a comprehensive design system built on Tailwind CSS:

- **Colors**: Custom color palette with dark/light mode support
- **Typography**: Consistent font scales and weights
- **Components**: Reusable UI components with variants
- **Spacing**: Consistent spacing scale
- **Responsive**: Mobile-first responsive design

## 🧪 Testing

### Unit Tests
```bash
pnpm run test           # Run unit tests
pnpm run test:watch     # Watch mode
pnpm run test:coverage  # With coverage
```

### E2E Tests
```bash
pnpm run test:e2e       # Run E2E tests
pnpm run test:e2e:ui    # With UI
pnpm run test:e2e:headed # In headed mode
```

## 🚀 Deployment

The application is configured with `@sveltejs/adapter-auto` for automatic deployment platform detection.

```bash
# Build for production
pnpm run build

# The built application will be in the .svelte-kit/output directory
```

## 📊 Performance

- **Bundle Size**: Optimized with code splitting and tree shaking
- **Build Time**: Fast builds with Vite
- **Runtime**: Efficient with Svelte's compile-time optimizations
- **SEO**: Server-side rendering with SvelteKit

## 🔄 Migration

This application was successfully migrated from Next.js to SvelteKit. See [MIGRATION.md](./MIGRATION.md) for detailed migration documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [documentation](./MIGRATION.md)
- Review existing [issues](../../issues)
- Create a new issue if needed