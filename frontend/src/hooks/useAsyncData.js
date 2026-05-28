import { useCallback, useEffect, useState } from 'react';
import { useMountedRef } from './useMountedRef';
import { getApiErrorMessage } from '../utils/apiError';

export const useAsyncData = (asyncFn, deps = [], options = {}) => {
  const {
    immediate = true,
    fallbackError = 'No se pudo cargar la información'
  } = options;

  const mountedRef = useMountedRef();

  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(Boolean(immediate));
  const [error, setError] = useState('');

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError('');

    try {
      const result = await asyncFn(...args);

      if (!mountedRef.current) return null;

      setData(result);
      return result;
    } catch (err) {
      if (!mountedRef.current) return null;

      setError(getApiErrorMessage(err, fallbackError));
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    if (!immediate) return;

    execute().catch(() => {});
  }, [execute, immediate]);

  return {
    data,
    setData,
    loading,
    error,
    setError,
    execute
  };
};