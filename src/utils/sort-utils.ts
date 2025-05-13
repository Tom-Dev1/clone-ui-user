import type { RequestExport } from "@/types/export-request"
import { getTotalValue } from "./format-export"

// Sort data function
export const sortData = (data: RequestExport[], field: string, direction: "asc" | "desc") => {
    return [...data].sort((a, b) => {
        let valueA, valueB

        // Determine values to compare based on field
        switch (field) {
            case "requestDate":
                valueA = a.requestDate ? new Date(a.requestDate).getTime() : 0
                valueB = b.requestDate ? new Date(b.requestDate).getTime() : 0
                break
            case "status":
                valueA = a.status || ""
                valueB = b.status || ""
                break
            case "totalValue":
                valueA = getTotalValue(a)
                valueB = getTotalValue(b)
                break
            default:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                valueA = (a as any)[field] || ""
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                valueB = (b as any)[field] || ""
        }

        // Compare values
        if (typeof valueA === "string" && typeof valueB === "string") {
            return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
        } else {
            return direction === "asc" ? (valueA > valueB ? 1 : -1) : valueA < valueB ? 1 : -1
        }
    })
}
