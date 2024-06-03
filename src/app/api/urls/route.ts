import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // 他のAPIを叩くためのリクエストを作成
        const apiUrl = `${process.env.DOMAIN_NAME}/api/object/get`;
        const bodyData = await request.json();
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${encodeToBase64(
                    `${process.env.USER_NAME}:${process.env.PASSWORD}`
                )}`,
            },
            body: JSON.stringify(bodyData),
        });
    
        // レスポンスのステータスコードを確認
        if (!response.ok) {
            // エラーレスポンスを返す場合
            return new NextResponse("Failed to fetch data from external API", { status: response.status });
        }
    
        // JSON形式のレスポンスを取得
        const data = await response.json();
    
        // レスポンスを返す
        return new NextResponse(JSON.stringify(data), { status: response.status });
    } catch (error) {
        console.error("Error fetching data from external API:", error);
        // エラーが発生した場合の処理
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

function encodeToBase64(input:string) {
    return Buffer.from(input).toString('base64');
}
