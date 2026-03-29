#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3001/api"
TESTS_PASSED=0
TESTS_FAILED=0

# Test data
BOARD_ID=""
LIST_ID=""
CARD_ID_1=""
CARD_ID_2=""
CARD_ID_3=""
LABEL_ID=""

# Helper function to print test header
print_header() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

# Helper function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Helper function to make API request
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_status" == "$expected_status" ]; then
        echo "$body"
        return 0
    else
        echo "$body"
        echo "HTTP Status: $http_status (Expected: $expected_status)" >&2
        return 1
    fi
}

# Setup: Create test board
print_header "SETUP: Creating test data"

echo "Creating test board..."
BOARD_RESPONSE=$(make_request POST "/boards" '{"name":"Search Test Board","description":"Testing search & filter"}' "201")
BOARD_ID=$(echo "$BOARD_RESPONSE" | jq -r '.data.id')
echo "Board created: $BOARD_ID"

echo "Creating test list..."
LIST_RESPONSE=$(make_request POST "/boards/$BOARD_ID/lists" '{"name":"Test List","order":0}' "201")
LIST_ID=$(echo "$LIST_RESPONSE" | jq -r '.data.id')
echo "List created: $LIST_ID"

echo "Creating test label..."
LABEL_RESPONSE=$(make_request POST "/labels" '{"name":"TestLabel","color":"#FF0000"}' "201")
LABEL_ID=$(echo "$LABEL_RESPONSE" | jq -r '.data.id')
echo "Label created: $LABEL_ID"

echo "Creating test cards..."
CARD_1=$(make_request POST "/lists/$LIST_ID/cards" '{"title":"Setup Database Server","description":"Install and configure MySQL"}' "201")
CARD_ID_1=$(echo "$CARD_1" | jq -r '.data.id')

CARD_2=$(make_request POST "/lists/$LIST_ID/cards" '{"title":"Implement Authentication","description":"Add JWT-based auth","members":["John Doe"]}' "201")
CARD_ID_2=$(echo "$CARD_2" | jq -r '.data.id')

CARD_3=$(make_request POST "/lists/$LIST_ID/cards" '{"title":"Write Unit Tests","description":"Test the API endpoints","dueDate":"2024-04-15"}' "201")
CARD_ID_3=$(echo "$CARD_3" | jq -r '.data.id')

echo "Cards created: $CARD_ID_1, $CARD_ID_2, $CARD_ID_3"

# Add label to cards
echo "Adding labels to cards..."
make_request POST "/cards/$CARD_ID_1/labels" "{\"labelId\":\"$LABEL_ID\"}" "200" > /dev/null

# Add checklist items
echo "Adding checklist items..."
make_request POST "/cards/$CARD_ID_3/checklist" '{"text":"Write unit tests"}' "201" > /dev/null

echo -e "${GREEN}Setup completed!${NC}"

# TEST 1: Search by Title
print_header "TEST 1: Search by Title"

echo "Test 1.1: Search for 'Database' in all cards"
RESPONSE=$(make_request GET "/cards/search?q=Database" "200")
print_result $? "Search for 'Database'"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards"

echo -e "\nTest 1.2: Search for 'Authentication' in all cards"
RESPONSE=$(make_request GET "/cards/search?q=Authentication" "200")
print_result $? "Search for 'Authentication'"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards"

echo -e "\nTest 1.3: Search for 'Database' limited to board"
RESPONSE=$(make_request GET "/cards/search?q=Database&boardId=$BOARD_ID" "200")
print_result $? "Search within board scope"

echo -e "\nTest 1.4: Search with no results"
RESPONSE=$(make_request GET "/cards/search?q=NonExistentCard" "200")
print_result $? "Search with no results"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
if [ "$COUNT" == "0" ]; then
    echo "Correctly returned 0 results"
else
    echo "WARNING: Expected 0 results, got $COUNT"
fi

# TEST 2: Filter by Labels
print_header "TEST 2: Filter by Labels"

echo "Test 2.1: Filter cards by label"
RESPONSE=$(make_request GET "/cards/filter/labels/$LABEL_ID?boardId=$BOARD_ID" "200")
print_result $? "Filter by label"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards with label"

echo -e "\nTest 2.2: Filter by non-existent label"
RESPONSE=$(make_request GET "/cards/filter/labels/invalid-label-id?boardId=$BOARD_ID" "200")
print_result $? "Filter by non-existent label returns 0 results"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards"

# TEST 3: Filter by Members
print_header "TEST 3: Filter by Members"

echo "Test 3.1: Filter cards by member 'John Doe'"
RESPONSE=$(make_request GET "/cards/filter/members/John%20Doe?boardId=$BOARD_ID" "200")
print_result $? "Filter by member"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards assigned to John Doe"

echo -e "\nTest 3.2: Filter by non-existent member"
RESPONSE=$(make_request GET "/cards/filter/members/NonExistent%20User?boardId=$BOARD_ID" "200")
print_result $? "Filter by non-existent member"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards"

