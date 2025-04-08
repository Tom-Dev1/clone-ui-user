import { SalesLayout } from "@/layouts/sale-layout"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
                        <div className="flex justify-between  items-center mb-2">
                            <TabsList>
                                <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                                <TabsTrigger value="categories">Danh mục</TabsTrigger>
                            </TabsList>
                        </div>
                        <div>
                            <TabsContent value="products" className="mt-0">
                                <ProductList />
                            </TabsContent>
                            <TabsContent value="categories" className="mt-0">
                                <CategoryList />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>

            </div>
        </SalesLayout>
    )
}

export default SalesProducts