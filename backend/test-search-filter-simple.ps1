param(
    [string]$BaseUrl = "http://localhost:3001/api"
)

# Test metrics
$testsPassedCount = 0
$testsFailedCount = 0

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
        
        return @{
            Success = $true
            Body = $response.Content | ConvertFrom-Json
            StatusCode = $response.StatusCode
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = 0
        }
    }
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "SETUP: Creating Test Data" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

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
    -Body @{"labelId" = $labelId} > $null

Write-Host "Adding checklist items..." -ForegroundColor Yellow
Invoke-ApiRequest -Method POST -Endpoint "/cards/$card3Id/checklist" `
    -Body @{"text" = "Write unit tests"} > $null

Write-Host "Setup completed!" -ForegroundColor Green

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST 1: Search by Title" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Test 1.1: Search for Database" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search?q=Database"
if ($response.Success) {
    Write-Host "PASSED: Search for Database" -ForegroundColor Green
    Write-Host "Result: Found $($response.Body.count) cards" -ForegroundColor Cyan
    $testsPassedCount++
} else {
    Write-Host "FAILED: Search for Database" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "Test 1.2: Search with board filter" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search?q=Database&boardId=$boardId"
if ($response.Success) {
    Write-Host "PASSED: Search with board filter" -ForegroundColor Green
    $testsPassedCount++
} else {
    Write-Host "FAILED: Search with board filter" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST 2: Filter by Labels" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Test 2.1: Filter cards by label" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/labels/$labelId`?boardId=$boardId"
if ($response.Success) {
    Write-Host "PASSED: Filter by label" -ForegroundColor Green
    Write-Host "Result: Found $($response.Body.count) cards" -ForegroundColor Cyan
    $testsPassedCount++
} else {
    Write-Host "FAILED: Filter by label" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST 3: Filter by Members" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Test 3.1: Filter cards by member John Doe" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/members/John%20Doe`?boardId=$boardId"
if ($response.Success) {
    Write-Host "PASSED: Filter by member" -ForegroundColor Green
    Write-Host "Result: Found $($response.Body.count) cards" -ForegroundColor Cyan
    $testsPassedCount++
} else {
    Write-Host "FAILED: Filter by member" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST 4: Filter by Due Date" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Test 4.1: Filter cards due in April" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET `
    -Endpoint "/cards/filter/duedate?dueDateStart=2024-04-01&dueDateEnd=2024-04-30&boardId=$boardId"
if ($response.Success) {
    Write-Host "PASSED: Filter by due date range" -ForegroundColor Green
    Write-Host "Result: Found $($response.Body.count) cards" -ForegroundColor Cyan
    $testsPassedCount++
} else {
    Write-Host "FAILED: Filter by due date range" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST 5: Filter Cards Without Due Date" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Test 5.1: Get cards without due date" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/no-duedate?boardId=$boardId"
if ($response.Success) {
    Write-Host "PASSED: Get cards without due date" -ForegroundColor Green
    Write-Host "Result: Found $($response.Body.count) cards" -ForegroundColor Cyan
    $testsPassedCount++
} else {
    Write-Host "FAILED: Get cards without due date" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST 6: Filter by Checklist Status" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Test 6.1: Find cards with incomplete checklist items" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/filter/checklist?completed=false&boardId=$boardId"
if ($response.Success) {
    Write-Host "PASSED: Filter by incomplete checklist" -ForegroundColor Green
    Write-Host "Result: Found $($response.Body.count) cards" -ForegroundColor Cyan
    $testsPassedCount++
} else {
    Write-Host "FAILED: Filter by incomplete checklist" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST 7: Combined Search and Filter" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Test 7.1: Search with label filter" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET `
    -Endpoint "/boards/$boardId/cards/search?q=Database&labelIds=$labelId"
if ($response.Success) {
    Write-Host "PASSED: Combined search and label filter" -ForegroundColor Green
    Write-Host "Result: Found $($response.Body.count) cards" -ForegroundColor Cyan
    $testsPassedCount++
} else {
    Write-Host "FAILED: Combined search and label filter" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST 8: Search Statistics" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Test 8.1: Get search statistics" -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method GET -Endpoint "/cards/search/stats"
if ($response.Success) {
    Write-Host "PASSED: Get search statistics" -ForegroundColor Green
    Write-Host "  Total Cards: $($response.Body.data.totalCards)" -ForegroundColor Cyan
    Write-Host "  Cards with Labels: $($response.Body.data.cardsWithLabels)" -ForegroundColor Cyan
    Write-Host "  Cards with Due Date: $($response.Body.data.cardsWithDueDate)" -ForegroundColor Cyan
    $testsPassedCount++
} else {
    Write-Host "FAILED: Get search statistics" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "CLEANUP" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Deleting test board..." -ForegroundColor Yellow
$deleteResult = Invoke-ApiRequest -Method DELETE -Endpoint "/boards/$boardId"
if ($deleteResult.Success) {
    Write-Host "PASSED: Deleted test board" -ForegroundColor Green
    $testsPassedCount++
} else {
    Write-Host "FAILED: Delete test board" -ForegroundColor Red
    $testsFailedCount++
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host "TEST SUMMARY" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
$totalTests = $testsPassedCount + $testsFailedCount
Write-Host ""
Write-Host "Total Tests: $totalTests"
Write-Host "Passed: $testsPassedCount" -ForegroundColor Green
Write-Host "Failed: $testsFailedCount" -ForegroundColor Red
Write-Host ""

if ($testsFailedCount -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "Some tests failed" -ForegroundColor Red
    Write-Host ""
    exit 1
}
