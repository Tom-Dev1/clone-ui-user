import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export interface ProductCategoryProps {
    title: string
    href: string
    image: string
    className?: string
}

export function ProductCategory({ title, href, image, className }: ProductCategoryProps) {
    return (
        <Link to={href} className={cn("block relative group overflow-hidden rounded-3xl", className)}>
            <div className="relative overflow-hidden">
                <img
                    src={image || "/placeholder.svg"}
                    alt={title}
                    className="w-full max-h-[369px] object-cover transition-transform duration-500 group-hover:scale-105"
                />


                <div className="absolute bottom-6 w-96 left-0 right-0 bg-gradient-to-l from-transparent to-white py-3 px-6">
                    <h3 className="text-2xl font-normal text-gray-800">{title}</h3>
                </div>
            </div>
        </Link>
    )
}

export interface ProductCategoryGridProps {
    categories: ProductCategoryProps[]
    className?: string
}

export function ProductCategoryGrid({ categories, className }: ProductCategoryGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-10", className)}>
            {categories.map((category, index) => (
                <ProductCategory key={index} {...category} />
            ))}
        </div>
    )
}

