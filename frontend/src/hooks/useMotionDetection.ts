import { useState, useEffect, useRef, useCallback } from 'react';
import { MotionState } from '../types';

interface UseMotionDetectionOptions {
  threshold?: number; // m/s^2 magnitude trigger threshold
  cooldownMs?: number; // milliseconds between triggers
  onJoltDetected?: (score: number) => void;
}

export function useMotionDetection({
  threshold = 19.5,
  cooldownMs = 3000,
  onJoltDetected,
}: UseMotionDetectionOptions = {}) {
  const [motionState, setMotionState] = useState<MotionState>({
    active: false,
    magnitude: 0,
    peakJolt: 0,
    lastDetectionTime: null,
    permissionState: 'unknown',
    isSupported: typeof window !== 'undefined' && 'DeviceMotionEvent' in window,
    errorMessage: null,
  });

  const lastTriggerRef = useRef<number>(0);
  const callbackRef = useRef(onJoltDetected);
  callbackRef.current = onJoltDetected;

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    // Prefer acceleration without gravity if provided, fallback to accelerationIncludingGravity
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) {
      return;
    }

    const ax = acc.x || 0;
    const ay = acc.y || 0;
    const az = acc.z || 0;

    // Total vector magnitude
    let mag = Math.sqrt(ax * ax + ay * ay + az * az);

    // If using accelerationIncludingGravity, subtract earth gravity baseline ~9.8
    if (!event.acceleration && event.accelerationIncludingGravity) {
      mag = Math.max(0, mag - 9.8);
    }

    const roundedMag = Math.round(mag * 10) / 10;
    const now = Date.now();

    setMotionState((prev) => ({
      ...prev,
      magnitude: roundedMag,
      peakJolt: Math.max(prev.peakJolt, roundedMag),
    }));

    // Check if threshold is breached and cooldown has elapsed
    if (roundedMag >= threshold && now - lastTriggerRef.current >= cooldownMs) {
      lastTriggerRef.current = now;
      setMotionState((prev) => ({
        ...prev,
        lastDetectionTime: now,
      }));
      if (callbackRef.current) {
        callbackRef.current(roundedMag);
      }
    }
  }, [threshold, cooldownMs]);

  const requestPermissionAndStart = useCallback(async (): Promise<boolean> => {
    if (!motionState.isSupported) {
      setMotionState((prev) => ({
        ...prev,
        permissionState: 'unsupported',
        errorMessage: 'DeviceMotionEvent API not supported on this browser or platform.',
      }));
      return false;
    }

    try {
      // iOS 13+ requires explicit user permission via requestPermission
      const DeviceMotionEventWithPermission = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceMotionEventWithPermission.requestPermission === 'function') {
        const response = await DeviceMotionEventWithPermission.requestPermission();
        if (response !== 'granted') {
          setMotionState((prev) => ({
            ...prev,
            permissionState: 'denied',
            active: false,
            errorMessage: 'Motion sensor permission was denied in your browser.',
          }));
          return false;
        }
      }

      window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });

      setMotionState((prev) => ({
        ...prev,
        active: true,
        permissionState: 'granted',
        errorMessage: null,
      }));
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initialize motion sensors';
      setMotionState((prev) => ({
        ...prev,
        active: false,
        permissionState: 'denied',
        errorMessage: message,
      }));
      return false;
    }
  }, [handleDeviceMotion, motionState.isSupported]);

  const stopMonitoring = useCallback(() => {
    window.removeEventListener('devicemotion', handleDeviceMotion);
    setMotionState((prev) => ({
      ...prev,
      active: false,
      magnitude: 0,
    }));
  }, [handleDeviceMotion]);

  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [handleDeviceMotion]);

  return {
    motionState,
    startMotionDetection: requestPermissionAndStart,
    stopMotionDetection: stopMonitoring,
  };
}

