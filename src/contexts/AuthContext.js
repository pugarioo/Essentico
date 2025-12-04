import { createContext, useState } from "react";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const login = async (email, password) => {
        setIsLoggingIn(true)

        const response = await fetch('http://localhost:8082/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "email": email, "password": password })
        })
        if (response.ok) {
            const data = await response.json();

            setIsAuthenticated(true);
            localStorage.setItem("token", data.token)
            localStorage.setItem("tokenType", data.tokenType)
            localStorage.setItem("user", data.user)
        } else {
            throw new Error('Login failed');
        }

        setIsLoggingIn(false)
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
    }

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};



export default AuthContext;
