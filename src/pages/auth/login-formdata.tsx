"use client";

import { useAuth } from "@/contexts/AuthContext";
import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const baseURL = `https://minhlong.mlhr.org`;
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for remembered username on component mount
  useEffect(() => {
    const rememberedUsername = localStorage.getItem("remembered_username");
    if (rememberedUsername) {
      setUserName(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      if (!userName.trim()) {
        setError("Vui lòng nhập tên đăng nhập");
        setIsLoading(false);
        return;
      }

      if (!password) {
        setError("Vui lòng nhập mật khẩu");
        setIsLoading(false);
        return;
      }

      // Prepare login data
      const loginData = {
        userName,
        password,
      };

      console.log("Attempting login with:", { userName });

      // Call login API
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Đăng nhập thất bại"
        );
      }

      const data = await response.json();
      console.log(data);

      console.log("Login successful:", data);

      // Handle the response format
      if (data.token) {
        // Store the JWT token and use the AuthContext login
        await login(data.token.token);
        localStorage.setItem("auth_token", data.token.token);
        // Store the role name
        localStorage.setItem("role_name", data.token.roleName);
        localStorage.setItem("name", data.token.displayName);

        // If remember me is checked, store the username
        if (rememberMe) {
          localStorage.setItem("remembered_username", userName);
        } else {
          localStorage.removeItem("remembered_username");
        }
      } else {
        setError("Đăng nhập thất bại: Không nhận được token");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof Error) {
        setError(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Đăng nhập
        </CardTitle>
        <CardDescription className="text-center">
          Đăng nhập để truy cập vào hệ thống quản lý nông nghiệp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="userName" className="text-sm font-medium">
              Tên đăng nhập
            </label>
            <Input
              id="userName"
              name="userName"
              placeholder="Tên đăng nhập"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </label>
              <button
                type="button"
                className="text-sm font-medium text-green-600 hover:text-green-700"
                onClick={() => navigate("/forgot-password")}
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <label
              htmlFor="remember-me"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="font-medium text-green-600 hover:text-green-700"
          >
            Đăng ký ngay
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
