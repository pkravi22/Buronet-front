import { NextResponse } from "next/server";
import clientPromise from "@/lib/helpers/mongoDbHelper";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const query = searchParams.get("query");
    const limit = Number(searchParams.get("limit") || 10);

    // Handle news query (for external news API)
    if (query) {
      const NEWS_API_KEY = "f6719dee71aa4664bca1082aa8e98438";
      
      if (!NEWS_API_KEY) {
        return NextResponse.json(
          { error: "NewsAPI key is not configured" },
          { status: 500 }
        );
      }

      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${limit}`,
          {
            method: 'GET',
            headers: {
              'X-Api-Key': NEWS_API_KEY,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `NewsAPI Error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
      } catch (err: any) {
        console.error("NewsAPI error:", err);
        return NextResponse.json(
          { error: err.message || "Failed to fetch news" },
          { status: 500 }
        );
      }
    }

    // Handle database updates (existing logic)
    if (!type || !["JOB", "EXAM"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("job_postings_db");

    const updates = await db
      .collection("jobAndExamUpdates")
      .find({
        type,
        status: "active",
      })
      .sort({ priority: 1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(updates);
  } catch (err) {
    console.error("Updates API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}
