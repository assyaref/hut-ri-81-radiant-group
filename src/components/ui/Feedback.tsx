interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Memuat data…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="spinner mb-4" />
      <p className="text-gray-500">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'Belum ada data', description = 'Tidak ada data untuk ditampilkan saat ini.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4">🗂️</div>
      <p className="text-lg font-semibold text-navy-900 mb-1">{title}</p>
      <p className="text-gray-500 text-sm max-w-sm">{description}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-lg font-semibold text-red-600 mb-1">Terjadi kesalahan</p>
      <p className="text-gray-500 text-sm max-w-sm mb-4">{message}</p>
      {onRetry && <button className="btn-outline-small" onClick={onRetry}>Coba Lagi</button>}
    </div>
  );
}