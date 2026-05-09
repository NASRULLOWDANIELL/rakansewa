import React, { createContext, useContext, useState, useEffect } from 'react';
import { createUser, updateUser, loginUser, googleLoginUser } from '../services/api';

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
          role: 'Admin',
          emailVerified: true,
          isStudentVerified: true
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

  const register = async (name, email, password, role, matricNumber, uitmEmail) => {
    try {
      // Create user using existing User API
      const newUser = await createUser({ name, email, password, role, matricNumber, uitmEmail });
      return newUser;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const googleLogin = async (googleUser) => {
    try {
      // Use the new backend endpoint for Google login with auto-registration
      const response = await googleLoginUser(googleUser.name, googleUser.email);
      
      const user = response.user;
      const isNewUser = response.isNewUser;
      const message = response.message;

      if (user.email === 'admin@rakansewa.com') {
        user.role = 'Admin';
      }

      setCurrentUser(user);
      sessionStorage.setItem('rakansewa_user', JSON.stringify(user));
      
      return { user, isNewUser, message };
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || "Google login failed");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('rakansewa_user');
  };

  const updateProfile = async (updatedData) => {
    try {
      const updatedUser = { ...currentUser, ...updatedData };
      
      let savedUser = updatedUser;
      // Save properly to backend if it's a real user (not dummy admin)
      if (currentUser.id && currentUser.id !== 999) {
        savedUser = await updateUser(currentUser.id, updatedUser);
      }
      
      setCurrentUser(savedUser);
      sessionStorage.setItem('rakansewa_user', JSON.stringify(savedUser));
      return savedUser;
    } catch (error) {
      console.error("Update profile failed:", error);
      throw error;
    }
  };

  /**
   * Check if the current user is UiTM verified.
   * Admin and Google users with UiTM emails are considered verified.
   * For students: matricNumber must match UiTM email username.
   */
  const isUitmVerified = () => {
    if (!currentUser) return false;
    if (currentUser.id === 999) return true; // mock admin
    if (currentUser.role === 'Owner' || currentUser.role === 'Admin') return true;
    return currentUser.isStudentVerified === true;
  };

  const value = {
    currentUser,
    login,
    register,
    googleLogin,
    updateProfile,
    logout,
    loading,
    isUitmVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
