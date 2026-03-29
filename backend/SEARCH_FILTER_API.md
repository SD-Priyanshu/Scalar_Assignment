# Search & Filter API Documentation

Complete reference for card search and filter endpoints.

## 🔍 Overview

The Search & Filter API provides powerful querying capabilities to find cards using:
- **Title search** - Find cards by title text
- **Label filtering** - Filter by one or more labels
- **Member filtering** - Filter by assigned members
- **Due date filtering** - Find cards within a date range
- **Checklist filtering** - Find cards by checklist completion status
- **Combined filtering** - Mix multiple filters together

## 🎯 Quick Examples

### Search by Title
```bash
curl -i "http://localhost:3001/api/cards/search?q=authentication"
```

### Filter by Label
```bash
curl -i "http://localhost:3001/api/cards/filter/labels/LABEL_ID?boardId=BOARD_ID"
```

### Filter by Member
```bash
curl -i "http://localhost:3001/api/cards/filter/members/John%20Doe?boardId=BOARD_ID"
```

### Filter by Due Date Range
```bash
curl -i "http://localhost:3001/api/cards/filter/duedate?dueDateStart=2024-01-01&dueDateEnd=2024-12-31"
```

---

## 📋 Search Endpoints

### Combined Search & Filter
**GET** `/api/boards/:boardId/cards/search`

Search and filter cards using multiple criteria at once.

**Query Parameters:**
- `q` (optional) - Title search query
- `labelIds` (optional) - Comma-separated label IDs to filter by (AND operation)
- `memberNames` (optional) - Comma-separated member names (AND operation)
- `dueDateStart` (optional) - ISO date string for start of date range
- `dueDateEnd` (optional) - ISO date string for end of date range

**Example:**
```bash
curl "http://localhost:3001/api/boards/board-123/cards/search?q=auth&labelIds=label-1,label-2&memberNames=John%20Doe&dueDateStart=2024-01-01&dueDateEnd=2024-12-31"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-id",
      "title": "Implement authentication",
      "description": "Add JWT-based auth",
      "listId": "list-id",
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
      "members": ["John Doe"],
      "dueDate": "2024-02-15T00:00:00Z",
      "checklist": [
        {
          "id": "item-1",
          "text": "Design schema",
          "done": true
        }
      ],
      "comments": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "message": "Cards searched and filtered successfully"
}
```

**Filter Logic:**
- **Labels:** Card must have ALL specified labels (AND)
- **Members:** Card must be assigned to ALL specified members (AND)
- **Due Date:** Card's due date must fall within the range
- **Title:** Card title must contain the search query (case-insensitive)

---

### Search by Title
**GET** `/api/cards/search`

Search cards by title text across all boards.

**Query Parameters:**
- `q` (required) - Search query (substring match, case-insensitive)
- `boardId` (optional) - Limit search to specific board

**Example:**
```bash
curl "http://localhost:3001/api/cards/search?q=database&boardId=board-123"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-1",
      "title": "Setup database",
      "description": null,
      "listId": "list-id",
      "order": 0,
      "labels": [...],
      "members": [],
      "dueDate": null,
      "checklist": [],
      "comments": []
    },
    {
      "id": "card-2",
      "title": "Database migration script",
      "description": "Create migration for v2",
      "listId": "list-id",
      "order": 1,
      "labels": [...],
      "members": ["Jane Smith"],
      "dueDate": "2024-02-20T00:00:00Z",
      "checklist": []
    }
  ],
  "count": 2,
  "message": "Cards found by title search"
}
```

**Features:**
- Case-insensitive substring matching
- Returns all matching cards sorted by board and position
- Includes all card relations (labels, checklist, etc.)

---

### Search in List
**GET** `/api/lists/:listId/cards/search`

Search cards within a specific list.

**Query Parameters:**
- `q` (required) - Search query

**Example:**
```bash
curl "http://localhost:3001/api/lists/list-123/cards/search?q=feature"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-id",
      "title": "Implement new feature",
      "listId": "list-123",
      ...
    }
  ],
  "count": 1,
  "message": "Cards found by title search"
}
```

---

## 🏷️ Filter by Labels

### Filter by Single Label
**GET** `/api/cards/filter/labels/:labelId`

Get all cards with a specific label.

**URL Parameters:**
- `labelId` (required) - Label ID

**Query Parameters:**
- `boardId` (optional) - Limit results to board

**Example:**
```bash
curl "http://localhost:3001/api/cards/filter/labels/label-1?boardId=board-123"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-id",
      "title": "Task with label",
      "labels": [
        {
          "label": {
            "id": "label-1",
            "name": "Bug",
            "color": "#FF0000"
          }
        }
      ],
      ...
    }
  ],
  "count": 5,
  "message": "Cards filtered by label successfully"
}
```

