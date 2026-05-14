export const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
};

export const toIsoStringSafe = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
};