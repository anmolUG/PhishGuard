import { User, Shield, Bell, Palette, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/common/Card";
import { Button } from "../components/common/Button";

export function Settings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account settings and preferences.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <nav className="flex flex-col space-y-1">
            <button className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 text-sm font-medium rounded-md w-full text-left">
              <User className="h-4 w-4" /> Profile
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:bg-secondary px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors">
              <Shield className="h-4 w-4" /> Security
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:bg-secondary px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors">
              <Bell className="h-4 w-4" /> Notifications
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:bg-secondary px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors">
              <Palette className="h-4 w-4" /> Appearance
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:bg-secondary px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors">
              <Key className="h-4 w-4" /> API & Integrations
            </button>
          </nav>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and organization details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <input type="text" className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue="Admin User" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email Address</label>
                <input type="email" className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue="admin@phishguard.example.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Organization</label>
                <input type="text" className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue="Global Security Corp" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and authentication methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Secure your account with 2FA.</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm">Password</h4>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago.</p>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
