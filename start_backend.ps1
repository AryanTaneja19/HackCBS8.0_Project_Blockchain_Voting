Write-Host "Starting FastAPI Backend Server..." -ForegroundColor Green
Write-Host ""

Set-Location Database_API

# Try different Python commands
$pythonCmd = $null

if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "ERROR: Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.8+ and add it to your PATH." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Using Python command: $pythonCmd" -ForegroundColor Cyan
Write-Host "Starting server on http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host ""

& $pythonCmd -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

