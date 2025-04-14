"use client";

import { useState } from "react";
import Link from "next/link";
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
import { ArrowLeft, Loader2, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Supabase password reset will be implemented here
            // await supabase.auth.resetPasswordForEmail(email)
            setIsSuccess(true);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to send reset email."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="space-y-4 px-0 text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 mb-2">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl text-foreground">
                        Kiểm tra email của bạn
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                        Nếu tài khoản tồn tại cho <strong>{email}</strong>, chúng tôi đã gửi
                        một liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="px-0 pt-6">
                    <Link href="/login" className="w-full">
                        <Button variant="outline" size="lg" className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Trở lại đăng nhập
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-4 px-0 text-left">
                <CardTitle className="text-3xl text-foreground">
                    Khôi phục mật khẩu
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                    Nhập địa chỉ email của bạn và chúng tôi sẽ gửi liên kết để thiết lập lại mật khẩu.
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
                </CardContent>

                <CardFooter className="flex-col items-start space-y-5 px-0">
                    <Button type="submit" size="lg" className="w-full text-[15px]" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            "Gửi liên kết khôi phục"
                        )}
                    </Button>
                    <div className="flex w-full justify-center">
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Trở lại đăng nhập
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
