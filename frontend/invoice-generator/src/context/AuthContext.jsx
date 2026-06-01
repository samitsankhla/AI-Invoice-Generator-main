import React, { createContext, useContext,useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [shouldRedirectAfterLogout, setShouldRedirectAfterLogout] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Handle logout redirect
    useEffect(() => {
        if (shouldRedirectAfterLogout && !isAuthenticated) {
            setShouldRedirectAfterLogout(false);
            window.location.replace('/');
        }
    }, [shouldRedirectAfterLogout, isAuthenticated]);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            if (token && userData) {
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            
        } catch (error) {
            console.error("Failed to check auth status:", error);
            logout();
        } finally {
            setLoading(false);
        }
    }

    const login = async (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Update state
        setUser(null);
        setIsAuthenticated(false);
        
        // Set flag to redirect after state update
        setShouldRedirectAfterLogout(true);
    };

    const updateUser = (updatedUser) => {
        const newUserData = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
    }

    const isProfileComplete = () => {
        if (!user) return false;
        return !!(user.businessName && user.businessAddress && user.address && user.phone);
    }

    const value = { user, loading, login, logout, updateUser, isAuthenticated, checkAuthStatus, isProfileComplete };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
