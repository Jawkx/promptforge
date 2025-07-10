# AGENTS.md - Development Guidelines

## Build/Lint/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run tsc` - TypeScript type checking
- `npm run preview` - Preview production build

## Code Style Guidelines
- **Imports**: Use `@/` alias for src imports, group external libs first, then internal
- **Formatting**: Prettier with 80 char line width, ESLint with TypeScript rules
- **Types**: Use TypeScript strictly, prefer interfaces over types for objects
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: Export as default, use arrow functions for functional components
- **Error Handling**: Use try/catch blocks, avoid silent failures
- **UI Components**: Located in `src/components/ui/` (ignored by ESLint)
- **State**: Use Zustand for global state, React hooks for local state
- **Styling**: Tailwind CSS with className prop, use clsx/cn for conditional classes

## Architecture Notes
- React + TypeScript + Vite project with LiveStore for real-time data
- UI built with Radix UI primitives and custom components
- TipTap editor for rich text editing
- Firebase for backend services