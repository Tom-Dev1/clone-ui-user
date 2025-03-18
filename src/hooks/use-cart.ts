import { useDispatch, useSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { addToCart, removeFromCart, updateQuantity, clearCart } from "@/store/cartSlice"
import type { ProductDetail } from "@/services/product-service"

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function useCart() {
    const dispatch = useAppDispatch()
    const cartItems = useAppSelector((state) => state.cart.items)

    const addItem = (product: ProductDetail, quantity = 1) => {
        dispatch(addToCart({ product, quantity }))
    }

    const removeItem = (productId: number) => {
        dispatch(removeFromCart(productId))
    }

    const updateItemQuantity = (productId: number, quantity: number) => {
        dispatch(updateQuantity({ productId, quantity }))
    }

    const clearAllItems = () => {
        dispatch(clearCart())
    }

    const getCartTotal = () => {
        // Calculate the total quantity of all items in the cart
        return cartItems.reduce((total, item) => total + item.quantity, 0)
    }

    return {
        items: cartItems,
        addItem,
        removeItem,
        updateItemQuantity,
        clearAllItems,
        getCartTotal,
    }
}