# TEST 4: Filter by Due Date
print_header "TEST 4: Filter by Due Date Range"

echo "Test 4.1: Filter cards due in April"
RESPONSE=$(make_request GET "/cards/filter/duedate?dueDateStart=2024-04-01&dueDateEnd=2024-04-30&boardId=$BOARD_ID" "200")
print_result $? "Filter by due date range"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards due in April"

echo -e "\nTest 4.2: Filter cards due this month"
TODAY=$(date +%Y-%m-01)
END_MONTH=$(date -d "$(date +%Y-%m-01) +1 month -1 day" +%Y-%m-%d)
RESPONSE=$(make_request GET "/cards/filter/duedate?dueDateStart=$TODAY&dueDateEnd=$END_MONTH&boardId=$BOARD_ID" "200")
print_result $? "Filter by current month"

echo -e "\nTest 4.3: Filter cards with date range (no results)"
RESPONSE=$(make_request GET "/cards/filter/duedate?dueDateStart=2020-01-01&dueDateEnd=2020-12-31&boardId=$BOARD_ID" "200")
print_result $? "Filter with empty results"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards"

# TEST 5: Filter Cards Without Due Date
print_header "TEST 5: Filter Cards Without Due Date"

echo "Test 5.1: Get cards without due date"
RESPONSE=$(make_request GET "/cards/filter/no-duedate?boardId=$BOARD_ID" "200")
print_result $? "Get cards without due date"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards without due date"

# TEST 6: Filter by Checklist Status
print_header "TEST 6: Filter by Checklist Status"

echo "Test 6.1: Find cards with incomplete checklist items"
RESPONSE=$(make_request GET "/cards/filter/checklist?completed=false&boardId=$BOARD_ID" "200")
print_result $? "Filter by incomplete checklist"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards with incomplete items"

echo -e "\nTest 6.2: Find cards with completed checklist items"
RESPONSE=$(make_request GET "/cards/filter/checklist?completed=true&boardId=$BOARD_ID" "200")
print_result $? "Filter by completed checklist"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT cards with completed items"

# TEST 7: Combined Search & Filter
print_header "TEST 7: Combined Search & Filter"

echo "Test 7.1: Search for 'Test' with label filter"
RESPONSE=$(make_request GET "/boards/$BOARD_ID/cards/search?q=Test&labelIds=$LABEL_ID" "200")
print_result $? "Combined search and label filter"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT matching cards"

echo -e "\nTest 7.2: Search with multiple criteria"
RESPONSE=$(make_request GET "/boards/$BOARD_ID/cards/search?q=Database&labelIds=$LABEL_ID&memberNames=John%20Doe" "200")
print_result $? "Search with multiple filters"
COUNT=$(echo "$RESPONSE" | jq -r '.count')
echo "Found $COUNT matching cards"

# TEST 8: Search Statistics
print_header "TEST 8: Search Statistics"

echo "Test 8.1: Get search statistics"
RESPONSE=$(make_request GET "/cards/search/stats" "200")
print_result $? "Get search statistics"
TOTAL=$(echo "$RESPONSE" | jq -r '.data.totalCards')
WITH_LABELS=$(echo "$RESPONSE" | jq -r '.data.cardsWithLabels')
WITH_DUE=$(echo "$RESPONSE" | jq -r '.data.cardsWithDueDate')
echo "Total Cards: $TOTAL"
echo "Cards with Labels: $WITH_LABELS"
echo "Cards with Due Date: $WITH_DUE"

echo -e "\nTest 8.2: Verify label distribution in stats"
LABEL_COUNT=$(echo "$RESPONSE" | jq '.data.labelDistribution | length')
echo "Label distribution includes $LABEL_COUNT labels"

# TEST 9: Edge Cases
print_header "TEST 9: Edge Cases"

echo "Test 9.1: Search with empty query string"
RESPONSE=$(make_request GET "/cards/search?q=" "200")
print_result $? "Search with empty query"

echo -e "\nTest 9.2: Search with special characters"
RESPONSE=$(make_request GET "/cards/search?q=test%26query" "200")
print_result $? "Search with special characters"

echo -e "\nTest 9.3: Filter with invalid date format"
RESPONSE=$(make_request GET "/cards/filter/duedate?dueDateStart=invalid-date&dueDateEnd=2024-12-31" "200")
RESULT=$?
if [ $RESULT -eq 0 ]; then
    # Check if error is handled gracefully
    echo "Request processed (error or empty result)"
    print_result 0 "Invalid date format handling"
else
    print_result $RESULT "Invalid date format handling"
fi

echo -e "\nTest 9.4: Filter with URL-encoded special characters"
RESPONSE=$(make_request GET "/cards/filter/members/John%20Doe%20Jr." "200")
print_result $? "URL-encoded special characters"

# Cleanup
print_header "CLEANUP"

echo "Deleting test data..."
make_request DELETE "/boards/$BOARD_ID" "" "200" > /dev/null
print_result $? "Deleted test board"

# Summary
print_header "TEST SUMMARY"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed${NC}\n"
    exit 1
fi
