@echo off
REM Search and Filter API Test Script
REM Tests all 8 search/filter endpoints

setlocal enabledelayedexpansion

set "BASE_URL=http://localhost:3001/api"
set "PASSED=0"
set "FAILED=0"

echo.
echo ===================================================
echo SETUP: Creating Test Data
echo ===================================================
echo.

REM Create board
echo Creating test board...
for /f "delims=" %%A in ('powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/boards' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"name\":\"Search Test\",\"description\":\"Test board\"}'; $r.Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object -ExpandProperty id"') do set "BOARD_ID=%%A"
echo Board created: !BOARD_ID!

REM Create list
echo Creating test list...
for /f "delims=" %%A in ('powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/boards/!BOARD_ID!/lists' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"name\":\"Test List\",\"order\":0}'; $r.Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object -ExpandProperty id"') do set "LIST_ID=%%A"
echo List created: !LIST_ID!

REM Create label
echo Creating test label...
for /f "delims=" %%A in ('powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/labels' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"name\":\"TestLabel\",\"color\":\"#FF0000\"}'; $r.Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object -ExpandProperty id"') do set "LABEL_ID=%%A"
echo Label created: !LABEL_ID!

REM Create cards
echo Creating test cards...
for /f "delims=" %%A in ('powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/lists/!LIST_ID!/cards' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"title\":\"Setup Database Server\"}'; $r.Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object -ExpandProperty id"') do set "CARD1=%%A"

for /f "delims=" %%A in ('powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/lists/!LIST_ID!/cards' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"title\":\"Implement Authentication\",\"members\":[\"John Doe\"]}'; $r.Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object -ExpandProperty id"') do set "CARD2=%%A"

for /f "delims=" %%A in ('powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/lists/!LIST_ID!/cards' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"title\":\"Write Unit Tests\",\"dueDate\":\"2024-04-15\"}'; $r.Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object -ExpandProperty id"') do set "CARD3=%%A"

echo Cards created: !CARD1! !CARD2! !CARD3!

echo.
echo ===================================================
echo TEST 1: Search by Title
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/cards/search?q=Database'; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Search for Database (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Search for Database' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo TEST 2: Filter by Labels
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/cards/filter/labels/!LABEL_ID!?boardId=!BOARD_ID!'; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Filter by label (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Filter by label' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo TEST 3: Filter by Members
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/cards/filter/members/John%%20Doe?boardId=!BOARD_ID!'; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Filter by member (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Filter by member' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo TEST 4: Filter by Due Date
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/cards/filter/duedate?dueDateStart=2024-04-01&dueDateEnd=2024-04-30&boardId=!BOARD_ID!'; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Filter by due date (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Filter by due date' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo TEST 5: Filter Cards Without Due Date
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/cards/filter/no-duedate?boardId=!BOARD_ID!'; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Filter without due date (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Filter without due date' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo TEST 6: Filter by Checklist Status
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/cards/filter/checklist?completed=false&boardId=!BOARD_ID!'; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Filter by checklist (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Filter by checklist' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo TEST 7: Combined Search and Filter
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/boards/!BOARD_ID!/cards/search?q=Database&labelIds=!LABEL_ID!'; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Combined search and filter (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Combined search and filter' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo TEST 8: Search Statistics
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/cards/search/stats'; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Get search statistics (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Get search statistics' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo CLEANUP
echo ===================================================
echo.

powershell -Command "([System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12); $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3001/api/boards/!BOARD_ID!' -Method DELETE; if ($r.StatusCode -eq 200) { Write-Host 'PASSED: Delete board (200)' -ForegroundColor Green } else { Write-Host 'FAILED: Delete board' -ForegroundColor Red }" && set /a PASSED+=1 || set /a FAILED+=1

echo.
echo ===================================================
echo TEST SUMMARY
echo ===================================================
echo.

set /a TOTAL=PASSED+FAILED
echo Total Tests: !TOTAL!
echo Passed: !PASSED!
echo Failed: !FAILED!

if !FAILED! equ 0 (
    echo.
    echo All tests passed!
    echo.
    exit /b 0
) else (
    echo.
    echo Some tests failed
    echo.
    exit /b 1
)
