import { NextResponse } from "next/server";
import {
  getParentChildPortalData,
  getPortalChildDataByToken,
} from "@/features/portal/parent-queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const athleteId = searchParams.get("athleteId");
  const token = searchParams.get("token");

  if (!athleteId) {
    return NextResponse.json(
      { success: false, error: "Parameter athleteId wajib diisi." },
      { status: 400 }
    );
  }

  let result;
  if (token) {
    result = await getPortalChildDataByToken(token, athleteId);
  } else {
    result = await getParentChildPortalData(athleteId);
  }

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error?.startsWith("UNAUTHORIZED") ? 403 : 404 }
    );
  }

  return NextResponse.json(result);
}

