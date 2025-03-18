import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Leaf,
  ShoppingBag,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

import { PageHeader } from "@/components/page-header";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ProductCategoriesSection } from "@/components/product-categories-section";
import { FeaturedProductsSection } from "@/components/featured-products-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function Home() {
  // Slideshow state and images
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image:
        "https://theme.hstatic.net/200000907029/1001282128/14/slide_1_img.jpg?v=318",
      title: "Không gian xanh cho ngôi nhà của bạn",
      subtitle: "Khám phá bộ sưu tập cây cảnh độc đáo",
    },
    {
      image:
        "https://theme.hstatic.net/200000907029/1001282128/14/slide_4_img.jpg?v=318",
      title: "Mang thiên nhiên vào không gian sống",
      subtitle: "Các loại cây phù hợp cho mọi không gian",
    },
    {
      image:
        "https://theme.hstatic.net/200000907029/1001282128/14/slide_3_img.jpg?v=318",
      title: "Cây cảnh trang trí nội thất",
      subtitle: "Tạo điểm nhấn cho không gian sống của bạn",
    },
    {
      image:
        "https://theme.hstatic.net/200000907029/1001282128/14/slide_2_img.jpg?v=318",
      title: "Chăm sóc cây trồng dễ dàng",
      subtitle: "Hướng dẫn và sản phẩm chăm sóc chuyên nghiệp",
    },
  ];

  // Autoplay functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  // Function to go to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Function to go to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Function to manually change slides
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Features section data
  const features = [
    {
      icon: <Leaf className="h-10 w-10 text-primary" />,
      title: "Cây trồng tự nhiên",
      description:
        "Cây trồng được chăm sóc trong môi trường tự nhiên, đảm bảo sức khỏe và độ bền",
    },
    {
      icon: <ShoppingBag className="h-10 w-10 text-primary" />,
      title: "Giao hàng nhanh chóng",
      description: "Đóng gói cẩn thận và giao hàng tận nơi trong vòng 24 giờ",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Hướng dẫn chăm sóc",
      description:
        "Kèm theo hướng dẫn chi tiết về cách chăm sóc cây trồng phù hợp",
    },
  ];

  // Blog posts data
  const blogPosts = [
    {
      image: "/placeholder.svg?height=300&width=500",
      title: "Cách chăm sóc cây xanh trong nhà",
      excerpt:
        "Những bí quyết giúp cây xanh trong nhà luôn khỏe mạnh và phát triển tốt.",
      date: "15/03/2023",
    },
    {
      image: "/placeholder.svg?height=300&width=500",
      title: "Top 10 cây cảnh dễ trồng cho người mới bắt đầu",
      excerpt:
        "Gợi ý những loại cây cảnh dễ chăm sóc, phù hợp với người mới bắt đầu trồng cây.",
      date: "20/04/2023",
    },
    {
      image: "/placeholder.svg?height=300&width=500",
      title: "Cách bố trí cây xanh trong không gian làm việc",
      excerpt:
        "Những ý tưởng sáng tạo để bố trí cây xanh trong văn phòng làm việc.",
      date: "05/05/2023",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section with Slideshow */}
      <section className="relative w-full" style={{ height: "700px" }}>
        {/* Slideshow */}
        <div className="absolute inset-0 overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={slide.image || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>

              {/* Slide content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: currentSlide === index ? 1 : 0,
                    y: currentSlide === index ? 0 : 20,
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="max-w-4xl mx-auto"
                >
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      Mua ngay
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
                    >
                      Tìm hiểu thêm
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next slide"
        >
          <ChevronRight className="h-8 w-8" />
        </button>

        {/* Slideshow Navigation Dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <ResponsiveContainer maxWidth="4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl transition-all"
              >
                <div className="mb-4 p-4 rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </section>

      {/* Product Categories Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <ResponsiveContainer maxWidth="4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Danh mục sản phẩm</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá các danh mục sản phẩm đa dạng của chúng tôi, từ cây cảnh
              nội thất đến cây ăn quả và phụ kiện chăm sóc cây
            </p>
          </div>
          <ProductCategoriesSection />
        </ResponsiveContainer>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <ResponsiveContainer maxWidth="4xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Sản phẩm nổi bật</h2>
              <p className="text-muted-foreground">
                Những sản phẩm được yêu thích nhất
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <FeaturedProductsSection />
          <div className="mt-8 text-center sm:hidden">
            <Button
              variant="outline"
              className="flex items-center gap-2 mx-auto"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <ResponsiveContainer maxWidth="4xl">
          <PageHeader
            title="Kiến thức cây trồng"
            description="Những kiến thức hữu ích về cách trồng và chăm sóc cây"
            className="text-center mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <Card
                key={i}
                className="overflow-hidden group hover:shadow-md transition-all border-slate-200 dark:border-slate-700"
              >
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm"
                    >
                      {post.date}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-primary flex items-center gap-2 group-hover:gap-3 transition-all"
                  >
                    Đọc thêm <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 mx-auto"
            >
              Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary/5 dark:bg-primary/10">
        <ResponsiveContainer maxWidth="4xl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Đăng ký nhận thông tin
                </h2>
                <p className="text-muted-foreground mb-6">
                  Nhận thông tin về sản phẩm mới, khuyến mãi và kiến thức chăm
                  sóc cây trồng
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button className="shrink-0">Đăng ký</Button>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="/placeholder.svg?height=300&width=400"
                  alt="Newsletter"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Add phone icon with ringing animation */}
      <div className="fixed bottom-6 right-6 z-30">
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
      </div>
    </div>
  );
}
