import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserByEmail, saveUser, initDB } from '../lib/db';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  isLoggedIn: false,
  email: 'sanjay@biomed.org',
  firstName: 'Sanjay',
  lastName: 'Grs',
  institution: 'Biomedical Institute',
  role: 'Researcher'
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('plga_user_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_USER;
  });

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch(err => console.error('DB Init Error in AuthProvider:', err));
  }, []);

  const login = async (email, password) => {
    let fName = 'Sanjay';
    let lName = 'Grs';

    if (email) {
      if (email.includes('google')) {
        fName = 'Google';
        lName = 'Researcher';
      } else {
        const prefix = email.split('@')[0];
        fName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }

    const newSession = {
      isLoggedIn: true,
      email: email || 'sanjay@biomed.org',
      firstName: fName,
      lastName: lName,
      institution: 'Biomedical Institute',
      role: 'Researcher'
    };

    setSession(newSession);
    localStorage.setItem('plga_user_session', JSON.stringify(newSession));

    // Async background sync with SQLite
    getUserByEmail(email)
      .then(dbUser => {
        if (!dbUser) {
          saveUser({
            email,
            firstName: defaultFirstName,
            lastName: 'Grs',
            institution: 'Biomedical Institute',
            role: 'Researcher',
            password
          }).catch(e => console.warn('Background saveUser warning:', e));
        } else {
          setSession(prev => ({
            ...prev,
            firstName: dbUser.first_name || prev.firstName,
            lastName: dbUser.last_name || prev.lastName,
            institution: dbUser.institution || prev.institution,
            role: dbUser.role || prev.role
          }));
        }
      })
      .catch(err => console.warn('Background db query warning:', err));

    return newSession;
  };

  const signup = async (userData) => {
    const userToSave = {
      email: userData.email,
      firstName: userData.firstName || 'Sanjay',
      lastName: userData.lastName || 'Grs',
      institution: userData.institution || 'Biomedical Institute',
      role: userData.role || 'Researcher',
      password: userData.password
    };

    await saveUser(userToSave);

    const newSession = {
      isLoggedIn: true,
      email: userToSave.email,
      firstName: userToSave.firstName,
      lastName: userToSave.lastName,
      institution: userToSave.institution,
      role: userToSave.role
    };

    setSession(newSession);
    localStorage.setItem('plga_user_session', JSON.stringify(newSession));
    return newSession;
  };

  const logout = () => {
    const cleared = { ...DEFAULT_USER, isLoggedIn: false };
    setSession(cleared);
    localStorage.removeItem('plga_user_session');
  };

  return (
    <AuthContext.Provider value={{ session, login, signup, logout, dbReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
