import { useState } from 'react';

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Hook to manage confirmation dialogs for unsaved changes
 */
export function useConfirmationDialog() {
  const [dialog, setDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirmation = (
    title: string,
    description: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setDialog({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        onConfirm();
        closeDialog();
      },
      onCancel: () => {
        onCancel?.();
        closeDialog();
      }
    });
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    dialog,
    showConfirmation,
    closeDialog
  };
}
