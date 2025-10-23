import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutLink = ({ children, ...rest }) => {
    const navigate = useNavigate();

    const handleLogout = (e) => {
        // 1. Limpiar el almacenamiento local
        localStorage.removeItem('loggedInUserId');
        localStorage.removeItem('userType'); 
        
        // 2. Redirigir a la ruta raíz (Login)
        navigate('/'); 
        
        // Opcional: Recargar la página para asegurar que el estado de la barra de navegación se actualice
        window.location.reload(); 
    };

    return (
        // Usamos un div con un cursor de puntero para indicar que es clickeable
        <div 
            onClick={handleLogout} 
            style={{ cursor: 'pointer' }}
            // Agrega aquí cualquier estilo o propiedad que necesites
            {...rest}
        >
            {children}
        </div>
    );
};

export default LogoutLink;