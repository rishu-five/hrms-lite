import React, { useEffect } from 'react';

export default function Toast({ message, type, onClose }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className={`toast toast-${type} animate-slide-up`}>
            {type === 'success' ? '✓ ' : '⚠ '}
            {message}
        </div>
    );
}
