# API Quick Reference

Fast lookup guide for all card management endpoints.

## 🎯 Cards (8 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/lists/:listId/cards` | Create card | ✅ |
| GET | `/api/lists/:listId/cards` | List cards | ✅ |
| GET | `/api/cards/:cardId` | Get card | ✅ |
| PATCH | `/api/cards/:cardId` | Update card | ✅ |
| POST | `/api/cards/:cardId/move` | Move card | ✅ |
| PATCH | `/api/lists/:listId/cards/reorder` | Reorder cards | ✅ |
| DELETE | `/api/cards/:cardId` | Delete card | ✅ |
| POST/DELETE | `/api/cards/:cardId/members` | Manage members | ✅ |

### Create Card
```bash
POST /api/lists/LIST_ID/cards
{
  "title": "Task title",
  "description": "Description (optional)",
  "dueDate": "2024-02-15T00:00:00Z",
  "cover": "image-url"
}
```

### Move Card
```bash
POST /api/cards/CARD_ID/move
{
  "toListId": "TARGET_LIST_ID",
  "newOrder": 0
}
```

### Reorder Cards (Drag & Drop)
```bash
PATCH /api/lists/LIST_ID/cards/reorder
{
  "cards": [
    {"id": "card-1", "listId": "list-1", "order": 0},
    {"id": "card-2", "listId": "list-1", "order": 1},
    {"id": "card-3", "listId": "list-2", "order": 0}
  ]
}
```

### Add Member
```bash
POST /api/cards/CARD_ID/members
{ "memberName": "John Doe" }
```

### Remove Member
```bash
DELETE /api/cards/CARD_ID/members/John%20Doe
```

---

## 🏷️ Labels (7 endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/labels` | Create label |
| GET | `/api/labels` | List all labels |
| GET | `/api/labels/:labelId` | Get label |
| PATCH | `/api/labels/:labelId` | Update label |
| DELETE | `/api/labels/:labelId` | Delete label |
| POST | `/api/cards/:cardId/labels` | Add label to card |
| DELETE | `/api/cards/:cardId/labels/:labelId` | Remove label |

### Create Label
```bash
POST /api/labels
{
  "name": "Bug",
  "color": "#FF0000"
}
```

### Add Label to Card
```bash
POST /api/cards/CARD_ID/labels
{ "labelId": "LABEL_ID" }
```

---

## ✅ Checklists (6 endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/cards/:cardId/checklist` | Create item |
| GET | `/api/cards/:cardId/checklist` | List items |
| GET | `/api/checklist/:itemId` | Get item |
| PATCH | `/api/checklist/:itemId` | Update item |
| DELETE | `/api/checklist/:itemId` | Delete item |
| GET | `/api/cards/:cardId/checklist/progress` | Get stats |

### Create Checklist Item
```bash
POST /api/cards/CARD_ID/checklist
{ "text": "Task description" }
```

### Toggle Item Done
```bash
PATCH /api/checklist/ITEM_ID
{ "done": true }
```

### Get Progress
```bash
GET /api/cards/CARD_ID/checklist/progress
# Returns: { total: 5, completed: 3, percentage: 60 }
```

---

## 📋 Common Response Format

### Success
```json
{
  "success": true,
  "data": { /* resource */ },
  "message": "Operation successful",
  "count": 10  // For lists
}
```

### Error
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Error description"
}
```

---

## 🔗 Commonly Used Parameters

| Parameter | Type | Example |
|-----------|------|---------|
| `cardId` | string | `"clfxyz123"` |
| `listId` | string | `"listABC"` |
| `labelId` | string | `"label-1"` |
| `itemId` | string | `"item-1"` |
| `title` | string | `"My Task"` |
| `order` | number | `0` |
| `done` | boolean | `true` |
| `color` | string | `"#FF0000"` |
| `memberName` | string | `"John Doe"` |

---

## 🚀 Usage Examples

### Create Full Card Flow
```bash
# 1. Create card
CARD=$(curl -X POST http://localhost:3001/api/lists/list-id/cards \
  -H "Content-Type: application/json" \
  -d '{"title":"Task"}' | jq -r '.data.id')

# 2. Add label
curl -X POST http://localhost:3001/api/cards/$CARD/labels \
  -H "Content-Type: application/json" \
  -d '{"labelId":"label-id"}'

# 3. Add checklist item
curl -X POST http://localhost:3001/api/cards/$CARD/checklist \
  -H "Content-Type: application/json" \
  -d '{"text":"Subtask"}'

# 4. Add member
curl -X POST http://localhost:3001/api/cards/$CARD/members \
  -H "Content-Type: application/json" \
  -d '{"memberName":"Jane"}'
```

### Drag & Drop Between Lists
```bash
# Move card and reorder in target
curl -X PATCH http://localhost:3001/api/lists/target-list/cards/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "cards": [
      {"id":"card-1","listId":"target-list","order":0},
      {"id":"card-2","listId":"target-list","order":1}
    ]
  }'
```

### Toggle Checklist Item
```bash
curl -X PATCH http://localhost:3001/api/checklist/item-id \
  -H "Content-Type: application/json" \
  -d '{"done":true}'
```

---

## ⚠️ Error Codes

| Code | Error | Cause |
|------|-------|-------|
| 400 | ValidationError | Invalid input |
| 404 | NotFoundError | Resource not found |
| 409 | ConflictError | Duplicate resource |
| 500 | InternalError | Server error |

---

## 💡 Tips

- **Drag & Drop:** Always include listId in reorder payload
- **Edit Card:** Only send fields to update
- **URL Encoding:** Member names with spaces need encoding (`John%20Doe`)
- **Progress:** Calculate percentage on frontend or use `/progress` endpoint
- **Cascade Delete:** Deleting card removes all labels, items, comments

---

## 🔗 Related Docs

- [Full API Reference](./CARDS_API.md)
- [Implementation Guide](./CARDS_IMPLEMENTATION.md)
- [Frontend Integration](./FRONTEND_INTEGRATION.md)
- [Main README](./README.md)

---

## 🧪 Test All Endpoints

```bash
bash test-cards.sh
```

---

**Last Updated:** 2024
**Status:** ✅ Production Ready
**API Version:** v1
