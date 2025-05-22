import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { Link } from "react-router-dom"


export function CartIndicator() {
    const { productCount } = useCart()
    const userRole = localStorage.getItem("role_name")
    const cartURL = userRole === "AGENCY" ? "/agency/product-request" : "/sales/cart"

    return (
        <Link to={cartURL} className={`relative `}>
            <ShoppingCart className="h-6 w-6" />
            {productCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {productCount > 99 ? "99+" : productCount}
                </span>
            )}
        </Link>
    )
}

