import { Link as RouterLink } from "react-router-dom"
import { FacebookIcon, Instagram, Mail, MapPin, Phone, TwitterIcon, Youtube } from "lucide-react"

export function SiteFooter() {
    return (
        <footer className="bg-black py-12 border-t">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    <div>
                        <img src="https://theme.hstatic.net/200000907029/1001282128/14/footer_logobct_img_large.png?v=318" alt="" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl mb-4">GIỚI THIỆU</h3>
                        <ul className="space-y-2">
                            <li>
                                <RouterLink to="/gioi-thieu/ve-chung-toi" className="text-gray-300 hover:text-primary">
                                    Về chúng tôi
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/gioi-thieu/tam-nhin-su-menh" className="text-gray-300 hover:text-primary">
                                    Tầm nhìn & Sứ mệnh
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/lien-he" className="text-gray-300 hover:text-primary">
                                    Liên hệ
                                </RouterLink>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">SẢN PHẨM</h3>
                        <ul className="space-y-2">
                            <li>
                                <RouterLink to="/san-pham/moi" className="text-gray-300 hover:text-primary">
                                    Sản phẩm mới
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/san-pham/ban-chay" className="text-gray-300 hover:text-primary">
                                    Bán chạy
                                </RouterLink>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">THÔNG TIN</h3>
                        <ul className="space-y-2">
                            <li>
                                <RouterLink to="/kien-thuc" className="text-gray-300 hover:text-primary">
                                    Kiến thức cây trồng
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/tin-tuc" className="text-gray-300 hover:text-primary">
                                    Tin tức
                                </RouterLink>
                            </li>
                            <li>
                                <RouterLink to="/tuyen-dung" className="text-gray-300 hover:text-primary">
                                    Tuyển dụng
                                </RouterLink>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">LIÊN HỆ</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                <span className="text-gray-300">123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-2 text-primary" />
                                <span className="text-gray-300">028 1234 5678</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-2 text-primary" />
                                <span className="text-gray-300">info@example.com</span>
                            </li>
                            <li className="flex items-center space-x-3 mt-4">
                                <a href="#" className="text-gray-300 hover:text-primary">
                                    <FacebookIcon className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-300 hover:text-primary">
                                    <Instagram className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-300 hover:text-primary">
                                    <Youtube className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-300 hover:text-primary">
                                    <TwitterIcon className="h-5 w-5" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-gray-300">
                    <p>© {new Date().getFullYear()} Minh Long. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    )
}

