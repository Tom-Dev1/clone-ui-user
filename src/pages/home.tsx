"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { ResponsiveContainer } from "@/components/responsive-container"
import { ProductCategoriesSection } from "@/components/product-categories-section"

export default function Home() {
    // Slideshow state and images
    const [currentSlide, setCurrentSlide] = useState(0)
    const slides = [
        "https://theme.hstatic.net/200000907029/1001282128/14/slide_1_img.jpg?v=318",
        "https://theme.hstatic.net/200000907029/1001282128/14/slide_4_img.jpg?v=318",
        "https://theme.hstatic.net/200000907029/1001282128/14/slide_3_img.jpg?v=318",
        "https://theme.hstatic.net/200000907029/1001282128/14/slide_2_img.jpg?v=318",
    ]

    // Autoplay functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
        }, 4000) // Change slide every 34 seconds

        return () => clearInterval(interval)
    }, [slides.length])

    // Function to go to previous slide
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    }

    // Function to go to next slide
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }

    // Function to manually change slides
    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    return (
        <>
            <div>
                {/* Hero Section with Slideshow */}
                <div className="relative w-full" style={{ height: "600px" }}>
                    {/* Slideshow */}
                    <div className="absolute inset-0 overflow-hidden">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                                    }`}
                            >
                                <img
                                    src={slide || "/placeholder.svg"}
                                    alt={`Slide ${index + 1}`}
                                    className="w-full h-full object-cover object-center"
                                />
                            </div>
                        ))}
                        {/* Overlay for better text readability */}
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    {/* Arrow Navigation */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>

                    {/* Slideshow Navigation Dots */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>


                </div>

                {/* Rest of the content */}
                <div className="mt-10">
                    <ResponsiveContainer maxWidth="3xl">
                        <PageHeader
                            title="Sản phẩm nổi bật"
                            description="Khám phá các sản phẩm chất lượng cao của chúng tôi"
                            className="text-center "
                        />

                        <ProductCategoriesSection />

                    </ResponsiveContainer>
                </div>

                <div className="bg-muted py-16">
                    <ResponsiveContainer maxWidth="2xl">
                        <PageHeader
                            title="Kiến thức cây trồng"
                            description="Những kiến thức hữu ích về cách trồng và chăm sóc cây"
                            className="text-center mb-12"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-lg border hover:shadow-md transition-all">
                                    <div className="aspect-video bg-muted-foreground/10 rounded-md mb-4 flex items-center justify-center">
                                        <span className="text-muted-foreground">Image {i + 1}</span>
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">Bài viết {i + 1}</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam
                                        ultricies.
                                    </p>
                                    <button className="text-primary font-medium hover:underline">Đọc thêm</button>
                                </div>
                            ))}
                        </div>
                    </ResponsiveContainer>
                </div>


                {/* Add phone icon with ringing animation */}
                <div className="fixed bottom-6 right-6 z-30">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                        <a
                            href="tel:02812345678"
                            className="relative flex items-center justify-center w-16 h-16 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary-foreground animate-wiggle"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}

