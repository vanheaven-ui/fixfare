"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairData = void 0;
exports.repairData = [
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
