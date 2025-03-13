import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const accessVerified = cookieStore.get("accessVerified");

  if (accessVerified && accessVerified.value === "true") {
    return NextResponse.json({ verified: true });
  }

  return NextResponse.json({ verified: false }, { status: 403 });
} 