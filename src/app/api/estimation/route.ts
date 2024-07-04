import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const apiUrl = `${process.env.ESTIMATION_API}/api/estimation`;
        const bodyData = await request.json();
        const response = await fetch(apiUrl, {
            cache: 'no-store',
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData),
        });
    
        // レスポンスのステータスコードを確認
        if (!response.ok) {
            // エラーレスポンスを返す場合
            return new NextResponse("Failed to fetch data from external API", { status: response.status });
        }
    
        // ヘッダーとステータスコードを取得
        const headers = new Headers();
        response.headers.forEach((value, key) => {
            headers.set(key, value);
        });

        // レスポンスボディを取得
        const body = await response.body;

        // 新しいレスポンスを作成して返す
        return new NextResponse(body, {
            status: response.status,
            headers: headers
        });
    } catch (error) {
        console.error('Error fetching data from external API:', error);
        // エラーが発生した場合の処理
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
