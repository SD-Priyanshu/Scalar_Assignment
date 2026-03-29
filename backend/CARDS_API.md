# Card Management API Documentation

Complete reference for cards, labels, and checklist management endpoints.

## 📋 Overview

The Card Management API includes three main components:
1. **Cards** - Create, read, update, delete, move, and reorder cards
2. **Labels** - Create and manage colored tags for card categorization
3. **Checklist Items** - Create task lists within cards and track completion

## 🎯 Card Endpoints

### Create Card
**POST** `/api/lists/:listId/cards`

Create a new card in a list.

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication to the API",
  "dueDate": "2024-02-15T00:00:00Z",
  "cover": "https://example.com/image.jpg"
}
```

**Parameters:**
- `title` (required) - Card title (1-255 characters)
- `description` (optional) - Card description (max 2000 characters)
- `dueDate` (optional) - Due date as ISO string
- `cover` (optional) - Cover image URL (max 2000 characters)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clfxyz123",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "listId": "listABC",
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

---

### Get All Cards in List
**GET** `/api/lists/:listId/cards`

Retrieve all cards in a specific list.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-1",
      "title": "Setup database",
      "description": null,
      "listId": "listABC",
      "order": 0,
      "labels": [
        {
          "label": {
            "id": "label-1",
            "name": "Backend",
            "color": "#0079BF"
          }
        }
      ],
      "checklist": [
        {
          "id": "item-1",
          "text": "Setup MySQL",
          "done": true
        },
        {
          "id": "item-2",
          "text": "Create tables",
          "done": false
        }
      ],
      "members": ["John Doe"],
      "attachments": [],
      "dueDate": null,
      "comments": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "message": "Cards retrieved successfully"
}
```

---

### Get Card by ID
**GET** `/api/cards/:cardId`

Retrieve a specific card with all details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clfxyz123",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication",
    "listId": "listABC",
    "order": 0,
    "labels": [...],
    "checklist": [...],
    "members": ["John Doe", "Jane Smith"],
    "attachments": [],
    "dueDate": "2024-02-15T00:00:00Z",
    "cover": "https://example.com/image.jpg",
    "comments": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Card retrieved successfully"
}
```

---

### Update Card
**PATCH** `/api/cards/:cardId`

Update card properties (title, description, due date, members, etc.).

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2024-02-20T00:00:00Z",
  "members": ["John Doe", "Alice Johnson"],
  "cover": "https://example.com/new-image.jpg"
}
```

**Parameters (all optional):**
- `title` - New card title
- `description` - New description
- `dueDate` - New due date or `null` to remove
- `members` - Array of member names
- `cover` - New cover image URL
- `order` - Card display order

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated card */ },
  "message": "Card updated successfully"
}
```

---

### Move Card to Another List
**POST** `/api/cards/:cardId/move`

Move a card to a different list.

**Request Body:**
```json
{
  "toListId": "targetListId",
  "newOrder": 2
}
```

**Parameters:**
- `toListId` (required) - Target list ID
- `newOrder` (required) - Position in target list (0-based)

**Response (200):**
```json
{
  "success": true,
  "data": { /* card at new location */ },
  "message": "Card moved successfully"
}
```

---

### Reorder Cards
**PATCH** `/api/lists/:listId/cards/reorder`

Reorder cards within one list or move between lists.

**Request Body:**
```json
{
  "cards": [
    { "id": "card-1", "listId": "listABC", "order": 0 },
    { "id": "card-2", "listId": "listABC", "order": 1 },
    { "id": "card-3", "listABC", "order": 2 },
    { "id": "card-4", "listId": "listXYZ", "order": 0 }
  ]
}
```

**Use Case:** Perfect for drag-and-drop UI where users can reorder across lists.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { /* reordered card-1 */ },
    { /* reordered card-2 */ },
    { /* reordered card-3 */ },
    { /* reordered card-4 */ }
  ],
  "message": "Cards reordered successfully"
}
```

---

### Add Member to Card
**POST** `/api/cards/:cardId/members`

