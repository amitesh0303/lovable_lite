# Lovable-lite ✨

An AI-powered, full-stack web app builder. Describe what you want to build in plain English and Lovable-lite generates a complete React + Tailwind application, lets you edit it live in a Monaco code editor, iterate with an AI chat assistant, and export the result directly to GitHub.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Templates](#templates)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

| Feature | Description |
|---|---|
| **AI Code Generation** | Generate a complete React + Tailwind app from a natural-language prompt (powered by GPT-4o-mini) |
| **Live Code Editor** | Monaco Editor with syntax highlighting, auto-layout, and word-wrap for all generated files |
| **AI Chat Assistant** | Iteratively modify your app by chatting – the AI edits only the files that need changing |
| **File Tree** | Hierarchical file explorer with folder expand/collapse; files auto-save with debounce |
| **Preview Panel** | In-browser HTML preview with Desktop / Tablet / Mobile device-size toggles |
| **GitHub Export** | Push all project files to a new or existing GitHub repository in one click |
| **Template Gallery** | Four pre-built starter templates (Admin Dashboard, SaaS Landing, Client Portal, CRM) |
| **Project Management** | Create, rename, duplicate, and delete projects from the dashboard |
| **Authentication** | Supabase email/password auth with Row Level Security – each user only sees their own data |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) (strict mode) |
| AI | [OpenAI SDK](https://github.com/openai/openai-node) – `gpt-4o-mini` |
| Database / Auth | [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security) |
| Code Editor | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| GitHub Integration | [@octokit/rest](https://github.com/octokit/rest.js) |
| Icons | [Lucide React](https://lucide.dev/) |
| Utilities | `clsx`, `tailwind-merge` |

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### Installation

```bash
git clone https://github.com/amitesh0303/lovable_lite.git
cd lovable_lite
npm install
```

### Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set the following variables:

| Variable | Description | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key | Same page as above |
| `OPENAI_API_KEY` | OpenAI secret key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

> **Note:** GitHub tokens are supplied by users at export time via the UI – no server-side token is required.

### Database Setup

1. Open your [Supabase Dashboard](https://app.supabase.com) and navigate to the SQL Editor.
2. Copy and run the migration file:

```bash
# Contents of supabase/migrations/001_initial.sql
```

Or paste the file content directly from [`supabase/migrations/001_initial.sql`](./supabase/migrations/001_initial.sql).

This creates the following tables with Row Level Security enabled:

| Table | Description |
|---|---|
| `profiles` | User profile linked to `auth.users` |
| `projects` | App projects (name, framework, status) |
| `project_files` | Source files for each project |
| `chat_messages` | AI chat history per project |

> **Tip:** To use the Supabase CLI you can also run `supabase db push` after linking your project with `supabase link`.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/dashboard`.

---

## Project Structure

```
lovable_lite/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx       # Email/password sign-in
│   │   │   └── signup/page.tsx      # New account creation
│   │   ├── api/
│   │   │   ├── chat/route.ts        # POST: AI chat → file edits
│   │   │   ├── generate/route.ts    # POST: prompt → generated app files
│   │   │   ├── github/export/route.ts # POST: push files to GitHub repo
│   │   │   └── projects/
│   │   │       ├── route.ts         # GET list / POST create project
│   │   │       └── [id]/
│   │   │           ├── route.ts     # GET / PATCH / DELETE project
│   │   │           └── files/route.ts # GET / POST (upsert) project files
│   │   ├── dashboard/page.tsx       # Project listing & management
│   │   ├── projects/[id]/page.tsx   # Full editor: file tree + Monaco + preview + chat
│   │   ├── templates/page.tsx       # Template gallery
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Redirects → /dashboard
│   ├── lib/
│   │   ├── github.ts                # Octokit helpers for repo creation & file push
│   │   ├── openai.ts                # GPT-4o-mini wrappers: generate & edit
│   │   ├── supabase.ts              # Supabase client + database TypeScript types
│   │   ├── templates.ts             # Hardcoded template library
│   │   └── utils.ts                 # cn(), getLanguageFromPath(), formatDate()
│   └── types/
│       └── index.ts                 # Shared TypeScript interfaces
├── supabase/
│   └── migrations/
│       └── 001_initial.sql          # Database schema + RLS policies
├── .env.example                     # Environment variable template
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## API Reference

All API routes live under `/api/` and return JSON.

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Get a single project |
| `PATCH` | `/api/projects/:id` | Update project name / status |
| `DELETE` | `/api/projects/:id` | Delete a project |

### Project Files

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects/:id/files` | List all files in a project |
| `POST` | `/api/projects/:id/files` | Upsert one or more files |

### AI

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/generate` | `{ prompt, projectId }` | Generate a full app from a prompt and save files |
| `POST` | `/api/chat` | `{ message, projectId }` | Send a chat message; AI edits files and returns a summary |

### GitHub

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/github/export` | `{ projectId, token, owner, repoName }` | Export project files to a GitHub repo |

---

## Templates

Four templates are included out of the box:

| Template | Category | Files |
|---|---|---|
| **Admin Dashboard** | Dashboard | Sidebar, Dashboard stats, Users table, Settings form |
| **SaaS Landing Page** | Marketing | Header, Hero, Features, Pricing, Footer |
| **Client Portal** | Portal | Login page, Portal with tabs (Projects, Documents, Messages) |
| **CRM Dashboard** | Business | Contacts table, Deals pipeline, Activity stats |

Templates open in the editor as a pre-populated starting point that you can further modify with AI.

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set the three environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`) in the Vercel project settings.

### Other platforms

```bash
npm run build
npm start
```

The app is a standard Next.js App Router project and works on any Node.js 20+ host that supports server-side rendering (Railway, Render, Fly.io, etc.).

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes and run the checks:
   ```bash
   npm run lint
   npm run build
   ```
3. Open a pull request describing what you changed and why.

---

## License

MIT
