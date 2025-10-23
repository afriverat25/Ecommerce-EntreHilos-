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
    content: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '90%',
        maxHeight: '90%',
        position: 'relative',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#333'
    }
};

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.content} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={modalStyles.closeButton}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;