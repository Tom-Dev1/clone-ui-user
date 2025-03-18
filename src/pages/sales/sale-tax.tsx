import { useState } from "react"
import { ResponsiveContainer } from "@/components/responsive-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calculator, Calendar, FileText, HelpCircle, Info, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SalesLayout } from "@/layouts/sale-layout"

const SalesTax = () => {
    const [vatAmount, setVatAmount] = useState<number | "">("")
    const [priceBeforeVat, setPriceBeforeVat] = useState<number | "">("")
    const [priceAfterVat, setPriceAfterVat] = useState<number | "">("")
    const [vatRate, setVatRate] = useState<number>(10)

    const calculateVatAmount = () => {
        if (priceBeforeVat !== "") {
            const amount = Number(priceBeforeVat) * (vatRate / 100)
            setVatAmount(Math.round(amount))
            setPriceAfterVat(Number(priceBeforeVat) + amount)
        }
    }

    const calculatePriceBeforeVat = () => {
        if (priceAfterVat !== "") {
            const price = Number(priceAfterVat) / (1 + vatRate / 100)
            setPriceBeforeVat(Math.round(price))
            setVatAmount(Number(priceAfterVat) - price)
        }
    }

    const resetCalculator = () => {
        setVatAmount("")
        setPriceBeforeVat("")
        setPriceAfterVat("")
    }

    return (
        <SalesLayout>
            <div className="py-8">
                <ResponsiveContainer>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Quản Lý Thuế</h1>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                <span className="hidden sm:inline">Tổng Quan</span>
                            </TabsTrigger>
                            <TabsTrigger value="rates" className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                <span className="hidden sm:inline">Biểu Thuế</span>
                            </TabsTrigger>
                            <TabsTrigger value="calculator" className="flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                <span className="hidden sm:inline">Tính Thuế</span>
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="hidden sm:inline">Lịch Thuế</span>
                            </TabsTrigger>
                            <TabsTrigger value="faq" className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">Hỏi Đáp</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Tổng Quan */}
                        <TabsContent value="overview" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tổng Quan Về Thuế</CardTitle>
                                    <CardDescription>
                                        Thông tin cơ bản về các loại thuế áp dụng cho doanh nghiệp tại Việt Nam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Thuế Giá Trị Gia Tăng (VAT)</h3>
                                        <p className="text-muted-foreground">
                                            Thuế GTGT là một loại thuế gián thu, được tính trên giá trị tăng thêm của hàng hóa, dịch vụ phát
                                            sinh trong quá trình từ sản xuất, lưu thông đến tiêu dùng. Thuế GTGT áp dụng cho hầu hết các hàng
                                            hóa và dịch vụ được mua bán tại Việt Nam.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Thuế Thu Nhập Doanh Nghiệp (TNDN)</h3>
                                        <p className="text-muted-foreground">
                                            Thuế TNDN là loại thuế trực thu, đánh vào thu nhập của doanh nghiệp. Thuế suất thuế TNDN phổ thông
                                            hiện nay là 20%. Một số trường hợp được hưởng ưu đãi thuế TNDN với mức thuế suất thấp hơn.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Thuế Xuất Nhập Khẩu</h3>
                                        <p className="text-muted-foreground">
                                            Thuế xuất khẩu, thuế nhập khẩu là loại thuế đánh vào hàng hóa được xuất khẩu hoặc nhập khẩu qua
                                            biên giới Việt Nam. Mức thuế suất thuế xuất khẩu, thuế nhập khẩu được quy định cụ thể cho từng mặt
                                            hàng.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Thuế Tiêu Thụ Đặc Biệt (TTĐB)</h3>
                                        <p className="text-muted-foreground">
                                            Thuế TTĐB là loại thuế gián thu đánh vào một số hàng hóa, dịch vụ đặc biệt mà Nhà nước cần điều
                                            tiết sản xuất và tiêu dùng như: thuốc lá, rượu, bia, xe ô tô dưới 24 chỗ ngồi, xe máy, xăng, điều
                                            hòa nhiệt độ...
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Nghĩa Vụ Thuế Của Doanh Nghiệp</CardTitle>
                                    <CardDescription>Các nghĩa vụ thuế cơ bản mà doanh nghiệp cần thực hiện</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <h3 className="font-medium">Đăng ký thuế</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Doanh nghiệp phải đăng ký thuế và được cấp mã số thuế trong thời hạn 10 ngày làm việc kể từ ngày
                                                được cấp Giấy chứng nhận đăng ký doanh nghiệp.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-medium">Khai thuế</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Doanh nghiệp phải khai thuế đầy đủ, chính xác, trung thực, đúng thời hạn và chịu trách nhiệm
                                                trước pháp luật về tính chính xác, trung thực của việc khai thuế.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-medium">Nộp thuế</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Doanh nghiệp phải nộp đủ, nộp đúng thời hạn các loại thuế, phí, lệ phí và các khoản thu khác vào
                                                ngân sách nhà nước.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-medium">Quyết toán thuế</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Doanh nghiệp phải thực hiện quyết toán thuế theo quy định của pháp luật về thuế.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Biểu Thuế */}
                        <TabsContent value="rates" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Biểu Thuế Giá Trị Gia Tăng (VAT)</CardTitle>
                                    <CardDescription>Các mức thuế suất VAT áp dụng cho hàng hóa, dịch vụ tại Việt Nam</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[200px]">Mức thuế suất</TableHead>
                                                <TableHead>Áp dụng cho</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-medium">0%</TableCell>
                                                <TableCell>
                                                    Hàng hóa, dịch vụ xuất khẩu; hoạt động xây dựng, lắp đặt công trình ở nước ngoài hoặc trong
                                                    khu phi thuế quan; vận tải quốc tế...
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">5%</TableCell>
                                                <TableCell>
                                                    Nước sạch; phân bón; thuốc chữa bệnh, thiết bị y tế; thực phẩm tươi sống; sách, báo, tạp chí;
                                                    dịch vụ khoa học công nghệ...
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">8%</TableCell>
                                                <TableCell>
                                                    Mức thuế suất mới được áp dụng từ 01/02/2022 đến 31/12/2022 theo Nghị định 15/2022/NĐ-CP (thay
                                                    cho mức 10%)
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">10%</TableCell>
                                                <TableCell>
                                                    Áp dụng cho các hàng hóa, dịch vụ không thuộc diện chịu thuế suất 0%, 5% hoặc không thuộc diện
                                                    không chịu thuế
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Biểu Thuế Thu Nhập Doanh Nghiệp (TNDN)</CardTitle>
                                    <CardDescription>Các mức thuế suất TNDN áp dụng cho doanh nghiệp tại Việt Nam</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[200px]">Mức thuế suất</TableHead>
                                                <TableHead>Áp dụng cho</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-medium">20%</TableCell>
                                                <TableCell>Mức thuế suất phổ thông áp dụng cho hầu hết các doanh nghiệp</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">15%</TableCell>
                                                <TableCell>Doanh nghiệp nhỏ và vừa, hợp tác xã, đơn vị sự nghiệp và tổ chức khác</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">10%</TableCell>
                                                <TableCell>
                                                    Thu nhập của doanh nghiệp từ thực hiện dự án đầu tư mới tại địa bàn có điều kiện kinh tế - xã
                                                    hội đặc biệt khó khăn, khu kinh tế, khu công nghệ cao...
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Hàng Hóa Không Chịu Thuế GTGT</CardTitle>
                                    <CardDescription>Danh mục một số hàng hóa, dịch vụ không chịu thuế GTGT</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                        <li>Sản phẩm trồng trọt, chăn nuôi, thủy sản chưa qua chế biến</li>
                                        <li>Sản phẩm muối</li>
                                        <li>Nhà ở thuộc sở hữu nhà nước</li>
                                        <li>Chuyển quyền sử dụng đất</li>
                                        <li>
                                            Bảo hiểm nhân thọ, bảo hiểm y tế, bảo hiểm giáo dục và các dịch vụ bảo hiểm khác liên quan đến con
                                            người
                                        </li>
                                        <li>Dịch vụ tín dụng, kinh doanh chứng khoán</li>
                                        <li>Dịch vụ khám chữa bệnh, y tế dự phòng và dịch vụ thú y</li>
                                        <li>Dạy học, dạy nghề theo quy định của pháp luật</li>
                                        <li>Xuất bản, nhập khẩu, phát hành báo, tạp chí, sách chính trị, sách giáo khoa, giáo trình...</li>
                                        <li>Vận chuyển hành khách công cộng bằng xe buýt, xe điện</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tính Thuế */}
                        <TabsContent value="calculator" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Công Cụ Tính Thuế GTGT</CardTitle>
                                    <CardDescription>Tính nhanh thuế giá trị gia tăng cho hàng hóa, dịch vụ</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="vat-rate">Thuế suất VAT</Label>
                                                <select
                                                    id="vat-rate"
                                                    className="w-full p-2 border rounded-md"
                                                    value={vatRate}
                                                    onChange={(e) => setVatRate(Number(e.target.value))}
                                                >
                                                    <option value="0">0%</option>
                                                    <option value="5">5%</option>
                                                    <option value="8">8%</option>
                                                    <option value="10">10%</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4 border p-4 rounded-md">
                                                <h3 className="font-medium">Tính từ giá chưa có thuế</h3>
                                                <div className="space-y-2">
                                                    <Label htmlFor="price-before-vat">Giá chưa có thuế (VNĐ)</Label>
                                                    <Input
                                                        id="price-before-vat"
                                                        type="number"
                                                        placeholder="Nhập giá chưa có thuế"
                                                        value={priceBeforeVat === "" ? "" : priceBeforeVat}
                                                        onChange={(e) => setPriceBeforeVat(e.target.value === "" ? "" : Number(e.target.value))}
                                                    />
                                                </div>
                                                <Button onClick={calculateVatAmount} className="w-full">
                                                    Tính thuế
                                                </Button>

                                                {priceBeforeVat !== "" && vatAmount !== "" && (
                                                    <div className="mt-4 p-3 bg-muted rounded-md">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="text-sm">Tiền thuế GTGT:</div>
                                                            <div className="text-sm font-medium text-right">
                                                                {typeof vatAmount === "number" ? vatAmount.toLocaleString() : ""} VNĐ
                                                            </div>
                                                            <div className="text-sm">Giá đã bao gồm thuế:</div>
                                                            <div className="text-sm font-medium text-right">
                                                                {typeof priceAfterVat === "number" ? priceAfterVat.toLocaleString() : ""} VNĐ
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4 border p-4 rounded-md">
                                                <h3 className="font-medium">Tính từ giá đã có thuế</h3>
                                                <div className="space-y-2">
                                                    <Label htmlFor="price-after-vat">Giá đã có thuế (VNĐ)</Label>
                                                    <Input
                                                        id="price-after-vat"
                                                        type="number"
                                                        placeholder="Nhập giá đã có thuế"
                                                        value={priceAfterVat === "" ? "" : priceAfterVat}
                                                        onChange={(e) => setPriceAfterVat(e.target.value === "" ? "" : Number(e.target.value))}
                                                    />
                                                </div>
                                                <Button onClick={calculatePriceBeforeVat} className="w-full">
                                                    Tính giá gốc
                                                </Button>

                                                {priceAfterVat !== "" && priceBeforeVat !== "" && (
                                                    <div className="mt-4 p-3 bg-muted rounded-md">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="text-sm">Giá chưa có thuế:</div>
                                                            <div className="text-sm font-medium text-right">
                                                                {typeof priceBeforeVat === "number" ? priceBeforeVat.toLocaleString() : ""} VNĐ
                                                            </div>
                                                            <div className="text-sm">Tiền thuế GTGT:</div>
                                                            <div className="text-sm font-medium text-right">
                                                                {typeof vatAmount === "number" ? vatAmount.toLocaleString() : ""} VNĐ
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <Button variant="outline" onClick={resetCalculator}>
                                                Đặt lại
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ví Dụ Tính Thuế GTGT</CardTitle>
                                    <CardDescription>Các ví dụ minh họa cách tính thuế GTGT</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-medium mb-2">Ví dụ 1: Tính thuế GTGT theo phương pháp khấu trừ</h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Công ty A mua nguyên vật liệu với giá chưa thuế là 100.000.000 VNĐ, thuế suất VAT là 10%. Sau
                                                đó, Công ty A bán thành phẩm với giá chưa thuế là 150.000.000 VNĐ, thuế suất VAT là 10%.
                                            </p>
                                            <div className="bg-muted p-3 rounded-md">
                                                <p className="text-sm">
                                                    <strong>Thuế GTGT đầu vào:</strong> 100.000.000 × 10% = 10.000.000 VNĐ
                                                    <br />
                                                    <strong>Thuế GTGT đầu ra:</strong> 150.000.000 × 10% = 15.000.000 VNĐ
                                                    <br />
                                                    <strong>Thuế GTGT phải nộp:</strong> 15.000.000 - 10.000.000 = 5.000.000 VNĐ
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-medium mb-2">Ví dụ 2: Tính thuế GTGT theo phương pháp trực tiếp trên GTGT</h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Công ty B cung cấp dịch vụ với giá trị gia tăng là 50.000.000 VNĐ, thuế suất VAT là 10%.
                                            </p>
                                            <div className="bg-muted p-3 rounded-md">
                                                <p className="text-sm">
                                                    <strong>Thuế GTGT phải nộp:</strong> 50.000.000 × 10% = 5.000.000 VNĐ
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-medium mb-2">
                                                Ví dụ 3: Tính thuế GTGT theo phương pháp trực tiếp trên doanh thu
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Hộ kinh doanh C có doanh thu là 200.000.000 VNĐ, tỷ lệ GTGT là 10%, thuế suất VAT là 10%.
                                            </p>
                                            <div className="bg-muted p-3 rounded-md">
                                                <p className="text-sm">
                                                    <strong>Thuế GTGT phải nộp:</strong> 200.000.000 × 10% × 10% = 2.000.000 VNĐ
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Lịch Thuế */}
                        <TabsContent value="calendar" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lịch Nộp Thuế Năm 2023</CardTitle>
                                    <CardDescription>Thời hạn khai và nộp các loại thuế cho doanh nghiệp</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[200px]">Loại thuế</TableHead>
                                                <TableHead>Kỳ khai thuế</TableHead>
                                                <TableHead>Thời hạn nộp tờ khai</TableHead>
                                                <TableHead>Thời hạn nộp thuế</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-medium">Thuế GTGT (khấu trừ)</TableCell>
                                                <TableCell>Hàng tháng hoặc quý</TableCell>
                                                <TableCell>
                                                    Chậm nhất là ngày thứ 20 của tháng tiếp theo (đối với kỳ khai thuế theo tháng) hoặc ngày thứ
                                                    30 của quý tiếp theo (đối với kỳ khai thuế theo quý)
                                                </TableCell>
                                                <TableCell>Cùng với thời hạn nộp tờ khai thuế</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Thuế TNDN tạm tính</TableCell>
                                                <TableCell>Hàng quý</TableCell>
                                                <TableCell>Chậm nhất là ngày thứ 30 của quý tiếp theo</TableCell>
                                                <TableCell>Cùng với thời hạn nộp tờ khai thuế</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Thuế TNDN quyết toán</TableCell>
                                                <TableCell>Năm</TableCell>
                                                <TableCell>
                                                    Chậm nhất là ngày cuối cùng của tháng thứ 3 kể từ ngày kết thúc năm tài chính
                                                </TableCell>
                                                <TableCell>Cùng với thời hạn nộp tờ khai quyết toán thuế</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Thuế TNCN</TableCell>
                                                <TableCell>Hàng tháng hoặc quý</TableCell>
                                                <TableCell>
                                                    Chậm nhất là ngày thứ 20 của tháng tiếp theo (đối với kỳ khai thuế theo tháng) hoặc ngày thứ
                                                    30 của quý tiếp theo (đối với kỳ khai thuế theo quý)
                                                </TableCell>
                                                <TableCell>Cùng với thời hạn nộp tờ khai thuế</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Các Mốc Thời Gian Quan Trọng</CardTitle>
                                    <CardDescription>Những thời điểm quan trọng cần lưu ý trong năm</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Ngày 20 hàng tháng</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Hạn nộp tờ khai thuế GTGT, thuế TNCN theo tháng và nộp thuế
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Ngày 30 của tháng đầu quý tiếp theo</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Hạn nộp tờ khai thuế GTGT, thuế TNCN theo quý và nộp thuế
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Ngày 31 tháng 3</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Hạn nộp tờ khai quyết toán thuế TNDN và thuế TNCN năm trước
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Ngày 30 tháng 7</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Hạn nộp thuế môn bài cho năm tiếp theo (đối với doanh nghiệp đang hoạt động)
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Ngày 30 tháng 10</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Hạn nộp lệ phí môn bài cho năm sau (đối với doanh nghiệp mới thành lập trong quý 4)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Hỏi Đáp */}
                        <TabsContent value="faq" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Câu Hỏi Thường Gặp Về Thuế</CardTitle>
                                    <CardDescription>Giải đáp những thắc mắc phổ biến về thuế</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>Doanh nghiệp mới thành lập phải làm gì về thuế?</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-muted-foreground">
                                                    Doanh nghiệp mới thành lập cần thực hiện các thủ tục sau:
                                                </p>
                                                <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                                    <li>Đăng ký mã số thuế (được cấp cùng với đăng ký kinh doanh)</li>
                                                    <li>
                                                        Nộp lệ phí môn bài trong thời hạn 30 ngày kể từ ngày được cấp giấy chứng nhận đăng ký kinh
                                                        doanh
                                                    </li>
                                                    <li>Đăng ký phương pháp tính thuế GTGT (khấu trừ hoặc trực tiếp)</li>
                                                    <li>Đăng ký sử dụng hóa đơn (tự in, đặt in hoặc hóa đơn điện tử)</li>
                                                    <li>Nộp thuế TNDN tạm tính hàng quý và quyết toán thuế TNDN hàng năm</li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="item-2">
                                            <AccordionTrigger>Khi nào doanh nghiệp được khấu trừ thuế GTGT đầu vào?</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-muted-foreground">
                                                    Doanh nghiệp được khấu trừ thuế GTGT đầu vào khi đáp ứng đủ các điều kiện sau:
                                                </p>
                                                <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                                    <li>Có hóa đơn GTGT mua hàng hóa, dịch vụ hoặc chứng từ nộp thuế GTGT khâu nhập khẩu</li>
                                                    <li>
                                                        Có chứng từ thanh toán không dùng tiền mặt đối với hàng hóa, dịch vụ mua vào có giá trị từ
                                                        20 triệu đồng trở lên
                                                    </li>
                                                    <li>
                                                        Hàng hóa, dịch vụ mua vào được sử dụng cho hoạt động sản xuất, kinh doanh hàng hóa, dịch vụ
                                                        chịu thuế GTGT
                                                    </li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="item-3">
                                            <AccordionTrigger>Doanh nghiệp có được hoàn thuế GTGT không?</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-muted-foreground">
                                                    Doanh nghiệp được hoàn thuế GTGT trong các trường hợp sau:
                                                </p>
                                                <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                                    <li>
                                                        Doanh nghiệp có số thuế GTGT đầu vào chưa được khấu trừ hết trong tháng (hoặc quý) mà lũy kế
                                                        từ 300 triệu đồng trở lên
                                                    </li>
                                                    <li>
                                                        Doanh nghiệp mới thành lập đang trong giai đoạn đầu tư chưa đi vào hoạt động sản xuất kinh
                                                        doanh
                                                    </li>
                                                    <li>Doanh nghiệp xuất khẩu hàng hóa, dịch vụ</li>
                                                    <li>Doanh nghiệp giải thể, phá sản, chấm dứt hoạt động có số thuế GTGT nộp thừa</li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="item-4">
                                            <AccordionTrigger>Chi phí nào không được trừ khi tính thuế TNDN?</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-muted-foreground">
                                                    Một số chi phí không được trừ khi tính thuế TNDN bao gồm:
                                                </p>
                                                <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                                    <li>Chi phí không liên quan đến hoạt động sản xuất, kinh doanh</li>
                                                    <li>Chi phí không có đủ hóa đơn, chứng từ hợp pháp</li>
                                                    <li>
                                                        Chi phí dịch vụ mua ngoài từ 20 triệu đồng trở lên không có chứng từ thanh toán không dùng
                                                        tiền mặt
                                                    </li>
                                                    <li>Chi phí khấu hao tài sản cố định không đúng quy định</li>
                                                    <li>Tiền phạt vi phạm hành chính, tiền chậm nộp</li>
                                                    <li>
                                                        Chi phí lương, thưởng cho người lao động không được ghi trong hợp đồng lao động, thỏa ước
                                                        lao động tập thể
                                                    </li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="item-5">
                                            <AccordionTrigger>Doanh nghiệp có thể chuyển lỗ sang các năm sau không?</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-muted-foreground">
                                                    Có, doanh nghiệp được chuyển lỗ sang các năm sau theo quy định sau:
                                                </p>
                                                <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                                    <li>
                                                        Doanh nghiệp có lỗ được chuyển lỗ sang năm sau, thời gian chuyển lỗ tối đa không quá 5 năm
                                                        kể từ năm tiếp sau năm phát sinh lỗ
                                                    </li>
                                                    <li>
                                                        Doanh nghiệp phải xác định số lỗ được chuyển vào chi phí được trừ khi xác định thu nhập chịu
                                                        thuế TNDN của năm chuyển lỗ theo nguyên tắc số lỗ chuyển không vượt quá thu nhập tính thuế
                                                        của năm chuyển lỗ
                                                    </li>
                                                    <li>Doanh nghiệp chỉ được chuyển lỗ khi quyết toán thuế</li>
                                                    <li>Doanh nghiệp không được chuyển lỗ trong trường hợp thay đổi chủ sở hữu</li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Tài Liệu Tham Khảo</CardTitle>
                                    <CardDescription>Các văn bản pháp luật và tài liệu hướng dẫn về thuế</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Luật Quản lý thuế số 38/2019/QH14</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Quy định về quản lý thuế và các khoản thu khác của ngân sách nhà nước
                                                </p>
                                                <a href="#" className="text-sm text-primary hover:underline">
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Luật Thuế GTGT số 13/2008/QH12</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Quy định về thuế giá trị gia tăng (đã được sửa đổi, bổ sung)
                                                </p>
                                                <a href="#" className="text-sm text-primary hover:underline">
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Luật Thuế TNDN số 14/2008/QH12</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Quy định về thuế thu nhập doanh nghiệp (đã được sửa đổi, bổ sung)
                                                </p>
                                                <a href="#" className="text-sm text-primary hover:underline">
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Nghị định 126/2020/NĐ-CP</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Quy định chi tiết một số điều của Luật Quản lý thuế
                                                </p>
                                                <a href="#" className="text-sm text-primary hover:underline">
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-md">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Thông tư 80/2021/TT-BTC</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Hướng dẫn thi hành một số điều của Luật Quản lý thuế và Nghị định 126/2020/NĐ-CP
                                                </p>
                                                <a href="#" className="text-sm text-primary hover:underline">
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </ResponsiveContainer>
            </div>
        </SalesLayout>
    )
}

export default SalesTax

