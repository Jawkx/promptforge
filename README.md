Prompt Forge is a real-time collaborative prompt engineering tool built with React, TypeScript, and LiveStore. It helps users create, manage, and organize AI prompts using a rich text editor and a context library system.

### Features

* **Context Library Management**: Users can create, edit, and organize reusable context snippets. The library supports label-based categorization with color coding, searching, filtering, and bulk operations. Contexts can be selected by dragging and dropping them into the prompt editor.
* **Rich Text Prompt Editor**: The editor is powered by TipTap and includes markdown support, syntax highlighting for code blocks, image and file handling, and various formatting tools. It also features real-time editing and typography extensions.
* **Real-time Collaboration**: The application uses LiveStore for real-time data synchronization, persistent state management, and automatic conflict resolution.
* **Modern UI/UX**: The user interface is clean, responsive, and built with Tailwind CSS. It supports both dark and light themes, resizable panels, and toast notifications for user feedback. It also includes keyboard shortcuts and accessibility features.
* **Cross-Platform**: Prompt Forge is a web-based application hosted on Cloudflare Pages and has Progressive Web App capabilities.

### Tech Stack

* **Frontend**: React 18 and TypeScript.
* **State Management**: Zustand and LiveStore for real-time synchronization.
* **UI Components**: Radix UI primitives with custom styling and Tailwind CSS.
* **Rich Text Editor**: TipTap with extensions for markdown, code blocks, and other formatting.
* **Data Handling**: TanStack Table for data tables and dnd-kit for drag and drop functionality.
* **Build & Deployment**: Vite is used as the build tool, and deployment is handled by Cloudflare Pages and Workers.
* **Code Quality**: oxlint, Prettier, and TypeScript are used to maintain code quality.

### Context Library Explained

The context library is designed to store reusable text snippets for prompt engineering. Users can organize these snippets with labels and colors, search through them, and copy them to the active prompt.

### Prompt Editor Explained

The rich text editor provides markdown-style formatting, code syntax highlighting, image embedding, real-time preview, and export capabilities.

### Real-time Sync Explained

LiveStore integration provides automatic data synchronization, conflict-free collaborative editing, and an offline-first architecture, ensuring cross-device consistency.

### Getting Started

To get started with Prompt Forge, you'll need Node.js 18+ or Bun, and the Wrangler CLI for deployment. You can clone the repository, install dependencies with `bun install`, and start the development server with `bun run dev`.

### Deployment

The project is configured for automatic deployment to Cloudflare Pages via GitHub Actions. Manual deployment is also an option using the Wrangler CLI. To set up automatic deployment, you need to configure a Cloudflare Pages project and add the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets to your GitHub repository.
