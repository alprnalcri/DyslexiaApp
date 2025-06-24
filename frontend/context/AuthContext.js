import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

// Create a ref to store the signOut function
let globalSignOut = null;

export const triggerGlobalSignOut = async () => {
  if (globalSignOut) {
    return globalSignOut();
  }
  // If for some reason globalSignOut isn't available, still try to remove the token
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (e) {
    console.error('Failed to remove token in global sign out', e);
  }
};

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        console.log("📦 Token in storage:", token);
        setUserToken(token);
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Create a memoized signOut function
  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
    } catch (e) {
      console.error('Failed to remove token', e);
      throw e;
    }
  }, []);

  // Update the global signOut reference when it changes
  useEffect(() => {
    globalSignOut = signOut;
    return () => {
      globalSignOut = null;
    };
  }, [signOut]);

  const authContext = React.useMemo(
    () => ({
      signIn: async (token) => {
        try {
          await AsyncStorage.setItem('userToken', token);
          setUserToken(token);
        } catch (e) {
          console.error('Failed to save token', e);
          throw new Error('Failed to sign in');
        }
      },
      signOut,
      userToken,
      isLoading,
    }),
    [userToken, isLoading, signOut]
  );

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
