# Todo App

Kanban application for task management with boards, columns, and cards.

## Tech Stack

- React + TypeScript + Vite
- Material-UI
- MobX (state)
- React Query (requests)
- @hello-pangea/dnd (drag & drop)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables (optional)
cp .env.example .env

# Start development server
npm run dev
```

**Note:** By default, the app works in offline mode using localStorage. To connect to a backend API, set `VITE_API_BASE_URL` in your `.env` file.

## Commands

- `npm run dev` - start dev server
- `npm run build` - build for production
- `npm run test` - run tests
- `npm run lint` - check code

## Structure

- `/src/api` - React Query hooks and API
- `/src/components` - components (Board, Column, TaskCard)
- `/src/lib` - Zod helpers
- `/src/pages` - pages (board list, board)
- `/src/schemas` - Zod validation schemas
- `/src/services` - Local storage service
- `/src/store` - MobX stores

## Features

- Create/edit/delete boards
- Add/edit/delete columns to board
- Add/edit/delete tasks
- Drag & drop for boards, columns and tasks
- Dark/light theme
