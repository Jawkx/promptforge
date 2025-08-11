# Prompt Forge

Welcome to **Prompt Forge**, a powerful and intuitive application designed to help you craft, manage, and test complex prompts for Large Language Models (LLMs). It provides a seamless interface for combining a main prompt with various context snippets, making prompt engineering more efficient and organized.

## ✨ Features

- **📝 Rich Text Prompt Editor**: A Tiptap-based editor for writing and formatting your main prompt.
- **📚 Context Library**:
    - Store and manage a library of reusable context snippets.
    - **CRUD Operations**: Create, read, update, and delete contexts.
    - **Labeling System**: Organize contexts with customizable, colored labels.
    - **Real-time Search**: Instantly filter contexts by title or content.
    - **Backup & Restore**: Export and import your entire context library as a JSON file.
- **📋 Selected Contexts Panel**:
    - Drag and drop contexts from the library to the "Selected Contexts" panel.
    - Reorder selected contexts to control their sequence in the final output.
    - Edit selected contexts on-the-fly without altering the original in the library.
- **🔄 Real-time Syncing**:
    - **LiveStore Integration**: All your data is synced in real-time across all open tabs and devices.
    - **Clerk Authentication**: Sign in to keep your context library and preferences synced to the cloud.
    - **Anonymous Mode**: Use the app without an account, with data persisted locally in your browser.
- **🚀 One-Click Copy & Download**:
    - **Copy All**: Concatenate the prompt and all selected contexts to your clipboard in a single click.
    - **Download as Markdown**: Export your work as a formatted Markdown file, perfect for documentation or sharing.
- **🎨 Theming**: Switch between light and dark modes to suit your preference.

---

## 🛠️ Tech Stack & Architecture

Prompt Forge is a modern web application built with a focus on a reactive and real-time user experience.

- **Frontend**:
    - **Framework**: [React](https://react.dev/)
    - **UI Components**: Built with [shadcn/ui](https://ui.shadcn.com/), which uses [Radix UI](https://www.radix-ui.com/) primitives and [Tailwind CSS](https://tailwindcss.com/).
    - **Routing**: [wouter](https://github.com/molefrog/wouter) for simple and minimalistic routing.
    - **Rich Text Editor**: A custom implementation using [Tiptap](https://tiptap.dev/).
- **State Management**:
    - **Local State**: [Zustand](https://github.com/pmndrs/zustand) for managing client-side state like the prompt and selected contexts.
    - **Real-time State & Backend**: [LiveStore](https://livestore.dev/) provides the real-time database, synchronization logic, and backend infrastructure. It uses a worker-based architecture (`live.worker.ts`) and Cloudflare for persistence.
- **Authentication**: [Clerk](https://clerk.com/) for user authentication and management.
- **Build Tool**: [Vite](https://vitejs.dev/) with Cloudflare integration for deployment.
- **Drag and Drop**: [dnd-kit](https://dndkit.com/) for a smooth drag-and-drop experience.

### Architectural Overview

The application is divided into two main panels:

1.  **Left Panel**: Contains the `PromptInput` and the `SelectedContexts` list. This is where you do the primary work of building your final prompt. State here is managed by **Zustand**.
2.  **Right Panel**: Houses the `ContextsLibrary`, which is your persistent, real-time database of context snippets. This is powered by **LiveStore**.

Data flows from the LiveStore-powered library to the Zustand-managed "Selected Contexts" panel via user actions like dragging and dropping. Changes to contexts in the library are automatically reflected in any "pristine" (unmodified) selected contexts, thanks to the `useSyncContexts` hook.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js and bun (livestore only support bun rn).
-   A Clerk account for authentication keys.
-   A Cloudflare account for deploying the sync server. (you can also use wrangler to run it locally)

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/your-username/prompt-forge.git](https://github.com/your-username/prompt-forge.git)
    cd prompt-forge
    ```
2.  **Install NPM packages**
    ```sh
    bun i
    ```
3.  **Set up environment variables**
    Create a `.env.local` file in the root of the project and add your Clerk and LiveStore credentials:
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
    VITE_SYNC_URL={worker-url}
    ```
4.  **Run the development server**
    ```sh
    bun run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
