import { useState, useRef, useCallback, useEffect } from 'react';
import { GeolocationState } from '../types';

export function useGeolocation() {
  const [geoState, setGeoState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    status: 'inactive',
    errorMessage: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoState((prev) => ({
        ...prev,
        status: 'unavailable',
        errorMessage: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setGeoState((prev) => ({
      ...prev,
      status: 'prompt',
      errorMessage: null,
    }));

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setGeoState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          status: 'granted',
          errorMessage: null,
        });
      },
      (error) => {
        let status: GeolocationState['status'] = 'unavailable';
        let message = 'Unable to retrieve location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            status = 'denied';
            message = 'GPS location permission was denied. Please allow location in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            status = 'unavailable';
            message = 'GPS signal unavailable. Ensure location/GPS services are turned on.';
            break;
          case error.TIMEOUT:
            status = 'timeout';
            message = 'Location request timed out while acquiring GPS fix.';
            break;
        }

        setGeoState((prev) => ({
          ...prev,
          status,
          errorMessage: message,
        }));
      },
      options
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGeoState((prev) => ({
      ...prev,
      status: 'inactive',
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    geoState,
    startWatchingLocation: startWatching,
    stopWatchingLocation: stopWatching,
  };
}

