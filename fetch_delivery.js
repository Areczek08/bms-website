async function main() {
  const url = "https://trucksbook.eu/delivery/66810730";
  console.log("Fetching:", url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Length:", text.length);
    console.log("Snippet:\n", text.substring(0, 1000));
    
    // Check if it asks for login or shows page not found, or contains the delivery details
    if (text.includes("login") || text.includes("Prihlásenie") || text.includes("Sign in")) {
      console.log("Page requires login!");
    } else {
      console.log("Page is public!");
      // Let's check if it has 'Maribor' or 'Soltau' or 'SeNNtiu'
      console.log("Contains Maribor:", text.includes("Maribor"));
      console.log("Contains Soltau:", text.includes("Soltau"));
      console.log("Contains SeNNtiu:", text.includes("SeNNtiu"));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
