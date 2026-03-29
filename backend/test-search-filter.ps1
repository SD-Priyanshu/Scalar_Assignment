param(
    [string]$BaseUrl = "http://localhost:3001/api"
)

# Test metrics
$testsPassedCount = 0
$testsFailedCount = 0
$testResults = @()

# Helper function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [object]$Body,
        [int]$ExpectedStatus = 200
    )
    
    $url = "$BaseUrl$Endpoint"
    
    try {
        $params = @{
            Uri    = $url
            Method = $Method
            Headers = @{"Content-Type" = "application/json"}
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json -Compress
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            return @{
                Success = $true
                Body = $response.Content | ConvertFrom-Json
                StatusCode = $response.StatusCode
            }
        } else {
            return @{
                Success = $false
                Body = $response.Content
                StatusCode = $response.StatusCode
            }
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.Value
        }
    }
}

function Print-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Blue
    Write-Host $Title -ForegroundColor Blue
    Write-Host ("=" * 60) -ForegroundColor Blue
    Write-Host ""
}

function Assert-Test {
    param(
        [bool]$Condition,
        [string]$TestName
    )
    
    if ($Condition) {
        Write-Host "✓ PASSED: $TestName" -ForegroundColor Green
        $script:testsPassedCount++
    } else {
        Write-Host "✗ FAILED: $TestName" -ForegroundColor Red
        $script:testsFailedCount++
    }
}

# ==================== SETUP ====================
Print-Header "SETUP: Creating Test Data"

Write-Host "Creating test board..." -ForegroundColor Yellow
$boardResult = Invoke-ApiRequest -Method POST -Endpoint "/boards" `
    -Body @{"name" = "Search Test Board"; "description" = "Testing search and filter"}
$boardId = $boardResult.Body.data.id
Write-Host "Board created: $boardId"

Write-Host "Creating test list..." -ForegroundColor Yellow
$listResult = Invoke-ApiRequest -Method POST -Endpoint "/boards/$boardId/lists" `
    -Body @{"name" = "Test List"; "order" = 0}
$listId = $listResult.Body.data.id
Write-Host "List created: $listId"

Write-Host "Creating test label..." -ForegroundColor Yellow
$labelResult = Invoke-ApiRequest -Method POST -Endpoint "/labels" `
    -Body @{"name" = "TestLabel"; "color" = "#FF0000"}
$labelId = $labelResult.Body.data.id
Write-Host "Label created: $labelId"

Write-Host "Creating test cards..." -ForegroundColor Yellow
$card1Result = Invoke-ApiRequest -Method POST -Endpoint "/lists/$listId/cards" `
    -Body @{"title" = "Setup Database Server"; "description" = "Install and configure MySQL"}
$card1Id = $card1Result.Body.data.id

$card2Result = Invoke-ApiRequest -Method POST -Endpoint "/lists/$listId/cards" `
    -Body @{"title" = "Implement Authentication"; "description" = "Add JWT-based auth"; "members" = @("John Doe")}
$card2Id = $card2Result.Body.data.id

$card3Result = Invoke-ApiRequest -Method POST -Endpoint "/lists/$listId/cards" `
    -Body @{"title" = "Write Unit Tests"; "description" = "Test the API endpoints"; "dueDate" = "2024-04-15"}
$card3Id = $card3Result.Body.data.id

Write-Host "Cards created: $card1Id, $card2Id, $card3Id"

Write-Host "Adding labels to cards..." -ForegroundColor Yellow
Invoke-ApiRequest -Method POST -Endpoint "/cards/$card1Id/labels" `
    -Body @{"labelId" = $labelId} | Out-Null

Write-Host "Adding checklist items..." -ForegroundColor Yellow
Invoke-ApiRequest -Method POST -Endpoint "/cards/$card3Id/checklist" `
    -Body @{"text" = "Write unit tests"} | Out-Null

Write-Host "✓ Setup completed!" -ForegroundColor Green

# ==================== TEST 1: Search by Title ====================
Print-Header "TEST 1: Search by Title"

Write-Host "Test 1.1: Search for 'Database' in all cards"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search?q=Database"
Assert-Test -Condition $response.Success -TestName "Search for 'Database'"
if ($response.Success) {
    Write-Host "Found $($response.Body.count) cards"
}

Write-Host "`nTest 1.2: Search for 'Authentication' in all cards"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search?q=Authentication"
Assert-Test -Condition $response.Success -TestName "Search for 'Authentication'"
if ($response.Success) {
    Write-Host "Found $($response.Body.count) cards"
}

Write-Host "`nTest 1.3: Search for 'Database' limited to board"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search?q=Database&boardId=$boardId"
Assert-Test -Condition $response.Success -TestName "Search within board scope"

Write-Host "`nTest 1.4: Search with no results"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search?q=NonExistentCard"
Assert-Test -Condition ($response.Success -and $response.Body.count -eq 0) -TestName "Search with no results"

# ==================== TEST 2: Filter by Labels ====================
Print-Header "TEST 2: Filter by Labels"

Write-Host "Test 2.1: Filter cards by label"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/labels/$labelId`?boardId=$boardId"
Assert-Test -Condition $response.Success -TestName "Filter by label"
if ($response.Success) {
    Write-Host "Found $($response.Body.count) cards with label"
}

Write-Host "`nTest 2.2: Filter by non-existent label"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/labels/invalid-label-id`?boardId=$boardId"
Assert-Test -Condition ($response.Success -and $response.Body.count -eq 0) -TestName "Filter by non-existent label"

