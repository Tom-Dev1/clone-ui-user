"use client";

import { useEffect, useState } from "react";
import {
  fetchAllProducts,
  fetchProductCategories,
} from "@/services/product-service";
import type { ProductCard, ProductCategory } from "@/services/product-service";
import { PageHeader } from "@/components/page-header";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ProductCard as ProductCardComponent } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { FloatingChat } from "@/components/floating-chat";

export default function CollectionsHome() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products and categories on component mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch products with default parameters
        const productsData = await fetchAllProducts();
        setProducts(productsData);

        // Fetch categories for the sidebar
        const categoriesData = await fetchProductCategories();
        setCategories(
          categoriesData
            .filter((cat) => cat.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);
  console.log(products);

  return (
    <div className="py-12 mx-auto">
      <ResponsiveContainer maxWidth="2xl">
        <PageHeader
          title="Tất cả sản phẩm"
          description="Sản phẩm chất lượng với những thương hiệu lớn"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories sidebar */}
          <div className="lg:w-1/5 xl:w-1/6">
            <div className="bg-white p-6 rounded-lg border sticky top-24">
              <h3 className="font-medium text-lg mb-4">Loại</h3>
              {loading && categories.length === 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/collections"
                      className="text-primary font-medium hover:text-primary"
                    >
                      Tất cả
                    </Link>
                  </li>
                  {categories &&
                    categories.map((category) => (
                      <li key={category.categoryId}>
                        <Link
                          to={`/collections/${category.categoryId}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {category.categoryName}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* Products grid */}
          <div className="lg:w-4/5 xl:w-5/6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border">
                    <Skeleton className="aspect-square w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {!products ? (
                  <div className="bg-muted/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">
                      Error loading products
                    </h3>
                    <p className="text-muted-foreground">
                      Unable to load products. Please try again later.
                    </p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="bg-muted/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">
                      No products found
                    </h3>
                    <p className="text-muted-foreground">
                      We couldn't find any products matching your criteria.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCardComponent
                        key={product.productId}
                        product={product}
                        categoryId=""
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </ResponsiveContainer>
      {/* <div className="fixed bottom-6 right-6 z-30">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                    <a
                        href="tel:02812345678"
                        className="relative flex items-center justify-center w-16 h-16 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    >
                        <Phone className="h-6 w-6 text-primary-foreground" />
                    </a>
                </div>
            </div> */}
      {/* Floating chat button */}
      <FloatingChat />
    </div>
  );
}
