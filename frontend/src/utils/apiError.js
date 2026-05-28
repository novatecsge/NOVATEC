export const getApiErrorMessage = (error, fallback = 'Ocurrió un error inesperado') => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};