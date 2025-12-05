import { prisma } from "@/lib/db";
// 1. Import the Prisma client types
import { Prisma } from "@prisma/client";

// Define the TypeScript interface for the JSON field
interface PriceRange {
  min: number;
  max: number;
}

// 2. Define the complex type for the query result
// This type utility tells TypeScript exactly what the result of the findMany query is.
type RepairWithVehicle = Prisma.RepairGetPayload<{
  include: { vehicleType: true };
}>;

export default async function Admin() {
  // The 'repairs' constant now correctly infers its type from the Prisma call,
  // which includes the 'vehicleType' relationship.
  const repairs = await prisma.repair.findMany({
    include: { vehicleType: true },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin: Repair Prices</h1>
      <p className="mb-4 text-gray-600">
        Curated UGX ranges (update via seed.ts).
      </p>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Repair</th>
            <th className="border border-gray-300 p-2">Vehicle</th>
            <th className="border border-gray-300 p-2">Range (UGX)</th>
          </tr>
        </thead>

        <tbody>
          {/* 3. Explicitly type the parameter 'repair' */}
          {repairs.map((repair: RepairWithVehicle) => {
            // PriceRange is stored as a JSON column, so we cast it for access.
            const range = repair.priceRange as unknown as PriceRange;

            return (
              <tr key={repair.id}>
                <td className="border border-gray-300 p-2">{repair.name}</td>

                <td className="border border-gray-300 p-2">
                  {repair.vehicleType.name}
                </td>

                <td className="border border-gray-300 p-2">
                  {range
                    ? `${range.min.toLocaleString()} - ${range.max.toLocaleString()}`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
