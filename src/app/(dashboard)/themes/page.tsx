"use client";

import { Palette, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { ThemeConfig } from "@/types";

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded border" style={{ backgroundColor: color }} />
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-muted-foreground font-mono">{color}</p>
      </div>
    </div>
  );
}

function ThemeCard({ theme, onActivate }: { theme: ThemeConfig; onActivate: () => void }) {
  return (
    <Card className={theme.isActive ? "ring-2 ring-primary" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {theme.name}
              {theme.isActive && <Badge variant="default" className="text-xs"><Check className="h-3 w-3 mr-1" />Active</Badge>}
            </CardTitle>
            <CardDescription className="mt-0.5">
              {theme.branding.tagline ?? theme.branding.companyName}
            </CardDescription>
          </div>
          {!theme.isActive && (
            <Button variant="outline" size="sm" onClick={onActivate}>
              Activate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Color Palette</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ColorSwatch color={theme.colors.primary} label="Primary" />
            <ColorSwatch color={theme.colors.secondary} label="Secondary" />
            <ColorSwatch color={theme.colors.accent} label="Accent" />
            <ColorSwatch color={theme.colors.background} label="Background" />
            <ColorSwatch color={theme.colors.surface} label="Surface" />
            <ColorSwatch color={theme.colors.text} label="Text" />
            <ColorSwatch color={theme.colors.success} label="Success" />
            <ColorSwatch color={theme.colors.warning} label="Warning" />
            <ColorSwatch color={theme.colors.error} label="Error" />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Typography</p>
            <p style={{ fontFamily: theme.typography.fontFamily }} className="text-sm">
              {theme.typography.fontFamily.split(",")[0]}
            </p>
            <p className="text-xs text-muted-foreground">
              Base: {theme.typography.baseFontSize} · Weight: {theme.typography.headingWeight}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Components</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">Radius: {theme.components.borderRadius}</Badge>
              <Badge variant="outline" className="text-xs capitalize">Button: {theme.components.buttonStyle}</Badge>
              <Badge variant="outline" className="text-xs capitalize">Shadow: {theme.components.cardShadow}</Badge>
              <Badge variant="outline" className="text-xs capitalize">Input: {theme.components.inputStyle}</Badge>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground">Preview</p>
          <div className="mt-2 rounded-lg border overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
            <div className="p-3" style={{ backgroundColor: theme.colors.primary }}>
              <p className="text-sm font-semibold" style={{ color: "#fff" }}>{theme.branding.companyName}</p>
            </div>
            <div className="p-3" style={{ backgroundColor: theme.colors.surface }}>
              <p className="text-sm font-medium" style={{ color: theme.colors.text }}>Sample Content</p>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>This is how your theme looks.</p>
              <div className="flex gap-2 mt-2">
                <div className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: theme.colors.success, borderRadius: theme.components.borderRadius }}>Approved</div>
                <div className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: theme.colors.warning, borderRadius: theme.components.borderRadius }}>Pending</div>
                <div className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: theme.colors.error, borderRadius: theme.components.borderRadius }}>Rejected</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ThemesPage() {
  const { data, loading, refetch } = useFetch<ThemeConfig[]>("/api/themes");

  const handleActivate = async (id: string) => {
    await fetch("/api/themes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: true }),
    });
    refetch();
  };

  if (loading || !data) return <PageLoading />;

  return (
    <>
      <PageHeader title="Themes" description="Customize the look and feel of your compliance portal">
        <Palette className="h-5 w-5 text-muted-foreground" />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {data.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} onActivate={() => handleActivate(theme.id)} />
        ))}
      </div>
    </>
  );
}
