"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ExportRequestFilterProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    dateRange: {
        from: Date | undefined
        to: Date | undefined
    }
    setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
}

export const ExportRequestFilter = ({
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
}: ExportRequestFilterProps) => {
    return (
        <div className="flex w-full gap-4">
            <div className="flex gap-2 w-full">
                <div className="flex w-full gap-2">
                    <Input
                        placeholder="Tìm kiếm yêu cầu..."
                        className="w-full px-4 h-9 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="end">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Lọc theo ngày</h4>
                            <div className="flex flex-col gap-2">
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs">Từ ngày</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateRange.from}
                                                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                                                    initialFocus
                                                    locale={vi}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs">Đến ngày</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateRange.to}
                                                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                                                    initialFocus
                                                    locale={vi}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
