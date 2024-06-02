import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
    const domain=process.env.DOMAIN_NAME
    return new NextResponse(domain, { status: 200 });
}
