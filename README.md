# Trello Clone

A Kanban-style project management web application that closely replicates Trello's design and functionality.

## Tech Stack

- Frontend: Next.js (React)
- Backend: Node.js with Express.js
- Database: MySQL with Prisma ORM
- Styling: Tailwind CSS
- Drag & Drop: @dnd-kit
- State Management: Zustand

## Features

### Core Features

- Board Management: Create and view boards
- List Management: Create, edit, delete, reorder lists
- Card Management: Create, edit, delete, move, reorder cards
- Card Details: Labels, due dates, checklists, members
- Search & Filter: Search by title, filter by labels, members, due dates

### Bonus Features

- Responsive design
- Multiple boards
- File attachments (placeholder)
- Comments
- Card cover images (placeholder)
- Board background customization

## Setup

1. Install dependencies for frontend:
   ```
   cd frontend
   npm install
   cd ..
   ```

2. Install dependencies for backend:
   ```
   cd backend
   npm install
   cd ..
   ```

3. Set up database:
   - Create a MySQL database
   - Set `DATABASE_URL` in `backend/.env` file (e.g., `mysql://user:password@localhost:3306/trello_clone`)

4. Run Prisma migrations for backend:
   ```
   cd backend
   npm run db:push
   cd ..
   ```

5. Seed the database:
   ```
   cd backend
   npm run db:seed
   cd ..
   ```

6. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
   (Runs on http://localhost:3001)

7. Start the frontend development server (in a new terminal):
   ```
   cd frontend
   npm run dev
   ```
   (Runs on http://localhost:3000)

## Project Structure

- `frontend/` - Next.js frontend
  - `app/` - Next.js app directory
    - `components/` - React components
    - `page.tsx` - Main page
  - `lib/` - Utility functions
  - `store/` - Zustand stores
  - `types/` - TypeScript types
- `backend/` - Express.js backend
  - `prisma/` - Database schema and seed
  - `server.js` - Express server

## Database Schema

See `backend/prisma/schema.prisma` for the database schema.

## Seed Data

The database is seeded with one sample board with lists and cards.

## Running the Application

After setup, visit `http://localhost:3000` to view the application. The backend runs on `http://localhost:3001`.

The application assumes a default user is logged in.

## Notes

- Drag and drop is implemented for lists and cards.
- UI is designed to resemble Trello.
- No authentication is implemented.
- File attachments and cover images are placeholders.