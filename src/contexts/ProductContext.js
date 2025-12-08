import React, { createContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [data, setData] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [discounts, setDiscounts] = useState([]);
    const [isFetchingDiscounts, setIsFetchingDiscounts] = useState(false);

    useEffect(() => {
        setIsFetching(true);
        fetch('http://localhost:8082/api/products')
            .then(response => response.json())
            .then(products => {
                setData(products);
                setIsFetching(false);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        setIsFetchingDiscounts(true);
        fetch('http://localhost:8082/api/discounts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch discounts');
                }
                return response.json();
            })
            .then(discountsData => {
                setDiscounts(discountsData);
                setIsFetchingDiscounts(false);
            })
            .catch(error => {
                console.error('Error fetching discounts:', error);
                setIsFetchingDiscounts(false);
            });
    }, []);

    // Function to validate a discount code
    const validateDiscountCode = (code) => {
        if (!code || !code.trim()) {
            return { valid: false, message: 'Please enter a discount code' };
        }

        const discount = discounts.find(
            d => d.discount_code?.toUpperCase() === code.trim().toUpperCase()
        );

        if (!discount) {
            return { valid: false, message: 'Invalid discount code' };
        }

        if (!discount.is_active) {
            return { valid: false, message: 'This discount code is not active' };
        }

        // Check expiration date
        if (discount.expiration_date) {
            const expirationDate = new Date(discount.expiration_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (expirationDate < today) {
                return { valid: false, message: 'This discount code has expired' };
            }
        }

        return { valid: true, discount };
    };

    return (
        <ProductContext.Provider value={{ 
            data, 
            isFetching, 
            discounts, 
            isFetchingDiscounts,
            validateDiscountCode 
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductContext;