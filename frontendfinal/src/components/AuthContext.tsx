import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserData {
  user_id: any;
  name: string;
  email: string;
  joinDate: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  updateUser: (userData: UserData) => void; // Added this function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Added updateUser function
  const updateUser = (userData: UserData) => {
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('📡 Sending login request...', { email, password });
      
      const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📊 Login response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Login API response:', responseData);
        
        // The user data is inside responseData.user, not directly in responseData
        const userDataFromAPI = responseData.user || responseData;
        
        console.log('👤 User data from API:', userDataFromAPI);
        
        const userData = {
          user_id: userDataFromAPI.user_id || userDataFromAPI.id,
          name: userDataFromAPI.name || userDataFromAPI.username,
          email: userDataFromAPI.email,
          joinDate: userDataFromAPI.joinDate || userDataFromAPI.created_at || new Date().toISOString(),
        };
        
        console.log('👤 Processed user data:', userData);
        
        setUser(userData);
        setIsLoggedIn(true);
        
        // Store token in localStorage if provided
        if (responseData.token) {
          localStorage.setItem('authToken', responseData.token);
          console.log('🔐 Token stored:', responseData.token);
        } else {
          console.log('⚠️ No token returned from API');
          // If no token, we might need to use user_id as a temporary identifier
          localStorage.setItem('authToken', userData.user_id?.toString() || 'temp-token');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Login failed:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Real API call for signup
      const response = await fetch('http://127.0.0.1:8000/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Signup API response:', responseData);
        
        // The user data is inside responseData.user, not directly in responseData
        const userDataFromAPI = responseData.user || responseData;
        
        const userData = {
          user_id: userDataFromAPI.user_id || userDataFromAPI.id,
          name: userDataFromAPI.name || userDataFromAPI.username,
          email: userDataFromAPI.email,
          joinDate: userDataFromAPI.joinDate || userDataFromAPI.created_at || new Date().toISOString(),
        };
        
        setUser(userData);
        setIsLoggedIn(true);
        
        // Store token in localStorage if provided
        if (responseData.token) {
          localStorage.setItem('authToken', responseData.token);
        } else {
          // If no token, use user_id as temporary identifier
          localStorage.setItem('authToken', userData.user_id?.toString() || 'temp-token');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
  };

  // Check for existing token on app load - Fixed useState to useEffect
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token and get user data
      fetch('http://127.0.0.1:8000/verify/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Token invalid');
      })
      .then(userData => {
        setUser({
          user_id: userData.user_id,
          name: userData.name || userData.username,
          email: userData.email,
          joinDate: userData.joinDate || userData.created_at,
        });
        setIsLoggedIn(true);
      })
      .catch(() => {
        localStorage.removeItem('authToken');
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        signup,
        logout,
        updateUser, // Added this to the context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}