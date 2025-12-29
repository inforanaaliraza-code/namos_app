# Release APK Build Script for Namos App
# Builds a standalone release APK that works without internet or USB cable
# Just like Flutter APKs - completely offline and standalone

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Namos App - Release APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "android")) {
    Write-Host "Error: android folder not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Step 1: Clean previous builds
Write-Host "[1/5] Cleaning previous builds..." -ForegroundColor Yellow
$androidBuildPath = "android\app\build"
if (Test-Path $androidBuildPath) {
    Remove-Item -Recurse -Force $androidBuildPath -ErrorAction SilentlyContinue
    Write-Host "   ✓ Previous builds cleaned" -ForegroundColor Green
} else {
    Write-Host "   ✓ No previous builds to clean" -ForegroundColor Green
}

# Step 2: Clean Android Gradle cache
Write-Host "[2/5] Cleaning Android Gradle cache..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠ Warning: Gradle clean had issues, but continuing..." -ForegroundColor Yellow
}
Set-Location ..

# Step 3: Ensure dependencies are installed
Write-Host "[3/5] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✓ Dependencies already installed" -ForegroundColor Green
}

# Step 4: Build Release APK
Write-Host "[4/5] Building Release APK (this may take 5-10 minutes)..." -ForegroundColor Yellow
Write-Host "   This will bundle all JavaScript code into the APK..." -ForegroundColor Gray
Write-Host ""

Set-Location android
.\gradlew.bat assembleRelease
$buildExitCode = $LASTEXITCODE
Set-Location ..

if ($buildExitCode -ne 0) {
    Write-Host ""
    Write-Host "   ✗ Build failed! Check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "   - Make sure Java JDK is installed" -ForegroundColor White
    Write-Host "   - Check if Android SDK is properly configured" -ForegroundColor White
    Write-Host "   - Try running: cd android; .\gradlew.bat clean; cd .." -ForegroundColor White
    exit 1
}

# Step 5: Locate and display APK path
Write-Host "[5/5] Locating Release APK..." -ForegroundColor Yellow

$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    $apkInfo = Get-Item $apkPath
    $apkSizeMB = [math]::Round($apkInfo.Length / 1MB, 2)
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Release APK Built Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK Location:" -ForegroundColor Cyan
    Write-Host "  $((Get-Location).Path)\$apkPath" -ForegroundColor White
    Write-Host ""
    Write-Host "APK Size: $apkSizeMB MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This APK is:" -ForegroundColor Yellow
    Write-Host "  ✓ Standalone - Works without internet" -ForegroundColor Green
    Write-Host "  ✓ Offline - No USB cable needed" -ForegroundColor Green
    Write-Host "  ✓ Production-ready - All JS bundled inside" -ForegroundColor Green
    Write-Host "  ✓ Just like Flutter APKs!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To install on your device:" -ForegroundColor Yellow
    Write-Host "  1. Transfer APK to your phone" -ForegroundColor White
    Write-Host "  2. Enable 'Install from Unknown Sources' in phone settings" -ForegroundColor White
    Write-Host "  3. Tap the APK file to install" -ForegroundColor White
    Write-Host ""
    
    # Ask if user wants to open the folder
    $openFolder = Read-Host "Open APK folder in Explorer? (Y/N)"
    if ($openFolder -eq "Y" -or $openFolder -eq "y") {
        $apkFolder = Split-Path -Parent $apkPath
        Invoke-Item $apkFolder
    }
} else {
    Write-Host ""
    Write-Host "   ✗ APK not found at expected location!" -ForegroundColor Red
    Write-Host "   Expected: $apkPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please check the build output above for errors." -ForegroundColor Yellow
    exit 1
}

