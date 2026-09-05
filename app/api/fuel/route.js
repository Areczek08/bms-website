import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

// Pamięć podręczna cen paliw (cache)
let fuelPriceCache = null;
let lastCacheFetchTime = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 godzin

const countryToIso = {
  "polska": "PL", "poland": "PL", "pl": "PL",
  "niemcy": "DE", "germany": "DE", "de": "DE",
  "wielka brytania": "GB", "great britain": "GB", "united kingdom": "GB", "uk": "GB", "gb": "GB", "anglia": "GB",
  "francja": "FR", "france": "FR", "fr": "FR",
  "wlochy": "IT", "włochy": "IT", "italy": "IT", "it": "IT",
  "holandia": "NL", "netherlands": "NL", "nl": "NL",
  "belgia": "BE", "belgium": "BE", "be": "BE",
  "czechy": "CZ", "czech republic": "CZ", "cz": "CZ",
  "slowacja": "SK", "słowacja": "SK", "slovakia": "SK", "sk": "SK",
  "litwa": "LT", "lithuania": "LT", "lt": "LT",
  "szwecja": "SE", "sweden": "SE", "se": "SE",
  "austria": "AT", "at": "AT",
  "szwajcaria": "CH", "switzerland": "CH", "ch": "CH",
  "hiszpania": "ES", "spain": "ES", "es": "ES"
};

