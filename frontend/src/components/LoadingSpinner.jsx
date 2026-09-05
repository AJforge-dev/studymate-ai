import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'default', text = null }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin text-blue-600`} />
      {text && <p className="text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
}
