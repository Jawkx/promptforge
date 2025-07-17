# PromptForge Architecture Documentation

## Executive Summary

PromptForge is a sophisticated React application designed for collaborative prompt engineering. The system demonstrates excellent architectural design with an event-sourced dual-store pattern, real-time collaboration capabilities, and modern development practices. Built on React 18, TypeScript, and Cloudflare Workers, it provides a scalable foundation for prompt management and collaborative editing.

### Key Architectural Strengths

- **Event-Sourced Dual-Store Architecture**: Excellent separation between persistent collaborative data (LiveStore) and ephemeral UI state (Zustand)
- **Real-time Collaboration**: WebSocket-based synchronization with conflict resolution
- **Modern Tech Stack**: React 18, TypeScript, Vite, Cloudflare Workers
- **Component Architecture**: Feature-based organization with proper separation of concerns
- **Performance Optimizations**: OPFS storage, pagination, memoization, and optimistic updates

## System Overview

PromptForge enables users to create, organize, and collaborate on prompt contexts in real-time. The application consists of:

- **Context Library**: Persistent storage and management of reusable text contexts
- **Prompt Editor**: Rich text editing interface for composing prompts
- **Real-time Collaboration**: Multi-user synchronization and conflict resolution
- **Label System**: Categorization and organization of contexts
- **Authentication**: User management via Clerk

## Core Architecture Patterns

### 1. Dual-Store Pattern

The application employs a sophisticated dual-store architecture that separates concerns between different types of state:

#### LiveStore (Persistent, Collaborative State)

- **Purpose**: Manages persistent data that needs real-time synchronization
- **Data**: Contexts, labels, library metadata, user memberships
- **Location**: `src/react/livestore/`
- **Technology**: Event-sourced SQLite with materialized views

```typescript
// Context Library Store Schema
export const contextLibrarySchema: LiveStoreSchema = makeSchema({
  events: contextLibraryEvents,
  state: State.SQLite.makeState({
    tables: contextLibraryTables,
    materializers: contextLibraryMaterializers,
  }),
});
```

#### Zustand (Ephemeral, UI State)

- **Purpose**: Manages transient UI state that doesn't need persistence
- **Data**: Current prompt content, selected contexts, focus areas
- **Location**: `src/react/store/localStore.ts`
- **Technology**: Zustand for lightweight state management

```typescript
interface LocalStoreState {
  prompt: Content;
  selectedContexts: SelectedContext[];
  focusedArea: FocusArea;
  // ... state management methods
}
```

### 2. Event Sourcing Architecture

The system uses event sourcing for all persistent data operations:

#### Events (`src/react/livestore/context-library-store/events.ts`)

```typescript
export const contextLibraryEvents = {
  contextCreated: Events.synced({
    name: "v1.ContextCreated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      content: Schema.String,
      // ...
    }),
  }),
  // ... other events
};
```

#### Materializers (`src/react/livestore/context-library-store/materializers.ts`)

- Transform events into database operations
- Handle idempotent operations with delete-then-insert patterns
- Maintain referential integrity across related entities

### 3. Real-time Synchronization

#### WebSocket Communication

- **Backend**: Cloudflare Durable Objects (`src/worker/index.ts`)
- **Protocol**: WebSocket-based real-time synchronization
- **Storage**: OPFS (Origin Private File System) for local persistence

#### Conflict Resolution

- Event-sourced architecture provides natural conflict resolution
- Optimistic updates with server reconciliation
- Version tracking for context synchronization

## Technology Stack

### Frontend

- **React 18**: Modern React with concurrent features
- **TypeScript**: Strict typing with comprehensive configuration
- **Vite**: Fast build tool with HMR
- **TailwindCSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

### State Management

- **LiveStore**: Real-time collaborative state with SQLite backend
- **Zustand**: Lightweight local state management
- **React Hook Form**: Form state and validation

### UI Components

- **TipTap**: Rich text editor with custom extensions
- **Tanstack Table**: Data table with sorting, filtering, pagination
- **DND Kit**: Drag and drop functionality
- **Sonner**: Toast notifications

### Backend & Infrastructure

- **Cloudflare Workers**: Serverless backend
- **Cloudflare Durable Objects**: Stateful WebSocket handling
- **Clerk**: Authentication and user management
- **SQLite**: Local and synchronized data storage

## Data Flow Architecture

### 1. Data Models

#### Core Entities

