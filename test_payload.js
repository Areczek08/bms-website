const textToParse = "Dostawa #65978310 [Rzeczywiste] - 474 km Z :grey_question: Caracal Do :grey_question: Tiraspol Detale Towar: Olej silnikowy [kontener] Zaakceptowany dystans 474 km Zysk 81 735 zł Ciągnik Scania S Statystyki Rzeczywiste Pozycja w firmie 2. :arrow_up:";

let driverName = "Jakub_130";

    // 2. Dystans (np. 123 km, 1,234 km) - w polskim formacie np. "[Rzeczywiste] - 474 km" lub "Zaakceptowany dystans 474 km"
    let distance = 0;
    const distanceMatch = textToParse.match(/Zaakceptowany dystans\s*(\d+(?:[,\s]\d+)*)\s*km/i) || 
                          textToParse.match(/Distance:\s*\*\*?(\d+(?:[,\s]\d+)*)\b/i) ||
                          textToParse.match(/-\s*(\d+(?:[,\s]\d+)*)\s*km/i);
    if (distanceMatch) {
      distance = parseInt(distanceMatch[1].replace(/[,\s]/g, ''), 10);
    }

    // 3. Miasta i ładunek (polski / angielski)
    let startCity = "Nieznane";
    let endCity = "Nieznane";
    let cargo = "Nieznany ładunek";

    const cargoMatch = textToParse.match(/Towar:?\s*([^\n]+?)(?=\s+Zaakceptowany|\[|$)/i) || textToParse.match(/delivered\s+\*\*([^*]+)\*\*/i) || textToParse.match(/Towar\s+([^\n]+?)(?:\s+Zaakceptowany|\s+Zysk|$)/i);
    if (cargoMatch) cargo = cargoMatch[1].trim();

    const fromMatch = textToParse.match(/Z\s*(?::[a-z_]+:\s*)?([A-Za-z0-9_\u0100-\uFFFF -]+?)(?=\s*Do|from)/i) || textToParse.match(/from\s+\*\*([^*]+)\*\*/i);
    if (fromMatch) startCity = fromMatch[1].trim();

    const toMatch = textToParse.match(/Do\s*(?::[a-z_]+:\s*)?([A-Za-z0-9_\u0100-\uFFFF -]+?)(?=\s*Detale|Towar|to)/i) || textToParse.match(/to\s+\*\*([^*]+)\*\*/i);
    if (toMatch) endCity = toMatch[1].trim();

console.log("Name:", driverName);
console.log("Distance:", distance);
console.log("Start:", startCity);
console.log("End:", endCity);
console.log("Cargo:", cargo);
