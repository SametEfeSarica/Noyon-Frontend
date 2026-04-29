import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // DEĞİŞEN KISIM BURASI: Sayfa yenilendiğinde localStorage'ı kontrol et.
  // Eğer 'userId' varsa (yani giriş yapmışsa), state otomatik olarak 'true' başlar.
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('userId') !== null;
  });

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);