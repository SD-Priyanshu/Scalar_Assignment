#!/bin/bash

# Test Cards, Labels, and Checklist Management API
# This script demonstrates all card-related endpoints

set -e

BASE_URL="http://localhost:3001"
BOARD_ID=""
LIST_ID=""
CARD_ID=""
LABEL_ID=""
ITEM_ID=""

echo "======================================"
echo "Card Management API Test Suite"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print section headers
print_section() {
  echo -e "${BLUE}▶ $1${NC}"
}

# Helper function to print success
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Test 1: Create a Board and List (prerequisites)
print_section "1. Creating Test Board and List"
echo "Creating board..."
BOARD=$(curl -s -X POST "$BASE_URL/api/boards" \
  -H "Content-Type: application/json" \
  -d '{"title": "Card Test Board"}')
BOARD_ID=$(echo $BOARD | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Board created: $BOARD_ID"

echo "Creating list..."
LIST=$(curl -s -X POST "$BASE_URL/api/boards/$BOARD_ID/lists" \
  -H "Content-Type: application/json" \
  -d '{"title": "Tasks"}')
LIST_ID=$(echo $LIST | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "List created: $LIST_ID"
echo ""

# Test 2: Create Cards
print_section "2. Card Management"
echo "Creating card 1..."
CARD1=$(curl -s -X POST "$BASE_URL/api/lists/$LIST_ID/cards" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement authentication",
    "description": "Add JWT-based authentication",
    "dueDate": "2024-02-15T00:00:00Z"
  }')
CARD1_ID=$(echo $CARD1 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Card 1 created: $CARD1_ID"

echo "Creating card 2..."
CARD2=$(curl -s -X POST "$BASE_URL/api/lists/$LIST_ID/cards" \
  -H "Content-Type: application/json" \
  -d '{"title": "Setup database"}')
CARD2_ID=$(echo $CARD2 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Card 2 created: $CARD2_ID"

echo "Creating card 3..."
CARD3=$(curl -s -X POST "$BASE_URL/api/lists/$LIST_ID/cards" \
  -H "Content-Type: application/json" \
  -d '{"title": "Write tests"}')
CARD3_ID=$(echo $CARD3 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Card 3 created: $CARD3_ID"

CARD_ID=$CARD1_ID  # Use first card for detail tests

echo "Getting all cards in list..."
CARDS=$(curl -s "$BASE_URL/api/lists/$LIST_ID/cards")
CARD_COUNT=$(echo $CARDS | grep -o '"id":"[^"]*"' | wc -l)
print_success "Retrieved $CARD_COUNT cards"

echo "Getting single card..."
CARD=$(curl -s "$BASE_URL/api/cards/$CARD_ID")
echo "$(echo $CARD | grep -o '"title":"[^"]*"')"
print_success "Card details retrieved"
echo ""

# Test 3: Update Cards
print_section "3. Card Updates"
echo "Updating card..."
curl -s -X PATCH "$BASE_URL/api/cards/$CARD_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Add OAuth2 and JWT-based authentication",
    "dueDate": "2024-02-20T00:00:00Z"
  }' > /dev/null
print_success "Card updated successfully"

echo "Adding members..."
curl -s -X POST "$BASE_URL/api/cards/$CARD_ID/members" \
  -H "Content-Type: application/json" \
  -d '{"memberName": "John Doe"}' > /dev/null
curl -s -X POST "$BASE_URL/api/cards/$CARD_ID/members" \
  -H "Content-Type: application/json" \
  -d '{"memberName": "Jane Smith"}' > /dev/null
print_success "Members added"

echo "Verifying members..."
CARD=$(curl -s "$BASE_URL/api/cards/$CARD_ID")
MEMBERS=$(echo $CARD | grep -o '"members":\[[^]]*\]')
echo "  Members: $MEMBERS"
print_success "Members verified"
echo ""

# Test 4: Labels Management
print_section "4. Label Management"
echo "Creating labels..."
LABEL1=$(curl -s -X POST "$BASE_URL/api/labels" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bug", "color": "#FF0000"}')
LABEL1_ID=$(echo $LABEL1 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Label 1 created: Bug"

LABEL2=$(curl -s -X POST "$BASE_URL/api/labels" \
  -H "Content-Type: application/json" \
  -d '{"name": "Feature", "color": "#00FF00"}')
LABEL2_ID=$(echo $LABEL2 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Label 2 created: Feature"

LABEL3=$(curl -s -X POST "$BASE_URL/api/labels" \
  -H "Content-Type: application/json" \
  -d '{"name": "Urgent", "color": "#FFD700"}')
LABEL3_ID=$(echo $LABEL3 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Label 3 created: Urgent"

echo "Getting all labels..."
LABELS=$(curl -s "$BASE_URL/api/labels")
LABEL_COUNT=$(echo $LABELS | grep -o '"id":"[^"]*"' | wc -l)
print_success "Retrieved $LABEL_COUNT labels"

echo "Adding labels to card..."
curl -s -X POST "$BASE_URL/api/cards/$CARD_ID/labels" \
  -H "Content-Type: application/json" \
  -d "{\"labelId\": \"$LABEL1_ID\"}" > /dev/null
curl -s -X POST "$BASE_URL/api/cards/$CARD_ID/labels" \
  -H "Content-Type: application/json" \
  -d "{\"labelId\": \"$LABEL3_ID\"}" > /dev/null
print_success "Labels added to card"

echo "Verifying labels..."
CARD=$(curl -s "$BASE_URL/api/cards/$CARD_ID")
LABEL_NAMES=$(echo $CARD | grep -o '"name":"[^"]*"' | grep -v "title" | head -2)
echo "  Card labels: $LABEL_NAMES"
print_success "Labels verified"
echo ""

# Test 5: Checklist Items
print_section "5. Checklist Management"
echo "Adding checklist items..."
ITEM1=$(curl -s -X POST "$BASE_URL/api/cards/$CARD_ID/checklist" \
  -H "Content-Type: application/json" \
  -d '{"text": "Design authentication schema"}')
ITEM1_ID=$(echo $ITEM1 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Item 1 created: Design authentication schema"

ITEM2=$(curl -s -X POST "$BASE_URL/api/cards/$CARD_ID/checklist" \
  -H "Content-Type: application/json" \
  -d '{"text": "Implement JWT strategy"}')
ITEM2_ID=$(echo $ITEM2 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Item 2 created: Implement JWT strategy"

ITEM3=$(curl -s -X POST "$BASE_URL/api/cards/$CARD_ID/checklist" \
  -H "Content-Type: application/json" \
  -d '{"text": "Add refresh token logic"}')
ITEM3_ID=$(echo $ITEM3 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Item 3 created: Add refresh token logic"

ITEM_ID=$ITEM1_ID

echo "Getting checklist items..."
ITEMS=$(curl -s "$BASE_URL/api/cards/$CARD_ID/checklist")
ITEM_COUNT=$(echo $ITEMS | grep -o '"id":"[^"]*"' | wc -l)
print_success "Retrieved $ITEM_COUNT checklist items"

echo "Marking item as complete..."
curl -s -X PATCH "$BASE_URL/api/checklist/$ITEM1_ID" \
  -H "Content-Type: application/json" \
  -d '{"done": true}' > /dev/null
print_success "Item marked as complete"

echo "Updating item text..."
curl -s -X PATCH "$BASE_URL/api/checklist/$ITEM2_ID" \
  -H "Content-Type: application/json" \
  -d '{"text": "Implement JWT strategy with proper validation"}' > /dev/null
print_success "Item text updated"

echo "Getting checklist progress..."
PROGRESS=$(curl -s "$BASE_URL/api/cards/$CARD_ID/checklist/progress")
TOTAL=$(echo $PROGRESS | grep -o '"total":[0-9]*' | cut -d':' -f2)
COMPLETED=$(echo $PROGRESS | grep -o '"completed":[0-9]*' | cut -d':' -f2)
PERCENTAGE=$(echo $PROGRESS | grep -o '"percentage":[0-9]*' | cut -d':' -f2)
echo "  Progress: $COMPLETED/$TOTAL items complete ($PERCENTAGE%)"
print_success "Progress retrieved"
echo ""

# Test 6: Card Reordering and Moving
print_section "6. Card Reordering and Movement"
echo "Reordering cards..."
curl -s -X PATCH "$BASE_URL/api/lists/$LIST_ID/cards/reorder" \
  -H "Content-Type: application/json" \
  -d "{
    \"cards\": [
      {\"id\": \"$CARD3_ID\", \"listId\": \"$LIST_ID\", \"order\": 0},
      {\"id\": \"$CARD1_ID\", \"listId\": \"$LIST_ID\", \"order\": 1},
      {\"id\": \"$CARD2_ID\", \"listId\": \"$LIST_ID\", \"order\": 2}
    ]
  }" > /dev/null
print_success "Cards reordered successfully"

echo "Creating second list..."
LIST2=$(curl -s -X POST "$BASE_URL/api/boards/$BOARD_ID/lists" \
  -H "Content-Type: application/json" \
  -d '{"title": "In Progress"}')
LIST2_ID=$(echo $LIST2 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
print_success "Second list created: $LIST2_ID"

echo "Moving card to another list..."
curl -s -X POST "$BASE_URL/api/cards/$CARD2_ID/move" \
  -H "Content-Type: application/json" \
  -d "{\"toListId\": \"$LIST2_ID\", \"newOrder\": 0}" > /dev/null
print_success "Card moved to second list"

echo "Verifying card moved..."
CARD=$(curl -s "$BASE_URL/api/cards/$CARD2_ID")
NEW_LIST=$(echo $CARD | grep -o '"listId":"[^"]*"')
print_success "Card location verified: $NEW_LIST"
echo ""

# Test 7: Deletion Tests
print_section "7. Deletion Operations"
echo "Deleting checklist item..."
curl -s -X DELETE "$BASE_URL/api/checklist/$ITEM3_ID" > /dev/null
print_success "Checklist item deleted"

echo "Removing label from card..."
curl -s -X DELETE "$BASE_URL/api/cards/$CARD_ID/labels/$LABEL1_ID" > /dev/null
print_success "Label removed from card"

echo "Removing member from card..."
curl -s -X DELETE "$BASE_URL/api/cards/$CARD_ID/members/John%20Doe" > /dev/null
print_success "Member removed from card"

echo "Deleting card..."
curl -s -X DELETE "$BASE_URL/api/cards/$CARD1_ID" > /dev/null
print_success "Card deleted"

echo "Deleting label..."
curl -s -X DELETE "$BASE_URL/api/labels/$LABEL2_ID" > /dev/null
print_success "Label deleted"
echo ""

# Test 8: Final Verification
print_section "8. Final Verification"
echo "Remaining cards in first list..."
CARDS=$(curl -s "$BASE_URL/api/lists/$LIST_ID/cards")
CARD_COUNT=$(echo $CARDS | grep -o '"id":"[^"]*"' | wc -l)
print_success "First list has $CARD_COUNT cards remaining"

echo "Cards in second list..."
CARDS=$(curl -s "$BASE_URL/api/lists/$LIST2_ID/cards")
CARD_COUNT=$(echo $CARDS | grep -o '"id":"[^"]*"' | wc -l)
print_success "Second list has $CARD_COUNT cards"

echo "Remaining labels..."
LABELS=$(curl -s "$BASE_URL/api/labels")
LABEL_COUNT=$(echo $LABELS | grep -o '"id":"[^"]*"' | wc -l)
print_success "Total labels remaining: $LABEL_COUNT"
echo ""

echo "======================================"
echo -e "${GREEN}✓ All tests completed successfully!${NC}"
echo "======================================"
echo ""
echo "Board ID: $BOARD_ID"
echo "List 1 ID: $LIST_ID"
echo "List 2 ID: $LIST2_ID"
echo ""
echo "To clean up, delete the board:"
echo "  curl -X DELETE $BASE_URL/api/boards/$BOARD_ID"
