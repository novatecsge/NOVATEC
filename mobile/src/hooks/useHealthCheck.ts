import { useCallback, useState } from 'react';
import { healthService } from '@/services/health.service';
import { getErrorMessage } from '@/services/api';

export const useHealthCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const check = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await healthService.check();
      setStatus('ok');
      setMessage(result?.service || 'Backend conectado correctamente');
      return true;
    } catch (error) {
      setStatus('error');
      setMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { check, isChecking, status, message };
};
