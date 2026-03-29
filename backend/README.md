# Kanban Board Backend API

A clean, well-structured Express.js backend with proper separation of concerns for managing Kanban boards.

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── boardController.js
│   ├── routes/              # API route definitions
│   │   └── boardRoutes.js
│   ├── services/            # Business logic
│   │   └── boardService.js
│   ├── middleware/          # Express middleware
│   │   ├── asyncHandler.js
│   │   └── errorHandler.js
│   ├── utils/               # Utility functions
│   │   ├── db.js
│   │   ├── validation.js
│   │   └── errors.js
│   └── app.js              # Express app configuration
├── prisma/                 # Database schema and migrations
├── index.js               # Server entry point
└── package.json
```

## 🏗️ Architecture Layers

### 1. **Routes** (`src/routes/`)
- Defines API endpoints
- Maps HTTP methods to controllers
- Validates request parameters

### 2. **Controllers** (`src/controllers/`)
- Handles HTTP requests and responses
- Calls service layer for business logic
- Returns consistent JSON responses

### 3. **Services** (`src/services/`)
- Contains core business logic
- Interacts with database via Prisma
- Validates data before database operations
- Returns formatted data

### 4. **Middleware** (`src/middleware/`)
- `asyncHandler.js` - Wraps async functions to catch errors
- `errorHandler.js` - Global error handling

### 5. **Utils** (`src/utils/`)
- `db.js` - Prisma client instance
- `validation.js` - Data validation functions
- `errors.js` - Custom error classes

## 🎯 API Endpoints

### Board Management

#### Create Board
```http
POST /api/boards
Content-Type: application/json

{
  "title": "My Project"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "board-id",
    "title": "My Project",
    "background": "#0079bf",
    "lists": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Board created successfully"
}
```

#### Get All Boards
```http
GET /api/boards
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "board-id",
      "title": "My Project",
      "background": "#0079bf",
      "lists": [
        {
          "id": "list-id",
          "title": "To Do",
          "order": 0,
          "cards": [
            {
              "id": "card-id",
              "title": "Task 1",
              "description": "Task description",
              "order": 0,
              "labels": [],
              "checklist": [],
              "members": [],
              "dueDate": null,
              "createdAt": "2024-01-01T00:00:00Z"
            }
          ]
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "message": "Boards retrieved successfully"
}
```

#### Get Board by ID
```http
GET /api/boards/:boardId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "board-id",
    "title": "My Project",
    "background": "#0079bf",
    "lists": [
      {
        "id": "list-id",
        "title": "To Do",
        "order": 0,
        "cards": [...]
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Board retrieved successfully"
}
```

#### Update Board
```http
PATCH /api/boards/:boardId
Content-Type: application/json

{
  "title": "Updated Title",
  "background": "#1a5f7a"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated board */ },
  "message": "Board updated successfully"
}
```

#### Delete Board
```http
DELETE /api/boards/:boardId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Board deleted successfully"
  },
  "message": "Board deleted successfully"
}
```

### List Management

#### Create List
```http
POST /api/boards/:boardId/lists
Content-Type: application/json

{
  "title": "To Do"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "list-id",
    "title": "To Do",
    "boardId": "board-id",
    "order": 0,
    "cards": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "List created successfully"
}
```

#### Get Lists by Board
```http
GET /api/boards/:boardId/lists
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "list-id",
      "title": "To Do",
      "boardId": "board-id",
      "order": 0,
      "cards": [
        {
          "id": "card-id",
          "title": "Task 1",
          "listId": "list-id",
          "order": 0,
          "labels": [],
          "checklist": [],
          "members": [],
          "dueDate": null,
          "description": null,
          "cover": null,
          "comments": [],
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "message": "Lists retrieved successfully"
}
```

#### Get List by ID
```http
GET /api/lists/:listId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "list-id",
    "title": "To Do",
    "boardId": "board-id",
    "order": 0,
    "cards": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "List retrieved successfully"
}
```

#### Edit List Title
```http
PATCH /api/lists/:listId
Content-Type: application/json

{
  "title": "In Progress"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "list-id",
    "title": "In Progress",
    "boardId": "board-id",
    "order": 0,
    "cards": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "List updated successfully"
}
```

#### Reorder Lists (Drag and Drop)
```http
PATCH /api/boards/:boardId/lists/reorder
Content-Type: application/json

{
  "lists": [
    { "id": "list-1", "order": 0 },
    { "id": "list-2", "order": 1 },
    { "id": "list-3", "order": 2 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "list-1",
      "title": "To Do",
      "boardId": "board-id",
      "order": 0,
      "cards": [...]
    },
    {
      "id": "list-2",
      "title": "In Progress",
      "boardId": "board-id",
      "order": 1,
      "cards": [...]
    },
    {
      "id": "list-3",
      "title": "Done",
      "boardId": "board-id",
      "order": 2,
      "cards": [...]
    }
  ],
  "message": "Lists reordered successfully"
}
```

#### Delete List
```http
DELETE /api/lists/:listId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "List deleted successfully"
  },
  "message": "List deleted successfully"
}
```

### Card Management

#### Create Card
```http
POST /api/lists/:listId/cards
Content-Type: application/json