const getCountryCode = (countryName) => {
  if (!countryName) return null;
  const normalized = countryName
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Usuwanie diakrytyków
    .replace(/ł/g, "l");
  
  for (const [key, value] of Object.entries(countryToIso)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return null;
};

async function getLiveFuelPrices() {
  const now = Date.now();
  if (fuelPriceCache && (now - lastCacheFetchTime < CACHE_DURATION)) {
    return fuelPriceCache;
  }
  
  try {
    const [pricesRes, ratesRes] = await Promise.all([
      fetch("https://openvan.camp/api/fuel/prices?source=bms-website"),
      fetch("https://openvan.camp/api/currency/rates?source=bms-website")
    ]);
    
    if (!pricesRes.ok || !ratesRes.ok) {
      throw new Error("Failed to fetch fuel or currency data from OpenVan");
    }
    
    const pricesData = await pricesRes.json();
    const ratesData = await ratesRes.json();
    
    if (!pricesData.success || !ratesData.success) {
      throw new Error("Data returned from OpenVan indicates failure");
    }
    
    const plnRate = ratesData.rates.PLN || 4.30;
    const processedPrices = {};
    
    for (const [countryCode, countryInfo] of Object.entries(pricesData.data)) {
      const currency = countryInfo.currency || "EUR";
      // Dla ciężarówek używamy ceny oleju napędowego (diesel)
      const rawPrice = countryInfo.prices.diesel || countryInfo.prices.diesel_regular || countryInfo.prices.gasoline || 0;
      
      let priceInPln = 0;
      if (rawPrice > 0) {
        if (currency === "PLN") {
          priceInPln = rawPrice;
        } else if (currency === "EUR") {
          priceInPln = rawPrice * plnRate;
        } else {
          // Zamiana waluty lokalnej na EUR, a potem na PLN
          const localRate = ratesData.rates[currency];
          if (localRate) {
            priceInPln = (rawPrice / localRate) * plnRate;
          } else {
            priceInPln = rawPrice * plnRate;
          }
        }
      }
      
      processedPrices[countryCode] = priceInPln;
    }
    
    fuelPriceCache = processedPrices;
    lastCacheFetchTime = now;
    return fuelPriceCache;
  } catch (err) {
    console.error("Error fetching live fuel prices:", err);
    return fuelPriceCache || null;
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'estimate') {
      const country = searchParams.get('country');
      const city = searchParams.get('city');

      if (!country) {
        return NextResponse.json({ error: "Country is required" }, { status: 400 });
      }

      const cleanCountry = country.trim();
      const cleanCity = city ? city.trim() : "";

      // 1. Spróbuj pobrać średnią z bazy danych dla danego miasta
      const cityLogs = await prisma.fuelLog.findMany({
        where: {
          country: cleanCountry,
          city: cleanCity
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      if (cityLogs.length > 0) {
        const sum = cityLogs.reduce((acc, log) => acc + log.pricePerLiter, 0);
        const avg = sum / cityLogs.length;
        return NextResponse.json({ price: avg.toFixed(2), source: "db_city" });
      }

      // 2. Spróbuj pobrać średnią z bazy danych dla danego kraju ogółem
      const countryLogs = await prisma.fuelLog.findMany({
        where: {
          country: cleanCountry
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      if (countryLogs.length > 0) {
        const sum = countryLogs.reduce((acc, log) => acc + log.pricePerLiter, 0);
        const avg = sum / countryLogs.length;
        return NextResponse.json({ price: avg.toFixed(2), source: "db_country" });
      }

      // 3. Pobierz aktualne stawki z Internetu (live API) i przelicz na PLN
      const countryCode = getCountryCode(cleanCountry);
      if (countryCode) {
        const livePrices = await getLiveFuelPrices();
        if (livePrices && livePrices[countryCode]) {
          let price = livePrices[countryCode];
          
          // Drobna fluktuacja dobowa dla realizmu
          const todayStr = new Date().toISOString().slice(0, 10);
          const seedStr = todayStr + cleanCity.toLowerCase();
          let hash = 0;
          for (let i = 0; i < seedStr.length; i++) {
            hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
          }
          const fluctuation = ((Math.abs(hash) % 30) - 15) / 100; // -0.15 PLN do +0.15 PLN
          price += fluctuation;
          
          return NextResponse.json({ price: price.toFixed(2), source: "live_api" });
        }
      }

      return NextResponse.json({ price: null, source: "default" });
    }

    const userId = searchParams.get('userId');
    const truckId = searchParams.get('truckId');

    const whereClause = {};
    if (userId) whereClause.userId = userId;
    if (truckId) whereClause.truckId = truckId;

    const logs = await prisma.fuelLog.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, firstName: true, email: true } },
        truck: { select: { brand: true, model: true, plate: true, fleetNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching fuel logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { truckId, country, city, liters, pricePerLiter, mileage, cardType } = body;

    if (!truckId || !country || !city || !liters || !pricePerLiter || !mileage || !cardType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalCost = parseFloat(liters) * parseFloat(pricePerLiter);

    // Get current truck to check mileage
    const truck = await prisma.truck.findUnique({ where: { id: truckId } });
    if (!truck) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    }

    const newMileage = parseInt(mileage);
    const updateTruckData = {};
    if (newMileage > truck.mileage) {
      updateTruckData.mileage = newMileage;
    }

    // Start transaction to ensure all or nothing
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create FuelLog
      const log = await tx.fuelLog.create({
        data: {
          userId: session.user.id,
          truckId,
          country,
          city,
          liters: parseFloat(liters),
          pricePerLiter: parseFloat(pricePerLiter),
          totalCost,
          mileage: newMileage,
          cardType: cardType
        }
      });

      // 2. Update Truck mileage if higher
      if (Object.keys(updateTruckData).length > 0) {
        await tx.truck.update({
          where: { id: truckId },
          data: updateTruckData
        });
      }

      // 3. Deduct company balance
      const company = await tx.company.findUnique({ where: { id: "BMS" } });
      if (company) {
        await tx.company.update({
          where: { id: "BMS" },
          data: { balance: company.balance - totalCost }
        });
      }

      // 4. Create Company Transaction log
      await tx.companyTransaction.create({
        data: {
          type: "EXPENSE",
          amount: totalCost,
          category: "Paliwo",
          description: `Tankowanie: ${truck.plate} | Kierowca: ${session.user.name} | ${liters}L x ${pricePerLiter} (${country}, ${city})`
        }
      });

      return log;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating fuel log:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
