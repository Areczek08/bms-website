import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'lib', 'baseDetails.json');

const defaultAmenities = {
  fuelStation: true,
  adBlue: true,
  carWash: true,
  workshop: true,
  parking: true,
  driverRestArea: true,
  security: true
};

export function getBaseDetailsMap() {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) || {};
  } catch (err) {
    console.error("Error reading baseDetails.json:", err);
    return {};
  }
}

export function getBaseDetails(baseId) {
  const map = getBaseDetailsMap();
  const existing = map[baseId] || {};
  return {
    description: existing.description || "Główny oddział logistyczny ze stacją paliw, warsztatem oraz zapleczem dla kierowców.",
    imageUrl: existing.imageUrl || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    amenities: {
      ...defaultAmenities,
      ...(existing.amenities || {})
    }
  };
}

export function saveBaseDetails(baseId, details) {
  try {
    const map = getBaseDetailsMap();
    map[baseId] = {
      ...map[baseId],
      ...details
    };
    fs.writeFileSync(filePath, JSON.stringify(map, null, 2), 'utf8');
    return map[baseId];
  } catch (err) {
    console.error("Error saving baseDetails.json:", err);
    return null;
  }
}
