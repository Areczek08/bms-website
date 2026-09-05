import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Brak pliku." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sprawdzamy czy mamy klucz ImgBB
    const imgbbKey = process.env.IMGBB_API_KEY;

    if (imgbbKey) {
      try {
        // Konwersja na base64 dla API ImgBB
        const base64Image = buffer.toString("base64");
        
        const imgbbFormData = new FormData();
        imgbbFormData.append("image", base64Image);
        
        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: imgbbFormData,
        });
        
        const imgbbData = await imgbbResponse.json();
        
        if (imgbbData.success) {
          // Zwraca bezpośredni link do obrazka hostowanego na imgbb
          return NextResponse.json({ success: true, url: imgbbData.data.url });
        }
      } catch (imgbbError) {
        console.warn("Błąd uploadu do ImgBB, użycie fallbacku:", imgbbError);
        // Przechodzimy do fallbacku lokalnego
      }
    }

    // LOKALNY FALLBACK (gdy brak klucza lub błąd ImgBB)
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.name);
    const filename = `${uniqueSuffix}${ext}`;
    
    // Zapis pliku w katalogu public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Błąd podczas wgrywania pliku:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas zapisywania pliku." }, { status: 500 });
  }
}
