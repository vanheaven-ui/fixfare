import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const quoteSchema = z.object({
  vehicleType: z.enum(["Car", "Motorcycle"]),
  repairName: z.string().min(1),
});

// GET: List all quotes (optional filter by userId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const quotes = await prisma.quote.findMany({
      where: userId ? { userId } : {},
      include: {
        repair: { include: { vehicleType: true } },
        user: { select: { name: true } },
        mechanic: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Quote list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create quote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleType, repairName } = quoteSchema.parse(body);

    const repair = await prisma.repair.findFirst({
      where: {
        name: repairName,
        vehicleType: { name: vehicleType },
      },
      select: { id: true, priceRange: true },
    });

    if (!repair) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    const shareLink = uuidv4().slice(0, 8);

    const quote = await prisma.quote.create({
      data: {
        repairId: repair.id,
        expectedRange: repair.priceRange as Prisma.InputJsonValue,
        shareLink,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      id: quote.id,
      shareLink: `/quote/${shareLink}`,
      expectedRange: repair.priceRange,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Quote gen error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
