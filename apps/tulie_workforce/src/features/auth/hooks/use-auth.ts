"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const signIn = useCallback(
        async (email: string, password: string) => {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            router.push("/");
            router.refresh();
        },
        [supabase.auth, router]
    );

    const signUp = useCallback(
        async (
            email: string,
            password: string,
            fullName: string,
            companyName?: string
        ) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, company_name: companyName },
                },
            });
            if (error) throw error;

            // Create profile via API route to use server-side types
            if (data.user) {
                await fetch("/api/auth/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: data.user.id,
                        email,
                        fullName,
                        companyName: companyName || null,
                    }),
                });
            }

            return data;
        },
        [supabase]
    );

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }, [supabase.auth, router]);

    return { user, loading, signIn, signUp, signOut };
};
