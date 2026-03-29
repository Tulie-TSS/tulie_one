"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@repo/ui";
import { Bot, Loader2, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signUp(email, password, fullName, companyName || undefined);
            setIsSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đăng ký thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="space-y-4 px-0 text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 mb-2">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">
                        Kiểm tra email của bạn
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                        Chúng tôi đã gửi một liên kết xác thực đến <strong>{email}</strong>.
                        Vui lòng kiểm tra hộp thư đến và nhấn vào liên kết để xác thực tài khoản.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="px-0 pt-6">
                    <Link href="/login" className="w-full">
                        <Button variant="outline" size="lg" className="w-full">Trở lại đăng nhập</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-4 px-0 text-left">
                <CardTitle className="text-3xl font-bold text-foreground">
                    Tạo tài khoản mới
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                    Bắt đầu với Tulie Workforce
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 px-0 pb-6 pt-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-semibold text-foreground/80">Họ và tên</Label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold text-foreground/80">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@agency.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="font-semibold text-foreground/80">Mật khẩu</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        <p className="text-xs text-muted-foreground/80 font-medium">
                            Tối thiểu 8 ký tự.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="font-semibold text-foreground/80">
                            Tên doanh nghiệp <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
                        </Label>
                        <Input
                            id="companyName"
                            type="text"
                            placeholder="Acme Agency..."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex-col space-y-5 px-0">
                    <Button type="submit" size="lg" className="w-full text-[15px]" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang tạo tài khoản...
                            </>
                        ) : (
                            "Tạo tài khoản"
                        )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Đã có tài khoản?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-foreground hover:underline"
                        >
                            Đăng nhập
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
