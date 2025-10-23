// Modal.jsx

import React from 'react';

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflow: 'auto',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};

export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div 
                style={modalStyles.modalContent} 
                onClick={e => e.stopPropagation()} // Evita que el clic dentro cierre el modal
            >
                <button style={modalStyles.closeButton} onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}