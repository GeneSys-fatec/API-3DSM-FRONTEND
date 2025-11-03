import { useState, useCallback } from 'react';

export interface MenuPosition {
  top: number;
  left: number;
}

export function useOptionsMenu() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const open = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY + rect.height / 2,
      left: rect.left + window.scrollX,
    });
    setSelectedId(id);
  }, []);

  const close = useCallback(() => {
    setSelectedId(null);
    setPosition(null);
  }, []);

  return {
    isOpen: !!selectedId,
    selectedId,
    position,
    open,
    close,
  };
}