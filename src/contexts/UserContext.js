import { createContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

    // Function to load user from localStorage
    const loadUser = () => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const parsedUser = JSON.parse(userStr);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        loadUser();
        
        // Listen for custom event when user is updated
        const handleUserUpdate = () => {
            loadUser();
        };
        
        window.addEventListener('userUpdated', handleUserUpdate);
        
        // Check localStorage periodically
        const interval = setInterval(loadUser, 500);
        
        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
            clearInterval(interval);
        };
    }, []);

    async function updateUser(formData) {
        setIsUpdatingUser(true);

        try {
            const response = await fetch('http://localhost:8082/api/user', {
                method: 'POST',
                headers: {
                    // Don't set Content-Type header - browser will set it with boundary for FormData
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: formData // FormData object
            });
            
            if (response.ok) {
                const data = await response.json();
                const userObj = typeof data === 'string' ? JSON.parse(data) : data;
                console.log(userObj);
                setUser(userObj);
                localStorage.setItem("user", JSON.stringify(userObj.user));
                window.dispatchEvent(new Event('userUpdated'));
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update user');
            }
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        } finally {
            setIsUpdatingUser(false);
        }
    }

    const contextData = {
        user,
        updateUser,
        isUpdatingUser,
    }

    return (
        <UserContext.Provider value={contextData}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContext;