import { Link, useLocation } from "react-router-dom";
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Search, 
  History, 
  Shield, 
  FileSearch, 
  Settings 
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Scan URL", href: "/scan", icon: Search },
  { name: "History", href: "/history", icon: History },
  { name: "Threats", href: "/threats", icon: ShieldAlert },
  { name: "Investigations", href: "/investigations", icon: FileSearch },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <Shield className="h-6 w-6 text-primary" />
          <span>PhishGuard</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-primary">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-muted-foreground">SOC Analyst</span>
          </div>
        </div>
      </div>
    </div>
  );
}