{
  "title": "Implement feature",
  "description": "Add user authentication",
  "dueDate": "2024-02-15T00:00:00Z",
  "cover": "https://example.com/image.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "card-id",
    "title": "Implement feature",
    "description": "Add user authentication",
    "listId": "list-id",
    "order": 0,
    "labels": [],
    "checklist": [],
    "members": [],
    "attachments": [],
    "dueDate": "2024-02-15T00:00:00Z",
    "cover": "https://example.com/image.jpg",
    "comments": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Card created successfully"
}
```

#### Get Cards by List
```http
GET /api/lists/:listId/cards
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-id",
      "title": "Implement feature",
      "description": "Add user authentication",
      "listId": "list-id",
      "order": 0,
      "labels": [
        {
          "label": {
            "id": "label-id",
            "name": "Bug",
            "color": "#FF0000"
          }
        }
      ],
      "members": ["John Doe", "Jane Smith"],
      "dueDate": "2024-02-15T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "message": "Cards retrieved successfully"
}
```

#### Get Card by ID
```http
GET /api/cards/:cardId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "card-id",
    "title": "Implement feature",
    "description": "Add user authentication",
    "listId": "list-id",
    "order": 0,
    "labels": [...],
    "checklist": [...],
    "members": ["John Doe"],
    "dueDate": "2024-02-15T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Card retrieved successfully"
}
```

#### Update Card
```http
PATCH /api/cards/:cardId
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2024-02-20T00:00:00Z",
  "members": ["John Doe", "Jane Smith"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated card */ },
  "message": "Card updated successfully"
}
```

#### Move Card to Another List
```http
POST /api/cards/:cardId/move
Content-Type: application/json

{
  "toListId": "target-list-id",
  "newOrder": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* moved card */ },
  "message": "Card moved successfully"
}
```

#### Reorder Cards
```http
PATCH /api/lists/:listId/cards/reorder
Content-Type: application/json

{
  "cards": [
    { "id": "card-1", "listId": "list-id", "order": 0 },
    { "id": "card-2", "listId": "list-id", "order": 1 },
    { "id": "card-3", "listId": "list-id", "order": 2 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [/* reordered cards */],
  "message": "Cards reordered successfully"
}
```

#### Add Member to Card
```http
POST /api/cards/:cardId/members
Content-Type: application/json

{
  "memberName": "John Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated card with members */ },
  "message": "Member added successfully"
}
```

#### Remove Member from Card
```http
DELETE /api/cards/:cardId/members/John%20Doe
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated card without member */ },
  "message": "Member removed successfully"
}
```

#### Delete Card
```http
DELETE /api/cards/:cardId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Card deleted successfully"
  },
  "message": "Card deleted successfully"
}
```

### Label Management

#### Create Label
```http
POST /api/labels
Content-Type: application/json

{
  "name": "Bug",
  "color": "#FF0000"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "label-id",
    "name": "Bug",
    "color": "#FF0000"
  },
  "message": "Label created successfully"
}
```

#### Get All Labels
```http
GET /api/labels
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "label-id-1",
      "name": "Bug",
      "color": "#FF0000"
    },
    {
      "id": "label-id-2",
      "name": "Feature",
      "color": "#00FF00"
    }
  ],
  "count": 2,
  "message": "Labels retrieved successfully"
}
```

#### Get Label by ID
```http
GET /api/labels/:labelId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "label-id",
    "name": "Bug",
    "color": "#FF0000"
  },
  "message": "Label retrieved successfully"
}
```

#### Update Label
```http
PATCH /api/labels/:labelId
Content-Type: application/json

{
  "name": "Critical Bug",
  "color": "#FF5500"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated label */ },
  "message": "Label updated successfully"
}
```

#### Delete Label
```http
DELETE /api/labels/:labelId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Label deleted successfully"
  },
  "message": "Label deleted successfully"
}
```

#### Add Label to Card
```http
POST /api/cards/:cardId/labels
Content-Type: application/json

{
  "labelId": "label-id"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* card with label added */ },
  "message": "Label added to card successfully"
}
```

#### Remove Label from Card
```http
DELETE /api/cards/:cardId/labels/:labelId
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* card with label removed */ },
  "message": "Label removed from card successfully"
}
```

### Checklist Management

#### Create Checklist Item
```http
POST /api/cards/:cardId/checklist
Content-Type: application/json

{
  "text": "Setup database"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "checklist-item-id",
    "text": "Setup database",
    "done": false,
    "cardId": "card-id"
  },
  "message": "Checklist item created successfully"
}
```

#### Get Checklist Items for Card
```http
GET /api/cards/:cardId/checklist
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-1",
      "text": "Setup database",
      "done": false,
      "cardId": "card-id"
    },
    {
      "id": "item-2",
      "text": "Create API routes",
      "done": true,
      "cardId": "card-id"
    }
  ],
  "count": 2,
  "message": "Checklist items retrieved successfully"
}
```

#### Get Checklist Item by ID
```http
GET /api/checklist/:itemId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "checklist-item-id",
    "text": "Setup database",
    "done": false,
    "cardId": "card-id"
  },
  "message": "Checklist item retrieved successfully"
}
```

#### Update Checklist Item
```http
PATCH /api/checklist/:itemId
Content-Type: application/json

