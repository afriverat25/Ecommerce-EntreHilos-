// ProductsManagement.jsx

import React, { useState, useEffect } from 'react';
import AddProductForm from './AddProductsForm'; // Asegúrate de que la ruta sea correcta
import ProductListTable from './ProductListTable'; // Lo crearemos en el paso 3
import Modal from './Modal'; // Componente Modal (lo definiremos abajo)
import { useNavigate } from 'react-router-dom';

const apiURLBase = "https://localhost:7144/api/Admin";

export default function ProductsManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productList, setProductList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const navigate = useNavigate();


    // 🔑 Función para obtener la lista de productos
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiURLBase}/getAllProducts`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.statusCode === 200 && data.listProducts) {
                setProductList(data.listProducts);
            } else {
                setError(data.statusMessage || "Error al obtener la lista de productos.");
                setProductList([]);
            }
        } catch (err) {
            setError("No se pudo conectar al servidor para obtener la lista.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // 🔑 Cargar la lista al montar el componente
    useEffect(() => {
        fetchProducts();
    }, []);

    // 🔑 Función de éxito que se pasa al formulario para cerrar el modal y recargar
    const openProductModal = (productToEdit = null) => {
    // Si pasamos un producto, lo guardamos para el modo Edición
    setEditingProduct(productToEdit); 
    setIsModalOpen(true);
};

// 🔑 NUEVA FUNCIÓN: Cierra el modal y resetea el modo edición
const closeModal = () => {
    setIsModalOpen(false);
    // MUY IMPORTANTE: Limpiar el estado de edición al cerrar
    setEditingProduct(null); 
};

// 🔑 FUNCIÓN DE ÉXITO: Ahora usa la función `closeModal` para cerrar y limpiar
const handleProductAdded = () => {
    closeModal(); // Cierra la ventana y limpia editingProduct
    fetchProducts(); // Recarga la lista
};

const handleGoToDashboard = () => {
        // Reemplaza '/dashboard' con la ruta real de tu dashboard
        navigate('/admin/dashboard'); 
    };

   return (
    <div style={styles.container}>
        <h1>Gestión de Inventario 📦</h1>
        
        <div style={styles.header}>
            <button 
                style={styles.backButton} 
                onClick={handleGoToDashboard}>
                ⬅️ Volver al Dashboard
            </button>
            
            {/* BOTÓN EXISTENTE */}
            <button 
                style={styles.addButton} 
                onClick={() => openProductModal(null)}>
                + Agregar Nuevo Producto
            </button>
        </div>

       

        {/* 🔑 CAMBIO 2: MODAL (Ventana Emergente) */}
        {/* Usamos la función closeModal que limpia el estado de edición */}
        <Modal isOpen={isModalOpen} onClose={closeModal}> 
            <AddProductForm 
                closeModal={closeModal} 
                refreshList={handleProductAdded} 
                // 🔑 CAMBIO 3: Pasamos el producto a editar (editingProduct) como initialData al formulario
                initialData={editingProduct} 
            />
        </Modal>
        
        <hr style={styles.hr} />

        {/* 🔑 LISTADO DE PRODUCTOS */}
        <h2>Productos Actuales ({productList.length})</h2>
        {isLoading && <p>Cargando productos...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        
        {!isLoading && !error && (
            <ProductListTable 
                products={productList} 
                refreshList={fetchProducts} 
                // 🔑 CAMBIO 4: Pasamos la función openProductModal (renombrada a onEdit) a la tabla
                onEdit={openProductModal} 
            />
        )}

    </div>
);
}

// Estilos
const styles = {
    container: { padding: '40px' },
    header: { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' },
    addButton: {
        padding: '12px 25px',
        backgroundColor: '#2ecc71', // Verde brillante
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
    hr: { borderTop: '1px solid #ddd', margin: '30px 0' },
    backButton: {
        padding: '10px 15px',
        backgroundColor: '#95a5a6', // Gris suave
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        marginRight: '20px', // Espacio con el botón de agregar
        transition: 'background-color 0.3s',
    },
    
    // 🔑 AJUSTE NECESARIO: Modifica styles.header para justificar el contenido
    header: {
        display: 'flex',
        justifyContent: 'space-between', // Para que los botones estén en los extremos
        alignItems: 'center',
        marginBottom: '20px'
    }
};