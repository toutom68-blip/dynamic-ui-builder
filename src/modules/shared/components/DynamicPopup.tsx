import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';

export type PopupType = 'confirmation' | 'info' | 'warning' | 'error' | 'success';

interface DynamicPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: PopupType;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const DynamicPopup: React.FC<DynamicPopupProps> = ({
  open,
  onOpenChange,
  type = 'info',
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  showCancel = true,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      try {
        await onConfirm();
        onOpenChange(false);
      } catch (error) {
        console.error('Popup confirm error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  // Determine button variant based on type
  const getConfirmVariant = () => {
    switch (type) {
      case 'error':
      case 'warning':
        return 'destructive';
      case 'success':
        return 'default';
      default:
        return 'default';
    }
  };

  const defaultConfirmText = type === 'confirmation' 
    ? t('common.confirm') 
    : t('common.ok');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {type === 'confirmation' && showCancel && (
            <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
              {cancelText || t('common.cancel')}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={getConfirmVariant() === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isLoading ? t('common.loading') : (confirmText || defaultConfirmText)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
