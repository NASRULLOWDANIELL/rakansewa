import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, loginUser } from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('rakansewa_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      let user;
      
      // Admin mock creation / fallback
      if (email === 'admin@rakansewa.com' && password === 'admin123') {
        user = {
          id: 999,
          name: 'Admin',
          email: 'admin@rakansewa.com',
          role: 'Admin'
        };
      } else {
        // Use the backend authentication endpoint
        user = await loginUser(email, password);
      }

      if (user) {
        // Mock admin role since there is no admin role on backend model initially (or maybe there is)
        if (user.email === 'admin@rakansewa.com') {
          user.role = 'Admin';
        }
        setCurrentUser(user);
        sessionStorage.setItem('rakansewa_user', JSON.stringify(user));
        return user;
      }
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || "Failed to login");
    }
  };

  const register = async (name, email, password, role) => {
    try {
      // Create user using existing User API
      const newUser = await createUser({ name, email, password, role });
      return newUser;
    } catch (error) {
      console.error(error);
      throw new Error("Registration failed");
    }
  };

  const googleLogin = async (googleUser) => {
    try {
      const users = await getAllUsers();
      let user = users.find(u => u.email === googleUser.email);
      
      if (!user) {
        // Create user if not exists, default to Student role
        user = await createUser({ 
          name: googleUser.name, 
          email: googleUser.email, 
          password: 'google_oauth_no_password', 
          role: 'Student' 
        });
      }

      if (user.email === 'admin@rakansewa.com') {
        user.role = 'Admin';
      }

      setCurrentUser(user);
      sessionStorage.setItem('rakansewa_user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error(error);
      throw new Error("Google login failed");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('rakansewa_user');
  };

  const updateProfile = async (updatedData) => {
    try {
      const updatedUser = { ...currentUser, ...updatedData };
      
      // Save properly to backend if it's a real user (not dummy admin)
      if (currentUser.id && currentUser.id !== 999) {
        await updateUser(currentUser.id, updatedUser);
      }
      
      setCurrentUser(updatedUser);
      sessionStorage.setItem('rakansewa_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Update profile failed:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    googleLogin,
    updateProfile,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
