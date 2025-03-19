"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AgencyLayout } from "@/layouts/agency-layout"
import { ResponsiveContainer } from "@/components/responsive-container"
import { isAuthenticated, isAgency } from "@/utils/auth-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, BanknoteIcon, QrCode } from "lucide-react"

// Định nghĩa kiểu dữ liệu cho công nợ
interface DebtItem {
    id: string
    orderNumber: string
    createdDate: string
    dueDate: string
    amount: number
    status: "unpaid" | "partially_paid" | "paid"
    paidAmount: number
}

export default function AgencyPayment() {
    const navigate = useNavigate()
    const [debts, setDebts] = useState<DebtItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null)
    const [paymentAmount, setPaymentAmount] = useState<string>("")
    // const [paymentMethod, setPaymentMethod] = useState<string>("bank")
    const [showPaymentForm, setShowPaymentForm] = useState(false)

    // Kiểm tra xác thực và quyền truy cập
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login")
            return
        }

        if (!isAgency()) {
            navigate("/unauthorized")
            return
        }
    }, [navigate])

    // Dữ liệu mẫu
    useEffect(() => {
        const fetchDebts = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
                // const response = await get<DebtItem[]>("/api/agency/debts")

                // Dữ liệu mẫu
                const sampleDebts: DebtItem[] = [
                    {
                        id: "DEBT001",
                        orderNumber: "DH-2023001",
                        createdDate: "2023-11-15T10:30:00",
                        dueDate: "2023-12-15T00:00:00",
                        amount: 1250000,
                        status: "unpaid",
                        paidAmount: 0,
                    },
                    {
                        id: "DEBT002",
                        orderNumber: "DH-2023002",
                        createdDate: "2023-11-20T14:15:00",
                        dueDate: "2023-12-20T00:00:00",
                        amount: 650000,
                        status: "partially_paid",
                        paidAmount: 300000,
                    },
                    {
                        id: "DEBT003",
                        orderNumber: "DH-2023003",
                        createdDate: "2023-10-25T09:45:00",
                        dueDate: "2023-11-25T00:00:00",
                        amount: 350000,
                        status: "paid",
                        paidAmount: 350000,
                    },
                    {
                        id: "DEBT004",
                        orderNumber: "DH-2023005",
                        createdDate: "2023-11-05T16:20:00",
                        dueDate: "2023-12-05T00:00:00",
                        amount: 825000,
                        status: "unpaid",
                        paidAmount: 0,
                    },
                ]

                setDebts(sampleDebts)
            } catch (err) {
                console.error("Error fetching debts:", err)
                setError("Đã xảy ra lỗi khi tải dữ liệu công nợ")
            } finally {
                setIsLoading(false)
            }
        }

        fetchDebts()
    }, [])

    // Hiển thị form thanh toán
    const handleShowPaymentForm = (debt: DebtItem) => {
        setSelectedDebt(debt)
        setPaymentAmount((debt.amount - debt.paidAmount).toString())
        setShowPaymentForm(true)
    }

    // Xử lý thanh toán
    const handlePayment = () => {
        if (!selectedDebt || !paymentAmount || Number(paymentAmount) <= 0) {
            return
        }

        // const amount = Number(paymentAmount)

        // Trong thực tế, bạn sẽ gọi API để xử lý thanh toán
        // await post("/api/agency/payments", {
        //   debtId: selectedDebt.id,
        //   amount,
        //   method: paymentMethod
        // })

        // Cập nhật trạng thái công nợ
        // const updatedDebts = debts.map((debt) => {
        //     if (debt.id === selectedDebt.id) {
        //         const newPaidAmount = debt.paidAmount + amount
        //         const newStatus = newPaidAmount >= debt.amount ? "paid" : "partially_paid"

        //         return {
        //             ...debt,
        //             paidAmount: newPaidAmount,
        //             status: newStatus,
        //         }
        //     }
        //     return debt
        // })

        // setDebts(updatedDebts)
        setShowPaymentForm(false)
        setSelectedDebt(null)
        setPaymentAmount("")

        alert("Thanh toán thành công!")
    }

    // Hiển thị trạng thái công nợ
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "unpaid":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Chưa thanh toán
                    </Badge>
                )
            case "partially_paid":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Thanh toán một phần
                    </Badge>
                )
            case "paid":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Đã thanh toán
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Format ngày giờ
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    // Format số tiền
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " đ"
    }

    // Tính tổng công nợ
    const calculateTotalDebt = () => {
        return debts
            .filter((debt) => debt.status !== "paid")
            .reduce((total, debt) => total + (debt.amount - debt.paidAmount), 0)
    }

    // Tính số công nợ sắp đến hạn (trong vòng 7 ngày)
    const calculateUpcomingDebt = () => {
        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)

        return debts
            .filter((debt) => {
                const dueDate = new Date(debt.dueDate)
                return debt.status !== "paid" && dueDate <= nextWeek && dueDate >= today
            })
            .reduce((total, debt) => total + (debt.amount - debt.paidAmount), 0)
    }

    return (
        <AgencyLayout>
            <div className="py-8">
                <ResponsiveContainer>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Thanh toán</h1>
                        <p className="text-gray-500 mt-1">Quản lý và thanh toán công nợ</p>
                    </div>

                    {/* Thống kê công nợ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Tổng công nợ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{formatCurrency(calculateTotalDebt())}</p>
                                <p className="text-sm text-gray-500 mt-1">Cần thanh toán</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Sắp đến hạn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{formatCurrency(calculateUpcomingDebt())}</p>
                                <p className="text-sm text-gray-500 mt-1">Trong 7 ngày tới</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Đã thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    {formatCurrency(debts.reduce((total, debt) => total + debt.paidAmount, 0))}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Tổng đã thanh toán</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Danh sách công nợ</CardTitle>
                            <CardDescription>Quản lý và thanh toán các khoản công nợ</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
                            ) : debts.length === 0 ? (
                                <div className="text-center py-8">
                                    <p>Không có khoản công nợ nào.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Mã đơn hàng</TableHead>
                                                <TableHead>Ngày tạo</TableHead>
                                                <TableHead>Hạn thanh toán</TableHead>
                                                <TableHead>Tổng tiền</TableHead>
                                                <TableHead>Đã thanh toán</TableHead>
                                                <TableHead>Còn lại</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {debts.map((debt) => (
                                                <TableRow key={debt.id}>
                                                    <TableCell className="font-medium">{debt.orderNumber}</TableCell>
                                                    <TableCell>{formatDateTime(debt.createdDate)}</TableCell>
                                                    <TableCell>{formatDateTime(debt.dueDate)}</TableCell>
                                                    <TableCell>{formatCurrency(debt.amount)}</TableCell>
                                                    <TableCell>{formatCurrency(debt.paidAmount)}</TableCell>
                                                    <TableCell>{formatCurrency(debt.amount - debt.paidAmount)}</TableCell>
                                                    <TableCell>{renderStatusBadge(debt.status)}</TableCell>
                                                    <TableCell>
                                                        {debt.status !== "paid" && (
                                                            <Button variant="outline" size="sm" onClick={() => handleShowPaymentForm(debt)}>
                                                                Thanh toán
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Form Modal */}
                    {selectedDebt && showPaymentForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold">Thanh toán công nợ</h2>
                                        <button onClick={() => setShowPaymentForm(false)} className="text-gray-500 hover:text-gray-700">
                                            ✕
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Đơn hàng</p>
                                            <p className="font-medium">{selectedDebt.orderNumber}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Tổng công nợ</p>
                                            <p className="font-medium">{formatCurrency(selectedDebt.amount)}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Đã thanh toán</p>
                                            <p className="font-medium">{formatCurrency(selectedDebt.paidAmount)}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Còn lại</p>
                                            <p className="font-bold text-lg">
                                                {formatCurrency(selectedDebt.amount - selectedDebt.paidAmount)}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="payment-amount">Số tiền thanh toán</Label>
                                            <Input
                                                id="payment-amount"
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                min="1"
                                                max={selectedDebt.amount - selectedDebt.paidAmount}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Phương thức thanh toán</Label>
                                            <Tabs defaultValue="bank">
                                                <TabsList className="grid grid-cols-3 w-full">
                                                    <TabsTrigger value="bank" className="flex items-center gap-2">
                                                        <BanknoteIcon className="h-4 w-4" />
                                                        <span>Chuyển khoản</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="card" className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4" />
                                                        <span>Thẻ tín dụng</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="qr" className="flex items-center gap-2">
                                                        <QrCode className="h-4 w-4" />
                                                        <span>QR Code</span>
                                                    </TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="bank" className="p-4 border rounded-md mt-2">
                                                    <p className="font-medium">Thông tin chuyển khoản</p>
                                                    <p className="text-sm mt-2">
                                                        Ngân hàng: <span className="font-medium">Vietcombank</span>
                                                    </p>
                                                    <p className="text-sm">
                                                        Số tài khoản: <span className="font-medium">1234567890</span>
                                                    </p>
                                                    <p className="text-sm">
                                                        Chủ tài khoản: <span className="font-medium">CÔNG TY TNHH ABC</span>
                                                    </p>
                                                    <p className="text-sm">
                                                        Nội dung: <span className="font-medium">{selectedDebt.orderNumber}</span>
                                                    </p>
                                                </TabsContent>
                                                <TabsContent value="card" className="p-4 border rounded-md mt-2">
                                                    <p className="font-medium">Thanh toán bằng thẻ tín dụng</p>
                                                    <div className="space-y-2 mt-2">
                                                        <Label htmlFor="card-number">Số thẻ</Label>
                                                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="expiry">Ngày hết hạn</Label>
                                                            <Input id="expiry" placeholder="MM/YY" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="cvv">CVV</Label>
                                                            <Input id="cvv" placeholder="123" />
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="qr" className="p-4 border rounded-md mt-2 text-center">
                                                    <p className="font-medium mb-2">Quét mã QR để thanh toán</p>
                                                    <div className="bg-gray-100 w-48 h-48 mx-auto flex items-center justify-center">
                                                        <QrCode className="h-24 w-24 text-gray-400" />
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-2 mt-6">
                                        <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                                            Hủy
                                        </Button>
                                        <Button
                                            onClick={handlePayment}
                                            disabled={
                                                !paymentAmount ||
                                                Number(paymentAmount) <= 0 ||
                                                Number(paymentAmount) > selectedDebt.amount - selectedDebt.paidAmount
                                            }
                                        >
                                            Xác nhận thanh toán
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ResponsiveContainer>
            </div>
        </AgencyLayout>
    )
}

