@echo off
REM ================================================================
REM  Daily KR Stock Price Update (Early Run)
REM  Fetches latest close price, PER, PBR for all KR stocks
REM  Schedule via Task Scheduler: weekdays 16:00 KST (after market close)
REM ================================================================

set PROJECT_DIR=C:\Users\laser\OneDrive\2026\vibecode\korean_stock
set PYTHON=C:\Python314\python.exe
set LOG_DIR=%PROJECT_DIR%\logs
set LOG_FILE=%LOG_DIR%\daily_update_early_%date:~0,4%%date:~5,2%%date:~8,2%.log

REM Create log directory if needed
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo [%date% %time%] Starting daily KR stock price update (early run) >> "%LOG_FILE%"

REM Run the KRX pipeline (latest-only = 1 API call)
"%PYTHON%" "%PROJECT_DIR%\scripts\fetch_krx_data.py" --latest-only >> "%LOG_FILE%" 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [%date% %time%] ERROR: Pipeline failed with exit code %ERRORLEVEL% >> "%LOG_FILE%"
    exit /b %ERRORLEVEL%
)

echo [%date% %time%] Update completed successfully >> "%LOG_FILE%"

REM Clean up logs older than 30 days
forfiles /p "%LOG_DIR%" /s /m *.log /d -30 /c "cmd /c del @path" 2>nul

exit /b 0
