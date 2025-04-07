"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { LocationSelector } from "@/components/location-selector";
import { UserType, DeparmentType } from "@/types/auth-type";
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, AlertCircle, CheckCircle, User, Building } from 'lucide-react';

interface LocationData {
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
  provinceName: string;
  districtName: string;
  wardName: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  fullName: string;
  position: string;
  department: string;
  agencyName: string;
  street: string;
  wardName: string;
  districtName: string;
  provinceName: string;
}

// Theo dõi trạng thái đã chạm vào của từng trường
interface TouchedFields {
  username: boolean;
  email: boolean;
  phone: boolean;
  password: boolean;
  confirmPassword: boolean;
  fullName: boolean;
  department: boolean;
  agencyName: boolean;
  street: boolean;
}

export function RegisterForm() {
  const baseURL = `https://minhlong.mlhr.org`;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [touched, setTouched] = useState<TouchedFields>({
    username: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    fullName: false,
    department: false,
    agencyName: false,
    street: false,
  });

  const [locationData, setLocationData] = useState<LocationData>({
    provinceId: null,
    districtId: null,
    wardId: null,
    provinceName: "",
    districtName: "",
    wardName: "",
  });

  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: UserType.EMPLOYEE,
    fullName: "",
    position: "STAFF", // Hardcoded as STAFF for EMPLOYEE
    department: "",
    agencyName: "",
    street: "",
    wardName: "",
    districtName: "",
    provinceName: "",
  });

  // Thêm hàm kiểm tra độ mạnh của mật khẩu
  const getPasswordStrength = (
    password: string
  ): "weak" | "medium" | "strong" => {
    if (!password) return "weak";

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;

    // Contains number
    if (/\d/.test(password)) score += 1;

    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Contains uppercase and lowercase
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;

    if (score >= 4) return "strong";
    if (score >= 2) return "medium";
    return "weak";
  };

  // Hàm validate riêng lẻ cho từng trường
  const validateField = useCallback(
    (name: keyof RegisterFormData, value: string): string | undefined => {
      switch (name) {
        case "username":
          if (!value) return "Tên đăng nhập là bắt buộc";
          if (value.length < 8) return "Tên đăng nhập phải có ít nhất 8 ký tự";
          return undefined;

        case "email":
          if (!value) return "Email là bắt buộc";
          if (!/\S+@\S+\.\S+/.test(value)) return "Email không hợp lệ";
          return undefined;

        case "phone":
          if (!value) return "Số điện thoại là bắt buộc";
          if (!/^\d{10}$/.test(value))
            return "Số điện thoại phải có đúng 10 số";
          return undefined;

        case "password":
          if (!value) return "Mật khẩu là bắt buộc";
          if (value.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
          if (!/\d/.test(value)) return "Mật khẩu phải chứa ít nhất 1 số";
          return undefined;

        case "confirmPassword":
          if (!value) return "Xác nhận mật khẩu là bắt buộc";
          if (value !== formData.password) return "Mật khẩu không khớp";
          return undefined;

        case "fullName":
          if (!value) return "Họ tên là bắt buộc";
          return undefined;

        case "department":
          if (formData.userType === UserType.EMPLOYEE && !value)
            return "Phòng ban là bắt buộc";
          return undefined;

        case "agencyName":
          if (formData.userType === UserType.AGENCY && !value)
            return "Tên đại lý là bắt buộc";
          return undefined;

        case "street":
          if (formData.userType === UserType.AGENCY && !value)
            return "Địa chỉ là bắt buộc";
          return undefined;

        default:
          return undefined;
      }
    },
    [formData.password, formData.userType]
  );

  // Validate lại confirmPassword khi password thay đổi
  useEffect(() => {
    if (touched.confirmPassword && formData.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  }, [
    formData.password,
    formData.confirmPassword,
    touched.confirmPassword,
    validateField,
  ]);

  // Handle user type change
  const handleUserTypeChange = (value: string) => {
    const userType = value as UserType;

    // Update the form data with the new user type and set position to STAFF if it's EMPLOYEE
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        userType,
        // Set position to STAFF only when switching to EMPLOYEE
        position: userType === UserType.EMPLOYEE ? "STAFF" : prev.position,
      };
      console.log("User type changed:", newFormData);
      return newFormData;
    });
  };

  // Update form values when location data changes (for both EMPLOYEE and AGENCY)
  const handleLocationChange = useCallback(
    (data: LocationData) => {
      console.log("RegisterForm: Location data received:", data);
      setLocationData(data);

      // Update form data with location information
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          provinceName: data.provinceName,
          districtName: data.districtName,
          wardName: data.wardName,
        };
        console.log("Form data updated with location:", newFormData);
        return newFormData;
      });

      // Clear location-related errors if values are provided
      const newErrors = { ...errors };
      if (data.provinceName) delete newErrors.provinceName;
      if (data.districtName) delete newErrors.districtName;
      if (data.wardName) delete newErrors.wardName;
      setErrors(newErrors);
    },
    [errors]
  );

  // Xử lý khi người dùng nhập liệu
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Cập nhật giá trị form
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      console.log("Form data updated:", newFormData);
      return newFormData;
    });

    // Đánh dấu trường đã được chạm vào
    if (!touched[name as keyof TouchedFields]) {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    }

    // Validate trường ngay khi người dùng nhập
    const fieldError = validateField(name as keyof RegisterFormData, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // Xử lý khi trường mất focus
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;

    // Đánh dấu trường đã được chạm vào
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate lại khi mất focus
    const fieldError = validateField(
      name as keyof RegisterFormData,
      formData[name as keyof RegisterFormData]
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // Validate toàn bộ form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};
    let isValid = true;

    // Validate từng trường
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof RegisterFormData;
      const error = validateField(fieldName, formData[fieldName]);

      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    // Validate các trường đặc biệt cho từng loại tài khoản
    if (formData.userType === UserType.AGENCY) {
      if (!formData.provinceName) {
        newErrors.provinceName = "Tỉnh/Thành phố là bắt buộc";
        isValid = false;
      }
      if (!formData.districtName) {
        newErrors.districtName = "Quận/Huyện là bắt buộc";
        isValid = false;
      }
      if (!formData.wardName) {
        newErrors.wardName = "Phường/Xã là bắt buộc";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Đánh dấu tất cả các trường đã được chạm vào
      setTouched({
        username: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true,
        fullName: true,
        department: true,
        agencyName: true,
        street: true,
      });

      if (!validateForm()) {
        // Scroll to the first error
        const firstError = document.querySelector(".text-red-500");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      setIsSubmitting(true);

      // Chuẩn bị dữ liệu đăng ký
      const registerData = {
        ...formData,
        createdAt: new Date(),
      };

      console.log("Form submitted with data:", registerData);

      try {
        // Gọi API đăng ký trực tiếp thay vì qua AuthService
        // để có thể xử lý response và error một cách chi tiết hơn
        const response = await axios.post(
          `${baseURL}/api/auth/register`,
          registerData
        );

        // Xử lý khi đăng ký thành công
        console.log("Registration successful:", response.data);

        // Hiển thị thông báo thành công từ API
        toast.success(
          response.data.message ||
          "Đăng ký thành công! Vui lòng chờ quản trị viên phê duyệt."
        );
        window.location.href = "/";
        // Reset form
        setFormData({
          username: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          userType: UserType.EMPLOYEE,
          fullName: "",
          position: "STAFF",
          department: "",
          agencyName: "",
          street: "",
          wardName: "",
          districtName: "",
          provinceName: "",
        });

        // Reset touched state
        setTouched({
          username: false,
          email: false,
          phone: false,
          password: false,
          confirmPassword: false,
          fullName: false,
          department: false,
          agencyName: false,
          street: false,
        });

        // Reset errors
        setErrors({});

        // Reset location data
        setLocationData({
          provinceId: null,
          districtId: null,
          wardId: null,
          provinceName: "",
          districtName: "",
          wardName: "",
        });
      } catch (error) {
        // Xử lý lỗi Axios
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;

          if (axiosError.response) {
            // Lỗi từ server (có response)
            const statusCode = axiosError.response.status;
            interface ApiErrorResponse {
              error?: string;
              message?: string;
              errors?: Record<string, string>;
            }
            const responseData = axiosError.response.data as ApiErrorResponse;

            console.error("API Error Response:", responseData);

            // Kiểm tra nếu có error trong response
            if (responseData.error) {
              // Hiển thị thông báo lỗi từ server
              toast.error(`Đăng ký thất bại: ${responseData.error}`);

              // Xử lý lỗi trùng lặp (username, email, phone)
              const errorMessage = responseData.error.toLowerCase();

              if (errorMessage.includes("username")) {
                setErrors((prev) => ({
                  ...prev,
                  username: "Tên đăng nhập đã tồn tại",
                }));
              }

              if (errorMessage.includes("email")) {
                setErrors((prev) => ({
                  ...prev,
                  email: "Email đã được sử dụng",
                }));
              }

              if (errorMessage.includes("phone")) {
                setErrors((prev) => ({
                  ...prev,
                  phone: "Số điện thoại đã được sử dụng",
                }));
              }

              // Nếu không có thông tin cụ thể về trường nào bị lỗi
              if (
                !errorMessage.includes("username") &&
                !errorMessage.includes("email") &&
                !errorMessage.includes("phone")
              ) {
                // Scroll to the top of the form to show the alert
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            } else if (responseData.message) {
              // Fallback to message if error is not present
              toast.error(`Đăng ký thất bại: ${responseData.message}`);

              // Xử lý lỗi validation cụ thể
              if (typeof responseData.errors === "object") {
                const newErrors = { ...errors };

                // Cập nhật state errors dựa trên lỗi từ server
                Object.entries(responseData.errors).forEach(
                  ([field, message]) => {
                    const fieldName = field as keyof RegisterFormData;
                    newErrors[fieldName] = message as string;
                  }
                );

                setErrors(newErrors);
              }
            } else {
              // Nếu không có thông báo lỗi cụ thể
              if (statusCode === 400) {
                toast.error(
                  "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin."
                );
              } else if (statusCode === 401) {
                toast.error("Bạn không có quyền thực hiện hành động này.");
              } else if (statusCode === 409) {
                toast.error("Thông tin đã tồn tại trong hệ thống.");
              } else if (statusCode >= 500) {
                toast.error("Lỗi máy chủ. Vui lòng thử lại sau.");
              } else {
                toast.error("Đăng ký thất bại. Vui lòng thử lại sau.");
              }
            }
          } else if (axiosError.request) {
            // Lỗi không nhận được response (network issues)
            toast.error(
              "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
            );
          } else {
            // Lỗi khi thiết lập request
            toast.error(`Lỗi: ${axiosError.message}`);
          }
        } else {
          // Lỗi không phải từ Axios
          toast.error("Đăng ký thất bại. Vui lòng thử lại.");
        }
      }
    } catch (error) {
      console.error("Unexpected error during form submission:", error);
      toast.error("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-white shadow-lg">
      <CardHeader className="text-center border-b pb-6">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 p-2 text-green-600">
          <Leaf className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
        <CardDescription>
          Tạo tài khoản để truy cập vào hệ thống quản lý nông nghiệp
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Loại tài khoản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.userType === UserType.EMPLOYEE
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                  }`}
                onClick={() => handleUserTypeChange(UserType.EMPLOYEE)}
              >
                <div className={`mr-4 p-2 rounded-full ${formData.userType === UserType.EMPLOYEE
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium">Nhân viên</h4>
                  <p className="text-sm text-gray-500">Đăng ký tài khoản nhân viên công ty</p>
                </div>
              </div>

              <div
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.userType === UserType.AGENCY
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                  }`}
                onClick={() => handleUserTypeChange(UserType.AGENCY)}
              >
                <div className={`mr-4 p-2 rounded-full ${formData.userType === UserType.AGENCY
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium">Đại lý</h4>
                  <p className="text-sm text-gray-500">Đăng ký tài khoản đại lý phân phối</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium border-b pb-2">Thông tin tài khoản</h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Tên đăng nhập
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Tối thiểu 8 ký tự"
                    className={touched.username && errors.username ? "border-red-300" : ""}
                  />
                  {touched.username && errors.username && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="example@email.com"
                    className={touched.email && errors.email ? "border-red-300" : ""}
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Số điện thoại
                  </label>
                  <Input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="10 số (VD: 0912345678)"
                    className={touched.phone && errors.phone ? "border-red-300" : ""}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Họ và tên
                  </label>
                  <Input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Nguyễn Văn A"
                    className={touched.fullName && errors.fullName ? "border-red-300" : ""}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                  </label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Tối thiểu 8 ký tự, bao gồm số"
                    className={touched.password && errors.password ? "border-red-300" : ""}
                  />
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.password}
                    </p>
                  )}

                  {touched.password && formData.password && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Độ mạnh mật khẩu:
                      </p>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrength(formData.password) === "strong"
                              ? "bg-green-500 w-full"
                              : getPasswordStrength(formData.password) ===
                                "medium"
                                ? "bg-yellow-500 w-2/3"
                                : "bg-red-500 w-1/3"
                            }`}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span
                          className={
                            getPasswordStrength(formData.password) === "weak"
                              ? "text-red-500 font-medium"
                              : "text-gray-400"
                          }
                        >
                          Yếu
                        </span>
                        <span
                          className={
                            getPasswordStrength(formData.password) === "medium"
                              ? "text-yellow-500 font-medium"
                              : "text-gray-400"
                          }
                        >
                          Trung bình
                        </span>
                        <span
                          className={
                            getPasswordStrength(formData.password) === "strong"
                              ? "text-green-500 font-medium"
                              : "text-gray-400"
                          }
                        >
                          Mạnh
                        </span>
                      </div>
                      <ul className="text-xs text-gray-500 mt-2 space-y-1">
                        <li
                          className={
                            formData.password.length >= 8
                              ? "text-green-500 flex items-center"
                              : "flex items-center"
                          }
                        >
                          {formData.password.length >= 8 ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <span className="w-3 h-3 mr-1">•</span>
                          )}
                          Tối thiểu 8 ký tự
                        </li>
                        <li
                          className={
                            /\d/.test(formData.password)
                              ? "text-green-500 flex items-center"
                              : "flex items-center"
                          }
                        >
                          {/\d/.test(formData.password) ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <span className="w-3 h-3 mr-1">•</span>
                          )}
                          Chứa ít nhất 1 số
                        </li>
                        <li
                          className={
                            /[^A-Za-z0-9]/.test(formData.password)
                              ? "text-green-500 flex items-center"
                              : "flex items-center"
                          }
                        >
                          {/[^A-Za-z0-9]/.test(formData.password) ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <span className="w-3 h-3 mr-1">•</span>
                          )}
                          Chứa ký tự đặc biệt (khuyến nghị)
                        </li>
                        <li
                          className={
                            /[A-Z]/.test(formData.password) &&
                              /[a-z]/.test(formData.password)
                              ? "text-green-500 flex items-center"
                              : "flex items-center"
                          }
                        >
                          {/[A-Z]/.test(formData.password) &&
                            /[a-z]/.test(formData.password) ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <span className="w-3 h-3 mr-1">•</span>
                          )}
                          Chứa chữ hoa và chữ thường (khuyến nghị)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Xác nhận mật khẩu
                  </label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Nhập lại mật khẩu"
                    className={touched.confirmPassword && errors.confirmPassword ? "border-red-300" : ""}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* User Type Specific Information */}
            <div className="space-y-6">
              {formData.userType === UserType.EMPLOYEE ? (
                <>
                  <h3 className="text-lg font-medium border-b pb-2">Thông tin nhân viên</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="position" className="text-sm font-medium">
                        Chức vụ
                      </label>
                      <Input
                        type="text"
                        id="position"
                        name="position"
                        value="STAFF"
                        disabled
                        className="bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="department" className="text-sm font-medium">
                        Phòng ban
                      </label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, department: value }));
                          // Validate after change
                          const fieldError = validateField("department", value);
                          setErrors((prev) => ({ ...prev, department: fieldError }));
                          setTouched((prev) => ({ ...prev, department: true }));
                        }}
                      >
                        <SelectTrigger className={touched.department && errors.department ? "border-red-300" : ""}>
                          <SelectValue placeholder="Chọn phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DeparmentType.WAREHOUSE}>
                            {DeparmentType.WAREHOUSE}
                          </SelectItem>
                          <SelectItem value={DeparmentType.SALES}>
                            {DeparmentType.SALES}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {touched.department && errors.department && (
                        <p className="text-red-500 text-xs flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.department}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium border-b pb-2">Thông tin đại lý</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="agencyName" className="text-sm font-medium">
                        Tên đại lý
                      </label>
                      <Input
                        type="text"
                        id="agencyName"
                        name="agencyName"
                        value={formData.agencyName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Đại lý ABC"
                        className={touched.agencyName && errors.agencyName ? "border-red-300" : ""}
                      />
                      {touched.agencyName && errors.agencyName && (
                        <p className="text-red-500 text-xs flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.agencyName}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Location Information - For both types */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium border-b pb-2">Thông tin địa chỉ</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Chọn địa điểm</h4>
                    <LocationSelector
                      onLocationChange={handleLocationChange}
                      initialValues={locationData}
                    />
                    {(errors.provinceName || errors.districtName || errors.wardName) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Vui lòng chọn đầy đủ thông tin địa điểm
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="street" className="text-sm font-medium">
                      Địa chỉ chi tiết
                    </label>
                    <Input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="123 Đường ABC"
                      className={touched.street && errors.street ? "border-red-300" : ""}
                    />
                    {touched.street && errors.street && (
                      <p className="text-red-500 text-xs flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.street}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <a href="/login" className="font-medium text-green-600 hover:text-green-700">
                  Đăng nhập ngay
                </a>
              </p>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
