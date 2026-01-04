#!/bin/bash
# CF Stopwatch - Release Build Script
# Builds a signed Android App Bundle (AAB) for Google Play Store

set -e  # Exit on error

echo "🚀 CF Stopwatch - Release Build Script"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get current version from build.gradle
VERSION_CODE=$(grep "versionCode" android/app/build.gradle | awk '{print $2}')
VERSION_NAME=$(grep "versionName" android/app/build.gradle | awk '{print $2}' | tr -d '"')

echo -e "${BLUE}Current Version:${NC}"
echo "  versionCode: $VERSION_CODE"
echo "  versionName: $VERSION_NAME"
echo ""

# Check if keystore exists
if [ ! -f "android/app/release.keystore" ]; then
    echo -e "${RED}❌ Error: release.keystore not found!${NC}"
    echo "Please ensure android/app/release.keystore exists."
    exit 1
fi

# Check if key.properties exists
if [ ! -f "android/key.properties" ]; then
    echo -e "${RED}❌ Error: key.properties not found!${NC}"
    echo "Please ensure android/key.properties exists with signing credentials."
    exit 1
fi

echo -e "${BLUE}✓${NC} Keystore and configuration found"
echo ""

# Optional: Clean build
read -p "Clean build directory first? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Cleaning build directory...${NC}"
    cd android && ./gradlew clean && cd ..
    echo -e "${GREEN}✓${NC} Clean complete"
    echo ""
fi

# Build the AAB
echo -e "${YELLOW}📦 Building release AAB...${NC}"
echo "This may take 1-2 minutes..."
echo ""

cd android && ./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
    
    # Show AAB details
    AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
    if [ -f "$AAB_PATH" ]; then
        AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
        echo -e "${BLUE}📱 Release AAB Details:${NC}"
        echo "  Location: android/$AAB_PATH"
        echo "  Size: $AAB_SIZE"
        echo "  Version: $VERSION_NAME (code $VERSION_CODE)"
        echo ""
        
        # Copy to easy-to-find location
        RELEASE_DIR="../releases"
        mkdir -p "$RELEASE_DIR"
        RELEASE_FILE="$RELEASE_DIR/cf-stopwatch-v$VERSION_NAME.aab"
        cp "$AAB_PATH" "$RELEASE_FILE"
        echo -e "${GREEN}✓${NC} Copied to: releases/cf-stopwatch-v$VERSION_NAME.aab"
        echo ""
        
        echo -e "${GREEN}🎉 Ready for Google Play Console upload!${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Test the release build on a device"
        echo "  2. Log in to Google Play Console"
        echo "  3. Upload: releases/cf-stopwatch-v$VERSION_NAME.aab"
        echo "  4. Fill in release notes"
        echo "  5. Submit for review"
        echo ""
    else
        echo -e "${RED}❌ AAB file not found at expected location${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    echo "Check the error messages above for details."
    exit 1
fi

cd ..
