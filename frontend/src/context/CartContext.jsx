import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { typeId, name, price, quantity }

  const add = (type) => setItems((prev) => {
    const found = prev.find((i) => i.typeId === type._id);
    if (found) return prev.map((i) => (i.typeId === type._id ? { ...i, quantity: Math.min(10, i.quantity + 1) } : i));
    return [...prev, { typeId: type._id, name: type.name, price: type.price, quantity: 1 }];
  });
  const setQty = (typeId, q) => setItems((prev) => prev.map((i) => (i.typeId === typeId ? { ...i, quantity: Math.max(1, Math.min(10, q)) } : i)));
  const remove = (typeId) => setItems((prev) => prev.filter((i) => i.typeId !== typeId));
  const clear = () => setItems([]);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.quantity * i.price, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>;
}
