'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@repo/ui'
import { getRoleDisplayName } from '@/lib/security/permissions'
import { ROLE_COLORS } from '@/lib/constants/roles'
import type { TeamMemberPerformance } from '@/lib/supabase/services/team-performance-service'
import type { UserRole } from '@/types'

interface TeamMemberTableProps {
    members: TeamMemberPerformance[]
}

export default function TeamMemberTable({ members }: TeamMemberTableProps) {
    const getProgressColor = (rate: number) => {
        if (rate >= 80) return 'bg-green-500'
        if (rate >= 50) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Hiệu suất từng thành viên</CardTitle>
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có dữ liệu
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thành viên</TableHead>
                                    <TableHead className="text-center">Tasks</TableHead>
                                    <TableHead className="text-center">Hoàn thành</TableHead>
                                    <TableHead className="text-center">Quá hạn</TableHead>
                                    <TableHead className="text-center">Dự án</TableHead>
                                    <TableHead>Tỷ lệ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map(member => (
                                    <TableRow key={member.user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                    {member.user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{member.user.full_name}</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] h-4 px-1 ${ROLE_COLORS[member.user.role as UserRole] || ''}`}
                                                    >
                                                        {getRoleDisplayName(member.user.role as UserRole)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{member.tasks_total}</TableCell>
                                        <TableCell className="text-center text-green-700 font-medium">{member.tasks_completed}</TableCell>
                                        <TableCell className="text-center">
                                            {member.tasks_overdue > 0 ? (
                                                <span className="text-red-700 font-medium">{member.tasks_overdue}</span>
                                            ) : (
                                                <span className="text-muted-foreground">0</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{member.projects_active}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 rounded-full bg-gray-100">
                                                    <div
                                                        className={`h-2 rounded-full ${getProgressColor(member.completion_rate)}`}
                                                        style={{ width: `${Math.min(member.completion_rate, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium w-8">{member.completion_rate}%</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
