import api, { unwrap } from './api';
import { API_ROUTES } from '@/config/routes';

const cleanQrToken = (rawValue: string) => {
  const raw = String(rawValue || '').trim();

  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw);

    return String(
      parsed?.qrToken ||
        parsed?.qr_token ||
        parsed?.token ||
        parsed?.value ||
        parsed?.data?.qrToken ||
        parsed?.data?.qr_token ||
        parsed?.data?.token ||
        raw
    ).trim();
  } catch {
    // Si viene como URL con ?token=...
    if (raw.includes('token=')) {
      try {
        const url = new URL(raw);
        return String(
          url.searchParams.get('token') ||
            url.searchParams.get('qrToken') ||
            raw
        ).trim();
      } catch {
        return raw;
      }
    }

    // Si viene con comillas por algún lector QR
    return raw.replace(/^"|"$/g, '').trim();
  }
};

export const accessService = {
  async scanQr(qrToken: string, gate = 'MAIN_GATE') {
    const cleanToken = cleanQrToken(qrToken);

    const response = await api.post(API_ROUTES.access.scan, {
      qrToken: cleanToken,
      gate
    });

    return unwrap<any>(response);
  }
};