# CF Stopwatch - Deployment Checklist

Use this checklist before each Google Play Store release.

## Pre-Build Checklist

### Code Quality
- [ ] All features tested on physical Android device
- [ ] No console errors or warnings in development
- [ ] All lint issues resolved or documented
- [ ] Code reviewed and approved
- [ ] All changes committed to git
- [ ] Master branch is up to date

### Version Management
- [ ] Version code incremented in `android/app/build.gradle`
- [ ] Version name updated following semantic versioning
- [ ] Version change committed to git
- [ ] Git tag created for release (e.g., `v1.2.0`)
- [ ] Tag pushed to GitHub

### Documentation
- [ ] DEPLOYMENT.md changelog updated with new version
- [ ] progress.ai updated with release notes
- [ ] README.md version references updated (if applicable)
- [ ] Release notes drafted (see template below)

## Build Checklist

### Environment
- [ ] Java 17 or 21 installed and configured
- [ ] Android SDK up to date
- [ ] Node modules installed (`npm install`)
- [ ] No pending dependency updates that could break build

### Signing
- [ ] `android/app/release.keystore` exists
- [ ] `android/key.properties` configured correctly
- [ ] Keystore backed up to secure location
- [ ] Passwords verified and accessible

### Build Process
- [ ] Clean build completed: `./gradlew clean`
- [ ] Release AAB built successfully: `./gradlew bundleRelease`
- [ ] AAB file exists at `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] AAB size is reasonable (~15-25MB)
- [ ] No build errors (deprecation warnings OK)
- [ ] ProGuard/R8 optimization confirmed in build logs

## Testing Checklist

### Functional Testing
- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] "Display over other apps" permission request works
- [ ] System overlay appears correctly
- [ ] Timer starts and displays correctly (mm:ss:ff format)
- [ ] Pause/resume functionality works
- [ ] Clear/reset functionality works
- [ ] Close button dismisses overlay
- [ ] Drag-to-reposition works smoothly
- [ ] Overlay persists when app is backgrounded
- [ ] Foreground service notification appears
- [ ] App works after device rotation
- [ ] No ANRs (Application Not Responding)

### UI/UX Testing
- [ ] Dark glass theme renders correctly
- [ ] All icons display properly
- [ ] Touch targets are responsive (44px minimum)
- [ ] Text is readable and properly sized
- [ ] No layout jitter or jumping
- [ ] Animations are smooth

### Performance Testing
- [ ] App startup time is acceptable (<2 seconds)
- [ ] Timer accuracy verified (compare with reference stopwatch)
- [ ] No memory leaks during extended use
- [ ] Battery usage is reasonable
- [ ] CPU usage is minimal when overlay is idle

### Compatibility Testing
- [ ] Tested on Android 8.0+ (minimum SDK)
- [ ] Tested on latest Android version
- [ ] Tested on different screen sizes/densities
- [ ] Tested on different manufacturers (Samsung, Google, etc.)

## Google Play Console Checklist

### Store Listing (First Release Only)
- [ ] App name: "CF Stopwatch"
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] App icon uploaded (512x512 PNG)
- [ ] Feature graphic uploaded (1024x500 PNG)
- [ ] Screenshots uploaded (minimum 2, recommended 4-8)
- [ ] Privacy policy URL provided
- [ ] App category selected
- [ ] Content rating completed
- [ ] Target audience defined

### Release Upload
- [ ] Logged into Google Play Console
- [ ] Correct app selected
- [ ] Release track chosen (Internal Testing / Production)
- [ ] AAB uploaded successfully
- [ ] Version code matches build.gradle
- [ ] Version name matches build.gradle
- [ ] Release notes added (see template)
- [ ] Permissions changes reviewed
- [ ] Target API level confirmed (API 34+)

### Internal Testing (Recommended)
- [ ] Internal testing release created
- [ ] Testers added (email addresses)
- [ ] Test link shared with testers
- [ ] Feedback collected (24-48 hours)
- [ ] Critical issues resolved
- [ ] Ready to promote to production

### Production Release
- [ ] All internal testing passed
- [ ] Release reviewed and approved
- [ ] Rollout percentage set (recommend 20% → 50% → 100%)
- [ ] Release submitted
- [ ] Confirmation email received

## Post-Release Checklist

### Monitoring (First 24 Hours)
- [ ] Check crash reports in Play Console
- [ ] Monitor ANR reports
- [ ] Review user ratings and reviews
- [ ] Check installation metrics
- [ ] Verify app appears in Play Store search
- [ ] Test download and installation from Play Store

### Documentation
- [ ] progress.ai updated with deployment date and outcome
- [ ] DEPLOYMENT.md changelog updated
- [ ] GitHub release created with notes
- [ ] Team notified of successful release

### Rollback Plan (If Issues Found)
- [ ] Halt staged rollout if critical bug found
- [ ] Document issue in progress.ai
- [ ] Create hotfix branch
- [ ] Fix issue and test thoroughly
- [ ] Bump version code
- [ ] Build and upload new release
- [ ] Communicate with users (if necessary)

## Release Notes Template

```
What's New in v[VERSION]:

• [Feature] Brief description of new feature
• [Improvement] Description of enhancement  
• [Fix] Bug fix description
• [Performance] Optimization details

Thank you for using CF Stopwatch!
```

## Version History

### v1.1.0 - 2026-01-04
**Release Notes:**
```
What's New:

• Rebranded to CF Stopwatch with updated app name
• Improved overlay stability and performance
• Enhanced dark glass UI design
• Bug fixes and optimizations

Thank you for using CF Stopwatch!
```

**Checklist Completed:** ✅ (Date: 2026-01-04)
**Released to:** Not yet deployed to Play Store
**Status:** Ready for deployment

---

### v1.0.1 - 2025-12-25
**Release Notes:**
```
What's New:

• Auto-launch overlay when permissions are already granted
• Improved user experience
• Bug fixes

Thank you for using CF Stopwatch!
```

**Checklist Completed:** ✅
**Released to:** GitHub releases only
**Status:** Superseded by v1.1.0

---

### v1.0.0 - 2025-12-25
**Release Notes:**
```
Initial Release:

• System-wide stopwatch overlay
• Glassmorphism dark theme
• Drag-to-reposition functionality
• Accurate timer (mm:ss:ff)
• Foreground service for reliability

Thank you for trying CF Stopwatch!
```

**Checklist Completed:** ✅
**Released to:** GitHub releases only
**Status:** Superseded by v1.1.0
