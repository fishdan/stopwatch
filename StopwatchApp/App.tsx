import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const TICK_MS = 50;
const BUTTON_SIZE = 48;

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
              window.width - styles.overlay.width,
            );
            const nextY = clamp(
              gesture.moveY - dragOffset.current.dy,
              0,
              window.height - styles.overlay.minHeight,
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
      <Text style={styles.timer} selectable={false}>
        {formatTime(elapsedMs)}
      </Text>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={handleStartStop}>
          <Text style={styles.buttonText}>{running ? 'Stop' : 'Start'}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.closeButton]}
          onPress={handleClose}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
};

function App(): React.JSX.Element {
  return (
    <View style={styles.app}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <StopwatchOverlay />
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
    width: 260,
    minHeight: 120,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 24, 32, 0.9)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  timer: {
    fontSize: 42,
    color: '#e6f0ff',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    height: BUTTON_SIZE,
    borderRadius: 12,
    backgroundColor: '#1f2a3a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#3a1f1f',
  },
  buttonText: {
    color: '#e6f0ff',
    fontSize: 16,
    fontWeight: '600',
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
