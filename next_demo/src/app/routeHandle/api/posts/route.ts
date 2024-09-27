import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const res = await new Promise(resolve => {
    setTimeout(() => {
      resolve(request.nextUrl)
    }, 1000);
  })

  return NextResponse.json(res)
}

export async function POST(request: NextRequest) {
  const posts = await request.json()
  
  return NextResponse.json({
    id: Math.random().toString(36).slice(-8),
    data: posts
  }, { status: 201 })
}
