# Build script for offline-capable APK
# This script ensures the JS bundle is generated before building the APK
# This allows the app to work offline without Metro bundler

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Offline-Capable APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Step 1: Generate the JS bundle for Android
Write-Host "📦 Step 1: Generating JavaScript bundle..." -ForegroundColor Yellow
Write-Host ""

$bundleCommand = "npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/"

try {
    # Create assets directory if it doesn't exist
    $assetsDir = "android/app/src/main/assets"
    if (-not (Test-Path $assetsDir)) {
        New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
        Write-Host "✅ Created assets directory: $assetsDir" -ForegroundColor Green
    }

    # Generate bundle
    Invoke-Expression $bundleCommand
    if ($LASTEXITCODE -ne 0) {
        throw "Bundle generation failed"
    }
    Write-Host ""
    Write-Host "✅ JavaScript bundle generated successfully!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ Error generating bundle: $_" -ForegroundColor Red
    Write-Host "Continuing with build anyway - Gradle will generate bundle if needed..." -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Build the APK
Write-Host "🔨 Step 2: Building Android APK..." -ForegroundColor Yellow
Write-Host ""

$buildType = $args[0]
if (-not $buildType) {
    $buildType = "debug"
    Write-Host "No build type specified, using: $buildType" -ForegroundColor Yellow
}

Write-Host "Build type: $buildType" -ForegroundColor Cyan
Write-Host ""

try {
    Push-Location android
    if ($buildType -eq "release") {
        Write-Host "Building RELEASE APK..." -ForegroundColor Yellow
        .\gradlew assembleRelease
    } else {
        Write-Host "Building DEBUG APK..." -ForegroundColor Yellow
        .\gradlew assembleDebug
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle build failed"
    }
    
    Pop-Location
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Show APK location
    if ($buildType -eq "release") {
        $apkPath = "android/app/build/outputs/apk/release/app-release.apk"
    } else {
        $apkPath = "android/app/build/outputs/apk/debug/app-debug.apk"
    }
    
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "📱 APK Location: $apkPath" -ForegroundColor Cyan
        Write-Host "📦 APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✨ This APK will work offline without Metro bundler!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: APK not found at expected location: $apkPath" -ForegroundColor Yellow
    }
    
} catch {
    Pop-Location
    Write-Host ""
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "💡 Tip: Install the APK on your device and test offline functionality" -ForegroundColor Cyan
Write-Host "   The app should load login/signup screens even without internet!" -ForegroundColor Cyan
Write-Host ""

