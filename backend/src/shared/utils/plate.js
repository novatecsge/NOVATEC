const normalizePlate = (plate) => {
  return String(plate || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .trim();
};

module.exports = {
  normalizePlate
};