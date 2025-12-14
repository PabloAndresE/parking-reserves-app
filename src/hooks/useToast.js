// src/hooks/useToast.js

import { useState, useCallback } from 'react';

export function useToast(timeout = 3000) {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'error') => {
        setToast({ message, type });

        setTimeout(() => {
            setToast(null);
        }, timeout);
    }, [timeout]);

    return {
        toast,
        showToast
    };
}
