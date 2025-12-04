import React, { createContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [data, setData] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

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

    return (
        <ProductContext.Provider value={{ data, isFetching }}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductContext;