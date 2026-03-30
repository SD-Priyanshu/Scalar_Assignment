# Trello Clone

A Kanban-style project management web application that closely replicates Trello's design and functionality.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features

- **Board Management**: Create and view boards
- **List Management**: Create, edit, delete, reorder lists
- **Card Management**: Create, edit, delete, move, reorder cards
- **Card Details**: Labels, due dates, checklists, members
- **Search & Filter**: Search by title, filter by labels, members, due dates

### Bonus Features

- Responsive design
- Multiple boards
- File attachments (placeholder)
- Comments
- Card cover images (placeholder)
- Board background customization

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MySQL with Prisma ORM
- **Drag & Drop**: @dnd-kit
- **State Management**: Zustand

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (version 8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Download here](https://git-scm.com/)

You can check your Node.js version with:
```bash
node --version
```

And MySQL with:
```bash
mysql --version
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Assignment_Project
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

## Setup

### Database Setup

1. **Create a MySQL database**:
   - Open MySQL command line or a GUI tool like MySQL Workbench
   - Create a new database:
     ```sql
     CREATE DATABASE trello_clone;
     ```

2. **Configure environment variables**:
   - In the `backend` directory, create a `.env` file (if it doesn't exist)
   - Add the following content, replacing with your MySQL credentials:
     ```
     DATABASE_URL="mysql://username:password@localhost:3306/trello_clone"
     PORT=3001
     ```
     - Replace `username` and `password` with your MySQL username and password
     - The default port is 3306 for MySQL

3. **Generate Prisma client**:
   ```bash
   cd backend
   npm run db:generate
   cd ..
   ```

4. **Push database schema**:
   ```bash
   cd backend
   npm run db:push
   cd ..
   ```

5. **Seed the database** (optional, for sample data):
   ```bash
   cd backend
   npm run db:seed
   cd ..
   ```

## Running the Application

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```
   - The backend will run on `http://localhost:3001`
   - You should see "Server running on port 3001" in the console

2. **Start the frontend development server** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   - The frontend will run on `http://localhost:3000`
   - Open your browser and navigate to `http://localhost:3000`

3. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

## API Documentation

The backend provides a comprehensive REST API. For detailed documentation, see:

- [API Quick Reference](backend/API_QUICK_REFERENCE.md)
- [Cards API](backend/CARDS_API.md)
- [Search & Filter API](backend/SEARCH_FILTER_API.md)
- [Backend README](backend/README.md) - Includes architecture details and endpoint examples

## Testing

The project includes shell scripts for testing various API endpoints:

### Backend Testing

- **Test Cards API**: `backend/test-cards.sh`
- **Test Lists API**: `backend/test-lists.sh`
- **Test Search & Filter**:
  - `backend/test-search-filter.sh` (Linux/Mac)
  - `backend/test-search-filter.bat` (Windows Batch)
  - `backend/test-search-filter.ps1` (Windows PowerShell)
  - `backend/test-search-filter-simple.ps1` (Simplified PowerShell)

To run a test script:
```bash
cd backend
./test-cards.sh
```

### Frontend Testing

Currently, the frontend does not have automated tests, but you can manually test the UI by interacting with the application.

## Project Structure

```
Assignment_Project/
├── frontend/                 # Next.js frontend
│   ├── app/                  # Next.js app directory
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main page
│   ├── components/           # React components
│   │   ├── Board.tsx
│   │   ├── Card.tsx
│   │   ├── List.tsx
│   │   └── ...
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript type definitions
│   └── package.json
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   └── utils/            # Utility functions
│   ├── prisma/               # Database schema and seed
│   ├── test-*.sh             # Test scripts
│   └── package.json
└── README.md                 # This file
```

## Database Schema

The database schema is defined in `backend/prisma/schema.prisma`. It includes tables for:

- Boards
- Lists
- Cards
- Labels
- Checklists
- Comments
- And relationships between them

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Running the Application

After setup, visit `http://localhost:3000` to view the application. The backend runs on `http://localhost:3001`.

The application assumes a default user is logged in.

## Notes

- Drag and drop is implemented for lists and cards.
- UI is designed to resemble Trello.
- No authentication is implemented.
- File attachments and cover images are placeholders.