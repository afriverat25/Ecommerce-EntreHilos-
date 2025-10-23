// Cart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CartPageStyles = {
    // --- ESTILOS GENERALES ---
    container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    item: { display: 'flex', borderBottom: '1px solid #eee', padding: '15px 0', alignItems: 'center', flexWrap: 'wrap' },
    img: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' },
    details: { flexGrow: 1, minWidth: '150px' },
    priceInfo: { minWidth: '180px', textAlign: 'right' },
    actions: { display: 'flex', alignItems: 'center', marginTop: '5px' },
    
    // --- ESTILOS DE BOTONES ---
    qtyButton: { 
        width: '30px', 
        height: '30px', 
        backgroundColor: '#f1c40f', // Amarillo
        color: 'black', 
        border: 'none', 
        borderRadius: '50%', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '1.2em',
        margin: '0 5px'
    },
    removeButton: { 
        backgroundColor: '#e74c3c', // Rojo
        color: 'white', 
        border: 'none', 
        padding: '5px 10px', 
        borderRadius: '5px', 
        cursor: 'pointer',
        marginLeft: '15px'
    },
    checkoutButton: { 
        padding: '15px 30px', 
        backgroundColor: '#2ecc71', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontSize: '1.2em', 
        marginTop: '20px' 
    },
    backButton: {
        padding: '10px 15px',
        backgroundColor: '#3499db', // Azul
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    }
};

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [totalOrderAmount, setTotalOrderAmount] = useState(0);
    const navigate = useNavigate();

    // 🔑 URL BASE (Necesaria para mostrar las imágenes)
    const API_BASE_URL = 'https://localhost:7144'; 

    // 🔑 Cargar carrito y recalcular totales
    const loadCart = () => {
        const savedCart = JSON.parse(localStorage.getItem('userCart')) || [];
        setCart(savedCart);
        
        // Asegura que item.totalItemPrice es un número o 0
        const total = savedCart.reduce((acc, item) => acc + (item.totalItemPrice ?? 0), 0);
        setTotalOrderAmount(total);
        
        // **OPCIONAL:** Actualiza el contador global del carrito (si existe en el layout)
        // window.dispatchEvent(new Event('cartUpdate')); 
    };

    useEffect(() => {
        loadCart();
    }, []);
    
    // 🔑 Función para actualizar la cantidad o eliminar un ítem
    const updateCart = (newCart) => {
        localStorage.setItem('userCart', JSON.stringify(newCart));
        // Forzar la recarga de los datos
        loadCart(); 
    };

    // 🔑 Maneja la actualización de cantidad (+/-)
    const handleUpdateQuantity = (productId, delta) => {
        let currentCart = JSON.parse(localStorage.getItem('userCart')) || [];
        const itemIndex = currentCart.findIndex(item => item.productId === productId);
        
        if (itemIndex > -1) {
            const item = currentCart[itemIndex];
            const newQuantity = item.quantity + delta;
            
            if (newQuantity <= 0) {
                // Si la cantidad es 0 o menos, llama a la función de eliminar
                handleRemoveItem(productId);
                return;
            }
            
            // 🚨 NOTA: Aquí deberías verificar el stock actual si lo tuvieras disponible
            // if (newQuantity > item.stock) { alert("Stock insuficiente"); return; }
            
            const safeUnitPrice = item.unitPrice ?? 0;
            const safeDiscount = item.discount ?? 0;
            const discountFactor = (100 - safeDiscount) / 100;
            const finalPricePerUnit = safeUnitPrice * discountFactor;
            
            // Actualizar el item
            item.quantity = newQuantity;
            item.totalItemPrice = finalPricePerUnit * newQuantity;
            
            updateCart(currentCart);
        }
    };

    // 🔑 Maneja la eliminación completa de un ítem
    const handleRemoveItem = (productId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
            return;
        }

        let currentCart = JSON.parse(localStorage.getItem('userCart')) || [];
        const newCart = currentCart.filter(item => item.productId !== productId);
        
        updateCart(newCart);
    };

    // 🔑 Lógica de Generación de Orden (se mantiene igual)
   const handleCreateOrder = async () => {
        if (cart.length === 0) {
            alert("Tu carrito está vacío. Agrega productos antes de crear una orden.");
            return;
        }

        if (!window.confirm(`¿Confirmas la creación de una orden por el total de COP ${totalOrderAmount.toFixed(2)}?`)) {
            return;
        }
        
        // 🚨 PASO CRÍTICO 1: OBTENER EL ID DEL USUARIO LOGGEADO
        // ESTO DEBE VENIR DE TU CONTEXTO DE AUTENTICACIÓN O LOCALSTORAGE DESPUÉS DEL LOGIN.
        // Reemplaza esta línea con la forma en que obtienes el ID real del usuario:
        const loggedInUserIdString = localStorage.getItem('loggedInUserId');
        const loggedInUserId = parseInt(loggedInUserIdString) || 0; // Se convierte a número, o 0 si no existe. 
              
        if (!loggedInUserId) {
            alert("Error: El usuario no está loggeado o el ID no está disponible.");
            return;
        }

        // 🚨 PASO CRÍTICO 2: CREAR EL PAYLOAD (DEBE COINCIDIR CON OrderRequestDTO)
        const orderPayload = {
            // UserId con mayúscula inicial para coincidir con el DTO de C#
            UserId: loggedInUserId,
            
            // CartItems con mayúscula inicial para coincidir con el DTO de C#
            CartItems: cart.map(item => ({
                // Propiedades con PascalCase para el DTO de C#
                ProductId: item.productId,
                UnityPrice: item.unitPrice, 
                Discount: item.discount,
                Quantity: item.quantity
            }))
        };
        
        try {
            // 🚨 PASO CRÍTICO 3: LLAMAR AL ENDPOINT FINAL CON LA RUTA CORREGIDA
            const response = await fetch("https://localhost:7144/Api/Users/createOrderFromCart", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            // ⚠️ Verifica que la respuesta tenga un estado OK antes de leer el JSON
            if (!response.ok) {
                 // Si la respuesta no es 200 (OK), el servidor puede enviar detalles del error
                const errorData = await response.json();
                throw new Error(errorData.statusMessage || `Error ${response.status}: Error de comunicación con el servidor.`);
            }

            const data = await response.json();

            if (data.statusCode === 200) {
                alert(data.statusMessage || "Orden generada con éxito.");
                localStorage.removeItem('userCart'); // Limpia el carrito
                
                // ⚠️ Opcional: Recarga el contador del carrito en el botón flotante
                // Si tienes un mecanismo de recarga global (como un context o un evento)
                
                navigate('/user/orders'); // Redirige a 'Mis Órdenes'
            } else {
                // Esto manejaría errores internos del DAL (ej. fondos insuficientes)
                alert(`Error al generar orden: ${data.statusMessage}`);
            }
        } catch (error) {
            console.error("Error al crear la orden:", error);
            alert(`Fallo en la transacción: ${error.message}`);
        }
    };
    
    // Botón para volver al dashboard de productos
    const handleGoBack = () => {
        navigate('/user/dashboard'); // Asume que esta es la ruta de tus productos
    };
    
    if (cart.length === 0) {
        return (
            <div style={CartPageStyles.container}>
                <div style={CartPageStyles.header}>
                    <h2>🛒 Carrito de Compras</h2>
                    <button onClick={handleGoBack} style={CartPageStyles.backButton}>← Volver a Productos</button>
                </div>
                <p>Tu carrito está vacío. ¡Añade productos para empezar!</p>
            </div>
        );
    }
    

    return (
        <div style={CartPageStyles.container}>
            <div style={CartPageStyles.header}>
                <h2>🛒 Carrito de Compras</h2>
                {/* Botón para volver a Productos */}
                <button onClick={handleGoBack} style={CartPageStyles.backButton}>← Volver a Productos</button>
            </div>
            
            {cart.map(item => {
                
                // 🛑 CORRECCIÓN: Agregar seguridad (?? 0) a las propiedades
                const safeUnitPrice = item.unitPrice ?? 0;
                const safeDiscount = item.discount ?? 0;
                const safeTotalItemPrice = item.totalItemPrice ?? 0;
                
                // Calcular con los valores seguros
                const discountAmount = (safeUnitPrice * safeDiscount) / 100;
                const finalPrice = safeUnitPrice - discountAmount;
                
                return (
                    <div key={item.productId} style={CartPageStyles.item}>
                        <img src={`${API_BASE_URL}${item.imgUrl}`} alt={item.name} style={CartPageStyles.img} />
                        
                        <div style={CartPageStyles.details}>
                            <h4 style={{ margin: 0 }}>{item.name}</h4>
                            <p style={{ margin: '5px 0 0', fontSize: '0.9em', color: '#555' }}>
                                Total Ítem: COP {safeTotalItemPrice.toFixed(2)}
                            </p>
                            
                            {/* 🔑 CONTROLES DE CANTIDAD */}
                            <div style={CartPageStyles.actions}>
                                <button 
                                    onClick={() => handleUpdateQuantity(item.productId, -1)} 
                                    style={CartPageStyles.qtyButton}
                                    title="Quitar uno"
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button 
                                    onClick={() => handleUpdateQuantity(item.productId, 1)} 
                                    style={CartPageStyles.qtyButton}
                                    title="Agregar uno"
                                >
                                    +
                                </button>
                                
                                <button 
                                    onClick={() => handleRemoveItem(item.productId)} 
                                    style={CartPageStyles.removeButton}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                        
                        <div style={CartPageStyles.priceInfo}>
                            <p style={{ margin: 0 }}>Precio Unitario: <span style={{ textDecoration: safeDiscount > 0 ? 'line-through' : 'none' }}>COP {safeUnitPrice.toFixed(2)}</span></p>
                            {safeDiscount > 0 && <p style={{ margin: 0, color: 'red' }}>Descuento: {safeDiscount}% (COP {finalPrice.toFixed(2)})</p>}
                        </div>
                    </div>
                );
            })}
            
            <h3 style={{ textAlign: 'right', marginTop: '30px' }}>
                Total de la Orden: <span style={{ color: '#2ecc71' }}>COP {totalOrderAmount.toFixed(2)}</span>
            </h3>

            <div style={{ textAlign: 'right' }}>
                <button onClick={handleCreateOrder} style={CartPageStyles.checkoutButton}>
                    Generar Orden de Compra
                </button>
            </div>
        </div>
    );
}