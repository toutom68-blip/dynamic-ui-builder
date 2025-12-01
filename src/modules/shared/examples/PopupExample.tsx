import React from 'react';
import { DynamicButton } from '@/modules/shared/components/DynamicButton';
import { DynamicPopup } from '@/modules/shared/components/DynamicPopup';
import { usePopup } from '@/hooks/usePopup';
import { toast } from 'sonner';

/**
 * Example component demonstrating the usage of DynamicPopup
 * This can be used as a reference for implementing popups in your app
 */
export const PopupExample: React.FC = () => {
  const popup = usePopup();

  const handleDeleteConfirmation = () => {
    popup.showConfirmation(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Item deleted successfully');
      }
    );
  };

  const handleInfoPopup = () => {
    popup.showInfo(
      'Information',
      'This is an informational message. Click OK to dismiss.'
    );
  };

  const handleErrorPopup = () => {
    popup.showError(
      'Error Occurred',
      'Something went wrong. Please try again later.'
    );
  };

  const handleWarningPopup = () => {
    popup.showWarning(
      'Warning',
      'This action might have consequences. Are you sure you want to proceed?',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.info('Action completed');
      }
    );
  };

  const handleSuccessPopup = () => {
    popup.showSuccess(
      'Success!',
      'Your operation completed successfully.'
    );
  };

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-bold mb-6">Popup Examples</h2>
      
      <div className="flex flex-wrap gap-4">
        <DynamicButton onClick={handleDeleteConfirmation} variant="destructive">
          Show Confirmation
        </DynamicButton>
        
        <DynamicButton onClick={handleInfoPopup} variant="secondary">
          Show Info
        </DynamicButton>
        
        <DynamicButton onClick={handleErrorPopup} variant="destructive">
          Show Error
        </DynamicButton>
        
        <DynamicButton onClick={handleWarningPopup} variant="outline">
          Show Warning
        </DynamicButton>
        
        <DynamicButton onClick={handleSuccessPopup} variant="primary">
          Show Success
        </DynamicButton>
      </div>

      <DynamicPopup
        open={popup.isOpen}
        onOpenChange={popup.hidePopup}
        type={popup.config.type}
        title={popup.config.title}
        description={popup.config.description}
        confirmText={popup.config.confirmText}
        cancelText={popup.config.cancelText}
        onConfirm={popup.config.onConfirm}
        onCancel={popup.config.onCancel}
        showCancel={popup.config.showCancel}
      />
    </div>
  );
};
