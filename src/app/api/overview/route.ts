import { success } from "@/lib/api-helpers";
import { overviewStats } from "@/lib/mock-data";

export async function GET() {
  return success(overviewStats);
}
