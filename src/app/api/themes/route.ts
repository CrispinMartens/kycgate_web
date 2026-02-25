import { NextRequest } from "next/server";
import { success, error, generateId, now } from "@/lib/api-helpers";
import { themes } from "@/lib/mock-data";
import { ThemeConfig } from "@/types";

export async function GET() {
  return success(themes);
}

export async function POST(request: NextRequest) {
  try {
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
