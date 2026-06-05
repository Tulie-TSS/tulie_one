'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@repo/ui'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { createClient } from '@/lib/supabase'

interface UserProfile {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
    role_type: string
}

export function UserNav() {
    const { t } = useLocaleStore()
    const router = useRouter()
    const [user, setUser] = useState<UserProfile | null>(null)

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('id, email, full_name, avatar_url, role_type')
                .eq('id', authUser.id)
                .single()
            if (profile) setUser(profile as UserProfile)
        }
        load()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    // Display first name: for single-word names (e.g. "Hệ thống Quản trị") show last word,
    // for personal names return last segment gracefully
    const displayName = user?.full_name?.split(' ').pop() || 'bạn'
    const initials = user?.full_name
        ? user.full_name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
        : 'U'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url ?? ''} alt={user?.full_name ?? ''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name ?? '—'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email ?? ''}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/settings">
                            {t('nav.profile')}
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings">
                            {t('nav.settings')}
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleSignOut}
                >
                    {t('nav.logout')}
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
