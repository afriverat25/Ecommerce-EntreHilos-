import React from "react";
import { Link, Outlet } from "react-router-dom"; // 🔑 Necesitas Link para la navegación y Outlet para las sub-rutas
import LogoutLink from "../Logout";

// Nota: Asumo que en tu archivo de rutas principal tendrás algo como:
// <Route path="/admin" element={<AdminDashboard />}>
//    <Route path="products" element={<Products />} /> 
//    <Route path="orders" element={<Orders />} /> 
// </Route>
// Si no usas rutas anidadas, solo usa <Link> y no necesitas <Outlet>

// --- Estilos de la página ---
const styles = {
    // 1. Contenedor principal: Usamos flexbox para el sidebar y el contenido
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
        flexShrink: 0, // Evita que se encoja
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
    navItemHover: { // Estilo para el hover (se aplica a Link con onMouseOver)
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

export default function AdminDashboard() {
    return (
        <div style={styles.dashboardContainer}>
            {/* 1. Barra Lateral (Sidebar) */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2>Admin Panel</h2>
                    <small>Ecrochet Shop</small>
                </div>
                
                <nav>
                    <Link to="/admin/dashboard" style={styles.navItem}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = styles.navItemHover.backgroundColor}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = styles.navItem.backgroundColor}>
                        🏠 Dashboard
                    </Link>
                    
                    <Link to="/admin/productsManagement" style={styles.navItem}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = styles.navItemHover.backgroundColor}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = styles.navItem.backgroundColor}>
                        📦 Gestión de Productos
                    </Link>
                    
                    <Link to="/admin/adminOrders" style={styles.navItem}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = styles.navItemHover.backgroundColor}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = styles.navItem.backgroundColor}>
                        📝 Gestión de Órdenes
                    </Link>

                    <Link to="/admin/customerList" style={styles.navItem}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = styles.navItemHover.backgroundColor}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = styles.navItem.backgroundColor}>
                        👤 Gestión de Usuarios
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
                <h1 style={styles.header}>Bienvenido, Administrador 👋</h1>
                <p style={{ marginBottom: '30px', color: '#34495e' }}>
                    Utiliza el menú de navegación para gestionar el inventario, las órdenes y las cuentas de usuario.
                </p>

                {/* 🔑 Este es el punto de montaje para las rutas anidadas (ej: Products.jsx, Orders.jsx) */}
                {/* Si no usas rutas anidadas (Opción B), puedes eliminar <Outlet /> y poner aquí el contenido. */}
                <Outlet /> 
                
                {/* 🔑 Si no usas <Outlet /> y quieres mantener el contenido inicial: */}
                {/* <div style={{ border: '1px solid #ccc', padding: '25px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '20px' }}>
                    <h2>Resumen Rápido</h2>
                    <p>Aquí irán métricas clave (Órdenes Pendientes: 5, Productos en Stock Bajo: 12).</p>
                </div> */}
            </div>
        </div>
    );
}