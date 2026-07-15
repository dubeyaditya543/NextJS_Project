import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json(
      { status: "ok", messsage: "db connected" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "failed", message: "db connection failed" },
      { status: 500 },
    );
  }
}
