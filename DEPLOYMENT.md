# CF Stopwatch - Deployment Guide

This guide covers the complete process for deploying CF Stopwatch to the Google Play Store.

## Prerequisites

- Android development environment set up
- Release keystore configured (see Security section)
- Access to Google Play Console
- Latest code merged to master branch

## Version Management

### Current Version
- **versionCode**: 3
- **versionName**: 1.1.0

### Versioning Rules
- **versionCode**: Must increment by 1 for every release (monotonically increasing integer)
- **versionName**: Follow semantic versioning (MAJOR.MINOR.PATCH)
  - MAJOR: Breaking changes or major feature overhauls
  - MINOR: New features, backward compatible
  - PATCH: Bug fixes, minor improvements

### How to Bump Version

1. Edit `StopwatchApp/android/app/build.gradle`:
   ```gradle
   versionCode 4  // Increment by 1
   versionName "1.2.0"  // Update according to changes
   ```

2. Commit the version change:
   ```bash
   git add StopwatchApp/android/app/build.gradle
   git commit -m "Bump version to 1.2.0 (versionCode 4)"
   ```

3. Tag the release:
   ```bash
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin master --tags
   ```

## Building Release AAB

### Quick Build Script

```bash
cd StopwatchApp
./scripts/build-release.sh
```

### Manual Build Steps

1. Navigate to the React Native project:
   ```bash
   cd StopwatchApp
   ```

2. Clean previous builds (optional but recommended):
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

3. Build the release AAB:
   ```bash
   cd android && ./gradlew bundleRelease
   ```

4. Locate the AAB:
   ```bash
   ls -lh android/app/build/outputs/bundle/release/app-release.aab
   ```

### Build Verification

After building, verify:
- ✅ AAB file exists and is ~15-25MB
- ✅ No build errors or warnings (deprecation warnings are OK)
- ✅ ProGuard/R8 optimization ran (check build logs)
- ✅ Signing configuration was applied

## Pre-Deployment Testing

### Test on Physical Device

1. Build and install debug version:
   ```bash
   npx react-native run-android
   ```

2. Test all features:
   - [ ] App launches successfully
   - [ ] "Display over other apps" permission request works
   - [ ] System overlay appears and stays on top
   - [ ] Timer accuracy (start, pause, stop, clear)
   - [ ] Drag-to-reposition works smoothly
   - [ ] Close button properly dismisses overlay
   - [ ] Foreground service notification appears
   - [ ] App works after backgrounding
   - [ ] No crashes or ANRs

3. Test release build (optional but recommended):
   ```bash
   cd android && ./gradlew installRelease
   ```

### Automated Checks

- [ ] All lint warnings addressed
- [ ] No console errors in Metro bundler
- [ ] ProGuard rules don't break functionality
- [ ] App size is reasonable (<25MB)

## Google Play Console Upload

### First-Time Setup

1. Log in to [Google Play Console](https://play.google.com/console)
2. Create new app if not exists:
   - App name: **CF Stopwatch**
   - Default language: English (United States)
   - App type: App
   - Free or Paid: Free

3. Complete store listing:
   - Short description
   - Full description
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2)
   - Privacy policy URL

### Upload New Release

1. Navigate to **Production** → **Create new release**

2. Upload the AAB:
   - Click **Upload** and select `app-release.aab`
   - Wait for processing (usually 1-5 minutes)

3. Fill in release details:
   - **Release name**: Version number (e.g., "1.1.0")
   - **Release notes**: See template below

4. Review and confirm:
   - Check version codes match
   - Review permissions changes
   - Confirm target API level

5. **Save** → **Review release** → **Start rollout to Production**

### Internal Testing Track (Recommended First)

Before production, use internal testing:

1. Navigate to **Testing** → **Internal testing** → **Create new release**
2. Upload AAB and add release notes
3. Add internal testers (email addresses)
4. Testers receive link to opt-in and download
5. Collect feedback for 24-48 hours
6. If successful, promote to production

## Release Notes Template

