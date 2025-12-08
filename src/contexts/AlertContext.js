import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AlertModal from '../components/AlertModal';

const AlertContext = createContext({
  alert: async () => {},
  confirm: async () => false,
});

export const AlertProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    show: false,
    title: 'Notice',
    message: '',
    variant: 'primary',
    confirmLabel: 'OK',
    cancelLabel: 'Close',
    type: 'alert', // 'alert' | 'confirm'
    resolve: null,
    isProcessing: false,
  });

  const closeModal = useCallback((result = false) => {
    setModalState(prev => {
      if (prev.resolve) {
        prev.resolve(result);
      }
      return { ...prev, show: false, resolve: null, isProcessing: false };
    });
  }, []);

  const alert = useCallback(({ title = 'Notice', message = '', variant = 'primary', confirmLabel = 'OK' } = {}) => {
    return new Promise(resolve => {
      setModalState({
        show: true,
        title,
        message,
        variant,
        confirmLabel,
        cancelLabel: 'Close',
        type: 'alert',
        resolve,
        isProcessing: false,
      });
    });
  }, []);

  const confirm = useCallback(
    ({
      title = 'Confirm',
      message = 'Are you sure?',
      variant = 'primary',
      confirmLabel = 'Yes',
      cancelLabel = 'No',
    } = {}) => {
      return new Promise(resolve => {
        setModalState({
          show: true,
          title,
          message,
          variant,
          confirmLabel,
          cancelLabel,
          type: 'confirm',
          resolve,
          isProcessing: false,
        });
      });
    },
    []
  );

  const handleCancel = useCallback(() => closeModal(false), [closeModal]);
  const handleConfirm = useCallback(() => closeModal(true), [closeModal]);

  // Override native alert to route through the modal (keep confirm native to avoid sync issues)
  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (msg) => {
      alert({ title: 'Notice', message: msg || '' });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [alert]);

  const value = useMemo(
    () => ({
      alert,
      confirm,
    }),
    [alert, confirm]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertModal
        show={modalState.show}
        title={modalState.title}
        message={modalState.message}
        variant={modalState.variant}
        confirmLabel={modalState.confirmLabel}
        cancelLabel={modalState.cancelLabel}
        onConfirm={modalState.type === 'confirm' ? handleConfirm : () => closeModal(true)}
        onCancel={handleCancel}
        isProcessing={modalState.isProcessing}
      />
    </AlertContext.Provider>
  );
};

export default AlertContext;

