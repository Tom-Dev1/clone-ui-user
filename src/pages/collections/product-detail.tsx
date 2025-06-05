"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchProductById,
  fetchProductCategories,
} from "@/services/product-service";
import type {
  ProductDetail,
  ProductCategory,
} from "@/services/product-service";
import { ResponsiveContainer } from "@/components/responsive-container";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  ChevronLeft,
  Phone,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/utils/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FloatingChat } from "@/components/floating-chat";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const { addItem } = useCart();
  const userRole = localStorage.getItem("role_name");
  const canOrder = userRole === "SALES MANAGER" || userRole === "AGENCY";

  useEffect(() => {
    async function loadProduct() {
      if (!id) {
        navigate("/collections");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const productId = Number.parseInt(id, 10);
        if (isNaN(productId)) {
          setError("Invalid product ID");
          setLoading(false);
          return;
        }
        const productData = await fetchProductById(productId);
        if (!productData) {
          setError("Product not found");
          setLoading(false);
          return;
        }
        setProduct(productData);
        if (productData.categoryId) {
          const categories = await fetchProductCategories();
          const productCategory = categories.find(
            (c) => c.categoryId === productData.categoryId
          );
          setCategory(productCategory || null);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Could not load product information");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, navigate]);

  const handlePrevImage = () => {
    if (!product?.images?.length) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!product?.images?.length) return;
    setActiveImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value, 10);

    if (isNaN(newValue)) {
      setQuantity(1);
      setQuantityError(null);
      return;
    }

    if (product && newValue > product.availableStock) {
      setQuantity(product.availableStock);
      setQuantityError(
        `Số lượng tối đa là ${product.availableStock} ${product.unit}`
      );
      return;
    }

    if (newValue < 1) {
      setQuantity(1);
      setQuantityError("Số lượng tối thiểu là 1");
      return;
    }

    setQuantity(newValue);
    setQuantityError(null);
  };

  const incrementQuantity = () => {
    if (product && quantity < product.availableStock) {
      setQuantity((prev) => prev + 1);
      setQuantityError(null);
    } else if (product) {
      setQuantityError(
        `Số lượng tối đa là ${product.availableStock} ${product.unit}`
      );
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      setQuantityError(null);
    } else {
      setQuantityError("Số lượng tối thiểu là 1");
    }
  };

  const handleAddToCart = () => {
    if (product) {
      if (quantity > product.availableStock) {
        setQuantityError(
          `Số lượng tối đa là ${product.availableStock} ${product.unit}`
        );
        return;
      }

      addItem(product, quantity);
      toast.success(
        `Đã thêm ${quantity} ${product.unit} của ${product.productName} vào giỏ hàng`
      );
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <ResponsiveContainer>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md" />
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full mb-6" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-12">
        <ResponsiveContainer>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error || "Product not found"}
          </div>
          <Link to="/collections" className="text-primary hover:underline">
            &larr; Back to products
          </Link>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="py-12">
      <ResponsiveContainer>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            <div className="relative">
              <div className="aspect-square bg-white rounded-lg border overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <div className="relative w-full h-full">
                    {/* Main Image */}
                    <div className="w-full h-full">
                      <img
                        key={activeImageIndex} // Key helps React recognize this is a new image
                        src={
                          product.images[activeImageIndex] ||
                          "/placeholder.svg?height=500&width=500"
                        }
                        alt={product.productName}
                        className="w-full h-full object-contain transition-opacity duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg?height=500&width=500";
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/20">
                    <span className="text-muted-foreground">
                      No image available
                    </span>
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto p-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-md border overflow-hidden flex-shrink-0 transition-all duration-200 ${
                      activeImageIndex === index
                        ? "ring-2 ring-primary scale-105"
                        : "hover:ring-1 hover:ring-primary/50 hover:scale-[1.02]"
                    }`}
                    aria-label={`View image ${index + 1}`}
                    aria-current={activeImageIndex === index ? "true" : "false"}
                  >
                    <img
                      src={image || "/placeholder.svg?height=80&width=80"}
                      alt={`${product.productName} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder.svg?height=80&width=80";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:w-1/2">
            <h1 className="text-2xl font-bold mb-2">{product.productName}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">
                Mã sản phẩm: {product.productCode}
              </span>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">
                Đơn vị: {product.unit}
              </span>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg mb-6">
              <h2 className="font-medium mb-2">Mô tả sản phẩm</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm">Loại:</span>
                <span className="text-sm font-medium">
                  {category?.categoryName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm">Hạn sử dụng:</span>
                <span className="text-sm font-medium">
                  {product.defaultExpiration} days
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm">Số lượng:</span>
                <span className="text-sm font-medium">
                  {product.availableStock} {product.unit}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm">Giá</span>
                <span className="text-sm font-medium">
                  {formatCurrency(product.price)} VND
                </span>
              </div>
            </div>

            {canOrder && product.availableStock > 0 && (
              <div className="mt-6 pt-6 mb-5">
                <h3 className="font-medium mb-4">Số lượng đặt hàng</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={decrementQuantity}
                        className="px-3 py-2 border-r hover:bg-muted/20"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min={1}
                        max={product.availableStock}
                        className="w-16 text-center py-2 focus:outline-none"
                        aria-label="Quantity"
                      />
                      <button
                        onClick={incrementQuantity}
                        className="px-3 py-2 border-l hover:bg-muted/20"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Số lượng có sẵn: {product.availableStock} {product.unit}
                    </span>
                  </div>
                  {quantityError && (
                    <p className="text-sm text-red-500">{quantityError}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Nhập số lượng và nhấn "Thêm vào giỏ hàng" để thêm vào đơn
                    hàng
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {canOrder ? (
                product.availableStock > 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Thêm vào giỏ hàng
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-2 bg-muted text-muted-foreground rounded-md cursor-not-allowed flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Hết hàng
                  </button>
                )
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      Liên hệ đặt hàng
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Liên hệ đặt hàng</DialogTitle>
                      <DialogDescription>
                        Vui lòng liên hệ số hotline sau để đặt hàng
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Phone className="h-5 w-5" />
                      <a
                        href="tel:0901234567"
                        className="text-lg font-semibold text-primary hover:underline"
                      >
                        0901234567
                      </a>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Link
                to="/collections"
                className="px-6 py-2 border border-muted-foreground/30 rounded-md hover:bg-muted/20"
              >
                Quay lại sản phẩm
              </Link>
            </div>
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
