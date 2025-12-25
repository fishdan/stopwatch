# Stopwatch Overlay

A completey free polished, minimal React Native stopwatch app for Android that stays on top of your screen even when you switch apps.

![Stopwatch Demo](https://via.placeholder.com/800x450.png?text=Stopwatch+Overlay+Demo)

## Features

- **System-Wide Overlay**: A floating stopwatch window that persists over all other apps.
- **Glassmorphism UI**: Modern, semi-transparent "Dark Glass" design with rounded corners.
- **Monospace Precision**: Accurate timer display (mm:ss:ff) using monospace fonts to prevent layout jitter.
- **Iconic Controls**: One-tap Play, Pause, Stop, and Close actions.
- **Foreground Service**: Ensures the stopwatch keeps running reliably in the background.
- **Drag-to-Reposition**: Easily move the overlay anywhere on your screen.

## Installation

You can download the latest standalone APK from the [Releases](https://github.com/fishdan/stopwatch/releases) page.

1. Download the `app-release.apk`.
2. Open the file on your Android device.
3. If prompted, allow "Install from unknown sources".
4. Open the app and tap **"Open System Overlay"**.
5. Grant the **"Display over other apps"** permission.

## Development

### Platform Support
- **Android**: Full system overlay via Native Foreground Service.
- **iOS**: In-app overlay fallback (System overlay is restricted on iOS).

### Tech Stack
- **React Native** (TypeScript)
- **Kotlin** (Android Native Side)
- **Gradle** (Build System)

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/fishdan/stopwatch.git
   cd stopwatch/StopwatchApp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run on Android:
   ```bash
   npx react-native run-android
   ```

## License
MIT
