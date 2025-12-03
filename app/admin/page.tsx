import { prisma } from "@/lib/db";

// Define the TypeScript interface for the JSON field
interface PriceRange {
  min: number;
  max: number;
}

export default async function Admin() {
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
          {repairs.map((repair) => (
            <tr key={repair.id}>
              <td className="border border-gray-300 p-2">{repair.name}</td>
              <td className="border border-gray-300 p-2">
                {repair.vehicleType.name}
              </td>
              <td className="border border-gray-300 p-2">
                {repair.priceRange
                  ? `${(repair.priceRange as unknown as PriceRange).min} - ${
                      (repair.priceRange as unknown as PriceRange).max
                    }`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
