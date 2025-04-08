import { SalesLayout } from "@/layouts/sale-layout"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import ProductList from "@/components/sales/ProductList"
import CategoryList from "@/components/sales/CategoryList"
const SalesProducts = () => {
    const [activeTab, setActiveTab] = useState("products")

    return (
        <SalesLayout>
            <div className="m-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Quản Lý Sản Phẩm</h1>
                </div>
                <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="bg-white py-2">
                        <div className="flex justify-between  items-center m-6">
                            <TabsList>
                                <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                                <TabsTrigger value="categories">Danh mục</TabsTrigger>
                            </TabsList>
                        </div>
                        <CardHeader>
                            <CardTitle>{activeTab === "products" ? "Danh sách sản phẩm" : "Danh sách danh mục"}</CardTitle>

                        </CardHeader>
                        <CardContent>
                            <TabsContent value="products" className="mt-0">
                                <ProductList />
                            </TabsContent>
                            <TabsContent value="categories" className="mt-0">
                                <CategoryList />
                            </TabsContent>
                        </CardContent>
                    </div>
                </Tabs>

            </div>
        </SalesLayout>
    )
}

export default SalesProducts