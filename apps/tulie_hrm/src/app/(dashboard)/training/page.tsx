'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { GraduationCap } from 'lucide-react'
export default function TrainingPage() {
  return (<div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">Đào tạo</h1><p className="text-sm text-muted-foreground">Quản lý chương trình đào tạo & phát triển nhân viên</p></div>
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardContent className="p-6 text-center"><GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="font-medium">Onboarding</h3><p className="text-sm text-muted-foreground mt-1">3 chương trình · 12 nhân viên</p></CardContent></Card>
      <Card><CardContent className="p-6 text-center"><GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="font-medium">Kỹ năng chuyên môn</h3><p className="text-sm text-muted-foreground mt-1">5 khóa · 28 nhân viên</p></CardContent></Card>
      <Card><CardContent className="p-6 text-center"><GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="font-medium">Leadership</h3><p className="text-sm text-muted-foreground mt-1">2 khóa · 8 nhân viên</p></CardContent></Card>
    </div></div>)
}
