import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Estructura de un producto dentro del carrito de compras.
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  vendorId: string;
  vendorName: string;
}

/**
 * Valida que un item del carrito tenga la estructura correcta.
 */
const isValidCartItem = (item: any): item is CartItem => {
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' && item.price > 0 &&
    typeof item.quantity === 'number' && item.quantity > 0 &&
    typeof item.vendorId === 'string' &&
    typeof item.vendorName === 'string'
  );
};

/**
 * Definición de las funciones y datos accesibles a través del contexto del carrito.
 */
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cargar el carrito desde localStorage al inicializar la aplicación
  useEffect(() => {
    const savedCart = localStorage.getItem('shop_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Validar y filtrar items válidos
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(isValidCartItem);
          setCart(validItems);
        }
      } catch (e) {
        console.error("Error al cargar el carrito desde localStorage", e);
      }
    }
  }, []);

  // Guardar automáticamente el carrito en localStorage cada vez que el estado cambie
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  /**
   * Añade un producto al carrito. Si el producto ya existe, incrementa su cantidad.
   */
  const addToCart = (newItem: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === newItem.id);
      if (existingItem) {
        // El producto ya está en el carrito, actualizamos su cantidad
        return prevCart.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      // El producto es nuevo en el carrito
      return [...prevCart, newItem];
    });
  };

  /**
   * Elimina un producto del carrito por su ID.
   */
  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  /**
   * Actualiza la cantidad de un producto específico. 
   * Si la cantidad es 0 o menor, se elimina del carrito.
   */
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Función para vaciar completamente el carrito
  const clearCart = () => setCart([]);

  // Cálculos automáticos derivados del estado del carrito
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Math.round(cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, 
      clearCart, totalItems, totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
