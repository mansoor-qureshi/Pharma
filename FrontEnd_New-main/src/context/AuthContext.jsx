import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loginInfo, setLoginInfo] = useState(() => {
        const storedLoginInfo = localStorage.getItem('user');
        return {
            user: storedLoginInfo ? JSON.parse(storedLoginInfo) : null,
            isLoggedIn: storedLoginInfo ? true : false
        }
    })


    const login = (userInfo) => {
        localStorage.setItem('user', JSON.stringify(userInfo));
        setLoginInfo({ user: userInfo, isLoggedIn: true })
    };

    const logout = () => {
        localStorage.removeItem('user');
        setLoginInfo({ user: null, isLoggedIn: false })
    };

    return (
        <AuthContext.Provider value={{ loginInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('AuthContext must be used within a MyProvider');
    }

    return context
};
