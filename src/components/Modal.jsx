// src/components/Modal.jsx

import React from 'react';
import { cn } from '../services/utils';

export function Modal({ open, title, children, actions }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div
                className="
                    bg-neutral-800 rounded-2xl p-6 w-full max-w-md border border-neutral-700
                    transform transition-all duration-200 ease-out
                    scale-95 opacity-0
                    animate-modal-in
                "
            >
                {title && (
                    <h3 className="text-xl font-bold mb-4">
                        {title}
                    </h3>
                )}

                <div className="mb-6">
                    {children}
                </div>

                {actions && (
                    <div className="flex justify-end gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
