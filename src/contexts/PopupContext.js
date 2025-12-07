import React, { createContext, useState } from 'react';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
    const [popup, setPopup] = useState({
        isVisible: false,
        product: null,
        quantity: null,
        onConfirm: null
    });

    function showPopup(product, onConfirmCallback) {
        setPopup({
            isVisible: true,
            product: product,
            onConfirm: (quantity) => onConfirmCallback(quantity)
        });
    }

    function hidePopup() {
        setPopup({ isVisible: false, product: null, onConfirm: null });
    }

    return (
        <PopupContext.Provider value={{ popup, showPopup, hidePopup }}>
            {children}
        </PopupContext.Provider>
    );
};

export default PopupContext;