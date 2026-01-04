# Internal Testing Plan: CF Stopwatch

This plan is for internal testers invited via the Google Play Console Internal Testing track.

## Tester Objectives
1. Verify the "System Overlay" permission flow is intuitive.
2. Ensure the timer is accurate and doesn't drift.
3. Confirm the overlay remains visible and functional while using other apps.
4. Identify any UI/UX friction in the new "CF Stopwatch" branding.

## Test Matrix

### 1. Permission & Launch
- **Action**: Open app for the first time.
- **Expectation**: Clear prompt for "Display over other apps".
- **Action**: Grant permission and return to app.
- **Expectation**: Overlay should launch automatically or via button.

### 2. Core Timer Logic
- **Action**: Start timer, let run for 5 minutes while using another app (e.g., Chrome/YouTube).
- **Expectation**: Timer stays on top. No lag in hundredths display.
- **Action**: Pause, Clear, and Resume.
- **Expectation**: Monotonic precision (no "jumps" in time).

### 3. Interaction & Gestures
- **Action**: Drag the overlay to all four corners of the screen.
- **Expectation**: Smooth movement, no "stuttering," and it stays within screen bounds.
- **Action**: Tap buttons while dragging.
- **Expectation**: Buttons should not trigger accidentally during a drag.

### 4. Lifecycle & System
- **Action**: Lock the screen, wait 1 minute, unlock.
- **Expectation**: Timer continues correctly (Android service should persist).
- **Action**: Force close the main app from "Recents".
- **Expectation**: The overlay should remain visible (as it's a separate Foreground Service).

## Feedback Loop
Please report results in the following format:
- **Device Model**: (e.g., Pixel 7)
- **Android Version**: (e.g., Android 14)
- **Result**: PASS / FAIL
- **Notes/Bugs**: Describe any issues or quirks.
