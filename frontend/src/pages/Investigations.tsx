import { useEffect, useState } from "react";
import { Plus, FolderOpen, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { api } from "../services/api";
import { Investigation } from "../types";

export function Investigations() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getInvestigations().then(data => {
      setInvestigations(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Investigations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and track ongoing security incidents and investigations.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Investigation
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-secondary/50 rounded-t-xl" />
              <CardContent className="h-32 bg-secondary/20" />
            </Card>
          ))
        ) : investigations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No investigations found.
          </div>
        ) : (
          investigations.map((inv) => (
            <Card key={inv.id} className="hover:border-primary/50 transition-colors flex flex-col group cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="font-mono text-xs bg-background">{inv.id}</Badge>
                  <Badge variant={
                    inv.riskLevel === 'high' ? 'destructive' : 
                    inv.riskLevel === 'suspicious' ? 'warning' : 'success'
                  }>
                    {inv.riskLevel === 'high' ? 'High Risk' : 'Suspicious'}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{inv.name}</CardTitle>
                <CardDescription className="line-clamp-2">{inv.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-auto">
                <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span>{inv.artifactsCount} Artifacts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(inv.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    inv.status === 'Open' ? 'bg-destructive/10 text-destructive' : 
                    inv.status === 'Investigating' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>
                    {inv.status}
                  </span>
                  <Button variant="ghost" size="sm">Open Workspace</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
