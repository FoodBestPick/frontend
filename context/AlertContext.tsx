import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertModal } from '../presentation/components/AlertModal';

interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({
    message: '',
    title: '알림',
    confirmText: '확인',
    showCancel: false,
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setConfig({
      title: options.title || '알림',
      message: options.message,
      confirmText: options.confirmText || '확인',
      cancelText: options.cancelText || '취소',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      showCancel: options.showCancel || false,
    });
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = () => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    hideAlert();
  };

  const handleCancel = () => {
    if (config.onCancel) {
      config.onCancel();
    }
    hideAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertModal
        visible={visible}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        showCancel={config.showCancel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
