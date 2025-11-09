@echo off
echo Starting FastAPI Backend Server...
echo.
cd Database_API
echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo Python is not found in PATH. Trying py command...
    py --version
    if %errorlevel% neq 0 (
        echo ERROR: Python is not installed or not in PATH.
        echo Please install Python 3.8+ and add it to your PATH.
        pause
        exit /b 1
    )
    py -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
)

