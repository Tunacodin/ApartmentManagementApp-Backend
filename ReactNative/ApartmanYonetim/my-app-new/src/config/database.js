// Database configuration
export const DB_CONFIG = {
    password: 'Kj9#mP2$vL5nX8@qR3',
    // Diğer veritabanı yapılandırma bilgileri buraya eklenebilir
};

// Güvenlik için şifreyi hash'leme fonksiyonu
export const hashPassword = (password) => {
    // Burada şifreyi hash'leyebilirsiniz
    // Örnek: return bcrypt.hashSync(password, 10);
    return password;
};

// Şifre doğrulama fonksiyonu
export const verifyPassword = (password, hashedPassword) => {
    // Burada şifre doğrulaması yapabilirsiniz
    // Örnek: return bcrypt.compareSync(password, hashedPassword);
    return password === hashedPassword;
}; 