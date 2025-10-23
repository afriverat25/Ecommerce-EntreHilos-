import React from 'react';

// URL base de tu API
const apiURLBase = "https://localhost:7144/api/Admin";

const styles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    th: {
        backgroundColor: '#34495e',
        color: 'white',
        padding: '15px 12px',
        textAlign: 'left',
        fontSize: '1em'
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #ecf0f1',
        verticalAlign: 'middle',
        color: '#333'
    },
    img: {
        width: '70px',
        height: '70px',
        borderRadius: '6px',
        objectFit: 'cover',
        border: '1px solid #ddd'
    },
    // Estilos de estado eliminados según tu petición anterior
    actionCell: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    buttonEdit: {
        padding: '8px 12px',
        backgroundColor: '#3498db', // Azul
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.2s',
    },
    buttonDelite: {
        padding: '8px 12px',
        backgroundColor: '#e74c3c', // Rojo
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.2s',
    }
};

// 🔑 CAMBIO 1: El componente ahora recibe 'onEdit' desde el padre
export default function ProductListTable({ products, refreshList, onEdit }) {
    
    // 🔑 FUNCIÓN DE ELIMINACIÓN: Llama al endpoint DELETE de C#
    const handleDelete = async (id, name) => {
        // Ventana de confirmación
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el producto "${name}" (ID: ${id})? Esta acción es permanente.`)) {
            return;
        }

        try {
            // Llama al endpoint de C# /api/Admin/deleteProduct/{id}
            const response = await fetch(`${apiURLBase}/deleteProduct/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // Maneja si el servidor responde con un error HTTP
                throw new Error(`Error HTTP ${response.status}`);
            }

            const data = await response.json(); // Lee la respuesta JSON del backend

            if (data.statusCode === 200) {
                alert(data.statusMessage);
                refreshList(); // Recarga la lista de productos
            } else {
                // Muestra el mensaje de error que viene del backend
                alert("Error al eliminar: " + data.statusMessage);
            }

        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            alert("Error de conexión al intentar eliminar el producto. Revisa tu API.");
        }
    };


    if (!products || products.length === 0) {
        return (
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center' }}>
                <p>Aún no hay productos cargados en el inventario. Usa el botón "Agregar Nuevo Producto".</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Imagen</th>
                        <th style={styles.th}>Nombre</th>
                        <th style={styles.th}>Precio</th>
                        <th style={styles.th}>Descuento</th>
                        <th style={styles.th}>Stock</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        // NOTA: Usamos product.id (minúscula) como key
                        <tr key={product.id}>
                            {/* NOTA: Corregido a product.id */}
                            <td style={styles.td}>{product.id}</td> 
                            <td style={styles.td}>
                                <img 
                                    // Corregido a product.imgUrl (camelCase)
                                    src={`https://localhost:7144${product.imgUrl}`} 
                                    alt={product.name} 
                                    style={styles.img} 
                                    onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder_image.jpg"; }}
                                />
                            </td>
                            <td style={styles.td}>
                                {/* Corregido a product.name (camelCase) */}
                                <strong style={{color: '#2c3e50'}}>{product.name}</strong>
                            </td>
                            <td style={styles.td}>
                                <span style={{fontSize: '1.1em', fontWeight: 'bold'}}>
                                    {/* Muestra COP y usa el nombre y manejo de seguridad corregido */}
                                    COP {(product.unitePrice ?? 0).toFixed(2)} 
                                </span>
                            </td>
                            <td style={styles.td}>
                                {/* Corregido a product.discount (camelCase) */}
                                {product.discount}%
                            </td>
                            <td style={styles.td}>
                                {/* Corregido a product.stoke (camelCase) */}
                                <span style={{ fontWeight: 'bold' }}>{product.stoke} unidades</span>
                            </td>
                            <td style={styles.td}>
                                <div style={styles.actionCell}> 
                                    <button 
                                        style={styles.buttonEdit} 
                                        // 🔑 Llama a la función 'onEdit' del padre, pasándole el objeto 'product' completo
                                        onClick={() => onEdit(product)}>
                                        Editar
                                    </button>

                                    <button 
                                        style={styles.buttonDelite} 
                                        // 🔑 Llama a la función 'handleDelete' con el ID y el nombre
                                        onClick={() => handleDelete(product.id, product.name)}>
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}