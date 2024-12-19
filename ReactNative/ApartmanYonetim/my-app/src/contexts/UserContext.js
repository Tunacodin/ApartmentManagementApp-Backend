import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({
    role: '', // 'admin', 'tenant' vb.
    name: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    createdAt: '',
    apartments: [], // Apartman bilgileri
    paymentInfo: {}, // Ödeme bilgileri
    tenantDetails: {}, // Kiracıya özel bilgiler
  });

  // Tüm bilgiler için güncelleme fonksiyonu
  const updatePartialInfo = (data) => {
    setUserInfo((prev) => ({ ...prev, ...data }));
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, updatePartialInfo }}>
      {children}
    </UserContext.Provider>
  );
};
