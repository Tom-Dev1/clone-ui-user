"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInfo, getToken } from "@/utils/auth-utils";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  CreditCard,
  Award,
  ShieldCheck,
  InfoIcon,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { AgencyLayout } from "@/layouts/agency-layout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Update the UserData interface to include contracts
interface UserData {
  userId: string;
  username: string;
  email: string;
  password: string;
  userType: string;
  phone: string;
  status: boolean;
  verifyEmail: boolean;
  agencyLevelName?: string;
  creditLimit?: number;
  contracts?: {
    contractId: number;
    fileName: string;
    filePath: string;
    fileType: string;
    createdAt: string;
  }[];
}

// Define interface for agency score data
interface AgencyScoreData {
  agencyId: number;
  agencyName: string;
  totalScore: number;
  scoreHistory: {
    scoreChange: number;
    reason: string;
    createdDate: string;
  }[];
}

export default function AgencyProfile() {
  const userInfo = getUserInfo();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileImage] = useState("/placeholder.svg?height=200&width=200");
  const [scoreData, setScoreData] = useState<AgencyScoreData | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userInfo?.id) {
          toast.error("Không tìm thấy thông tin người dùng");
          return;
        }

        const token = getToken();
        if (!token) {
          toast.error("Phiên đăng nhập hết hạn");
          return;
        }

        const response = await fetch(
          `https://minhlong.mlhr.org/api/get-info-user/${userInfo.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Không thể tải thông tin người dùng");
      }
    };

    fetchUserData();
  }, [userInfo?.id]);

  // Fetch agency score data
  useEffect(() => {
    const fetchAgencyScore = async () => {
      setIsLoadingScore(true);
      try {
        const token = getToken();
        if (!token) {
          toast.error("Phiên đăng nhập hết hạn");
          return;
        }

        const response = await fetch(
          "https://minhlong.mlhr.org/api/AgencyScore/get-my-score",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setScoreData(data);
      } catch (error) {
        console.error("Failed to fetch agency score:", error);
        // Don't show toast for this error to avoid too many notifications
      } finally {
        setIsLoadingScore(false);
      }
    };

    fetchAgencyScore();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get score level based on total score
  const getScoreLevel = (score: number) => {
    if (score >= 1000) return { level: "Xuất sắc", color: "text-green-600" };
    if (score >= 750) return { level: "Tốt", color: "text-blue-600" };
    if (score >= 500) return { level: "Khá", color: "text-yellow-600" };
    if (score >= 250) return { level: "Trung bình", color: "text-orange-600" };
    return { level: "Cần cải thiện", color: "text-red-600" };
  };

  // Get progress color based on score
  const getProgressColor = (score: number) => {
    if (score >= 1000) return "bg-green-500";
    if (score >= 750) return "bg-blue-500";
    if (score >= 500) return "bg-yellow-500";
    if (score >= 250) return "bg-orange-500";
    return "bg-red-500";
  };

  // Calculate progress percentage (max score is 1200)
  const calculateProgress = (score: number) => {
    const maxScore = 1200;
    return Math.min(Math.round((score / maxScore) * 100), 100);
  };

  return (
    <AgencyLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Hồ sơ đại lý</h1>
          <p className="text-muted-foreground">
            Thông tin cá nhân và cấp độ đại lý của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Thông tin tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage
                    src={profileImage || "/placeholder.svg"}
                    alt="Avatar"
                  />
                  <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                    {scoreData?.agencyName.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {userData?.status && (
                  <span
                    className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"
                    title="Đang hoạt động"
                  ></span>
                )}
              </div>
              <h3 className="font-medium text-lg mt-4">
                {scoreData?.agencyName || "Chưa có thông tin"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {userData?.userType || "Đại lý"}
              </p>

              {userData?.agencyLevelName && (
                <div className="mt-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {userData.agencyLevelName}
                </div>
              )}

              {/* Agency Score Section */}
              {scoreData && (
                <div className="mt-6 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">Điểm uy tín</h4>
                    <span
                      className={`font-bold ${
                        getScoreLevel(scoreData.totalScore).color
                      }`}
                    >
                      {scoreData.totalScore} điểm
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(scoreData.totalScore)}
                    className="h-2"
                    indicatorClassName={getProgressColor(scoreData.totalScore)}
                  />
                  <p className="text-xs text-right mt-1 text-muted-foreground">
                    Mức:{" "}
                    <span
                      className={`font-medium ${
                        getScoreLevel(scoreData.totalScore).color
                      }`}
                    >
                      {getScoreLevel(scoreData.totalScore).level}
                    </span>
                  </p>

                  {scoreData.scoreHistory &&
                    scoreData.scoreHistory.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm text-left mb-2">
                          Lịch sử điểm gần đây
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 text-left">
                          {scoreData.scoreHistory
                            .slice(0, 3)
                            .map((history, index) => (
                              <div key={index} className="mb-2 last:mb-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {formatDate(history.createdDate)}
                                  </span>
                                  <Badge
                                    variant={
                                      history.scoreChange > 0
                                        ? "default"
                                        : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {history.scoreChange > 0 ? "+" : ""}
                                    {history.scoreChange}
                                  </Badge>
                                </div>
                                <p className="text-sm mt-1">{history.reason}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {isLoadingScore && (
                <div className="mt-6 w-full text-center">
                  <div className="animate-pulse bg-gray-200 h-4 w-3/4 mx-auto rounded mb-2"></div>
                  <div className="animate-pulse bg-gray-200 h-2 w-full rounded mb-2"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-1/2 mx-auto rounded"></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Chi tiết tài khoản</CardTitle>
              <CardDescription>
                Thông tin chi tiết về tài khoản đại lý của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Tên người dùng
                        </p>
                        <p className="font-medium">
                          {userData?.username || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Email
                        </p>
                        <p className="font-medium">
                          {userData?.email || "Chưa có thông tin"}
                        </p>
                        {userData?.verifyEmail && (
                          <span className="inline-flex items-center text-xs text-green-600 mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" /> Đã xác thực
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Số điện thoại
                        </p>
                        <p className="font-medium">
                          {userData?.phone || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {userData?.creditLimit !== undefined && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Hạn mức tín dụng
                          </p>
                          <p className="font-medium text-lg">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(userData.creditLimit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Cấp độ đại lý
                        </p>
                        <p className="font-medium">
                          {userData?.agencyLevelName || "Chưa phân loại"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Trạng thái tài khoản
                        </p>
                        <div className="flex items-center mt-1">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              userData?.status ? "bg-green-500" : "bg-red-500"
                            } mr-2`}
                          ></span>
                          <p className="font-medium">
                            {userData?.status
                              ? "Đang hoạt động"
                              : "Không hoạt động"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agency Score Summary */}
                  {scoreData && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Điểm uy tín
                          </p>
                          <p className="font-medium">
                            <span
                              className={
                                getScoreLevel(scoreData.totalScore).color
                              }
                            >
                              {scoreData.totalScore} điểm
                            </span>
                            <span className="text-xs ml-2 text-gray-500">
                              ({getScoreLevel(scoreData.totalScore).level})
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Card */}
          {userData?.contracts && userData.contracts.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Hợp đồng đại lý</CardTitle>
                <CardDescription>
                  Các hợp đồng đã ký kết với đại lý
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.contracts.map((contract) => {
                    const isImage = [
                      ".jpg",
                      ".jpeg",
                      ".png",
                      ".gif",
                      ".webp",
                    ].includes(contract.fileType.toLowerCase());
                    const date = new Date(contract.createdAt);
                    const formattedDate = new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(date);

                    return (
                      <div
                        key={contract.contractId}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex flex-col space-y-3">
                          {isImage && (
                            <div className="w-full h-40 bg-white rounded-lg overflow-hidden border">
                              <img
                                src={contract.filePath || "/placeholder.svg"}
                                alt={contract.fileName}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <p
                              className="font-medium truncate"
                              title={contract.fileName}
                            >
                              {contract.fileName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Ngày tải lên: {formattedDate}
                            </p>
                            <div className="mt-3">
                              <a
                                href={contract.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Xem hợp đồng
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Thông tin bổ sung</CardTitle>
              <CardDescription>
                Các thông tin khác về tài khoản đại lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-green-800">
                <div className="flex items-start">
                  <InfoIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Quyền lợi đại lý</h4>
                    <p className="text-sm mt-1">
                      Với cấp độ {userData?.agencyLevelName || "hiện tại"}, bạn
                      được hưởng các ưu đãi đặc biệt khi đặt hàng và thanh toán.
                      Hạn mức tín dụng của bạn là{" "}
                      {userData?.creditLimit !== undefined
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(userData.creditLimit)
                        : "chưa được cấp"}
                      . Để nâng cấp tài khoản, vui lòng liên hệ với nhân viên
                      kinh doanh của chúng tôi.
                    </p>

                    {scoreData && (
                      <p className="text-sm mt-2">
                        Điểm uy tín hiện tại của bạn là{" "}
                        <strong>{scoreData.totalScore}</strong> điểm, đạt mức{" "}
                        <strong
                          className={getScoreLevel(scoreData.totalScore).color}
                        >
                          {getScoreLevel(scoreData.totalScore).level}
                        </strong>
                        . Điểm uy tín cao sẽ giúp bạn được xem xét nâng cấp đại
                        lý và tăng hạn mức tín dụng.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AgencyLayout>
  );
}
