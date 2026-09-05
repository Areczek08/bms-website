// First get CSRF token, then attempt login
async function test() {
  // Step 1: Get CSRF token
  const csrfRes = await fetch("http://localhost:3000/api/auth/csrf");
  const csrfData = await csrfRes.json();
  console.log("CSRF Token:", csrfData.csrfToken);
  const cookies = csrfRes.headers.getSetCookie?.() || [];
  console.log("Cookies:", cookies);
  const cookieHeader = cookies.map(c => c.split(";")[0]).join("; ");

  // Step 2: Attempt login
  const body = new URLSearchParams({
    email: "eryost82@gmail.com",
    password: "ErasBojar2026!",
    redirect: "false",
    callbackUrl: "http://localhost:3000/dashboard",
    csrfToken: csrfData.csrfToken,
    json: "true"
  });

  const loginRes = await fetch("http://localhost:3000/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieHeader
    },
    body: body.toString(),
    redirect: "manual"
  });

  console.log("\nLogin response status:", loginRes.status);
  console.log("Login response headers location:", loginRes.headers.get("location"));
  const loginCookies = loginRes.headers.getSetCookie?.() || [];
  console.log("Login cookies:", loginCookies.map(c => c.split(";")[0]));
  
  const text = await loginRes.text();
  console.log("Body:", text.substring(0, 300));
}

test().catch(console.error);