Add a member/assignee to a card.

**Request Body:**
```json
{
  "memberName": "John Doe"
}
```

**Parameters:**
- `memberName` (required) - Name of member to add (1-255 characters)

**Response (200):**
```json
{
  "success": true,
  "data": { /* card with updated members array */ },
  "message": "Member added successfully"
}
```

---

### Remove Member from Card
**DELETE** `/api/cards/:cardId/members/:memberName`

Remove a member/assignee from a card.

**URL Parameters:**
- `memberName` - Member name to remove (URL encoded)

**Example:** `/api/cards/card-123/members/John%20Doe`

**Response (200):**
```json
{
  "success": true,
  "data": { /* card with member removed */ },
  "message": "Member removed successfully"
}
```

---

### Delete Card
**DELETE** `/api/cards/:cardId`

Delete a card and all its associated data (labels, checklist items, comments).

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

---

## 🏷️ Label Endpoints

### Create Label
**POST** `/api/labels`

Create a new label for categorizing cards.

**Request Body:**
```json
{
  "name": "Bug",
  "color": "#FF0000"
}
```

**Parameters:**
- `name` (required) - Label name (1-50 characters)
- `color` (required) - Color (hex or color name, 1-20 characters)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "label-1",
    "name": "Bug",
    "color": "#FF0000"
  },
  "message": "Label created successfully"
}
```

---

### Get All Labels
**GET** `/api/labels`

Retrieve all available labels.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "label-1",
      "name": "Bug",
      "color": "#FF0000"
    },
    {
      "id": "label-2",
      "name": "Feature",
      "color": "#00FF00"
    },
    {
      "id": "label-3",
      "name": "Documentation",
      "color": "#0000FF"
    }
  ],
  "count": 3,
  "message": "Labels retrieved successfully"
}
```

---

### Get Label by ID
**GET** `/api/labels/:labelId`

Retrieve a specific label.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "label-1",
    "name": "Bug",
    "color": "#FF0000"
  },
  "message": "Label retrieved successfully"
}
```

---

### Update Label
**PATCH** `/api/labels/:labelId`

Update a label's name or color.

**Request Body:**
```json
{
  "name": "Critical Bug",
  "color": "#FF5500"
}
```

**Parameters (optional):**
- `name` - New label name
- `color` - New color

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated label */ },
  "message": "Label updated successfully"
}
```

---

### Delete Label
**DELETE** `/api/labels/:labelId`

Delete a label (removes from all cards automatically).

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

---

### Add Label to Card
**POST** `/api/cards/:cardId/labels`

Add a label to a card.

**Request Body:**
```json
{
  "labelId": "label-1"
}
```

**Parameters:**
- `labelId` (required) - ID of the label to add

**Response (200):**
```json
{
  "success": true,
  "data": { /* card with label added */ },
  "message": "Label added to card successfully"
}
```

**Error Cases:**
- 404 - Card or label not found
- 409 - Label already assigned to card

---

### Remove Label from Card
**DELETE** `/api/cards/:cardId/labels/:labelId`

Remove a label from a card.

**URL Parameters:**
- `cardId` - Card ID
- `labelId` - Label ID

**Response (200):**
```json
{
  "success": true,
  "data": { /* card with label removed */ },
  "message": "Label removed from card successfully"
}
```

---

## ✅ Checklist Item Endpoints

### Create Checklist Item
**POST** `/api/cards/:cardId/checklist`

Add a checklist item to a card.

**Request Body:**
```json
{
  "text": "Setup database connection"
}
```

**Parameters:**
- `text` (required) - Checklist item text (1-255 characters)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "item-1",
    "text": "Setup database connection",
    "done": false,
    "cardId": "card-123"
  },
  "message": "Checklist item created successfully"
}
```

---

### Get Checklist Items for Card
**GET** `/api/cards/:cardId/checklist`

Retrieve all checklist items for a card.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-1",
      "text": "Setup database",
      "done": true,
      "cardId": "card-123"
    },
    {
      "id": "item-2",
      "text": "Create API routes",
      "done": false,
      "cardId": "card-123"
    },
    {
      "id": "item-3",
      "text": "Write tests",
      "done": false,
      "cardId": "card-123"
    }
  ],
  "count": 3,
  "message": "Checklist items retrieved successfully"
}
```

