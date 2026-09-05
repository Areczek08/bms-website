const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sqlPath = "C:\\Users\\defin\\Downloads\\kierowcy.sql";
  console.log(`Wczytywanie pliku: ${sqlPath}`);
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`Plik ${sqlPath} nie istnieje!`);
    return;
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  // Szukamy sekcji INSERT INTO `kierowcy` ... VALUES
  const insertIndex = sqlContent.indexOf('INSERT INTO `kierowcy`');
  if (insertIndex === -1) {
    console.error('Nie znaleziono sekcji INSERT INTO `kierowcy` w pliku SQL.');
    return;
  }

  const valuesSection = sqlContent.slice(insertIndex);
  const valuesMatch = valuesSection.match(/VALUES\s+([\s\S]*);/);
  
  if (!valuesMatch || !valuesMatch[1]) {
    console.error('Nie można sparsować wartości z zapytania INSERT.');
    return;
  }

  let valuesString = valuesMatch[1].trim();
  
  // Dzielimy ciąg wartości na pojedyncze wpisy kierowców
  // Wartości są postaci: (1, 'Imie', ...), (2, 'Imie2', ...)
  const rows = [];
  
  // Bardzo uproszczone parsowanie, szukamy wszystkich elementów pomiędzy ( a )
  // Musimy jednak uważać na nawiasy wewnątrz stringów, dlatego użyjemy regexa iteracyjnego
  // Ponieważ w SQL stringi są w pojedynczych cudzysłowach, usuniemy na chwilę blob z równania dla łatwiejszego parsowania
  const rowRegex = /\(\s*(\d+)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*(\d+|NULL)\s*,\s*(\d+|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*(0x[a-fA-F0-9]+|NULL)\s*,\s*('(?:[^'\\]|\\.)*'|NULL)\s*,\s*([\d\.]+|NULL)\s*,\s*(\d+|NULL)\s*,\s*(\d+|NULL)\s*\)/g;

  let match;
  let count = 0;
  
  const parseVal = (val) => {
    if (val === 'NULL') return null;
    if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1);
    return val;
  };

  while ((match = rowRegex.exec(valuesString)) !== null) {
    const nr = parseVal(match[1]);
    const name = parseVal(match[2]);
    const discord = parseVal(match[3]);
    const trucksbook = parseVal(match[4]);
    const rankStr = parseVal(match[5]);
    const joinDateStr = parseVal(match[6]);
    const probation = parseVal(match[7]);
    const truckBrandModel = parseVal(match[8]);
    const receiveDate = parseVal(match[9]);
    const trailerType = parseVal(match[10]);
    const plate = parseVal(match[11]);
    const praises = parseVal(match[12]);
    const reprimands = parseVal(match[13]);
    const notes = parseVal(match[14]);
    const premium = parseVal(match[15]);
    const penaltyPoints = parseVal(match[16]);
    const premiumColor = parseVal(match[17]);
    // Pomijamy bloba (AWATAR) - match[18]
    const socialMedia = parseVal(match[19]);
    const ecoScore = parseVal(match[20]);
    const initialMileage = parseVal(match[21]);
    const initialDeliveries = parseVal(match[22]);

    console.log(`Przetwarzanie kierowcy: ${name} (${discord})`);

    // Mapowanie roli
    let role = "DRIVER";
    if (rankStr && rankStr.toLowerCase().includes("właściciel")) role = "OWNER";
    else if (rankStr && rankStr.toLowerCase().includes("zarząd")) role = "BOARD";
    else if (rankStr && rankStr.toLowerCase().includes("dyspozytor")) role = "DISPATCHER";

    // Formatowanie daty
    let createdAt = new Date();
    if (joinDateStr) {
      try {
        createdAt = new Date(joinDateStr);
        if (isNaN(createdAt.getTime())) createdAt = new Date();
      } catch (e) {
        createdAt = new Date();
      }
    }

    // Znajdź lub utwórz użytkownika
    try {
      const user = await prisma.user.upsert({
        where: {
          email: `${discord || name.toLowerCase().replace(/\s+/g, '')}@bojar.local` // Wymagany unikalny email z racji braku w pliku
        },
        update: {
          name: name,
          firstName: name,
          discordNick: discord,
          trucksBookUrl: trucksbook,
          role: role,
          rank: rankStr || "Praktykant",
          notes: notes,
          probationPeriod: probation,
          premium: premium === "1",
          penaltyPoints: penaltyPoints ? parseInt(penaltyPoints) : 0,
          premiumColor: premiumColor,
          socialMedia: socialMedia,
          ecoScore: ecoScore ? parseFloat(ecoScore) : 100.0,
          initialMileage: initialMileage ? parseInt(initialMileage) : 0,
          initialDeliveries: initialDeliveries ? parseInt(initialDeliveries) : 0,
          createdAt: createdAt
        },
        create: {
          email: `${discord || name.toLowerCase().replace(/\s+/g, '')}@bojar.local`,
          name: name,
          firstName: name,
          discordNick: discord,
          trucksBookUrl: trucksbook,
          role: role,
          rank: rankStr || "Praktykant",
          notes: notes,
          probationPeriod: probation,
          premium: premium === "1",
          penaltyPoints: penaltyPoints ? parseInt(penaltyPoints) : 0,
          premiumColor: premiumColor,
          socialMedia: socialMedia,
          ecoScore: ecoScore ? parseFloat(ecoScore) : 100.0,
          initialMileage: initialMileage ? parseInt(initialMileage) : 0,
          initialDeliveries: initialDeliveries ? parseInt(initialDeliveries) : 0,
          createdAt: createdAt
        }
      });

      // Pojazd (Ciągnik siodłowy)
      if (truckBrandModel && plate) {
        // Bardzo proste rozbicie nazwy ciężarówki np. "Scania S580"
        const parts = truckBrandModel.split(" ");
        const brand = parts[0] || "Unknown";
        const model = parts.slice(1).join(" ") || "Unknown";

        await prisma.truck.upsert({
          where: { plate: plate },
          update: {
            brand: brand,
            model: model,
            assignedDriverId: user.id
          },
          create: {
            fleetNumber: `TRK-${plate}`, // Generowany nr floty
            plate: plate,
            brand: brand,
            model: model,
            assignedDriverId: user.id
          }
        });
        console.log(` -> Przypisano pojazd: ${truckBrandModel} (${plate})`);
      }

      count++;
    } catch (err) {
      console.error(`Błąd przy dodawaniu kierowcy ${name}: ${err.message}`);
    }
  }

  console.log(`\nZakończono import. Zaimportowano/zaktualizowano kierowców: ${count}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
