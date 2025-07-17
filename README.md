# Prompt Forge

A powerful, real-time collaborative prompt engineering tool built with React, TypeScript, and LiveStore. Prompt Forge helps you organize, manage, and craft AI prompts with a rich text editor and context library system.

## Features

### 🎯 **Context Library Management**

- Create, edit, and organize reusable context snippets
- Label-based categorization with color coding
- Search and filter contexts
- Drag-and-drop context selection
- Bulk operations (select, delete multiple contexts)

### ✍️ **Rich Text Prompt Editor**

- TipTap-powered rich text editor with markdown support
- Real-time editing with syntax highlighting
- Image support and file handling
- Code block syntax highlighting with Lowlight
- Typography extensions and formatting tools

### 🔄 **Real-time Collaboration**

- LiveStore integration for real-time data synchronization
- Persistent state management
- Automatic conflict resolution

### 🎨 **Modern UI/UX**

- Clean, responsive design with Tailwind CSS
- Dark/light theme support
- Resizable panels for optimal workspace layout
- Toast notifications for user feedback
- Keyboard shortcuts and accessibility features

### 📱 **Cross-Platform**

- Web-based application
- Cloudflare Pages hosting for reliable deployment
- Progressive Web App capabilities

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand + LiveStore for real-time sync
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom design system
- **Rich Text Editor**: TipTap with extensions
- **Data Tables**: TanStack Table
- **Drag & Drop**: dnd-kit
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages + Workers
- **Code Quality**: oxlint + Prettier + TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Wrangler CLI (for deployment)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd promptforge
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Start the development server:

```bash
bun run dev
# or
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run oxlint
- `bun run tsc` - TypeScript type checking
- `bun run preview` - Preview production build
- `bun run worker:dev` - Start Cloudflare Worker dev server
- `bun run worker:deploy` - Deploy Cloudflare Worker

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Base UI components (Radix + custom)
├── features/           # Feature-specific components
│   ├── context-library/    # Context management
│   ├── prompt-editor/      # Rich text editor
│   ├── selected-contexts/  # Selected contexts panel
│   └── shared/            # Shared feature components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── livestore/          # Real-time data stores
├── screens/            # Main application screens
├── store/              # State management
└── types/              # TypeScript type definitions
```

## Key Features Explained

### Context Library

The context library allows you to:

- Store reusable text snippets for prompt engineering
- Organize contexts with labels and colors
- Search through your context collection
- Copy contexts to your active prompt

### Prompt Editor

The rich text editor provides:

- Markdown-style formatting
- Code syntax highlighting
- Image embedding
- Real-time preview
- Export capabilities

### Real-time Sync

LiveStore integration enables:

- Automatic data synchronization
- Conflict-free collaborative editing
- Offline-first architecture
- Cross-device consistency

## Development Guidelines

### Code Style

- Use TypeScript strictly with proper type definitions
- Follow React best practices with functional components
- Implement proper error boundaries and loading states
- Use Tailwind CSS for styling with the established design system

### State Management

- Use Zustand for local application state
- Use LiveStore for real-time synchronized data
- Keep state minimal and normalized

### Component Architecture

- Build reusable components in `components/ui/`
- Feature-specific components go in `features/`
- Use proper prop typing and default values

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and ensure tests pass
4. Run linting: `bun run lint`
5. Run type checking: `bun run tsc`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Deployment

This project is configured for automatic deployment to **Cloudflare Pages** via GitHub Actions.

### Setup Steps

1. **Cloudflare Configuration**

   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Create a new Pages project
   - Note your **Account ID** from the right sidebar

2. **GitHub Secrets**
   Add these secrets to your GitHub repository:

   - `CLOUDFLARE_API_TOKEN`: Create at [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
     - Use template "Cloudflare Pages"
     - Permissions: `Cloudflare Pages:Edit`
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

3. **Manual Deployment (Optional)**

   ```bash
   # Install Wrangler CLI
   bun add -D wrangler

   # Login to Cloudflare
   bunx wrangler login

   # Deploy manually
   bunx wrangler pages deploy dist --project-name=promptforge
   ```

## License

This project is private and proprietary.

## Support

For questions or support, please open an issue in the repository.
