import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  Dimensions,
  NativeModules,
  PanResponder,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const TICK_MS = 50;
const BUTTON_SIZE = 48;
const OVERLAY_WIDTH = 260;
const OVERLAY_HEIGHT = 120;

type OverlayPermissionModule = {
  isGranted: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
};

const OverlayPermission = NativeModules
  .OverlayPermission as OverlayPermissionModule | undefined;

const now = () =>
  typeof performance !== 'undefined' && performance.now
    ? performance.now()
    : Date.now();

const formatTime = (elapsedMs: number) => {
  const totalHundredths = Math.floor(elapsedMs / 10);
  const hundredths = totalHundredths % 100;
  const totalSeconds = Math.floor(totalHundredths / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  const pad = (v: number, len = 2) => v.toString().padStart(len, '0');
  return `${pad(minutes)}:${pad(seconds)}:${pad(hundredths)}`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const StopwatchOverlay = () => {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState({x: 24, y: 120});
  // Track whether Android overlay permission has been granted; default true on iOS.
  const [overlayAllowed, setOverlayAllowed] = useState(
    Platform.OS !== 'android',
  );
  const dragOffset = useRef({dx: 0, dy: 0});
  const window = Dimensions.get('window');

  useEffect(() => {
    if (!running) {
      return;
    }
    const startAt = now() - elapsedMs;
    const interval = setInterval(() => {
      setElapsedMs(now() - startAt);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [running, elapsedMs]);

  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS !== 'android') {
        return;
      }
      try {
        const granted = await OverlayPermission?.isGranted?.();
        if (typeof granted === 'boolean') {
          setOverlayAllowed(granted);
        }
      } catch (err) {
        console.warn('Overlay permission check failed', err);
      }
    };
    checkPermission();
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gesture) => {
          dragOffset.current = {
            dx: gesture.x0 - position.x,
            dy: gesture.y0 - position.y,
          };
        },
        onPanResponderMove: (_, gesture) => {
          setPosition(() => {
            const nextX = clamp(
              gesture.moveX - dragOffset.current.dx,
              0,
              window.width - OVERLAY_WIDTH,
            );
            const nextY = clamp(
              gesture.moveY - dragOffset.current.dy,
              0,
              window.height - OVERLAY_HEIGHT,
            );
            return {x: nextX, y: nextY};
          });
        },
      }),
    [position.x, position.y, window.height, window.width],
  );

  const handleStartStop = () => setRunning(prev => !prev);

  const handleClear = () => {
    setRunning(false);
    setElapsedMs(0);
  };

  const handleClose = () => {
    setRunning(false);
    setElapsedMs(0);
    setVisible(false);
  };

  const handleRequestOverlay = async () => {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      const granted = await OverlayPermission?.requestPermission?.();
      if (granted) {
        setOverlayAllowed(true);
        return;
      }
      const recheck = await OverlayPermission?.isGranted?.();
      setOverlayAllowed(!!recheck);
      if (!recheck) {
        Alert.alert(
          'Overlay permission needed',
          'Enable “Display over other apps” for StopwatchApp to keep the timer on top.',
        );
      }
    } catch (err) {
      console.warn('Overlay permission request failed', err);
      Alert.alert(
        'Overlay permission',
        'Unable to request overlay permission. Please enable it manually in system settings.',
      );
    }
  };

  if (!visible) {
    return (
      <View style={styles.reopenContainer}>
        <Pressable style={styles.reopenButton} onPress={() => setVisible(true)}>
          <Text style={styles.reopenText}>Open Stopwatch</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.overlay,
        {
          top: position.y,
          left: position.x,
        },
      ]}
      {...panResponder.panHandlers}>
      {Platform.OS === 'android' && !overlayAllowed ? (
        <Pressable
          style={styles.permissionBadge}
          onPress={handleRequestOverlay}>
          <Text style={styles.permissionText}>Enable overlay permission</Text>
        </Pressable>
      ) : null}
      <Text style={styles.timer} selectable={false}>
        {formatTime(elapsedMs)}
      </Text>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={handleStartStop}>
          <Text style={styles.iconText}>{running ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleClear}>
          <Text style={styles.iconText}>⏹</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.closeButton]}
          onPress={handleClose}>
          <Text style={styles.iconText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
};

function App(): React.JSX.Element {
  const [overlayAllowed, setOverlayAllowed] = useState<boolean | null>(null);

  const checkAndLaunch = async () => {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      const isGranted = await OverlayPermission?.isGranted?.();
      setOverlayAllowed(!!isGranted);

      if (isGranted) {
        const StopwatchModule = NativeModules.StopwatchModule;
        if (StopwatchModule) {
          StopwatchModule.start();
          // Give a bit of time for the service to start before minimizing
          setTimeout(() => {
            StopwatchModule.minimize();
          }, 300);
        }
      }
    } catch (e) {
      console.warn('Auto-launch check failed', e);
    }
  };

  useEffect(() => {
    // Initial check on mount
    checkAndLaunch();

    // Re-check and auto-minimize every time the app comes to the foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkAndLaunch();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleRequestOverlay = async () => {
    try {
      const granted = await OverlayPermission?.requestPermission?.();
      if (granted) {
        setOverlayAllowed(true);
        NativeModules.StopwatchModule?.start();
        setTimeout(() => {
          NativeModules.StopwatchModule?.minimize();
        }, 100);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to request overlay permission.');
    }
  };

  if (overlayAllowed === null) {
    return <View style={styles.app} />;
  }

  if (overlayAllowed === false) {
    return (
      <View style={styles.app}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.reopenContainer}>
          <Text style={[styles.reopenText, { marginBottom: 20, textAlign: 'center' }]}>
            Stopwatch operates as a system overlay.
          </Text>
          <Pressable style={styles.reopenButton} onPress={handleRequestOverlay}>
            <Text style={styles.reopenText}>Enable Overlay & Start</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.reopenContainer}>
        <Text style={styles.reopenText}>Stopwatch is running in overlay mode</Text>
        <Pressable 
          style={[styles.reopenButton, { marginTop: 20 }]} 
          onPress={() => NativeModules.StopwatchModule?.minimize()}>
          <Text style={styles.reopenText}>Minimize App</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  overlay: {
    position: 'absolute',
    width: OVERLAY_WIDTH,
    minHeight: OVERLAY_HEIGHT,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 18, 18, 0.85)', // Dark Glass
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 0, 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timer: {
    fontSize: 38,
    color: '#ffffff',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  permissionBadge: {
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#5c3b00',
  },
  permissionText: {
    color: '#ffdca8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    flex: 1,
    height: BUTTON_SIZE,
    borderRadius: 24, // Iconic circle/pill
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reopenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f1115',
  },
  reopenButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#1f2a3a',
    borderRadius: 12,
  },
  reopenText: {
    color: '#e6f0ff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
