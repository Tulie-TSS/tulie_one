'use client'

import Link from 'next/link'
import { MOCK_USERS } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { Button } from '@repo/ui'
import { Badge } from '@repo/ui'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@repo/ui'

export default function TeamSettingsPage() {
    const { t } = useLocaleStore()

    return (
        <div>
            <Link href="/settings" className="inline-flex items-center gap-1 no-underline mb-4 text-sm text-muted-foreground">{t('settings.backToSettings')}</Link>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-foreground">{t('settings.team')}</h1>
                <Button size="sm">{t('settings.inviteMember')}</Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[t('team.member'), t('team.email'), t('team.role'), t('team.wipLimit'), t('team.status')].map(h => (
                                <TableHead key={h}>{h}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_USERS.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-[11px] font-semibold">{user.full_name.charAt(0)}</div>
                                        <span className="font-medium text-foreground">{user.full_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role_type === 'admin' ? 'destructive' : user.role_type === 'manager' ? 'default' : 'secondary'}>
                                        {user.role_type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-foreground">{user.personal_wip_limit}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full inline-block ${user.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                                        <span className={`text-xs ${user.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>{user.is_active ? t('team.active') : t('team.inactive')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
