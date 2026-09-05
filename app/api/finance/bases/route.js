import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { getBaseDetails, saveBaseDetails } from "../../../../lib/bases";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const basesFromDb = await prisma.companyBase.findMany({
      include: {
        trucks: { 
          select: { 
            id: true, 
            brand: true, 
            model: true, 
            plate: true,
            fleetNumber: true,
            status: true
          } 
        },
        payments: true
      }
    });

    // Attach extended details (description, imageUrl, amenities)
    const bases = basesFromDb.map(b => {
      const details = getBaseDetails(b.id);
      return {
        ...b,
        imageUrl: details.imageUrl,
        description: details.description,
        amenities: details.amenities
      };
    });

    const trucks = await prisma.truck.findMany({
      select: { 
        id: true, 
        brand: true, 
        model: true, 
        plate: true, 
        fleetNumber: true,
        baseId: true 
      }
    });

    return NextResponse.json({ success: true, bases, trucks });
  } catch (error) {
    console.error("Bases GET Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { name, city, monthlyCost, capacity, imageUrl, description, amenities } = await req.json();

    if (!name || !city || !monthlyCost) {
      return NextResponse.json({ error: "Brak wymaganych danych" }, { status: 400 });
    }

    const base = await prisma.companyBase.create({
      data: {
        name,
        city,
        monthlyCost: parseFloat(monthlyCost),
        capacity: capacity ? parseInt(capacity) : null,
      }
    });

    // Save extended details if provided
    saveBaseDetails(base.id, {
      imageUrl,
      description,
      amenities
    });

    const details = getBaseDetails(base.id);

    return NextResponse.json({ 
      success: true, 
      base: {
        ...base,
        imageUrl: details.imageUrl,
        description: details.description,
        amenities: details.amenities
      } 
    });
  } catch (error) {
    console.error("Bases POST Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await req.json();

    // Mode A: Update Base Details
    if (body.action === "UPDATE_BASE") {
      const { baseId, name, city, monthlyCost, capacity, imageUrl, description, amenities } = body;
      if (!baseId) return NextResponse.json({ error: "Brak ID bazy" }, { status: 400 });

      const updatedBase = await prisma.companyBase.update({
        where: { id: baseId },
        data: {
          name,
          city,
          monthlyCost: parseFloat(monthlyCost),
          capacity: capacity ? parseInt(capacity) : null,
        }
      });

      saveBaseDetails(baseId, {
        imageUrl,
        description,
        amenities
      });

      return NextResponse.json({ success: true, base: updatedBase });
    }

    // Mode B: Assign Trucks (Multi or Single)
    const { baseId, truckId, truckIds } = body;
    const idsToAssign = truckIds && Array.isArray(truckIds) ? truckIds : (truckId ? [truckId] : []);

    if (idsToAssign.length === 0) {
      return NextResponse.json({ error: "Brak wybranych ciągników" }, { status: 400 });
    }

    if (baseId) {
      const base = await prisma.companyBase.findUnique({ where: { id: baseId }, include: { trucks: true } });
      if (base && base.capacity) {
        const availableSlots = base.capacity - base.trucks.length;
        if (idsToAssign.length > availableSlots) {
          return NextResponse.json({ error: `Baza pomieści jeszcze tylko ${availableSlots} pojazdów.` }, { status: 400 });
        }
      }
    }

    await prisma.truck.updateMany({
      where: { id: { in: idsToAssign } },
      data: { baseId: baseId || null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Base Assign/Update Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas zapisywania" }, { status: 500 });
  }
}