---

### Get Checklist Item by ID
**GET** `/api/checklist/:itemId`

Retrieve a specific checklist item.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "item-1",
    "text": "Setup database",
    "done": true,
    "cardId": "card-123"
  },
  "message": "Checklist item retrieved successfully"
}
```

---

### Update Checklist Item
**PATCH** `/api/checklist/:itemId`

Update a checklist item (change text or mark as done/incomplete).

**Request Body:**
```json
{
  "text": "Setup MySQL database",
  "done": true
}
```

**Parameters (optional):**
- `text` - New item text
- `done` - Boolean to mark as complete/incomplete

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "item-1",
    "text": "Setup MySQL database",
    "done": true,
    "cardId": "card-123"
  },
  "message": "Checklist item updated successfully"
}
```

---

### Get Checklist Progress
**GET** `/api/cards/:cardId/checklist/progress`

Get completion statistics for a card's checklist.

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

**Use Case:** Display progress bar showing 3/5 items complete (60%).

---

### Delete Checklist Item
**DELETE** `/api/checklist/:itemId`

Remove a checklist item.

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

---

## 🔄 Common Workflows

### Complete Card Workflow
```
1. Create Card
   POST /api/lists/:listId/cards

2. Add Labels
   POST /api/cards/:cardId/labels

3. Assign Members
   POST /api/cards/:cardId/members

4. Add Checklist Items
   POST /api/cards/:cardId/checklist

5. Update Checklist Progress
   PATCH /api/checklist/:itemId (toggle done)

6. Get Progress
   GET /api/cards/:cardId/checklist/progress

7. Move/Reorder Card
   POST /api/cards/:cardId/move
   or
   PATCH /api/lists/:listId/cards/reorder
```

### Drag-and-Drop Workflow
```
1. Detect drag start on card
2. On drop, call reorder endpoint:
   PATCH /api/lists/:listId/cards/reorder
3. Send all affected cards with new positions
4. Update UI with response data
```

### Card Update Workflow
```
1. Edit card properties
2. Send PATCH request with changes:
   PATCH /api/cards/:cardId
3. Include only changed fields
4. Receive updated card with relations
```

---

## ⚠️ Error Handling

### Common Errors

| Code | Error | Cause | Solution |
|------|-------|-------|----------|
| 400 | ValidationError | Invalid input format | Check request body format |
| 404 | NotFoundError | Card/List not found | Verify IDs are correct |
| 409 | ConflictError | Label already on card | Remove before re-adding |
| 500 | InternalServerError | Server error | Check server logs |

### Example Error Response
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Card title must be between 1 and 255 characters"
}
```

---

## 🧪 Testing Examples

### Create and Manage a Card
```bash
# Create card
CARD=$(curl -X POST http://localhost:3001/api/lists/list-123/cards \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Card"}')
CARD_ID=$(echo $CARD | jq -r '.data.id')

# Add label
curl -X POST http://localhost:3001/api/cards/$CARD_ID/labels \
  -H "Content-Type: application/json" \
  -d '{"labelId": "label-456"}'

# Add member
curl -X POST http://localhost:3001/api/cards/$CARD_ID/members \
  -H "Content-Type: application/json" \
  -d '{"memberName": "John Doe"}'

# Add checklist item
curl -X POST http://localhost:3001/api/cards/$CARD_ID/checklist \
  -H "Content-Type: application/json" \
  -d '{"text": "Task 1"}'

# Get card with all data
curl http://localhost:3001/api/cards/$CARD_ID
```

---

## 📚 Related Resources

- [Boards API](./README.md#board-management)
- [Lists API](./README.md#list-management)
- [Architecture Guide](./FEATURES.md)
- [Error Handling](./README.md#error-handling)
