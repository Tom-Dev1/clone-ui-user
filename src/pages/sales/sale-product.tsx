import { SalesLayout } from "@/layouts/sale-layout"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import ProductList from "@/components/sales/ProductList"
import CategoryList from "@/components/sales/CategoryList"
const SalesProducts = () => {
    const [activeTab, setActiveTab] = useState("products")

    return (
        <SalesLayout>

            <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <TabsList>
                        <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                        <TabsTrigger value="categories">Danh mục</TabsTrigger>
                    </TabsList>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{activeTab === "products" ? "Danh sách sản phẩm" : "Danh sách danh mục"}</CardTitle>
                        <CardDescription>
                            {activeTab === "products"
                                ? "Xem và quản lý tất cả sản phẩm trong hệ thống"
                                : "Xem và quản lý các danh mục sản phẩm"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="products" className="mt-0">
                            <ProductList />
                        </TabsContent>
                        <TabsContent value="categories" className="mt-0">
                            <CategoryList />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>

        </SalesLayout>
    )
}

export default SalesProducts