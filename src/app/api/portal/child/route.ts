import { NextResponse } from "next/server";
import { getParentChildPortalData } from "@/features/portal/parent-queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const athleteId = searchParams.get("athleteId");

  if (!athleteId) {
    return NextResponse.json(
      { success: false, error: "Parameter athleteId wajib diisi." },
      { status: 400 }
    );
  }

  const result = await getParentChildPortalData(athleteId);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error?.startsWith("UNAUTHORIZED") ? 403 : 404 }
    );
  }

  return NextResponse.json(result);
}
