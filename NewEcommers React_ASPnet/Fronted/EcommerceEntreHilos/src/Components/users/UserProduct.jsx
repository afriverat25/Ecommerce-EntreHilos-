import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal'; // Asegúrate de que esta ruta sea correcta

// 🔑 URL BASE Y ENDPOINT
const API_BASE_URL = 'https://localhost:7144'; 
const API_GET_PRODUCTS = `${API_BASE_URL}/api/Admin/getAllProducts`; 


// --- Estilos de la Tarjeta ---
const cardStyles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
        marginTop: '30px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        display: 'flex',
        flexDirection: 'column',
    },
    imageWrapper: {
        height: '200px',
        overflow: 'hidden',
        cursor: 'pointer'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    info: {
        padding: '15px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    name: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#2c3e50',
    },
    price: {
        fontSize: '1.5em',
        color: '#27ae60', // Verde para el precio
        fontWeight: 'bolder',
        marginBottom: '10px'
    },
    stock: {
        fontSize: '0.9em',
        color: '#8e44ad', // Morado para el stock
        marginBottom: '15px'
    },
    addToCartButton: {
        marginTop: 'auto', // Lo empuja al final de la tarjeta
        padding: '10px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    }
};

// --- Estilos para el Botón Flotante del Carrito ---
const cartButtonStyles = {
    base: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        zIndex: 1000,
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        transition: 'background-color 0.3s, transform 0.2s',
    },
    empty: {
        backgroundColor: '#7f8c8d', // Gris
    },
    filled: {
        backgroundColor: '#e74c3c', // Rojo llamativo para notificar!
    },
    badge: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: '#3498db', // Azul
        color: 'white',
        borderRadius: '50%',
        padding: '2px 8px',
        fontSize: '12px',
        border: '2px solid white',
    },
};

// --- Componente del Botón Flotante de Carrito ---
const CartButton = ({ count, navigate }) => {
    
    // El estilo cambia basado en si count > 0
    const dynamicStyle = {
        ...cartButtonStyles.base,
        ...(count > 0 ? cartButtonStyles.filled : cartButtonStyles.empty)
    };
    
    const handleClick = () => {
        if (count > 0) {
            navigate('/user/cart'); // Ruta a tu componente Cart.jsx
        } else {
            alert("Tu carrito está vacío.");
        }
    };

    return (
        <div 
            style={dynamicStyle} 
            onClick={handleClick}
            title={count > 0 ? `Ir al carrito (${count} productos)` : `Carrito vacío`}
        >
            🛒
            {/* Mostrar el badge si count > 0 */}
            {count > 0 && (
                <span style={cartButtonStyles.badge}>{count}</span>
            )}
        </div>
    );
};


// --- Componente de la Tarjeta Individual (ProductCard) ---
const ProductCard = ({ product, openImageModal, handleAddToCart }) => {
    
    // 🛑 Desestructuración con camelCase
    const { id, name, unitePrice, stoke, imgUrl } = product;
    
    // Agregar seguridad para el precio (usando ?? 0)
    const displayPrice = unitePrice ?? 0;
    
    return (
        <div 
            style={cardStyles.card} 
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} 
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            
            {/* Imagen con Modal al hacer click */}
           <div 
                style={cardStyles.imageWrapper} 
                onClick={() => openImageModal(`${API_BASE_URL}${imgUrl}`, name)} // URL Completa para el modal
                title={`Ver ${name} en grande`}
            >
                <img 
                    // 🛑 URL COMPLETA para la imagen
                    src={`${API_BASE_URL}${imgUrl}`} 
                    alt={name} 
                    style={cardStyles.image} 
                    onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder_image.jpg"; }}
                />
            </div>
            
            {/* Información del Producto */}
            <div style={cardStyles.info}>
                <div style={cardStyles.name}>{name}</div>
                
                <div style={cardStyles.price}>COP {displayPrice.toFixed(2)}</div>
                
                <div style={cardStyles.stock}>Stock: {stoke} unidades</div> 
                
                {/* Botón de Agregar al Carrito */}
                <button 
                    onClick={() => handleAddToCart(product)} // Pasa el objeto producto completo
                    style={cardStyles.addToCartButton}
                    title="Añadir 1 unidad al carrito"
                >
                    🛒 Agregar al Carrito
                </button>
            </div>
        </div>
    );
};


