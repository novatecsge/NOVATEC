import { useState } from 'react';
import { getApiErrorMessage } from '@/utils/apiError';

export const useAsyncAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async <T,>(callback: () => Promise<T>): Promise<T | null> => {
    setLoading(true); setError(null);
    try { return await callback(); }
    catch (err) { setError(getApiErrorMessage(err)); return null; }
    finally { setLoading(false); }
  };

  return { loading, error, run, setError };
};
