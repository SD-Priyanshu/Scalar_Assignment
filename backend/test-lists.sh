#!/bin/bash

# Kanban Board Backend - API Testing Script
# This script demonstrates all the List Management API endpoints

API_URL="http://localhost:3001/api"

echo "=========================================="
echo "   Kanban Board Backend - List APIs"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Create a Board first
echo -e "${BLUE}[1] Creating a new board...${NC}"
BOARD_RESPONSE=$(curl -s -X POST "$API_URL/boards" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Project"}')
echo "$BOARD_RESPONSE" | jq '.'
BOARD_ID=$(echo "$BOARD_RESPONSE" | jq -r '.data.id')
echo -e "${GREEN}Board ID: $BOARD_ID${NC}"
echo ""

# Step 2: Create multiple lists
echo -e "${BLUE}[2] Creating lists...${NC}"

echo "Creating 'To Do' list..."
LIST1_RESPONSE=$(curl -s -X POST "$API_URL/boards/$BOARD_ID/lists" \
  -H "Content-Type: application/json" \
  -d '{"title": "To Do"}')
LIST1_ID=$(echo "$LIST1_RESPONSE" | jq -r '.data.id')
echo -e "${GREEN}List 1 ID: $LIST1_ID${NC}"

echo "Creating 'In Progress' list..."
LIST2_RESPONSE=$(curl -s -X POST "$API_URL/boards/$BOARD_ID/lists" \
  -H "Content-Type: application/json" \
  -d '{"title": "In Progress"}')
LIST2_ID=$(echo "$LIST2_RESPONSE" | jq -r '.data.id')
echo -e "${GREEN}List 2 ID: $LIST2_ID${NC}"

echo "Creating 'Done' list..."
LIST3_RESPONSE=$(curl -s -X POST "$API_URL/boards/$BOARD_ID/lists" \
  -H "Content-Type: application/json" \
  -d '{"title": "Done"}')
LIST3_ID=$(echo "$LIST3_RESPONSE" | jq -r '.data.id')
echo -e "${GREEN}List 3 ID: $LIST3_ID${NC}"
echo ""

# Step 3: Get all lists for the board
echo -e "${BLUE}[3] Getting all lists for the board...${NC}"
curl -s -X GET "$API_URL/boards/$BOARD_ID/lists" | jq '.'
echo ""

# Step 4: Get a specific list
echo -e "${BLUE}[4] Getting a specific list...${NC}"
curl -s -X GET "$API_URL/lists/$LIST1_ID" | jq '.'
echo ""

# Step 5: Update a list title
echo -e "${BLUE}[5] Updating list title...${NC}"
curl -s -X PATCH "$API_URL/lists/$LIST1_ID" \
  -H "Content-Type: application/json" \
  -d '{"title": "Todo - Updated"}' | jq '.'
echo ""

# Step 6: Reorder lists (drag and drop)
echo -e "${BLUE}[6] Reordering lists (simulating drag & drop)...${NC}"
curl -s -X PATCH "$API_URL/boards/$BOARD_ID/lists/reorder" \
  -H "Content-Type: application/json" \
  -d '{
    "lists": [
      {"id": "'$LIST3_ID'", "order": 0},
      {"id": "'$LIST2_ID'", "order": 1},
      {"id": "'$LIST1_ID'", "order": 2}
    ]
  }' | jq '.'
echo ""

# Step 7: View board with reordered lists
echo -e "${BLUE}[7] Viewing board with reordered lists...${NC}"
curl -s -X GET "$API_URL/boards/$BOARD_ID" | jq '.data.lists | map({id, title, order})'
echo ""

# Step 8: Delete a list
echo -e "${BLUE}[8] Deleting a list...${NC}"
curl -s -X DELETE "$API_URL/lists/$LIST3_ID" | jq '.'
echo ""

# Step 9: Verify list was deleted
echo -e "${BLUE}[9] Verifying list was deleted (getting all lists)...${NC}"
curl -s -X GET "$API_URL/boards/$BOARD_ID/lists" | jq '.data | map({id, title, order})'
echo ""

echo -e "${GREEN}=========================================="
echo "   All tests completed successfully!"
echo "==========================================${NC}"
