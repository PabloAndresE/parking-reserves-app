// src/components/Toast.jsx

import React from 'react';
import { cn } from '../services/utils';

export function Toast({ message, type = 'error' }) {
    if (!message) return null;

    return (
        <div
            className={cn(
                'fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg z-50',
                'transform transition-all duration-300 ease-out',
                'animate-toast-in',
                type === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
            )}
        >
            {message}
        </div>
    );
}
