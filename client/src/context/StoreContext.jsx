import { createContext, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../api";

export const StoreContext = createContext(null);

const CART_KEY = "flipkart-clone-cart";
const WISHLIST_KEY = "flipkart-clone-wishlist";

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem(WISHLIST_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    async function loadProducts() {
      const response = await fetch(apiUrl("/api/products"));
      const data = await response.json();
      setProducts(data.products);
      setCategories(["All", ...data.categories]);
    }

    loadProducts().catch(() => {
      setProducts([]);
      setCategories(["All"]);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, searchTerm]);

  const cartItems = useMemo(() => {
    return cart
      .map((entry) => {
        const product = products.find((item) => item.id === entry.productId);
        return product ? { ...product, quantity: entry.quantity } : null;
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price.current * item.quantity,
      0
    );
    const deliveryFee = subtotal > 0 ? 40 : 0;
    const discount = cartItems.reduce(
      (sum, item) => sum + (item.price.original - item.price.current) * item.quantity,
      0
    );

    return {
      subtotal,
      discount,
      deliveryFee,
      total: subtotal + deliveryFee,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cartItems]);

  const wishlistItems = useMemo(() => {
    return wishlist
      .map((productId) => products.find((item) => item.id === productId))
      .filter(Boolean);
  }, [products, wishlist]);

  function addToCart(productId, quantity = 1) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { productId, quantity }];
    });
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }

  function removeFromCart(productId) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  function toggleWishlist(productId) {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((item) => item !== productId)
        : [...current, productId]
    );
  }

  function isWishlisted(productId) {
    return wishlist.includes(productId);
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        filteredProducts,
        searchTerm,
        setSearchTerm,
        activeCategory,
        setActiveCategory,
        cartItems,
        cartSummary,
        wishlistItems,
        wishlistCount: wishlist.length,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
