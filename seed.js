const { PrismaClient } = require("@prisma/client");

const repairData = [
  // Car Repairs (UGX ranges: parts + labor, 2025 inflation-adjusted)
  {
    name: "Brake Pads Replacement",
    vehicleTypeId: "CAR",
    min: 50000,
    max: 100000,
  },
  { name: "Oil Change", vehicleTypeId: "CAR", min: 30000, max: 60000 },
  { name: "Tire Replacement", vehicleTypeId: "CAR", min: 80000, max: 150000 },
  { name: "Carburetor Cleaning", vehicleTypeId: "CAR", min: 20000, max: 50000 },
  {
    name: "Spark Plug Replacement",
    vehicleTypeId: "CAR",
    min: 15000,
    max: 30000,
  },
  // Moto Expansion
  {
    name: "Brake Pads (Boda)",
    vehicleTypeId: "MOTORCYCLE",
    min: 20000,
    max: 40000,
  },
  {
    name: "Fork Oil Change",
    vehicleTypeId: "MOTORCYCLE",
    min: 25000,
    max: 50000,
  },
];

const prisma = new PrismaClient();

async function main() {
  await prisma.quote.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.vehicleType.deleteMany();

  const carType = await prisma.vehicleType.upsert({
    where: { name: "Car" },
    update: {},
    create: { name: "Car" },
  });

  const motoType = await prisma.vehicleType.upsert({
    where: { name: "Motorcycle" },
    update: {},
    create: { name: "Motorcycle" },
  });

  for (const repair of repairData) {
    const vehicleTypeId =
      repair.vehicleTypeId === "CAR" ? carType.id : motoType.id;
    await prisma.repair.upsert({
      where: { name_vehicleTypeId: { name: repair.name, vehicleTypeId } },
      update: {},
      create: {
        name: repair.name,
        vehicleTypeId,
        priceRange: { min: repair.min, max: repair.max, currency: "UGX" },
      },
    });
  }

  console.log("✅ Seeded! Cars: 5 repairs (e.g., brakes 50k-100k UGX).");
}

main()
  .catch((e) => console.error("Seed error:", e))
  .finally(async () => await prisma.$disconnect());