// --- Componente Principal de la Vista de Productos (UserProducts) ---
export default function UserProducts() {
    const [productList, setProductList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalImage, setModalImage] = useState(null);
    const [modalCaption, setModalCaption] = useState('');
    const navigate = useNavigate();
    
    // Estado para el contador del carrito (badge/botón flotante)
    const [cartCount, setCartCount] = useState(0); 

    // 🔑 Obtener productos (con filtro de Stock > 0)
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_GET_PRODUCTS);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.statusCode === 200 && data.listProducts) {
                // 🛑 FILTRO: Solo mostrar productos donde stoke > 0
                // Y nos aseguramos de que tengan un ID válido (para la key)
                const availableProducts = data.listProducts.filter(p => p.stoke > 0 && p.id);
                setProductList(availableProducts);
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

   // 🔑 Maneja la adición al carrito y actualiza el contador
   const handleAddToCart = (product) => {
        const quantityString = prompt(`¿Cuántas unidades de "${product.name}" deseas agregar al carrito?`, 1);
        
        const quantity = parseInt(quantityString);
        if (isNaN(quantity) || quantity <= 0) {
            alert("Cantidad inválida.");
            return;
        }
        
        if (quantity > product.stoke) {
            alert(`Solo quedan ${product.stoke} unidades en stock.`);
            return;
        }
        
        let cart = JSON.parse(localStorage.getItem('userCart')) || [];
        const existingItemIndex = cart.findIndex(item => item.productId === product.id);
        
        const discountFactor = (100 - (product.discount ?? 0)) / 100;
        const finalPricePerUnit = product.unitePrice * discountFactor;

        const newItem = {
            productId: product.id,
            name: product.name,
            imgUrl: product.imgUrl,
            unitPrice: product.unitePrice,
            discount: product.discount ?? 0,
            quantity: quantity,
            totalItemPrice: finalPricePerUnit * quantity, 
        };

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
            cart[existingItemIndex].totalItemPrice += newItem.totalItemPrice;
        } else {
            cart.push(newItem);
        }

        localStorage.setItem('userCart', JSON.stringify(cart));
        
        // 🛑 Actualiza el contador
        setCartCount(cart.length); 
        
        alert(`${quantity} ${product.name}(s) agregado(s) al carrito!`);
    };

    // 🔑 Lógica para el Modal de Imagen
    const openImageModal = (imagePath, name) => {
        setModalImage(imagePath);
        setModalCaption(name);
    };

    const closeImageModal = () => {
        setModalImage(null);
        setModalCaption('');
    };
    
    // Carga inicial de productos y del contador del carrito
    useEffect(() => {
        fetchProducts();
        const savedCart = JSON.parse(localStorage.getItem('userCart')) || [];
        setCartCount(savedCart.length);
    }, []);

    if (isLoading) {
        return <div style={cardStyles.container}>Cargando productos disponibles...</div>;
    }

    if (error) {
        return <div style={{ ...cardStyles.container, color: 'red' }}>Error: {error}</div>;
    }

    if (productList.length === 0) {
        return <div style={cardStyles.container}>No hay productos disponibles en este momento.</div>;
    }

    return (
        <div style={cardStyles.container}>
            
            {/* 🛑 Botón Flotante de Carrito con Notificación */}
            <CartButton count={cartCount} navigate={navigate} />

            <h1>Productos Disponibles para Compra 🧶</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>
                Explora el inventario. Los productos con stock agotado no se muestran.
            </p>

            <div style={cardStyles.grid}>
                {productList.map(product => (
                    <ProductCard 
                        key={product.id}
                        product={product}
                        openImageModal={openImageModal}
                        handleAddToCart={handleAddToCart}
                    />
                ))}
            </div>

            {/* Modal para ver la imagen ampliada */}
            <Modal isOpen={!!modalImage} onClose={closeImageModal}>
                <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>{modalCaption}</h3>
                <img 
                    src={modalImage} 
                    alt={modalCaption} 
                    style={{ 
                        maxWidth: '100%', 
                        maxHeight: '70vh', 
                        borderRadius: '5px' 
                    }} 
                />
            </Modal>
        </div>
    );
}