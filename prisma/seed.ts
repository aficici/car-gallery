import { PrismaClient, Role, FuelType, Transmission, VehicleStatus, PaymentMethod, ContactNoteType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@cargallery.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@cargallery.com",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "0532 000 0001",
      isActive: true,
    },
  });

  const salesPassword = await bcrypt.hash("sales123", 12);
  await prisma.user.upsert({
    where: { email: "sales@cargallery.com" },
    update: {},
    create: {
      name: "John Smith",
      email: "sales@cargallery.com",
      password: salesPassword,
      role: Role.SALES_REP,
      phone: "0532 000 0002",
      isActive: true,
    },
  });

  console.log("✅ Users created:");
  console.log("   Admin → admin@cargallery.com / admin123");
  console.log("   Sales → sales@cargallery.com / sales123");

  const vehicles = [
    { brand: "Toyota", model: "Corolla", year: 2022, color: "White", fuelType: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC, mileage: 45000, purchasePrice: 28000, salePrice: 32000, status: VehicleStatus.AVAILABLE, vin: "JT2BF22K1W0123451", plateNumber: "34 ABC 001", description: "Clean title, one owner, well maintained." },
    { brand: "Honda", model: "Civic", year: 2021, color: "Blue", fuelType: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC, mileage: 62000, purchasePrice: 22000, salePrice: 26500, status: VehicleStatus.AVAILABLE, vin: "2HGEG165XVH523452", plateNumber: "34 ABC 002", description: "Sporty sedan, excellent condition." },
    { brand: "Ford", model: "Mustang", year: 2020, color: "Red", fuelType: FuelType.GASOLINE, transmission: Transmission.MANUAL, mileage: 38000, purchasePrice: 35000, salePrice: 41000, status: VehicleStatus.RESERVED, vin: "1FA6P8CF5L5123453", plateNumber: "34 ABC 003", description: "Classic muscle car, low mileage." },
    { brand: "BMW", model: "3 Series", year: 2023, color: "Black", fuelType: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC, mileage: 15000, purchasePrice: 48000, salePrice: 56000, status: VehicleStatus.AVAILABLE, vin: "WBA8E9G58JNU23454", plateNumber: "34 ABC 004", description: "Premium sedan, loaded with features." },
    { brand: "Tesla", model: "Model 3", year: 2023, color: "Silver", fuelType: FuelType.ELECTRIC, transmission: Transmission.AUTOMATIC, mileage: 22000, purchasePrice: 42000, salePrice: 49000, status: VehicleStatus.AVAILABLE, vin: "5YJ3E1EA4PF123455", plateNumber: "34 ABC 005", description: "Long range, autopilot included." },
    { brand: "Mercedes", model: "C-Class", year: 2022, color: "Gray", fuelType: FuelType.DIESEL, transmission: Transmission.AUTOMATIC, mileage: 31000, purchasePrice: 52000, salePrice: 61000, status: VehicleStatus.AVAILABLE, vin: "WDDGF81X79F123456", plateNumber: "34 ABC 006", description: "Luxury sedan, panoramic roof." },
    { brand: "Volkswagen", model: "Golf", year: 2021, color: "White", fuelType: FuelType.DIESEL, transmission: Transmission.MANUAL, mileage: 55000, purchasePrice: 19000, salePrice: 23000, status: VehicleStatus.SOLD, vin: "WVWZZZ1KZ8W123457", plateNumber: "34 ABC 007", description: "Reliable hatchback, great fuel economy." },
    { brand: "Hyundai", model: "Tucson", year: 2022, color: "Green", fuelType: FuelType.HYBRID, transmission: Transmission.AUTOMATIC, mileage: 28000, purchasePrice: 31000, salePrice: 37000, status: VehicleStatus.AVAILABLE, vin: "KM8J3CA46NU123458", plateNumber: "34 ABC 008", description: "Hybrid SUV, low running costs." },
    { brand: "Kia", model: "Sportage", year: 2023, color: "Orange", fuelType: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC, mileage: 12000, purchasePrice: 29000, salePrice: 34500, status: VehicleStatus.AVAILABLE, vin: "KNDPMCAC7N7123459", plateNumber: "34 ABC 009", description: "New model, full warranty." },
    { brand: "Audi", model: "A4", year: 2021, color: "Navy", fuelType: FuelType.DIESEL, transmission: Transmission.AUTOMATIC, mileage: 47000, purchasePrice: 39000, salePrice: 46000, status: VehicleStatus.AVAILABLE, vin: "WAUZZZ8K9BA123460", plateNumber: "34 ABC 010", description: "Premium german engineering." },
    { brand: "Nissan", model: "Leaf", year: 2022, color: "White", fuelType: FuelType.ELECTRIC, transmission: Transmission.AUTOMATIC, mileage: 33000, purchasePrice: 24000, salePrice: 28500, status: VehicleStatus.AVAILABLE, vin: "1N4AZ1CP4NC123461", plateNumber: "34 ABC 011", description: "Fully electric, great range." },
    { brand: "Renault", model: "Megane", year: 2020, color: "Red", fuelType: FuelType.LPG, transmission: Transmission.MANUAL, mileage: 78000, purchasePrice: 12000, salePrice: 15000, status: VehicleStatus.AVAILABLE, vin: "VF1BM1B0H51123462", plateNumber: "34 ABC 012", description: "Economical with LPG conversion." },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { vin: vehicle.vin },
      update: {},
      create: { ...vehicle, images: [] },
    });
  }

  console.log(`✅ ${vehicles.length} vehicles created`);

  // Customers
  const customers = [
    { firstName: "Michael", lastName: "Johnson", email: "michael.j@email.com", phone: "+1 555 100 0001", city: "Los Angeles", occupation: "Software Engineer", idNumber: "US123456001" },
    { firstName: "Sarah", lastName: "Williams", email: "sarah.w@email.com", phone: "+1 555 100 0002", city: "Beverly Hills", occupation: "Doctor", idNumber: "US123456002" },
    { firstName: "James", lastName: "Brown", email: "james.b@email.com", phone: "+1 555 100 0003", city: "Santa Monica", occupation: "Lawyer", idNumber: "US123456003" },
    { firstName: "Emily", lastName: "Davis", email: "emily.d@email.com", phone: "+1 555 100 0004", city: "Pasadena", occupation: "Teacher", idNumber: "US123456004" },
  ];

  const createdCustomers: { id: string }[] = [];
  for (const c of customers) {
    const customer = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: c,
    });
    createdCustomers.push(customer);
  }
  console.log(`✅ ${customers.length} customers created`);

  // Sample sale (Golf is SOLD)
  const golf = await prisma.vehicle.findUnique({ where: { vin: "WVWZZZ1KZ8W123457" } });
  const admin = await prisma.user.findUnique({ where: { email: "admin@cargallery.com" } });
  if (golf && admin && createdCustomers[0]) {
    const existing = await prisma.sale.findUnique({ where: { vehicleId: golf.id } });
    if (!existing) {
      await prisma.sale.create({
        data: {
          vehicleId: golf.id,
          customerId: createdCustomers[0].id,
          salesRepId: admin.id,
          salePrice: 23000,
          downPayment: 5000,
          remainingAmount: 18000,
          paymentMethod: PaymentMethod.INSTALLMENT,
          paymentStatus: "PARTIAL",
          commissionRate: 0.02,
          commissionAmount: 460,
          saleDate: new Date("2025-11-15"),
          payments: {
            create: [
              { amount: 6000, dueDate: new Date("2025-12-15"), isPaid: true, paidDate: new Date("2025-12-10") },
              { amount: 6000, dueDate: new Date("2026-01-15"), isPaid: true, paidDate: new Date("2026-01-12") },
              { amount: 6000, dueDate: new Date("2026-02-15"), isPaid: false },
            ],
          },
        },
      });
      console.log("✅ Sample sale created");
    }

    // Sample contact notes for first customer
    const noteCount = await prisma.contactNote.count({ where: { customerId: createdCustomers[0].id } });
    if (noteCount === 0) {
      await prisma.contactNote.createMany({
        data: [
          { customerId: createdCustomers[0].id, userId: admin.id, type: ContactNoteType.CALL, content: "Initial inquiry about available vehicles. Interested in SUVs and sedans.", createdAt: new Date("2025-11-01") },
          { customerId: createdCustomers[0].id, userId: admin.id, type: ContactNoteType.MEETING, content: "Visited showroom. Tested the Golf and showed interest in the BMW 3 Series.", createdAt: new Date("2025-11-10") },
          { customerId: createdCustomers[0].id, userId: admin.id, type: ContactNoteType.NOTE, content: "Customer agreed to purchase the VW Golf. Paperwork signed.", createdAt: new Date("2025-11-15") },
          { customerId: createdCustomers[0].id, userId: admin.id, type: ContactNoteType.FOLLOW_UP, content: "Follow up on remaining payment due Feb 2026.", createdAt: new Date("2026-01-20") },
        ],
      });
      console.log("✅ Sample contact notes created");
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
