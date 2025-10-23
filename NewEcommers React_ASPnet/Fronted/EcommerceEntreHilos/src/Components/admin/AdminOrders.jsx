import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Componente de Modal reutilizable
// Opcional: import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://localhost:7144';

// Estados disponibles para el administrador
const STATUS_OPTIONS = ['Completada', 'Enviado', 'Entregado', 'Cancelada'];

// --- Estilos Simples ---
const styles = {
    // ... (Estilos similares a UserOrders.jsx)
    container: { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { borderBottom: '2px solid #34495e', padding: '12px 8px', textAlign: 'left', backgroundColor: '#ecf0f1' },
    td: { borderBottom: '1px solid #eee', padding: '10px 8px' },
    select: { padding: '5px', borderRadius: '4px', border: '1px solid #ccc' },
    deleteButton: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' },
    detailButton: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
    status: (status) => {
        let color = '#7f8c8d'; 
        if (status === 'Completada') color = '#2ecc71'; 
        if (status === 'Enviado') color = '#f39c12'; // Naranja
        if (status === 'Entregado') color = '#2980b9'; // Azul
        if (status === 'Cancelada') color = '#e74c3c'; 
        return { fontWeight: 'bold', color: color };
    }
};

// --- Estilos Específicos para el Modal (puedes copiarlos de UserOrders) ---
const modalItemStyles = {
    // ... (Estilos de imagen y detalle del modal) ...
    itemContainer: { 
        borderBottom: '1px dotted #ccc', 
        padding: '10px 0',
        display: 'flex',
        alignItems: 'center',
    },
    img: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginRight: '15px',
        flexShrink: 0
    },
    details: {
        flexGrow: 1
    }
};


export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🔑 Obtener TODAS las Órdenes
    const fetchAllOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Llama al nuevo endpoint del administrador
            const response = await fetch(`${API_BASE_URL}/api/Admin/getAllOrders`);
            const data = await response.json();

            if (data.statusCode === 200 && data.data) {
                setOrders(data.data);
            } else if (data.statusCode === 404) {
                setOrders([]);
            } else {
                setError(data.statusMessage || "Error al obtener la lista de órdenes.");
            }
        } catch (err) {
            setError("Fallo la conexión con el servidor.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    // 🔑 Manejar el cambio de estado de la orden
    const handleStatusChange = async (orderId, newStatus) => {
        if (!window.confirm(`¿Seguro que deseas cambiar el estado de la orden ${orderId} a "${newStatus}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/Admin/updateStatus/${orderId}/${newStatus}`, {
                method: 'PUT',
            });
            const data = await response.json();

            if (data.statusCode === 200) {
                alert(data.statusMessage);
                fetchAllOrders(); // Recargar la lista
            } else {
                alert(`Error al actualizar estado: ${data.statusMessage}`);
            }
        } catch (error) {
            alert("Fallo la conexión con el servidor al actualizar el estado.");
        }
    };

    // 🔑 Eliminar Orden (Solo si está 'Entregada')
    const handleDeleteOrder = async (orderId, orderStatus) => {
        if (orderStatus !== 'Entregado') {
            alert("Solo puedes eliminar órdenes cuyo estado es 'Entregado'.");
            return;
        }

        if (!window.confirm(`ADVERTENCIA: ¿Estás seguro de ELIMINAR permanentemente la orden ${orderId}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/Admin/deleteOrder/${orderId}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.statusCode === 200) {
                alert(data.statusMessage);
                fetchAllOrders(); // Recargar la lista
            } else {
                alert(`Error al eliminar: ${data.statusMessage}`);
            }
        } catch (error) {
            alert("Fallo la conexión con el servidor al eliminar la orden.");
        }
    };

    // 🔑 Manejo del Modal (Detalles)
    const handleDetailClick = (order) => {
        setModalData(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    if (isLoading) return <div style={styles.container}>Cargando todas las órdenes...</div>;
    if (error) return <div style={{ ...styles.container, color: 'red' }}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h1>🛠️ Gestión de Órdenes</h1>
            <p>Total de Órdenes: {orders.length}</p>

            {orders.length === 0 ? (
                <p>No hay órdenes registradas.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nº Orden</th>
                            <th style={styles.th}>Cliente</th>
                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>Acciones</th>
                            <th style={styles.th}>Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td style={styles.td}>{order.orderNo}</td>
                                <td style={styles.td}>{order.userName}</td>
                                <td style={{ ...styles.td, fontWeight: 'bold' }}>COP {order.orderTotal.toFixed(2)}</td>
                                
                                {/* Columna de Estado con Selector */}
                                <td style={styles.td}>
                                    <select
                                        value={order.orderStatus}
                                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                        style={{...styles.select, ...styles.status(order.orderStatus)}}
                                    >
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                                
                                {/* Botón de Detalle */}
                                <td style={styles.td}>
                                    <button 
                                        onClick={() => handleDetailClick(order)} 
                                        style={styles.detailButton}
                                    >
                                        Ver Detalle ({order.items.length})
                                    </button>
                                </td>

                                {/* Botón de Eliminar (Solo si está Entregado) */}
                                <td style={styles.td}>
                                    <button 
                                        onClick={() => handleDeleteOrder(order.orderId, order.orderStatus)} 
                                        style={styles.deleteButton}
                                        disabled={order.orderStatus !== 'Entregado'}
                                        title={order.orderStatus !== 'Entregado' ? "Solo se pueden eliminar órdenes 'Entregadas'" : "Eliminar orden"}
                                    >
                                        {order.orderStatus === 'Entregado' ? '🗑️' : '🔒'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal de Detalle (Se reutiliza la estructura del cliente) */}
            {isModalOpen && modalData && (
                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <h2>Detalle de Orden {modalData.orderNo}</h2>
                    <p>Cliente: <strong>{modalData.userName}</strong></p>
                    <p>Estado: <span style={styles.status(modalData.orderStatus)}>{modalData.orderStatus}</span></p>
                    <hr />
                    
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {modalData.items.map((item, index) => (
                            <div key={index} style={modalItemStyles.itemContainer}>
                                {item.imgUrl && (
                                    <img 
                                        src={`${API_BASE_URL}${item.imgUrl}`} 
                                        alt={item.productName} 
                                        style={modalItemStyles.img} 
                                    />
                                )}
                                <div style={modalItemStyles.details}>
                                    <h4>{item.productName} ({item.quatity} unid.)</h4>
                                    <p>Total Ítem: COP {item.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ textAlign: 'right', marginTop: '20px' }}>
                        Total Final: COP {modalData.orderTotal.toFixed(2)}
                    </h3>
                </Modal>
            )}
        </div>
    );
}