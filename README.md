# PromptForge

A sophisticated real-time collaborative prompt engineering tool built with modern web technologies. PromptForge enables users to create, manage, and organize AI prompts through an intuitive interface with advanced context management and real-time synchronization capabilities.

## ✨ Key Features

### 🗂️ Context Library Management

- **Reusable Context Snippets**: Create and organize text snippets for prompt engineering
- **Label-Based Organization**: Color-coded labels for categorization and filtering
- **Advanced Search & Filtering**: Quickly find contexts with powerful search capabilities
- **Drag & Drop Interface**: Intuitive context selection and organization
- **Bulk Operations**: Manage multiple contexts efficiently

### ✍️ Rich Text Prompt Editor

- **TipTap-Powered Editor**: Professional-grade rich text editing experience
- **Markdown Support**: Full markdown syntax with live preview
- **Code Syntax Highlighting**: Syntax highlighting for multiple programming languages
- **Real-time Editing**: Instant updates and collaborative editing
- **Export Capabilities**: Multiple export formats for your prompts

### 🔄 Real-time Collaboration

- **LiveStore Integration**: Event-sourcing architecture for robust data consistency
- **Automatic Conflict Resolution**: Seamless collaborative editing without conflicts
- **Cross-Device Synchronization**: Access your work from anywhere
- **Offline-First Architecture**: Continue working even without internet connection

### 🎨 Modern UI/UX

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: Comfortable viewing in any lighting condition
- **Resizable Panels**: Customizable workspace layout
- **Toast Notifications**: Clear feedback for all user actions
- **Accessibility Features**: Built with accessibility best practices

## 🏗️ Architecture & Tech Stack

### Frontend

- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling

### State Management

- **LiveStore** for real-time collaborative state with event sourcing
- **Zustand** for local UI state management
- **SQLite** backend with materialized views for efficient queries

### UI Components

- **Radix UI** primitives for accessible, unstyled components
- **Custom Design System** built on Radix with consistent styling
- **TanStack Table** for advanced data table functionality
- **@dnd-kit** for drag-and-drop interactions

### Infrastructure

- **Cloudflare Workers** for serverless backend processing
- **Cloudflare Durable Objects** for stateful WebSocket connections
- **Cloudflare Pages** for global edge deployment
- **D1 Database** for persistent data storage

### Authentication & Security

- **Clerk** for user authentication with anonymous user support
- **Environment-based Configuration** for secure API key management
- **CORS Configuration** for cross-origin request handling

### Development Tools

- **TypeScript** with strict configuration for type safety
- **oxlint** for fast, modern linting
- **Prettier** for consistent code formatting
- **GitHub Actions** for automated CI/CD

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** or **Bun** runtime
- **Wrangler CLI** for Cloudflare deployment
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd promptforge
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Add your Clerk and Cloudflare credentials
   ```

4. **Start development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run linters (oxlint)
- `bun run format` - Format code (prettier)
- `bun run tsc` - TypeScript type checking
- `bun run preview` - Preview production build
- `bun run worker:dev` - Start Cloudflare Worker dev server
- `bun run worker:deploy` - Deploy Cloudflare Worker

## 🏛️ Architecture Deep Dive

### Event Sourcing with LiveStore

PromptForge uses an event-sourcing architecture powered by LiveStore, providing:

- **Versioned Events**: All changes are captured as immutable events (v1.ContextCreated, v1.ContextUpdated)
- **Conflict Resolution**: Automatic handling of concurrent edits across multiple users
- **Audit Trail**: Complete history of all changes for debugging and analytics
- **Optimistic Updates**: Immediate UI feedback with eventual consistency

### Dual State Management

The application employs a sophisticated dual state management approach:

- **LiveStore**: Persistent, collaborative data (contexts, labels, user preferences)
- **Zustand**: Ephemeral UI state (modal states, focus areas, temporary selections)

### Real-time Collaboration

- **WebSocket Connections**: Managed by Cloudflare Durable Objects
- **Global Edge Distribution**: Low-latency sync across worldwide users
- **Offline-First**: OPFS (Origin Private File System) for client-side persistence
- **Conflict-Free Editing**: CRDT-like behavior through event sourcing

## 📁 Project Structure

```
src/
├── react/                    # Main React application
│   ├── components/          # Reusable UI components
│   │   └── ui/             # Design system components
│   ├── features/           # Feature-specific components
│   │   ├── context-library/ # Context management
│   │   ├── prompt-editor/   # Rich text editor
│   │   └── shared/         # Shared feature components
│   ├── screens/            # Top-level screen components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── livestore/          # LiveStore configuration
│   ├── store/              # State management
│   └── types/              # TypeScript type definitions
└── worker/                 # Cloudflare Worker code
```

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled with comprehensive typing
- **ESLint**: oxlint for fast, modern linting
- **Prettier**: Consistent code formatting
- **Import Organization**: External libraries first, then internal imports with `@/` alias

### Component Patterns

- **Functional Components**: Using React hooks exclusively
- **Custom Hooks**: Business logic abstracted into reusable hooks
- **Compound Components**: Complex UI built with composition patterns
- **Error Boundaries**: Graceful error handling (recommended for implementation)

### State Management Best Practices

- **LiveStore**: For data that needs persistence and collaboration
- **Zustand**: For local UI state and temporary data
- **React State**: For component-specific state only

## 🚀 Deployment

### Automatic Deployment (Recommended)

The project is configured for automatic deployment via GitHub Actions:

1. **Configure Cloudflare Pages project**
2. **Add repository secrets**:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_SYNC_URL`
3. **Push to `dev` branch** to trigger deployment

### Manual Deployment

```bash
# Build the project
bun run build

# Deploy to Cloudflare
bun run worker:deploy
```

## 🔍 Performance Considerations

### Current Optimizations

- **Vite Build System**: Fast development and optimized production builds
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Optimistic Updates**: Immediate UI feedback

### Recommended Improvements

- **List Virtualization**: For large context libraries (use `@tanstack/react-virtual`)
- **Bundle Analysis**: Regular bundle size monitoring
- **Performance Monitoring**: Add analytics and performance tracking
- **Error Tracking**: Implement error monitoring service

## 🧪 Testing Strategy (Recommended)

While the project currently lacks a testing framework, the recommended testing approach includes:

### Testing Framework

- **Vitest**: Fast unit testing framework (Vite-native)
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing for critical user flows

### Test Coverage Priorities

1. **Context Management**: Create, edit, delete, and organize contexts
2. **Real-time Sync**: Multi-user collaboration scenarios
3. **Drag & Drop**: Context selection and reordering
4. **Authentication**: User login/logout flows
5. **Error Handling**: Component failure scenarios

## 🔒 Security

### Current Security Measures

- **Environment Variables**: Secure API key management
- **Clerk Authentication**: Industry-standard user authentication
- **CORS Configuration**: Controlled cross-origin requests
- **TypeScript**: Compile-time type safety

### Security Recommendations

- **Content Security Policy (CSP)**: Add CSP headers
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API endpoint protection
- **Security Headers**: Additional security headers

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** following code style guidelines
4. **Run linting**: `bun run lint`
5. **Run type checking**: `bun run tsc`
6. **Commit changes**: Use conventional commit messages
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open Pull Request**

### Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Components follow established patterns
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance implications considered

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **LiveStore** - Real-time collaborative state management
- **Radix UI** - Accessible component primitives
- **TipTap** - Extensible rich text editor
- **Cloudflare** - Edge computing platform
- **Clerk** - User authentication service
