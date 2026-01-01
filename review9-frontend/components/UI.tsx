'use client';

import React, { useState } from 'react';

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}> = ({ children, onClick, variant = 'primary', className = '', disabled, type = 'button' }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const Input: React.FC<{ label: string;[key: string]: any }> = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input {...props} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
  </div>
);

// Badge component for status display
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-600 bg-transparent',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Status Badge with predefined candidate statuses
export const CandidateStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline'; label: string }> = {
    PENDING: { variant: 'outline', label: 'Pending' },
    INVITED: { variant: 'secondary', label: 'Invited' },
    REVIEW: { variant: 'default', label: 'Review' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    CONSIDERED: { variant: 'warning', label: 'Considered' },
    SHORTLISTED: { variant: 'success', label: 'Shortlisted' },
    PAUSED: { variant: 'danger', label: 'Paused' },
    ONGOING: { variant: 'default', label: 'Ongoing' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    FAILED: { variant: 'danger', label: 'Failed' },
  };
  const config = statusConfig[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Loading Button with spinner
export const LoadingButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, loading = false, variant = 'primary', className = '', disabled }) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={className}
      disabled={loading || disabled}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      )}
      {children}
    </Button>
  );
};

// Dropdown Menu
export const Dropdown: React.FC<{
  trigger: React.ReactNode;
  items: { label: string; onClick: () => void; disabled?: boolean; variant?: 'default' | 'danger' }[];
}> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-[100] mt-2 w-48 origin-top-right rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
            <div className="py-1">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { item.onClick(); setIsOpen(false); }}
                  disabled={item.disabled}
                  className={`block w-full text-left px-4 py-2 text-sm ${item.disabled ? 'text-gray-400 cursor-not-allowed' :
                    item.variant === 'danger' ? 'text-red-600 hover:bg-red-50' :
                      'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Simple Table
export const Table: React.FC<{
  headers: string[];
  children: React.ReactNode;
}> = ({ headers, children }) => (
  <div className="rounded-lg border border-gray-200">
    <div className="overflow-x-auto min-h-[400px]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  </div>
);

// Skeleton loader
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Score indicator
export const ScoreIndicator: React.FC<{ score?: number }> = ({ score }) => {
  if (score === undefined) return <span className="text-gray-400">-</span>;
  const color = score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-semibold ${color}`}>{score}%</span>;
};

// Fit indicator
export const FitIndicator: React.FC<{ isFit?: boolean }> = ({ isFit }) => {
  if (isFit === undefined) return <span className="text-gray-400">-</span>;
  return isFit ? (
    <span className="text-green-600 font-medium">✓ Fit</span>
  ) : (
    <span className="text-red-600 font-medium">✗ Not Fit</span>
  );
};
