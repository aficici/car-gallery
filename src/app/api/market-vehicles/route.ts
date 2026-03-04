import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const make = searchParams.get("make")?.toLowerCase() || "";
  const search = searchParams.get("search")?.toLowerCase() || "";
  const sort = searchParams.get("sort") || "price_asc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");

  try {
    const filePath = path.join(process.cwd(), "public", "vehicles.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    let vehicles = data.vehicles as Vehicle[];

    if (make) {
      vehicles = vehicles.filter((v) => v.make?.toLowerCase() === make);
    }
    if (search) {
      vehicles = vehicles.filter(
        (v) =>
          v.make?.toLowerCase().includes(search) ||
          v.model?.toLowerCase().includes(search) ||
          v.vin?.toLowerCase().includes(search) ||
          String(v.year).includes(search)
      );
    }

    vehicles = [...vehicles].sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return (a.price || 999999) - (b.price || 999999);
        case "price_desc":
          return (b.price || 0) - (a.price || 0);
        case "year_desc":
          return (b.year || 0) - (a.year || 0);
        case "year_asc":
          return (a.year || 9999) - (b.year || 9999);
        case "mileage_asc":
          return (a.mileage || 999999) - (b.mileage || 999999);
        default:
          return 0;
      }
    });

    const total = vehicles.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = vehicles.slice(offset, offset + limit);

    const allMakes = [...new Set(data.vehicles.map((v: Vehicle) => v.make).filter(Boolean))].sort();

    const stats = {
      total: data.total,
      withVin: data.vehicles.filter((v: Vehicle) => v.vin).length,
      avgPrice: Math.round(
        data.vehicles
          .filter((v: Vehicle) => v.price)
          .reduce((sum: number, v: Vehicle) => sum + (v.price || 0), 0) /
          data.vehicles.filter((v: Vehicle) => v.price).length
      ),
      scraped_at: data.scraped_at,
      search_params: data.search_params,
    };

    return NextResponse.json({
      vehicles: paginated,
      total,
      page,
      totalPages,
      limit,
      makes: allMakes,
      stats,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load vehicle data" },
      { status: 500 }
    );
  }
}

interface Vehicle {
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  mileage: number | null;
  price: number | null;
  location: string | null;
  distance_miles: number | null;
  dealer: string | null;
  url: string;
  source_id: string | null;
  site_code: string | null;
}
