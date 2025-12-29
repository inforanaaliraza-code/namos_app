# Complete Rebuild Script for Namos App
# Fixes getConstants error by cleaning and rebuilding everything

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Namos App - Complete Rebuild Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop Metro (if running)
Write-Host "[1/6] Checking for running Metro bundler..." -ForegroundColor Yellow
$metroProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" }
if ($metroProcess) {
    Write-Host "   Found Metro process. Please stop it manually (Ctrl+C) and press Enter to continue..." -ForegroundColor Red
    Read-Host
}

# Step 2: Clean node_modules
Write-Host "[2/6] Cleaning node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "   ✓ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "   ✓ node_modules already clean" -ForegroundColor Green
}

# Step 3: Clean Android build caches
Write-Host "[3/6] Cleaning Android build caches..." -ForegroundColor Yellow
$androidPaths = @(
    "android\app\build",
    "android\build",
    "android\.gradle"
)

foreach ($path in $androidPaths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "   ✓ $path cleaned" -ForegroundColor Green
    }
}

# Step 4: Clean Metro cache
Write-Host "[4/6] Cleaning Metro cache..." -ForegroundColor Yellow
$tempPaths = @(
    "$env:TEMP\metro-*",
    "$env:TEMP\haste-map-*",
    "$env:TEMP\react-*"
)

foreach ($pattern in $tempPaths) {
    Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "   ✓ Metro cache cleaned" -ForegroundColor Green

# Step 5: Reinstall dependencies
Write-Host "[5/6] Reinstalling dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 6: Clean Android Gradle build
Write-Host "[6/6] Cleaning Android Gradle build..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat clean
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Android build cleaned" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to clean Android build" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Rebuild Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start Metro bundler: npm start -- --reset-cache" -ForegroundColor White
Write-Host "2. In a NEW terminal, run: npm run android" -ForegroundColor White
Write-Host ""