# ==================== TEST 3: Filter by Members ====================
Print-Header "TEST 3: Filter by Members"

Write-Host "Test 3.1: Filter cards by member 'John Doe'"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/members/John%20Doe`?boardId=$boardId"
Assert-Test -Condition $response.Success -TestName "Filter by member"
if ($response.Success) {
    Write-Host "Found $($response.Body.count) cards assigned to John Doe"
}

Write-Host "`nTest 3.2: Filter by non-existent member"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/members/NonExistent%20User`?boardId=$boardId"
Assert-Test -Condition ($response.Success -and $response.Body.count -eq 0) -TestName "Filter by non-existent member"

# ==================== TEST 4: Filter by Due Date ====================
Print-Header "TEST 4: Filter by Due Date Range"

Write-Host "Test 4.1: Filter cards due in April"
$response = Invoke-ApiRequest -Method GET `
    -Endpoint "/cards/filter/duedate?dueDateStart=2024-04-01&dueDateEnd=2024-04-30&boardId=$boardId"
Assert-Test -Condition $response.Success -TestName "Filter by due date range"
if ($response.Success) {
    Write-Host "Found $($response.Body.count) cards due in April"
}

Write-Host "`nTest 4.2: Filter cards with date range (no results)"
$response = Invoke-ApiRequest -Method GET `
    -Endpoint "/cards/filter/duedate?dueDateStart=2020-01-01&dueDateEnd=2020-12-31&boardId=$boardId"
Assert-Test -Condition ($response.Success -and $response.Body.count -eq 0) -TestName "Filter with empty results"

# ==================== TEST 5: Filter Cards Without Due Date ====================
Print-Header "TEST 5: Filter Cards Without Due Date"

Write-Host "Test 5.1: Get cards without due date"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/no-duedate?boardId=$boardId"
Assert-Test -Condition $response.Success -TestName "Get cards without due date"
if ($response.Success) {
    Write-Host "Found $($response.Body.count) cards without due date"
}

# ==================== TEST 6: Filter by Checklist Status ====================
Print-Header "TEST 6: Filter by Checklist Status"

Write-Host "Test 6.1: Find cards with incomplete checklist items"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/checklist?completed=false&boardId=$boardId"
Assert-Test -Condition $response.Success -TestName "Filter by incomplete checklist"
if ($response.Success) {
    Write-Host "Found $($response.Body.count) cards with incomplete items"
}

Write-Host "`nTest 6.2: Find cards with completed checklist items"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/checklist?completed=true&boardId=$boardId"
Assert-Test -Condition $response.Success -TestName "Filter by completed checklist"

# ==================== TEST 7: Combined Search & Filter ====================
Print-Header "TEST 7: Combined Search & Filter"

Write-Host "Test 7.1: Search with label filter"
$response = Invoke-ApiRequest -Method GET `
    -Endpoint "/boards/$boardId/cards/search?q=Database&labelIds=$labelId"
Assert-Test -Condition $response.Success -TestName "Combined search and label filter"

Write-Host "`nTest 7.2: Search with multiple criteria"
$response = Invoke-ApiRequest -Method GET `
    -Endpoint "/boards/$boardId/cards/search?q=Database&labelIds=$labelId&memberNames=John%20Doe"
Assert-Test -Condition $response.Success -TestName "Search with multiple filters"

# ==================== TEST 8: Search Statistics ====================
Print-Header "TEST 8: Search Statistics"

Write-Host "Test 8.1: Get search statistics"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search/stats"
Assert-Test -Condition $response.Success -TestName "Get search statistics"
if ($response.Success) {
    Write-Host "Total Cards: $($response.Body.data.totalCards)"
    Write-Host "Cards with Labels: $($response.Body.data.cardsWithLabels)"
    Write-Host "Cards with Due Date: $($response.Body.data.cardsWithDueDate)"
    
    if ($response.Body.data.labelDistribution) {
        Write-Host "Label count: $($response.Body.data.labelDistribution.Count)"
    }
}

# ==================== TEST 9: Edge Cases ====================
Print-Header "TEST 9: Edge Cases"

Write-Host "Test 9.1: Search with empty query string"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search?q="
Assert-Test -Condition $response.Success -TestName "Search with empty query"

Write-Host "`nTest 9.2: Search with special characters"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search?q=test%26query"
Assert-Test -Condition $response.Success -TestName "Search with special characters"

Write-Host "`nTest 9.3: Filter with URL-encoded special characters"
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/members/John%20Doe%20Jr."
Assert-Test -Condition $response.Success -TestName "URL-encoded special characters"

# ==================== CLEANUP ====================
Print-Header "CLEANUP"

Write-Host "Deleting test board..."
$deleteResult = Invoke-ApiRequest -Method DELETE -Endpoint "/boards/$boardId" -ExpectedStatus 200
Assert-Test -Condition $deleteResult.Success -TestName "Deleted test board"

# ==================== SUMMARY ====================
Print-Header "TEST SUMMARY"

$totalTests = $testsPassedCount + $testsFailedCount
Write-Host "Total Tests: $totalTests"
Write-Host "Passed: $testsPassedCount" -ForegroundColor Green
Write-Host "Failed: $testsFailedCount" -ForegroundColor Red

if ($testsFailedCount -eq 0) {
    Write-Host "`nAll tests passed!`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome tests failed`n" -ForegroundColor Red
    exit 1
}
