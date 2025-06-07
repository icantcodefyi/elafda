import {
  Shield,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "~/lib/admin";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const adminNavItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/posts",
    label: "Posts",
    icon: FileText,
  },
  {
    href: "/admin/comments",
    label: "Comments",
    icon: MessageSquare,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect if user is not admin
  const admin = await requireAdmin();

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-6 w-6" />
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <Badge variant="secondary">Administrator</Badge>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">
                Welcome, {admin.name}
              </span>
              <Link href="/" className="text-primary text-sm hover:underline">
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 md:col-span-3">
            <Card className="p-4">
              <nav className="space-y-2">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