**Use Cases:**
- Show all cards with a specific label
- Implement label-based board views
- Display "All Red Flags" or similar

---

## 👥 Filter by Members

### Filter by Member Assignment
**GET** `/api/cards/filter/members/:memberName`

Get all cards assigned to a specific member.

**URL Parameters:**
- `memberName` (required) - Member name (URL encoded)

**Query Parameters:**
- `boardId` (optional) - Limit to board

**Example:**
```bash
curl "http://localhost:3001/api/cards/filter/members/John%20Doe?boardId=board-123"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-1",
      "title": "Implement auth module",
      "members": ["John Doe"],
      ...
    },
    {
      "id": "card-2",
      "title": "API testing",
      "members": ["John Doe", "Jane Smith"],
      ...
    }
  ],
  "count": 15,
  "message": "Cards filtered by member successfully"
}
```

**Use Cases:**
- Show member's workload/assigned cards
- Create "Assigned To Me" views
- Team capacity planning

---

## 📅 Filter by Due Dates

### Filter by Date Range
**GET** `/api/cards/filter/duedate`

Get cards with due dates within a specific range.

**Query Parameters:**
- `dueDateStart` (optional) - ISO date string (start of range)
- `dueDateEnd` (optional) - ISO date string (end of range)
- `boardId` (optional) - Limit to board

**Examples:**

**Due this week:**
```bash
curl "http://localhost:3001/api/cards/filter/duedate?dueDateStart=2024-03-31&dueDateEnd=2024-04-06"
```

**Due in next 30 days:**
```bash
curl "http://localhost:3001/api/cards/filter/duedate?dueDateStart=2024-03-28&dueDateEnd=2024-04-27"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-1",
      "title": "Urgent task",
      "dueDate": "2024-03-29T00:00:00Z",
      ...
    },
    {
      "id": "card-2",
      "title": "Feature deadline",
      "dueDate": "2024-04-05T00:00:00Z",
      ...
    }
  ],
  "count": 8,
  "message": "Cards filtered by due date successfully"
}
```

**Features:**
- Time range filtering
- Sorted by due date ascending
- Includes cards without due dates separately

---

### Filter Cards Without Due Date
**GET** `/api/cards/filter/no-duedate`

Get all cards that don't have a due date assigned.

**Query Parameters:**
- `boardId` (optional) - Limit to board

**Example:**
```bash
curl "http://localhost:3001/api/cards/filter/no-duedate?boardId=board-123"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-1",
      "title": "Task without deadline",
      "dueDate": null,
      ...
    }
  ],
  "count": 12,
  "message": "Cards without due date retrieved successfully"
}
```

**Use Cases:**
- Find cards missing deadlines
- Bulk assign due dates
- Track unscheduled work

---

## ✅ Filter by Checklist Status

### Filter by Checklist Completion
**GET** `/api/cards/filter/checklist`

Get cards based on checklist item completion status.

**Query Parameters:**
- `completed` (optional) - `true` for completed items, `false` for incomplete
- `boardId` (optional) - Limit to board

**Examples:**

**Cards with incomplete checklist items:**
```bash
curl "http://localhost:3001/api/cards/filter/checklist?completed=false&boardId=board-123"
```

**Cards with completed checklist items:**
```bash
curl "http://localhost:3001/api/cards/filter/checklist?completed=true"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "card-1",
      "title": "Task with pending items",
      "checklist": [
        {"id": "item-1", "text": "Step 1", "done": false},
        {"id": "item-2", "text": "Step 2", "done": false}
      ],
      ...
    }
  ],
  "count": 5,
  "message": "Cards with incomplete checklist items retrieved successfully"
}
```

**Use Cases:**
- Show cards in progress
- Find completed work
- Track multi-step tasks

---

## 📊 Search Statistics

### Get Search Statistics
**GET** `/api/cards/search/stats`

Get aggregated statistics about cards and labels.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCards": 156,
    "cardsWithLabels": 98,
    "cardsWithDueDate": 72,
    "totalUniqueLabels": 8,
    "labelDistribution": [
      {
        "id": "label-1",
        "name": "Bug",
        "color": "#FF0000",
        "cardCount": 34
      },
      {
        "id": "label-2",
        "name": "Feature",
        "color": "#00FF00",
        "cardCount": 45
      },
      {
        "id": "label-3",
        "name": "Documentation",
        "color": "#0000FF",
        "cardCount": 19
      }
    ]
  },
  "message": "Search statistics retrieved successfully"
}
```

**Use Cases:**
- Dashboard overview
- Analytics and reporting
- Label usage insights
- Planning capacity

---

## 🔄 Complete Filtering Workflows

### Workflow 1: Find My Overdue Tasks
```bash
# Get cards assigned to me that are overdue
curl "http://localhost:3001/api/cards/filter/members/John%20Doe?boardId=board-1"

