"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ReturnOrderFilterProps {
    onFilterChange: (status: string, search: string, dates: { from: Date | undefined; to: Date | undefined }) => void
    statusFilter: string
    searchText: string
    dateRange: {
        from: Date | undefined
        to: Date | undefined
    }
}

export default function ReturnOrderFilter({
    onFilterChange,
    statusFilter,
    searchText,
    dateRange,
}: ReturnOrderFilterProps) {
    const [status, setStatus] = useState(statusFilter)
    const [search, setSearch] = useState(searchText)
    const [dates, setDates] = useState(dateRange)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    // Apply filters when they change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onFilterChange(status, search, dates)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [status, search, dates, onFilterChange])

    // Format date range for display
    const formatDateRange = () => {
        if (!dates.from && !dates.to) return "Chọn khoảng thời gian"

        if (dates.from && dates.to) {
            return `${format(dates.from, "dd/MM/yyyy")} - ${format(dates.to, "dd/MM/yyyy")}`
        }

        if (dates.from) {
            return `Từ ${format(dates.from, "dd/MM/yyyy")}`
        }

        return `Đến ${format(dates.to!, "dd/MM/yyyy")}`
    }

    // Reset all filters
    const resetFilters = () => {
        setStatus("all")
        setSearch("")
        setDates({ from: undefined, to: undefined })
    }

    // Check if any filters are active
    const hasActiveFilters = status !== "all" || search !== "" || dates.from || dates.to

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="status-filter">Trạng thái</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status-filter">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="approved">Đã chấp nhận</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="search-filter">Tìm kiếm</Label>
                    <Input
                        id="search-filter"
                        placeholder="Tìm theo mã đơn, đại lý, sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date-filter">Khoảng thời gian</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button id="date-filter" variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formatDateRange()}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dates.from}
                                selected={{ from: dates.from, to: dates.to }}
                                onSelect={(range) => {
                                    setDates({
                                        from: range?.from,
                                        to: range?.to,
                                    })
                                    if (range?.to) {
                                        setIsCalendarOpen(false)
                                    }
                                }}
                                locale={vi}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="flex items-center">
                    <div className="text-sm text-muted-foreground mr-2">Bộ lọc đang áp dụng:</div>
                    <div className="flex flex-wrap gap-2">
                        {status !== "all" && (
                            <Badge variant="secondary" onClick={() => setStatus("all")}>
                                Trạng thái:{" "}
                                {status === "pending"
                                    ? "Chờ xử lý"
                                    : status === "approved"
                                        ? "Đã chấp nhận"
                                        : status === "completed"
                                            ? "Hoàn thành"
                                            : "Từ chối"}
                                <X className="ml-1 h-3 w-3" />
                            </Badge>
                        )}
                        {search && (
                            <Badge variant="secondary" onClick={() => setSearch("")}>
                                Tìm kiếm: {search}
                                <X className="ml-1 h-3 w-3" />
                            </Badge>
                        )}
                        {(dates.from || dates.to) && (
                            <Badge variant="secondary" onClick={() => setDates({ from: undefined, to: undefined })}>
                                Thời gian: {formatDateRange()}
                                <X className="ml-1 h-3 w-3" />
                            </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                            Xóa tất cả
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

import { Badge } from "@/components/ui/badge"
