import { Badge } from '@repo/ui'
import { TEAM, formatCurrency } from '@/lib/demo/mock-data'
import { UserCheck, Mail, Phone } from 'lucide-react'

export default function DemoTeam() {
    const totalSalary = TEAM.reduce((s, t) => s + t.salary, 0)
    const departments = [...new Set(TEAM.map(t => t.department))]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-muted dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-border">
                    <UserCheck className="h-6 w-6 text-foreground dark:text-zinc-100" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground dark:text-zinc-50">Nhân sự</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{TEAM.length} nhân viên · {departments.length} phòng ban · Quỹ lương {formatCurrency(totalSalary)}/tháng</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {TEAM.map((member) => (
                    <div key={member.id} className="bg-white dark:bg-zinc-900 rounded-md border border-border p-5 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                <span className="text-sm font-black text-muted-foreground dark:text-zinc-300">{member.name.split(' ').slice(-1)[0][0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground dark:text-zinc-50">{member.name}</p>
                                <p className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground mt-0.5">{member.role}</p>
                                <Badge className="mt-2 text-[10px] font-semibold border-none px-2 py-0.5 rounded-md bg-muted text-muted-foreground dark:bg-zinc-800 dark:text-muted-foreground">
                                    {member.department}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
                                <Phone className="w-3 h-3" />{member.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground truncate">
                                <Mail className="w-3 h-3" />{member.email}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] text-muted-foreground">Từ {member.joinDate}</span>
                                <span className="text-xs font-bold text-foreground dark:text-zinc-100">{formatCurrency(member.salary)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