```typescript
export type Context = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly tokenCount: number;
  readonly version: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly labels: readonly Label[];
};

export type Label = {
  readonly id: string;
  readonly name: string;
  readonly color: string;
};
```

#### Database Schema

```sql
-- Contexts table
CREATE TABLE contextsLibrary (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  tokenCount INTEGER NOT NULL DEFAULT 0,
  version TEXT NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT 0,
  updatedAt INTEGER NOT NULL DEFAULT 0
);

-- Labels and associations
CREATE TABLE labels (
  id TEXT PRIMARY KEY,
  name TEXT,
  color TEXT
);

CREATE TABLE context_labels (
  contextId TEXT,
  labelId TEXT
);
```

### 2. State Synchronization

#### Context Synchronization Hook (`src/react/hooks/useSyncContexts.ts`)

```typescript
export const useSyncContexts = ({
  libraryContexts,
  selectedContexts,
  updateSelectedContext,
  removeMultipleSelectedContextsFromPrompt,
}: UseSyncContextsParams) => {
  // Synchronizes selected contexts with library changes
  // Handles pristine context updates and deletion cleanup
};
```

**Complexity**: O(n\*m) where n = selected contexts, m = library contexts
**Flow**: Library changes → Sync hook → Update selected contexts → UI re-render

### 3. Event Processing Flow

1. **User Action** → UI Component
2. **Event Creation** → LiveStore Event
3. **Local Materializer** → SQLite Update
4. **WebSocket Sync** → Server Propagation
5. **Remote Materializers** → Other Clients Update
6. **UI Re-render** → Reactive Updates

## Component Architecture

### 1. Feature-Based Organization

```
src/react/
├── features/
│   ├── context-library/     # Context management
│   ├── prompt-editor/       # Rich text editing
│   ├── selected-contexts/   # Working context area
│   └── shared/             # Common components
├── components/ui/          # Reusable UI components
├── screens/               # Top-level screen components
└── hooks/                # Custom React hooks
```

### 2. Screen Components

#### Editor Screen (`src/react/screens/Editor/index.tsx`)

- **Complexity**: High - Manages drag & drop, modals, confirmations
- **Dependencies**: LiveStore, Zustand, DND Kit, Wouter routing
- **Flow**: User interactions → State updates → Real-time sync

```typescript
const Editor: React.FC = () => {
  // Drag and drop state management
  const { activeDraggedContexts, handleDragStart, handleDragEnd } = useDragAndDrop();

  // Real-time data queries
  const contexts = useQuery(contexts$, { store: contextLibraryStore });

  // Modal and confirmation state
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <ResizablePanelGroup direction="horizontal">
        <LeftPanel />
        <RightPanel />
      </ResizablePanelGroup>
    </DndContext>
  );
};
```

### 3. UI Component Patterns

#### Radix UI Integration

- Consistent accessibility patterns
- Compound component architecture
- Theme-aware styling with CSS variables

#### Performance Optimizations

- `React.memo` for expensive list items
- `useCallback` for event handlers
- Virtualization for large datasets

## Security Considerations

### Authentication & Authorization

- **Clerk Integration**: Robust user management with session handling
- **Environment Variables**: Proper configuration for sensitive data
- **TypeScript**: Compile-time type safety

### Current Security Posture

**Strengths:**

- Clerk authentication provides robust user management
- Environment variables properly configured
- TypeScript strict mode with comprehensive linting
- Proper gitignore configuration

**Areas for Improvement:**

- **Server-side Validation**: Currently only client-side validation exists
- **Rate Limiting**: No visible abuse prevention mechanisms
- **Content Sanitization**: User-generated content needs sanitization
- **CORS Configuration**: Broadly enabled in worker (`enableCORS: true`)

### Recommendations

1. Implement server-side input validation and sanitization
2. Add rate limiting and abuse prevention
3. Implement content sanitization for user contexts
4. Review and restrict CORS configuration

## Scalability & Performance

### Current Scalability Characteristics

#### Strengths

- **Event-sourced Architecture**: Scales well for collaborative features
- **Cloudflare Workers**: Global edge distribution
- **OPFS Storage**: Efficient local storage without IndexedDB limitations
- **Pagination**: Data tables handle large datasets efficiently
- **Optimistic Updates**: Reduced perceived latency

#### Potential Bottlenecks

- **Token Estimation**: Client-side only with rough heuristic (4-char rule)
- **SQLite Materialized Views**: May not scale to very large datasets
- **Complex State Sync**: `useSyncContexts` has O(n\*m) complexity
- **Drag Operations**: Could be expensive with large context lists