```
What's New in v1.2.0:

• [Feature] Brief description of new feature
• [Improvement] Description of enhancement
• [Fix] Bug fix description
• [Performance] Optimization details

Thank you for using CF Stopwatch!
```

### Example Release Notes

**v1.1.0**
```
What's New:

• Rebranded to CF Stopwatch with updated app name and icon
• Improved overlay stability and performance
• Enhanced dark glass UI design
• Bug fixes and optimizations

Thank you for using CF Stopwatch!
```

## Post-Deployment

### Monitoring

After release, monitor:
- Crash reports in Play Console
- User reviews and ratings
- Installation metrics
- ANR (Application Not Responding) reports

### Rollback Plan

If critical issues are discovered:
1. Halt rollout in Play Console (if staged rollout)
2. Fix issue in code
3. Bump versionCode and rebuild
4. Upload new release with fix
5. Document issue in progress.ai

## Security

### Keystore Management

- **Location**: `StopwatchApp/android/app/release.keystore`
- **Config**: `StopwatchApp/android/key.properties`
- **CRITICAL**: Both files are gitignored - NEVER commit to version control
- **Backup**: Keep secure backup of keystore (losing it means you can't update the app!)

### Keystore Backup Checklist

- [ ] Keystore backed up to secure location
- [ ] Password stored in password manager
- [ ] Key alias documented
- [ ] Recovery process tested

## CI/CD Automation (GitHub Actions)

We have a GitHub Action configured in `.github/workflows/android-build.yml` that automatically builds a signed AAB whenever a new tag (e.g., `v1.2.0`) is pushed to the repository.

### Setup Instructions (GitHub Secrets)

To enable this, you must add the following **Actions Secrets** in your GitHub repository settings:

1.  `ANDROID_KEYSTORE_BASE64`: The base64-encoded string of your `release.keystore` file.
    *   Generate it locally: `base64 -w 0 StopwatchApp/android/app/release.keystore`
2.  `ANDROID_STORE_PASSWORD`: The password for your keystore.
3.  `ANDROID_KEY_PASSWORD`: The password for your key.
4.  `ANDROID_KEY_ALIAS`: Your key alias (e.g., `my-key-alias`).

Once these are set, pushing a tag will trigger an automated build, and the AAB will be available in the "Actions" tab artifacts.

## Troubleshooting

### Build Fails

**Issue**: Gradle build fails
- Check Java version: `java -version` (should be 17 or 21)
- Clean build: `cd android && ./gradlew clean`
- Check `key.properties` exists and is valid

**Issue**: Signing fails
- Verify keystore path in `key.properties`
- Check passwords are correct
- Ensure keystore file exists

### Upload Fails

**Issue**: Version code already used
- Increment versionCode in `build.gradle`
- Rebuild AAB

**Issue**: APK/AAB signature mismatch
- Ensure using same keystore as previous releases
- Verify signing configuration in `build.gradle`

## Quick Reference

### File Locations
- AAB Output: `StopwatchApp/android/app/build/outputs/bundle/release/app-release.aab`
- Version Config: `StopwatchApp/android/app/build.gradle` (lines 82-83)
- Signing Config: `StopwatchApp/android/key.properties`
- Keystore: `StopwatchApp/android/app/release.keystore`

### Important Commands
```bash
# Build release AAB
cd StopwatchApp/android && ./gradlew bundleRelease

# Build release APK (for sharing)
cd StopwatchApp/android && ./gradlew assembleRelease

# Clean build
cd StopwatchApp/android && ./gradlew clean

# Check version
grep -E "versionCode|versionName" StopwatchApp/android/app/build.gradle
```

## Changelog

Maintain a changelog of all releases in this section:

### v1.1.0 (2026-01-04)
- Rebranded to CF Stopwatch
- Updated app name across all platforms
- Version code: 3

### v1.0.1 (2025-12-25)
- Auto-launch overlay if permissions granted
- UI polish and dark glass theme
- Version code: 2

### v1.0.0 (2025-12-25)
- Initial release
- Android system overlay with foreground service
- Glassmorphism UI design
- Drag-to-reposition functionality
- Version code: 1
