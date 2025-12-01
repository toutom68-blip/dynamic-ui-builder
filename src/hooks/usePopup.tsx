import { useState, useCallback } from 'react';
import { PopupType } from '@/modules/shared/components/DynamicPopup';

interface PopupConfig {
  type?: PopupType;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const usePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<PopupConfig>({
    title: '',
  });

  const showPopup = useCallback((popupConfig: PopupConfig) => {
    setConfig(popupConfig);
    setIsOpen(true);
  }, []);

  const hidePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  const showConfirmation = useCallback(
    (
      title: string,
      description?: string,
      onConfirm?: () => void | Promise<void>,
      onCancel?: () => void
    ) => {
      showPopup({
        type: 'confirmation',
        title,
        description,
        onConfirm,
        onCancel,
        showCancel: true,
      });
    },
    [showPopup]
  );

  const showInfo = useCallback(
    (title: string, description?: string, onConfirm?: () => void) => {
      showPopup({
        type: 'info',
        title,
        description,
        onConfirm,
        showCancel: false,
      });
    },
    [showPopup]
  );

  const showError = useCallback(
    (title: string, description?: string, onConfirm?: () => void) => {
      showPopup({
        type: 'error',
        title,
        description,
        onConfirm,
        showCancel: false,
      });
    },
    [showPopup]
  );

  const showWarning = useCallback(
    (title: string, description?: string, onConfirm?: () => void | Promise<void>) => {
      showPopup({
        type: 'warning',
        title,
        description,
        onConfirm,
        showCancel: false,
      });
    },
    [showPopup]
  );

  const showSuccess = useCallback(
    (title: string, description?: string, onConfirm?: () => void) => {
      showPopup({
        type: 'success',
        title,
        description,
        onConfirm,
        showCancel: false,
      });
    },
    [showPopup]
  );

  return {
    isOpen,
    config,
    hidePopup,
    showPopup,
    showConfirmation,
    showInfo,
    showError,
    showWarning,
    showSuccess,
  };
};
