import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Asegúrate de que tu componente Modal sea reutilizable
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://localhost:7144';

// --- Estilos Simples ---
const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { borderBottom: '2px solid #3498db', padding: '12px 8px', textAlign: 'left', backgroundColor: '#ecf0f1' },
    td: { borderBottom: '1px solid #eee', padding: '10px 8px', cursor: 'pointer' },
    rowHover: { backgroundColor: '#f5f5f5' },
    total: { color: '#27ae60', fontWeight: 'bold' },
    status: (status) => {
        let color = '#7f8c8d'; // Gris por defecto
        if (status === 'Completada') color = '#2ecc71'; // Verde
        if (status === 'Pendiente') color = '#f39c12'; // Naranja
        if (status === 'Cancelada') color = '#e74c3c'; // Rojo
        return { fontWeight: 'bold', color: color };
    }
};

const modalItemStyles = {
    // Estilo para el contenedor de cada ítem en el modal
    itemContainer: { 
        borderBottom: '1px dotted #ccc', 
        padding: '10px 0',
        display: 'flex',
        alignItems: 'center',
    },
    // Estilo para la imagen
    img: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginRight: '15px',
        flexShrink: 0
    },
    // Estilo para el texto/detalle
    details: {
        flexGrow: 1
    }
};

export default function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null); // Almacena la orden seleccionada
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const API_BASE_URL = 'https://localhost:7144'; 


    // 🔑 Obtener el ID del Usuario (MISMA LÓGICA QUE EN Cart.jsx)
    const loggedInUserIdString = localStorage.getItem('loggedInUserId');
    const loggedInUserId = parseInt(loggedInUserIdString) || 0; // Se convierte a número, o 0 si no existe.
    
    // 🔑 Llamada al nuevo Endpoint de C#
    const fetchUserOrders = async () => {
        if (!loggedInUserId || isNaN(loggedInUserId)) {
            setError("Error: ID de usuario no encontrado. Por favor, inicie sesión.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Users/getOrdersByUserId/${loggedInUserId}`);
            const data = await response.json();

            if (data.statusCode === 200 && data.data) {
                setOrders(data.data);
            } else if (data.statusCode === 404) {
                setOrders([]);
            } else {
                setError(data.statusMessage || "Error al obtener la lista de órdenes.");
            }
        } catch (err) {
            setError("Fallo la conexión con el servidor de órdenes.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, [loggedInUserId]);

    // 🔑 Manejo del Modal
    const handleRowClick = (order) => {
        setModalData(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    if (isLoading) {
        return <div style={styles.container}>Cargando historial de órdenes...</div>;
    }

    if (error) {
        return <div style={{ ...styles.container, color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div style={styles.container}>
            <h1>📝 Historial de Órdenes</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>
                Haz clic en una orden para ver los detalles de los productos.
            </p>

            {orders.length === 0 ? (
                <p>Aún no has realizado ninguna orden.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Número de Orden</th>
                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}># Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr 
                                key={order.orderId} 
                                onClick={() => handleRowClick(order)}
                                style={{ transition: 'background-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.rowHover.backgroundColor}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <td style={styles.td}>{order.orderNo}</td>
                                <td style={{ ...styles.td, ...styles.total }}>COP {order.orderTotal.toFixed(2)}</td>
                                <td style={styles.td}>
                                    <span style={styles.status(order.orderStatus)}>{order.orderStatus}</span>
                                </td>
                                <td style={styles.td}>{order.items.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {/* Modal para ver el detalle de la orden */}
           {isModalOpen && modalData && (
                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <h2>Detalle de la Orden: {modalData.orderNo}</h2>
                    <p>Estado: <span style={styles.status(modalData.orderStatus)}>{modalData.orderStatus}</span></p>
                    <hr />
                    
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {modalData.items.map((item, index) => (
                            <div key={index} style={modalItemStyles.itemContainer}>
                                
                                {/* 🔑 NUEVO: Mostrar la Imagen del Producto */}
                                {item.imgUrl && (
                                    <img 
                                        src={`${API_BASE_URL}${item.imgUrl}`} 
                                        alt={item.productName} 
                                        style={modalItemStyles.img} 
                                        // Opcional: Manejo de error de imagen
                                        onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }}
                                    />
                                )}

                                <div style={modalItemStyles.details}>
                                    <h4>{item.productName} ({item.quatity} unidades)</h4>
                                    <p style={{ margin: '3px 0', fontSize: '0.9em' }}>
                                        Precio Unitario: <span style={{ textDecoration: item.discount > 0 ? 'line-through' : 'none' }}>COP {item.unityPrice.toFixed(2)}</span>
                                    </p>
                                    {item.discount > 0 && (
                                        <p style={{ margin: '3px 0', fontSize: '0.9em', color: 'red' }}>
                                            Descuento: {item.discount}% | Total con Descuento: COP {(item.unityPrice * (1 - item.discount / 100)).toFixed(2)}
                                        </p>
                                    )}
                                    <p style={{ margin: '3px 0', fontWeight: 'bold' }}>Total Item: COP {item.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ textAlign: 'right', marginTop: '20px' }}>
                        Total Final de la Orden: <span style={styles.total}>COP {modalData.orderTotal.toFixed(2)}</span>
                    </h3>
                </Modal>
            )}
        </div>
    );
}