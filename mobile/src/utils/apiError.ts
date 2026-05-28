export const getApiErrorMessage = (error: unknown): string => {
  const anyError = error as any;
  return (
    anyError?.response?.data?.message ||
    anyError?.message ||
    'Ocurrió un error inesperado. Intenta nuevamente.'
  );
};
