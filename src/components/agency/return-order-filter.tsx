"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ReturnOrderFilterProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    dateRange: {
        from: Date | undefined
        to: Date | undefined
    }
    setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
}

export const ReturnOrderFilter = ({ searchQuery, setSearchQuery, dateRange, setDateRange }: ReturnOrderFilterProps) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Tìm kiếm theo mã đơn, sản phẩm, lý do..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[240px] justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                                    {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                                </>
                            ) : (
                                format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                            )
                        ) : (
                            "Chọn khoảng thời gian"
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                        <div className="grid gap-2">
                            <div className="grid gap-1">
                                <Label htmlFor="from">Từ ngày</Label>
                                <Calendar
                                    mode="single"
                                    selected={dateRange.from}
                                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                                    initialFocus
                                    locale={vi}
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="to">Đến ngày</Label>
                                <Calendar
                                    mode="single"
                                    selected={dateRange.to}
                                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                                    initialFocus
                                    locale={vi}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setDateRange({ from: undefined, to: undefined })} size="sm">
                                Xóa bộ lọc
                            </Button>
                            <Button
                                onClick={() => document.body.click()} // Close the popover
                                size="sm"
                            >
                                Áp dụng
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
