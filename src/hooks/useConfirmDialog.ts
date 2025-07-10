import { useCallback } from 'react';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmDialogState {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  confirmDeletion: (itemName: string, itemType?: string) => Promise<boolean>;
  confirmUnsavedChanges: (action?: string) => Promise<boolean>;
}

export function useConfirmDialog(): ConfirmDialogState {
  const confirm = useCallback(async (options: ConfirmDialogOptions): Promise<boolean> => {
    const { message, title, confirmText = 'Confirm', cancelText = 'Cancel' } = options;
    
    const fullMessage = title ? `${title}\n\n${message}` : message;
    return window.confirm(fullMessage);
  }, []);

  const confirmDeletion = useCallback(async (
    itemName: string, 
    itemType: string = 'item'
  ): Promise<boolean> => {
    return confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  }, [confirm]);

  const confirmUnsavedChanges = useCallback(async (
    action: string = 'continue'
  ): Promise<boolean> => {
    return confirm({
      title: 'Unsaved Changes',
      message: `You have unsaved changes. Are you sure you want to ${action}? Your current changes will be lost.`,
      confirmText: 'Continue',
      cancelText: 'Cancel'
    });
  }, [confirm]);

  return {
    confirm,
    confirmDeletion,
    confirmUnsavedChanges,
  };
} 