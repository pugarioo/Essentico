import { createContext, useState, useEffect } from "react";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Add this


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setIsCheckingAuth(false); // Mark as done checking
    }, []);

    const login = async (email, password) => {
        setIsLoggingIn(true)

        try {
            const response = await fetch('http://localhost:8082/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ "email": email, "password": password })
            })

            if (response.ok) {
                const data = await response.json();

                setIsAuthenticated(true);
                localStorage.setItem("token", data.token)
                localStorage.setItem("tokenType", data.tokenType)
                localStorage.setItem("user", JSON.stringify(data.user))
            } else {
                // Get error message from backend response
                const errorData = await response.json().catch(() => ({}));
                
                // Handle backend error format:
                // 401: { message: 'Invalid email or password', errors: { email: [...] } }
                // 422: { message: 'Validation failed', errors: {...} }
                // 500: { message: '...', error: '...' }
                let errorMessage = errorData.message || 'Login failed';
                
                // If there are validation errors, extract them
                if (errorData.errors) {
                    const errorMessages = Object.values(errorData.errors)
                        .flat()
                        .filter(msg => msg)
                        .join(', ');
                    if (errorMessages) {
                        errorMessage = errorMessages;
                    }
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
                
                throw new Error(errorMessage);
            }
        } catch (error) {
            // Re-throw the error so Login component can catch it
            throw error;
        } finally {
            // Always reset loading state, even if there's an error
            setIsLoggingIn(false)
        }
    };

    const logout = async () => {
        setIsLoggingOut(true)
        
        const response = await fetch('http://localhost:8082/api/logout', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            
        })

        if (response.ok) {
            setIsAuthenticated(false);
            localStorage.removeItem("token")
            localStorage.removeItem("tokenType")
            localStorage.removeItem("user")
        } else {
            throw new Error('Logout failed');
        }

        setIsLoggingOut(false)
    };

    const contextData = {
        login,
        logout,
        isAuthenticated,
        setIsAuthenticated,
        isLoggingIn,
        isLoggingOut,
        isCheckingAuth, // Add this
    }

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};



export default AuthContext;
