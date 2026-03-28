import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";

export default function Home() {
  return (
    <main className="container mx-auto p-8 max-w-5xl">
      <div className="flex flex-col space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight">Tulie Design System</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            A comprehensive component library built on top of Radix UI and TailwindCSS.
          </p>
        </header>
        
        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Badges</h2>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cards & Inputs</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>Enter your email below to log in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input type="email" placeholder="m@example.com" />
              </div>
              <Button className="w-full">Sign in</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
