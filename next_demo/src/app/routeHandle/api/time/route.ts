import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    date: new Date().toLocaleTimeString(),
  })
}