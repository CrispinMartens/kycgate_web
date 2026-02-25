import { NextRequest } from "next/server";
import { success, error, generateId, now } from "@/lib/api-helpers";
import { themes } from "@/lib/mock-data";
import { ThemeConfig } from "@/types";

const GOLDEN_SUISSE_THEME: ThemeConfig = {
  id: "theme_04",
  name: "Golden Suisse",
  isActive: false,
  branding: {
    companyName: "Golden Suisse",
    tagline: "Preserving Wealth. Protecting Legacy. Ensuring Sovereignty.",
  },
  colors: {
    primary: "#B78B2E",
    secondary: "#1E2A31",
    accent: "#D4AF37",
    background: "#F7F4EE",
    surface: "#FFFFFF",
    text: "#1B1B1B",
    textSecondary: "#6F6A5D",
    success: "#2F7D55",
    warning: "#C08A1A",
    error: "#A63A2A",
    info: "#355C7D",
  },
  typography: {
    fontFamily: "Inter, IBM Plex Sans, system-ui, sans-serif",
    headingFontFamily: "Playfair Display, Times New Roman, serif",
    baseFontSize: "14px",
    headingWeight: "700",
  },
  components: {
    borderRadius: "4px",
    buttonStyle: "square",
    cardShadow: "sm",
    inputStyle: "outline",
  },
  updatedAt: "2026-02-23T12:00:00Z",
};

const INABANK_THEME: ThemeConfig = {
  id: "theme_05",
  name: "InaBank",
  isActive: false,
  branding: {
    companyName: "InaBank",
    tagline: "Private onboarding with trusted compliance.",
  },
  colors: {
    primary: "#004555",
    secondary: "#396D7A",
    accent: "#86A1A9",
    background: "#F3F4F5",
    surface: "#F7F9FA",
    text: "#0F172A",
    textSecondary: "#396D7A",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
  },
  typography: {
    fontFamily: "Proxima Nova, IBM Plex Sans, system-ui, sans-serif",
    headingFontFamily: "GT Alpina, Times New Roman, serif",
    baseFontSize: "14px",
    headingWeight: "600",
  },
  components: {
    borderRadius: "4px",
    buttonStyle: "square",
    cardShadow: "sm",
    inputStyle: "outline",
  },
  updatedAt: "2026-02-23T12:30:00Z",
};

function ensureBuiltInThemes() {
  const builtInThemes = [GOLDEN_SUISSE_THEME, INABANK_THEME];
  for (const builtInTheme of builtInThemes) {
    const exists = themes.some(
      (theme) => theme.id === builtInTheme.id || theme.name === builtInTheme.name,
    );
    if (!exists) {
      themes.push({ ...builtInTheme });
    }
  }
}

export async function GET() {
  ensureBuiltInThemes();
  return success(themes);
}

export async function POST(request: NextRequest) {
  try {
    ensureBuiltInThemes();
    const body = await request.json();
    if (!body.name) return error("Validation error: name is required");

    const newTheme: ThemeConfig = {
      id: generateId("theme"),
      name: body.name,
      isActive: false,
      branding: body.branding ?? { companyName: "KYCGate" },
      colors: body.colors ?? themes[0].colors,
      typography: body.typography ?? themes[0].typography,
      components: body.components ?? themes[0].components,
      updatedAt: now(),
    };

    themes.push(newTheme);
    return success(newTheme, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    ensureBuiltInThemes();
    const body = await request.json();
    if (!body.id) return error("Validation error: id is required");

    const index = themes.findIndex((t) => t.id === body.id);
    if (index === -1) return error("Theme not found", 404);

    if (body.isActive === true) {
      themes.forEach((t) => (t.isActive = false));
    }

    themes[index] = { ...themes[index], ...body, updatedAt: now() };
    return success(themes[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}
