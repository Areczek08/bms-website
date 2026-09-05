"use client";

function parsePlate(rawPlate) {
  if (!rawPlate) return { district: "BMS", number: "001" };
  const str = String(rawPlate).trim().toUpperCase();
  if (str.includes(" ")) {
    const parts = str.split(/\s+/);
    return { district: parts[0], number: parts.slice(1).join(" ") };
  }
  const match = str.match(/^([A-Z]{2,3})([A-Z0-9]+)$/);
  if (match) {
    return { district: match[1], number: match[2] };
  }
  if (str.length > 4) {
    return { district: str.substring(0, 3), number: str.substring(3) };
  }
  return { district: str, number: "" };
}

export default function LicensePlate({ plate, scale = 0.32, className = "" }) {
  const { district, number } = parsePlate(plate);
  const totalLength = (district || "").length + (number || "").length;
  
  // Dynamic font sizing based on plate character count to prevent overflow clipping
  const fontSize = totalLength > 7 ? "66px" : (totalLength > 6 ? "74px" : "82px");
  const stickerMargin = totalLength > 7 ? "0 6px" : "0 10px";
  
  // Container size with subpixel safety margin
  const width = Math.ceil(526 * scale);
  const height = Math.ceil(120 * scale);

  return (
    <div 
      className={`relative inline-block select-none overflow-visible ${className}`} 
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div 
        style={{
          width: '520px',
          height: '114px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: 'linear-gradient(180deg, #ffffff 0%, #f7f7f7 70%, #e0e0e0 100%)',
          border: '3px solid #1a1a1a',
          borderRadius: '6px',
          display: 'flex',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 0 0 2px #fff, inset 0 0 6px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Euroband */}
        <div 
          style={{
            width: '46px',
            height: '100%',
            background: 'linear-gradient(180deg, #003399 0%, #002266 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0,0,0,0.2)',
            flexShrink: 0
          }}
        >
          <svg style={{ width: '28px', height: '28px', marginTop: '2px' }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g fill="#FFCC00">
              <polygon points="50,5 52,11 58,11 53,15 55,21 50,17 45,21 47,15 42,11 48,11" />
              <polygon points="72.5,11 74.5,17 80.5,17 75.5,21 77.5,27 72.5,23 67.5,27 69.5,21 64.5,17 70.5,17" />
              <polygon points="89,27.5 91,33.5 97,33.5 92,37.5 94,43.5 89,39.5 84,43.5 86,37.5 81,33.5 87,33.5" />
              <polygon points="95,50 97,56 103,56 98,60 100,66 95,62 90,66 92,60 87,56 93,56" transform="translate(-5, -5)" />
              <polygon points="89,72.5 91,78.5 97,78.5 92,82.5 94,88.5 89,84.5 84,88.5 86,82.5 81,78.5 87,78.5" />
              <polygon points="72.5,89 74.5,95 80.5,95 75.5,99 77.5,105 72.5,101 67.5,105 69.5,99 64.5,95 70.5,95" transform="translate(0, -10)" />
              <polygon points="50,95 52,101 58,101 53,105 55,111 50,107 45,111 47,105 42,101 48,101" transform="translate(0, -10)" />
              <polygon points="27.5,89 29.5,95 35.5,95 30.5,99 32.5,105 27.5,101 22.5,105 24.5,99 19.5,95 25.5,95" transform="translate(0, -10)" />
              <polygon points="11,72.5 13,78.5 19,78.5 14,82.5 16,88.5 11,84.5 6,88.5 8,82.5 3,78.5 9,78.5" />
              <polygon points="5,50 7,56 13,56 8,60 10,66 5,62 0,66 2,60 -3,56 3,56" transform="translate(5, -5)" />
              <polygon points="11,27.5 13,33.5 19,33.5 14,37.5 16,43.5 11,39.5 6,43.5 8,37.5 3,33.5 9,33.5" />
              <polygon points="27.5,11 29.5,17 35.5,17 30.5,21 32.5,27 27.5,23 22.5,27 24.5,21 19.5,17 25.5,17" />
            </g>
          </svg>
          <div style={{ color: '#ffffff', fontSize: '19px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', letterSpacing: '1px', marginBottom: '2px' }}>
            PL
          </div>
        </div>

        {/* Text Area */}
        <div 
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 10px',
            fontFamily: "'Arklas', monospace",
            fontSize: fontSize,
            color: '#111',
            lineHeight: 1,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 1px rgba(255,255,255,0.6)',
            paddingTop: '4px',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ letterSpacing: '1px' }}>{district}</span>
          
          {/* Legalization Sticker */}
          <div 
            style={{
              width: '18px',
              height: '28px',
              background: 'linear-gradient(135deg, #d4d4d4 0%, #ffffff 30%, #a8a8a8 50%, #fcfcfc 70%, #999999 100%)',
              border: '1px solid #777',
              borderRadius: '3px',
              margin: stickerMargin,
              position: 'relative',
              boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              flexShrink: 0
            }}
          />

          <span style={{ letterSpacing: '1.5px' }}>{number}</span>
        </div>
      </div>
    </div>
  );
}
