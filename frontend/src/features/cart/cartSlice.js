import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  storeSlug: null,
  storeId: null,
  items: [], // { product: ID, name: String, price: Number, quantity: Number, variant: String, image: String, maxInventory: Number }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state, action) => {
      const { storeSlug, storeId } = action.payload;
      state.storeSlug = storeSlug;
      state.storeId = storeId;
      
      const persisted = localStorage.getItem(`cart_${storeSlug}`);
      if (persisted) {
        try {
          state.items = JSON.parse(persisted);
        } catch (e) {
          state.items = [];
        }
      } else {
        state.items = [];
      }
    },
    addToCart: (state, action) => {
      const { product, name, price, quantity, variant, image, maxInventory } = action.payload;
      
      // Check if product with identical variant exists in cart
      const existingItem = state.items.find(
        (item) => item.product === product && item.variant === variant
      );

      if (existingItem) {
        // Enforce inventory checks
        const newQty = existingItem.quantity + quantity;
        existingItem.quantity = Math.min(newQty, maxInventory);
      } else {
        state.items.push({
          product,
          name,
          price,
          quantity: Math.min(quantity, maxInventory),
          variant,
          image,
          maxInventory,
        });
      }

      if (state.storeSlug) {
        localStorage.setItem(`cart_${state.storeSlug}`, JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action) => {
      const { product, variant } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.product === product && item.variant === variant)
      );

      if (state.storeSlug) {
        localStorage.setItem(`cart_${state.storeSlug}`, JSON.stringify(state.items));
      }
    },
    updateQuantity: (state, action) => {
      const { product, variant, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.product === product && i.variant === variant
      );
      
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.maxInventory));
      }

      if (state.storeSlug) {
        localStorage.setItem(`cart_${state.storeSlug}`, JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      if (state.storeSlug) {
        localStorage.removeItem(`cart_${state.storeSlug}`);
      }
    },
  },
});

export const { initializeCart, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCartItemsCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
