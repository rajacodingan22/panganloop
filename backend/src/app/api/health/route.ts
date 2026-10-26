import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "panganloop-backend",
    timestamp: new Date().toISOString(),
  });
}
