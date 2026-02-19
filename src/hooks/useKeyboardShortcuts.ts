import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onEscape: () => void;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onSelectAll,
  onEscape,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (event.key === 'z' && isCtrlOrCmd && !event.shiftKey) {
        event.preventDefault();
        onUndo();
      } else if ((event.key === 'y' && isCtrlOrCmd) || (event.key === 'z' && isCtrlOrCmd && event.shiftKey)) {
        event.preventDefault();
        onRedo();
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT') {
          event.preventDefault();
          onDelete();
        }
      } else if (event.key === 'a' && isCtrlOrCmd) {
        event.preventDefault();
        onSelectAll();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    },
    [onUndo, onRedo, onDelete, onSelectAll, onEscape]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
