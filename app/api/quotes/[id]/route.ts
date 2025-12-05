import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Typed include for relations
type QuoteWithRelations = Prisma.QuoteGetPayload<{
  include: {
    repair: {
      include: {
        vehicleType: true;
      };
    };
  };
}>;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const quote = (await prisma.quote.findFirst({
      where: { shareLink: id },
      include: {
        repair: { include: { vehicleType: true } },
      },
    })) as QuoteWithRelations;

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: quote.id,
      repair: quote.repair.name,
      vehicleType: quote.repair.vehicleType.name,
      expectedRange: quote.expectedRange,
      status: quote.status,
      counterQuote: quote.counterQuote,
      shareLink: id,
    });
  } catch (error) {
    console.error("Quote fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, counterQuote, mechanicId } = body;

    if (!status || !counterQuote) {
      return NextResponse.json(
        { error: "Status and counterQuote required" },
        { status: 400 }
      );
    }

    const existingQuote = await prisma.quote.findFirst({
      where: { shareLink: id },
    });

    if (!existingQuote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const quote = await prisma.quote.update({
      where: { id: existingQuote.id },
      data: {
        status: status as
          | "PENDING"
          | "COUNTERED"
          | "APPROVED"
          | "COMPLETED",
        counterQuote:
          typeof counterQuote === "object"
            ? counterQuote
            : { amount: counterQuote },
        mechanicId: mechanicId || null,
      },
      include: { repair: true },
    });

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("Quote update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
