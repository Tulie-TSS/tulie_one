export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            T
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Tulie ERP</h1>
          <p className="mt-1 text-sm text-muted-foreground">Đăng nhập để tiếp tục</p>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Sử dụng tài khoản Tulie (chung với CRM)
        </p>
      </div>
    </div>
  )
}
