
import { useParams } from "react-router-dom"
import { PageHeader } from "@/components/page-header"
import { ResponsiveContainer } from "@/components/responsive-container"

export default function ProductCategory() {
    const { category } = useParams()

    // Map category slugs to display names
    const getCategoryName = (slug: string | undefined) => {
        const categoryMap: Record<string, string> = {
            "thuoc-tru-oc-1": "Thuốc trừ ốc",
            "thuoc-tru-co": "Thuốc trừ cỏ",
            "thuoc-tru-sau": "Thuốc trừ sâu",
            "thuoc-tru-benh": "Thuốc trừ bệnh",
            "thuoc-duong": "Thuốc dưỡng",
            "phan-bon": "Phân bón",
        }

        return categoryMap[slug || ""] || "Sản phẩm"
    }

    return (
        <div className="py-12">
            <ResponsiveContainer maxWidth="3xl">
                <PageHeader
                    title={getCategoryName(category)}
                    description="Khám phá các sản phẩm chất lượng cao của chúng tôi"
                />

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/5 xl:w-1/6">
                        <div className="bg-white p-6 rounded-lg border sticky top-24">
                            <h3 className="font-medium text-lg mb-4">Danh mục</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/collections" className="text-muted-foreground hover:text-primary">
                                        Tất cả sản phẩm
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/collections/thuoc-tru-oc-1"
                                        className={`${category === "thuoc-tru-oc-1" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-primary`}
                                    >
                                        Thuốc trừ ốc
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/collections/thuoc-tru-co"
                                        className={`${category === "thuoc-tru-co" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-primary`}
                                    >
                                        Thuốc trừ cỏ
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/collections/thuoc-tru-sau"
                                        className={`${category === "thuoc-tru-sau" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-primary`}
                                    >
                                        Thuốc trừ sâu
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/collections/thuoc-tru-benh"
                                        className={`${category === "thuoc-tru-benh" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-primary`}
                                    >
                                        Thuốc trừ bệnh
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/collections/thuoc-duong"
                                        className={`${category === "thuoc-duong" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-primary`}
                                    >
                                        Thuốc dưỡng
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/collections/phan-bon"
                                        className={`${category === "phan-bon" ? "text-primary font-medium" : "text-muted-foreground"} hover:text-primary`}
                                    >
                                        Phân bón
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:w-4/5 xl:w-5/6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border group hover:shadow-md transition-all">
                                    <div className="aspect-square bg-muted rounded-md mb-4 overflow-hidden">
                                        <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <span className="text-muted-foreground">Image {i + 1}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-medium">
                                        {getCategoryName(category)} {i + 1}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">Mô tả ngắn về sản phẩm</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-medium text-primary">120.000 ₫</span>
                                        <button className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded">Chi tiết</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-8">
                            <nav className="flex items-center space-x-2">
                                <button className="w-10 h-10 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted">
                                    &laquo;
                                </button>
                                <button className="w-10 h-10 rounded-md border flex items-center justify-center bg-primary text-primary-foreground">
                                    1
                                </button>
                                <button className="w-10 h-10 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted">
                                    2
                                </button>
                                <button className="w-10 h-10 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted">
                                    3
                                </button>
                                <button className="w-10 h-10 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted">
                                    &raquo;
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </ResponsiveContainer>
        </div>
    )
}