# Parse response for cards with dueDate < today
```

### Workflow 2: Find Tasks in Review
```bash
# Get cards with "In Review" label and status
curl "http://localhost:3001/api/cards/filter/labels/label-review"
```

### Workflow 3: Sprint Planning
```bash
# Find all incomplete work for sprint
curl "http://localhost:3001/api/cards/search?q=sprint%201&labelIds=label-current"

# Find cards for team member this sprint
curl "http://localhost:3001/api/cards/filter/members/Jane%20Smith?boardId=board-sprint"
```

### Workflow 4: Deadline Tracking
```bash
# Find cards due this week
curl "http://localhost:3001/api/cards/filter/duedate?dueDateStart=2024-03-31&dueDateEnd=2024-04-06"

# Find cards without deadlines
curl "http://localhost:3001/api/cards/filter/no-duedate"
```

### Workflow 5: Quality Assurance
```bash
# Find cards with QA label that have incomplete checklists
curl "http://localhost:3001/api/cards/filter/labels/label-qa"
curl "http://localhost:3001/api/cards/filter/checklist?completed=false"
```

---

## ⚠️ Error Handling

### Common Errors

| Code | Error | Cause | Solution |
|------|-------|-------|----------|
| 400 | ValidationError | Invalid query parameters | Check parameter format |
| 404 | NotFoundError | Label/Board not found | Verify ID exists |
| 500 | InternalError | Server error | Check server logs |

### Example Error Response
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Invalid start date format"
}
```

---

## 🎨 Frontend Integration

### Using Search Results in Components
```typescript
// Search cards in a board
const handleSearch = async (query: string) => {
  const response = await fetch(
    `/api/boards/${boardId}/cards/search?q=${query}`
  );
  const { data } = await response.json();
  return data; // Array of matching cards
};

// Filter by label
const handleFilterByLabel = async (labelId: string) => {
  const response = await fetch(
    `/api/cards/filter/labels/${labelId}?boardId=${boardId}`
  );
  const { data } = await response.json();
  return data;
};

// Filter by member
const handleFilterByMember = async (memberName: string) => {
  const response = await fetch(
    `/api/cards/filter/members/${encodeURIComponent(memberName)}`
  );
  const { data } = await response.json();
  return data;
};
```

---

## 🧪 Testing

### Run Integration Tests
```bash
bash test-search-filter.sh
```

### Manual Tests

**Test Title Search:**
```bash
# Create test cards with various titles
curl -X POST http://localhost:3001/api/lists/LIST_ID/cards \
  -d '{"title": "Test Database Setup"}' \
  -H "Content-Type: application/json"

# Search for "Database"
curl "http://localhost:3001/api/cards/search?q=Database"
```

**Test Label Filter:**
```bash
# Create label
LABEL=$(curl -X POST http://localhost:3001/api/labels \
  -d '{"name":"Urgent","color":"#FF0000"}' \
  -H "Content-Type: application/json" | jq -r '.data.id')

# Add label to card
curl -X POST http://localhost:3001/api/cards/CARD_ID/labels \
  -d "{\"labelId\":\"$LABEL\"}" \
  -H "Content-Type: application/json"

# Filter by label
curl "http://localhost:3001/api/cards/filter/labels/$LABEL"
```

---

## 📚 Performance Considerations

### Query Optimization
- Indexes on `title`, `dueDate`, and `members` fields recommended
- Label filtering done post-query for better performance
- Member filtering done in-memory for flexibility

### Pagination (Future)
Currently returns all results. Future enhancement: add `limit` and `offset` parameters.

### Caching (Recommended)
- Cache search results for 30 seconds
- Invalidate on card/label changes
- Use Redis for distributed caching

---

## 🔒 Security Features

- URL parameter validation
- Date format validation
- Member name encoding/decoding
- SQL injection prevention (Prisma ORM)
- Consistent error messages

---

## 📞 Related Resources

- [Card Management API](./CARDS_API.md)
- [Implementation Guide](./CARDS_IMPLEMENTATION.md)
- [Frontend Integration](./FRONTEND_INTEGRATION.md)
- [Test Script](./test-search-filter.sh)
- [Main README](./README.md)

---

## 🚀 Upcoming Features

- Pagination support
- Advanced filters (regex matching)
- Saved searches/filters
- Search history
- Full-text search capabilities
- Real-time search suggestions

---

**API Version:** v1
**Last Updated:** 2024
**Status:** ✅ Production Ready
