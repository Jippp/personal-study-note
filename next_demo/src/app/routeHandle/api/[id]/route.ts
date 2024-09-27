import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const res = await new Promise(resolve => {
    setTimeout(() => {
      resolve(context)
    }, 1000);
  })
  return NextResponse.json(res)
}