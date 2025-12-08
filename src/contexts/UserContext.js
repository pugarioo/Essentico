import { createContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

    // Function to load user from localStorage
    const loadUser = () => {
        const userStr = localStorage.getItem("user");
        if (userStr && userStr.trim() !== "") {
            try {
                const parsedUser = JSON.parse(userStr);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
                // Clear corrupted data to prevent infinite loop
                localStorage.removeItem("user");
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
        
        // Check localStorage periodically (reduced frequency to prevent excessive checks)
        const interval = setInterval(loadUser, 2000);
        
        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
            clearInterval(interval);
        };
    }, []);

    async function updateUser(formData) {
        setIsUpdatingUser(true);

        try {
            // Check if current user is admin and if formData contains user_id (admin updating another user)
            const isAdmin = user && user.role === 'admin';
            const userIdToUpdate = formData.get('user_id');
            
            let url, headers;
            
            if (isAdmin && userIdToUpdate) {
                // Admin updating another user - use /api/users/{id} route without token
                url = `http://localhost:8082/api/users/${userIdToUpdate}`;
                headers = {
                    // Don't set Content-Type header - browser will set it with boundary for FormData
                    // No Authorization header as requested
                };
                // Remove user_id from formData since it's in the URL
                formData.delete('user_id');
            } else {
                // Regular user updating themselves - use /api/user route with token
                url = 'http://localhost:8082/api/user';
                headers = {
                    // Don't set Content-Type header - browser will set it with boundary for FormData
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                };
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData // FormData object
            });
            
            if (response.ok) {
                const data = await response.json();
                const userObj = typeof data === 'string' ? JSON.parse(data) : data;
                console.log(userObj);
                // Handle both response structures: { user: {...} } or user object directly
                const userData = userObj.user || userObj;
                
                // Only update current user state if updating self, not when admin updates another user
                if (!isAdmin || !userIdToUpdate) {
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                    window.dispatchEvent(new Event('userUpdated'));
                }
                
                return userData;
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