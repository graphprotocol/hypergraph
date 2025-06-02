import { useEffect } from 'react';

type ModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Modal({ isOpen, onOpenChange, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Modal has keyboard support via Escape key */}
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] max-h-[90vh] w-[90vw] max-w-2xl">
        <div className="bg-white rounded shadow-lg max-h-[90vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
