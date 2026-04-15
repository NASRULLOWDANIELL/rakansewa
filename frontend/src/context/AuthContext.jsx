import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllUsers, createUser } from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('rakansewa_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const users = await getAllUsers();
      // Simple client-side mock check since backend doesn't have login endpoint
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        // Mock admin role since there is no admin role on backend model initially (or maybe there is)
        if (user.email === 'admin@rakansewa.com') {
          user.role = 'Admin';
        }
        setCurrentUser(user);
        localStorage.setItem('rakansewa_user', JSON.stringify(user));
        return user;
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to login");
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
      localStorage.setItem('rakansewa_user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error(error);
      throw new Error("Google login failed");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rakansewa_user');
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    localStorage.setItem('rakansewa_user', JSON.stringify(updatedUser));
    return updatedUser;
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
