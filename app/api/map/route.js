import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSafeAvatarUrl } from "../../../lib/avatar";

const coordsCache = {};

async function getCoords(city) {
  if (!city) return null;
  const lowerCity = city.toLowerCase().trim();
  if (coordsCache[lowerCity]) {
    return coordsCache[lowerCity];
  }
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lowerCity)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "BojarManagerSystem/1.0" }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        coordsCache[lowerCity] = coords;
        return coords;
      }
    }
  } catch(e) {
    console.error("Geocoding error for city:", city, e);
  }
  return null;
}

export async function GET(req) {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        role: { in: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
        driverStatus: {
          notIn: ["WAITING_FOR_APPROVAL", "INACTIVE"]
        }
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        discordNick: true,
        image: true,
        assignedTruck: {
          select: {
            brand: true,
            model: true,
            plate: true,
            fuelLevel: true,
            mileage: true,
            attachedTrailer: {
              select: {
                brand: true,
                model: true,
                plate: true
              }
            }
          }
        },
        jobs: {
          where: { status: "APPROVED" },
          select: {
            endCity: true,
            date: true
          },
          orderBy: { date: "desc" },
          take: 1
        }
      }
    });

    const driversMapData = [];

    for (const driver of drivers) {
      if (driver.jobs.length > 0) {
        const lastJob = driver.jobs[0];
        const lastCity = lastJob.endCity;
        
        let coords = null;
        if (lastCity) {
          coords = await getCoords(lastCity);
        }

        if (coords) {
          const truckStr = driver.assignedTruck ? `${driver.assignedTruck.brand} ${driver.assignedTruck.model} (${driver.assignedTruck.plate})` : "Brak przypisanego ciągnika";
          const trailerStr = driver.assignedTruck?.attachedTrailer ? `${driver.assignedTruck.attachedTrailer.brand} ${driver.assignedTruck.attachedTrailer.model} (${driver.assignedTruck.attachedTrailer.plate})` : "Brak przypisanej naczepy";
          
          driversMapData.push({
            id: driver.id,
            name: driver.firstName || driver.name || driver.discordNick || "Kierowca",
            image: getSafeAvatarUrl(driver),
            truck: truckStr,
            trailer: trailerStr,
            fuelLevel: driver.assignedTruck ? driver.assignedTruck.fuelLevel : null,
            truckMileage: driver.assignedTruck ? driver.assignedTruck.mileage : null,
            lastCity: lastCity,
            lastCoords: coords,
            lastJobDate: lastJob.date
          });
        }
      }
    }

    return NextResponse.json(driversMapData, {
      headers: {
        "Cache-Control": "private, max-age=30, s-maxage=60"
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd serwera przy pobieraniu lokalizacji" }, { status: 500 });
  }
}
