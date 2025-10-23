import React from "react";
import { Link, Outlet } from "react-router-dom"; 
import LogoutLink from "../Logout.jsx";

// Nota: Los estilos son copiados directamente de AdminDashboard.jsx
const styles = {
    // 1. Contenedor principal
    dashboardContainer: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f4f7f6', // Fondo suave
    },
    // 2. Barra lateral de navegación
    sidebar: {
        width: '250px',
        backgroundColor: '#2c3e50', // Color oscuro elegante
        padding: '20px 0',
        color: 'white',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        flexShrink: 0, 
    },
    sidebarHeader: {
        textAlign: 'center',
        marginBottom: '30px',
        padding: '0 20px',
        borderBottom: '1px solid #34495e',
        paddingBottom: '10px',
    },
    navItem: {
        display: 'block',
        padding: '12px 20px',
        textDecoration: 'none',
        color: 'white',
        fontSize: '16px',
        transition: 'background-color 0.2s',
    },
    navItemHover: { 
        backgroundColor: '#34495e',
    },
    // 3. Área de contenido principal
    contentArea: {
        flexGrow: 1,
        padding: '40px',
        backgroundColor: '#f4f7f6',
    },
    header: {
        borderBottom: '2px solid #bdc3c7',
        paddingBottom: '15px',
        marginBottom: '30px',
        color: '#2c3e50',
    }
};

export default function UserDashboard() {
    
    // Función de ayuda para manejar el hover (opcional, podrías usar CSS si usas librerías de estilos)
    const getNavItemProps = (path, isLogout = false) => ({
        to: path,
        style: styles.navItem,
        onMouseOver: e => e.currentTarget.style.backgroundColor = isLogout ? '#e74c3c' : styles.navItemHover.backgroundColor,
        onMouseOut: e => e.currentTarget.style.backgroundColor = styles.navItem.backgroundColor,
    });

    return (
        <div style={styles.dashboardContainer}>
            {/* 1. Barra Lateral (Sidebar) */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2>Ecrochet Shop</h2>
                    <small>Panel de Usuario</small>
                </div>
                
                <nav>
                    {/* ENLACES DEL DASHBOARD DE USUARIO */}
                    
                    <Link {...getNavItemProps("/dashboard/home")}>
                        🏠 Dashboard
                    </Link>
                    
                    <Link {...getNavItemProps("/user/products")}>
                        🧶 Productos Disponibles
                    </Link>
                    
                    <Link {...getNavItemProps("/user/cart")}>
                        🛒 Carrito de Compras
                    </Link>
                    
                    <Link {...getNavItemProps("/user/orders")}>
                        📝 Mis Órdenes
                    </Link>
                    
                    <Link {...getNavItemProps("/user/profile")}>
                        ⚙️ Configuración de Perfil
                    </Link>

                    {localStorage.getItem('loggedInUserId') && (
                        <LogoutLink style={{ /* tus estilos */ }}>
                            🚪 Cerrar Sesión
                        </LogoutLink>
                    )}
                </nav>
            </div>

            {/* 2. Área de Contenido Principal */}
            <div style={styles.contentArea}>
                <h1 style={styles.header}>Bienvenido a la Tienda 👋</h1>
                <p style={{ marginBottom: '30px', color: '#34495e' }}>
                    Explora nuestros productos, gestiona tus órdenes y actualiza tu perfil.
                </p>

                {/* Este <Outlet /> cargará el componente de la ruta anidada */}
                <Outlet /> 
            </div>
        </div>
    );
}