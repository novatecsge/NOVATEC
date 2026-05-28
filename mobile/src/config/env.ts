import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const fromProcess = (key: string) => {
  const value = (process.env as Record<string, string | undefined>)[key];
  return value && value.trim().length > 0 ? value : undefined;
};

export const env = {
  apiUrl: fromProcess('EXPO_PUBLIC_API_URL') ?? String(extra.apiUrl ?? 'http://10.0.2.2:3000/api/v1'),
  socketUrl: fromProcess('EXPO_PUBLIC_SOCKET_URL') ?? String(extra.socketUrl ?? 'http://10.0.2.2:3000')
};
