import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className={`rounded-xl p-3 ${danger ? 'bg-danger/10' : 'bg-info/10'}`}>
              <AlertCircle className={`h-5 w-5 ${danger ? 'text-danger' : 'text-info'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text">{title}</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onCancel} className="btn-secondary">Cancel</button>
            <button
              onClick={onConfirm}
              className={danger ? 'btn-danger' : 'btn-primary'}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
