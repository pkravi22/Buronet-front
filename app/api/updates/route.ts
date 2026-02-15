import { NextResponse } from "next/server";
import clientPromise from "@/lib/helpers/mongoDbHelper";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = Number(searchParams.get("limit") || 10);

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