### Performance Optimizations

#### Current Optimizations

```typescript
// Memoized table rows for performance
const DataTableRow = React.memo(({ row, table, activeId }) => {
  // Expensive rendering logic memoized
});

// Debounced auto-save
useEffect(() => {
  const timeoutId = setTimeout(() => {
    onDataChange(currentValues);
  }, 500); // 500ms debounce
  return () => clearTimeout(timeoutId);
}, [watchedTitle, watchedContent, watchedLabels]);
```

#### Recommended Improvements

1. Implement server-side token counting for accuracy
2. Add caching layer for frequently accessed contexts
3. Optimize state synchronization algorithms
4. Consider virtualization for very large context lists

## Strategic Recommendations

### High Priority (Immediate Action Required)

#### 1. Implement Server-side Validation

**Current State**: All validation is client-side only
**Risk**: Data integrity and security vulnerabilities
**Solution**:

```typescript
// Implement Zod schemas for validation
const ContextSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000),
  labels: z.array(LabelSchema).optional(),
});
```

#### 2. Centralize Business Logic

**Current State**: Business logic scattered across UI components
**Risk**: Code duplication and inconsistent behavior
**Solution**: Create dedicated service layer

```typescript
// Example: useContextActions hook
export const useContextActions = () => {
  const contextLibraryStore = useContextLibraryStore();

  const createContext = useCallback(
    async (data: ContextFormData) => {
      // Centralized validation and creation logic
      const validatedData = ContextSchema.parse(data);
      contextLibraryStore.commit(
        contextLibraryEvents.contextCreated(validatedData),
      );
    },
    [contextLibraryStore],
  );

  return { createContext, updateContext, deleteContext };
};
```

#### 3. Improve Error Handling

**Current State**: Limited error handling and recovery
**Risk**: Poor user experience during failures
**Solution**: Implement centralized error boundary and logging

### Medium Priority

#### 1. Simplify Rich Text Editor

**Current State**: Complex TipTap implementation with 30+ files
**Assessment**: May be over-engineered for prompt editing use case
**Recommendation**: Evaluate if simplified editor would suffice

#### 2. Optimize State Synchronization

**Current State**: Complex synchronization logic in `useSyncContexts`
**Improvement**: Simplify algorithms and reduce computational complexity

#### 3. Add Comprehensive Testing

**Current State**: No visible test framework
**Recommendation**: Implement unit tests for business logic and E2E tests for critical flows

### Low Priority

#### 1. Performance Monitoring

- Implement observability with tools like Sentry or LogRocket
- Add performance metrics and monitoring

#### 2. Offline-First Patterns

- Enhance offline capabilities beyond current OPFS usage
- Implement conflict resolution UI for offline scenarios

## Development Guidelines

### Code Organization Principles

1. **Feature-based Structure**: Group related functionality together
2. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
3. **Type Safety**: Comprehensive TypeScript usage with strict configuration
4. **Performance**: Appropriate use of memoization and optimization techniques

### State Management Guidelines

1. **LiveStore**: Use for persistent, collaborative data
2. **Zustand**: Use for ephemeral UI state
3. **React State**: Use for component-local state only
4. **Synchronization**: Always use provided hooks for cross-store sync

### Component Development

1. **Composition**: Prefer composition over inheritance
2. **Accessibility**: Use Radix UI primitives for accessible components
3. **Performance**: Use React.memo judiciously for expensive components
4. **Testing**: Write unit tests for complex business logic

### Best Practices

1. **Event Naming**: Use versioned event names (e.g., "v1.ContextCreated")
2. **ID Generation**: Use consistent ID generation utilities
3. **Error Handling**: Implement proper error boundaries and user feedback
4. **Documentation**: Maintain architectural decision records (ADRs)

## Conclusion

PromptForge demonstrates excellent architectural design with sophisticated real-time collaboration features. The event-sourced dual-store architecture provides a solid foundation for scaling. Key areas for improvement focus on server-side validation, centralized business logic, and enhanced error handling. With these improvements, the architecture is well-positioned to support significant business growth and feature expansion.

The system successfully balances complexity with maintainability, though some areas like the rich text editor and state synchronization could benefit from simplification. The technology choices are appropriate for the problem domain, and the modular architecture enables rapid feature development.

---

_This document should be updated as the architecture evolves. Consider creating architectural decision records (ADRs) for major changes._
