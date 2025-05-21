// Para birimi formatı
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0 ₺';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

// Tarih formatı
export const formatDate = (dateString) => {
  if (!dateString || dateString === "0001-01-01T00:00:00") return "Belirtilmemiş";
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Kart numarası formatı (4'lü gruplar halinde)
export const formatCardNumber = (text) => {
  const cleaned = text.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

// Son kullanma tarihi formatı (AA/YY)
export const formatExpiryDate = (text) => {
  const cleaned = text.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
}; 