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
      const NEWS_API_KEY = process.env.NEXT_PUBLIC_CURRENT_AFFAIRS_API_KEY || "pub_7ebcbabb30e44a098ef683a34a98453c";
      
      if (!NEWS_API_KEY) {
        return NextResponse.json(
          { error: "News API key is not configured" },
          { status: 500 }
        );
      }

      try {
        const response = await fetch(
          `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en`,
          {
            method: 'GET'
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `NewsAPI Error: ${response.status}`);
        }

        const data = await response.json();
        // Transform Newsdata.io format to match the expected NewsAPI format in useNews.ts
        const articles = (data.results || []).map((item: any) => ({
          source: { id: null, name: item.source_id || 'News Source' },
          author: item.creator ? item.creator[0] : null,
          title: item.title,
          description: item.description,
          url: item.link,
          urlToImage: item.image_url,
          publishedAt: item.pubDate,
          content: item.content
        }));
        
        return NextResponse.json({ articles });
      } catch (err: any) {
        console.error("News API error:", err);
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