{
  "text": "Setup MySQL database",
  "done": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated checklist item */ },
  "message": "Checklist item updated successfully"
}
```

#### Get Checklist Progress
```http
GET /api/cards/:cardId/checklist/progress
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "completed": 3,
    "percentage": 60
  },
  "message": "Checklist progress retrieved successfully"
}
```

#### Delete Checklist Item
```http
DELETE /api/checklist/:itemId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Checklist item deleted successfully"
  },
  "message": "Checklist item deleted successfully"
}
```

## 🚀 Getting Started

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create `.env` file:
```env
DATABASE_URL="mysql://user:password@localhost:3306/kanban_db"
PORT=3001
```

### Run Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### Database Management
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## 🔍 Key Features

### ✅ Input Validation
- Validates required fields
- Checks data types
- Enforces string length constraints
- Validates numeric values

### ✅ Error Handling
- Custom error classes (ValidationError, NotFoundError, etc.)
- Global error handler middleware
- Proper HTTP status codes
- Detailed error messages

### ✅ Database Integrity
- Verifies parent resources exist before creating children
- Uses Prisma relations for data consistency
- Cascading deletes for related data

### ✅ Code Organization
- Clear separation of concerns
- Reusable service functions
- Consistent response format
- Comprehensive error handling

## 📊 Data Models

### Board
- `id` - Unique identifier
- `title` - Board name
- `background` - Background color
- `lists` - Associated lists
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### List
- `id` - Unique identifier
- `title` - List name
- `boardId` - Associated board
- `cards` - Associated cards
- `order` - Display order
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Card
- `id` - Unique identifier
- `title` - Card title
- `description` - Card description
- `listId` - Associated list
- `labels` - Associated labels
- `dueDate` - Due date
- `checklist` - Checklist items
- `members` - Assigned members
- `attachments` - File attachments
- `cover` - Cover image URL
- `comments` - Comments
- `order` - Display order
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Create a Board
```bash
curl -X POST http://localhost:3001/api/boards \
  -H "Content-Type: application/json" \
  -d '{"title": "My Board"}'
```

### Get All Boards
```bash
curl http://localhost:3001/api/boards
```

### Get Board Details
```bash
curl http://localhost:3001/api/boards/:boardId
```

### Create a List
```bash
curl -X POST http://localhost:3001/api/boards/:boardId/lists \
  -H "Content-Type: application/json" \
  -d '{"title": "To Do"}'
```

### Get Lists for a Board
```bash
curl http://localhost:3001/api/boards/:boardId/lists
```

### Get List Details
```bash
curl http://localhost:3001/api/lists/:listId
```

### Edit List Title
```bash
curl -X PATCH http://localhost:3001/api/lists/:listId \
  -H "Content-Type: application/json" \
  -d '{"title": "In Progress"}'
```

### Reorder Lists (Drag and Drop)
```bash
curl -X PATCH http://localhost:3001/api/boards/:boardId/lists/reorder \
  -H "Content-Type: application/json" \
  -d '{"lists": [{"id": "list-1", "order": 0}, {"id": "list-2", "order": 1}]}'
```

### Delete a List
```bash
curl -X DELETE http://localhost:3001/api/lists/:listId
```

## 📝 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Error description"
}
```

## 🐛 Error Handling

| Status | Error | Cause |
|--------|-------|-------|
| 400 | ValidationError | Invalid input data |
| 404 | NotFoundError | Resource not found |
| 409 | ConflictError | Duplicate resource |
| 500 | InternalServerError | Server error |

## 📚 Next Steps

### Completed Features ✅
- **Board Management** - Create, view, update, delete boards with complete data includes
- **List Management** - Create, edit, delete, and reorder lists (drag & drop between lists)
- **Card Management** - Create, edit, delete, reorder cards; move between lists; drag & drop within and across lists
- **Label Management** - Create, update, delete labels; add/remove labels from cards
- **Checklist Items** - Create multiple checklist items per card; mark as complete/incomplete; track progress

### Coming Soon Features
To add more features, follow this pattern:

1. **Create new service** in `src/services/`
2. **Create new controller** in `src/controllers/`
3. **Create new routes** in `src/routes/`
4. **Update main routes** in `src/app.js`

### Planned Features
- **Comments** - Add and delete comments on cards
- **Attachments** - Upload and manage file attachments
- **Search & Filter** - Find cards by title, labels, members
- **User Assignments** - Assign members to cards and track assigned work
- **Activity Feed** - Log and display card activity
- **Card Templates** - Create reusable card templates

## 🔐 Security Considerations

- Validate all inputs
- Use parameterized queries (Prisma handles this)
- Implement authentication/authorization
- Rate limiting (consider express-rate-limit)
- Input sanitization (consider express-validator)
- CORS configured for frontend

## 📄 License

This project is part of the Kanban Board application assignment.
