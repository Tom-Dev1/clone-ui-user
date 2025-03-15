import { useState, useEffect } from "react"

type ScrollDirection = "up" | "down" | null

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
    const [prevScrollY, setPrevScrollY] = useState(0)
    const [isAtTop, setIsAtTop] = useState(true)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            // Determine if we're at the top of the page
            setIsAtTop(currentScrollY < 10)
            // Only update direction if we've scrolled more than 5px (prevents micro-movements)
            if (Math.abs(currentScrollY - prevScrollY) < 5) {
                return
            }
            const newScrollDirection = currentScrollY > prevScrollY ? "down" : "up"
            setScrollDirection(newScrollDirection)
            setPrevScrollY(currentScrollY)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [prevScrollY])

    return { scrollDirection, isAtTop }
}
