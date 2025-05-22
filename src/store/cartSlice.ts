import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ProductDetail } from "@/services/product-service"

export interface CartItem {
  productId: number
  productName: string
  productCode: string
  unit: string
  quantity: number
  availableStock: number
  price: number
  images?: string[]
}

interface CartState {
  items: CartItem[]
}

// Hàm helper để lưu cart vào localStorage
const saveCartToLocalStorage = (items: CartItem[]) => {
  localStorage.setItem('cart_items', JSON.stringify(items));
}

// Lấy initial state từ localStorage nếu có
const initialState: CartState = {
  items: (() => {
    const savedCart = localStorage.getItem('cart_items');
    return savedCart ? JSON.parse(savedCart) : [];
  })(),
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ product: ProductDetail; quantity: number }>) => {
      const { product, quantity } = action.payload
      const existingItem = state.items.find((item) => item.productId === product.productId)

      if (existingItem) {
        // Đảm bảo số lượng không vượt quá availableStock
        const newQuantity = existingItem.quantity + quantity
        existingItem.quantity = Math.min(newQuantity, product.availableStock)
      } else {
        // Thêm sản phẩm mới vào giỏ hàng với availableStock
        state.items.push({
          productId: product.productId,
          productName: product.productName,
          productCode: product.productCode,
          unit: product.unit,
          quantity: Math.min(quantity, product.availableStock),
          availableStock: product.availableStock,
          price: product.price,
          images: product.images,
        })
      }
      // Lưu vào localStorage sau khi thêm
      saveCartToLocalStorage(state.items)
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload)
      // Lưu vào localStorage sau khi xóa
      saveCartToLocalStorage(state.items)
    },
    updateItemQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload
      const item = state.items.find((item) => item.productId === productId)

      if (item) {
        // Đảm bảo số lượng không vượt quá availableStock
        item.quantity = Math.min(quantity, item.availableStock)
      }
      // Lưu vào localStorage sau khi cập nhật
      saveCartToLocalStorage(state.items)
    },
    clearAllItems: (state) => {
      state.items = []
      // Xóa cart khỏi localStorage
      localStorage.removeItem('cart_items')
    },
  },
})

export const { addItem, removeItem, updateItemQuantity, clearAllItems } = cartSlice.actions

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items

export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0)

export const selectCartProductCount = (state: { cart: CartState }) =>
  state.cart.items.length

export const selectCartTotalPrice = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0)

export default cartSlice.reducer

