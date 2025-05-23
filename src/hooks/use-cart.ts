import { useDispatch, useSelector } from "react-redux"
import {
    addItem,
    removeItem,
    updateItemQuantity,
    clearAllItems,
    selectCartItems,
    selectCartItemCount,
    selectCartProductCount,
    selectCartTotalPrice,
} from "@/store/cartSlice"
import type { ProductDetail } from "@/services/product-service"

export function useCart() {
    const dispatch = useDispatch()
    const cartItems = useSelector(selectCartItems)
    const itemCount = useSelector(selectCartItemCount)
    const productCount = useSelector(selectCartProductCount)
    const totalPrice = useSelector(selectCartTotalPrice)

    const addItemToCart = (product: ProductDetail, quantity: number) => {
        if (quantity <= 0) {
            console.error("Quantity must be greater than 0")
            return
        }

        if (quantity > product.availableStock) {
            console.warn(`Quantity adjusted to available stock: ${product.availableStock}`)
            quantity = product.availableStock
        }

        dispatch(addItem({ product, quantity }))
    }

    const removeItemFromCart = (productId: number) => {
        dispatch(removeItem(productId))
    }

    const updateCartItemQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            console.error("Quantity must be greater than 0")
            return
        }

        const item = cartItems.find((item) => item.productId === productId)
        if (item && quantity > item.availableStock) {
            console.warn(`Quantity adjusted to available stock: ${item.availableStock}`)
            quantity = item.availableStock
        }

        dispatch(updateItemQuantity({ productId, quantity }))
    }

    const clearCart = () => {
        dispatch(clearAllItems())
    }

    return {
        cartItems,
        itemCount,
        productCount,
        totalPrice,
        addItem: addItemToCart,
        removeItem: removeItemFromCart,
        updateItemQuantity: updateCartItemQuantity,
        clearCart,
    }
}

