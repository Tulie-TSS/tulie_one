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
import { Bot, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signIn(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-4 px-0 text-left">
                <CardTitle className="text-3xl text-foreground">
                    Chào mừng trở lại
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                    Đăng nhập vào tài khoản của bạn để tiếp tục
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="font-semibold text-foreground/80">Mật khẩu</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
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
                    </div>
                </CardContent>

                <CardFooter className="flex-col space-y-5 px-0">
                    <Button type="submit" size="lg" className="w-full text-[15px]" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang đăng nhập...
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Chưa có tài khoản?{" "}
                        <Link
                            href="/signup"
                            className="font-semibold text-foreground hover:underline"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
