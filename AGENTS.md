# AGENTS.md - Development Guidelines

## Build/Lint/Test Commands

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run linters (oxlint)
- `bun run format` - Run formatters (prettier)
- `bun run tsc` - TypeScript type checking
- `bun run preview` - Preview production build
- `bun run worker:dev` - Start Cloudflare Worker dev server
- `bun run worker:deploy` - Deploy Cloudflare Worker
- **Note**: No test framework configured - check with user before adding tests

## Code Style Guidelines

- **Imports**: Use `@/` alias for src imports, group external libs first, then internal
- **Formatting**: Prettier with 80 char line width, oxlint for linting
- **Types**: Use TypeScript strictly, prefer interfaces over types for objects
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: Use React.forwardRef for UI components, export as default
- **Error Handling**: Use try/catch blocks, avoid silent failures
- **UI Components**: Located in `src/components/ui/`, use Radix UI + CVA patterns
- **State**: Use Zustand for global state, LiveStore for real-time data
- **Styling**: Tailwind CSS with className prop, use cn() utility for conditional classes

## Architecture Notes

- React + TypeScript + Vite project with LiveStore for real-time data sync
- UI built with Radix UI primitives and custom components using CVA
- TipTap editor for rich text editing with custom extensions
- Cloudflare Workers for backend services, Clerk for authentication
