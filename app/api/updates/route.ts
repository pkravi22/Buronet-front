import { NextResponse } from "next/server";
import clientPromise from "@/lib/helpers/mongoDbHelper";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type"); // JOB | EXAM
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
      $or: [
        { validTill: null },
        { validTill: { $gt: new Date() } },
      ],
    })
    .sort({ priority: 1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json(updates);
}
