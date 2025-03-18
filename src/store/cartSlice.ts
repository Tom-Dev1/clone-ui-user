import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ProductDetail } from "@/services/product-service"

export interface CartItem {
  productId: number
  productName: string
  productCode: string
  unit: string
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: ProductDetail; quantity: number }>) => {
      const { product, quantity } = action.payload
      const existingItem = state.items.find((item) => item.productId === product.productId)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({
          productId: product.productId,
          productName: product.productName,
          productCode: product.productCode,
          unit: product.unit,
          quantity,
          image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        })
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload
      const item = state.items.find((item) => item.productId === productId)
      if (item) {
        item.quantity = quantity
      }
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

export default cartSlice.reducer

