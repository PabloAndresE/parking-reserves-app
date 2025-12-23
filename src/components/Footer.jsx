import React from 'react';

export function Footer() {
    return (
        <footer className="
            fixed bottom-0 left-0 w-full z-50
            bg-neutral-900 border-t border-neutral-800
            px-4
            py-3 sm:py-4
            text-center
        ">
            <p className="text-sm text-neutral-200">
                Developed and Designed by Pablo & Reno
            </p>

            <p className="mt-1 text-xs text-neutral-400">
                OfiPark 2025 ©
            </p>

            <p className="mt-0.5 text-xs text-neutral-500">
                Quito, Ecuador
            </p>
        </footer>
    );
}
