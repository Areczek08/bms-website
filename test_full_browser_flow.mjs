async function testFlow() {
  try {
    // 1. Get CSRF Token
    const csrfRes = await fetch("https://system.vsbojarlogistic.pl/api/auth/csrf");
    const setCookieHeaders = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get("set-cookie")];
    const csrfData = await csrfRes.json();
    console.log("CSRF Data:", csrfData);
    console.log("Set-Cookie from /api/auth/csrf:", setCookieHeaders);

    // Extract cookie strings
    const cookieHeader = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
    console.log("Cookie header to send:", cookieHeader);

    // 2. Post credentials
    const formData = new URLSearchParams();
    formData.append("csrfToken", csrfData.csrfToken);
    formData.append("email", "eryost82@gmail.com");
    formData.append("password", "Bojar2026!");
    formData.append("callbackUrl", "https://system.vsbojarlogistic.pl/dashboard");
    formData.append("json", "true");

    const loginRes = await fetch("https://system.vsbojarlogistic.pl/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookieHeader
      },
      body: formData,
      redirect: "manual"
    });

    console.log("Login Res Status:", loginRes.status);
    console.log("Login Res Headers:", Object.fromEntries(loginRes.headers.entries()));
    const loginCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie")];
    console.log("Login Res Set-Cookies:", loginCookies);
    const bodyText = await loginRes.text();
    console.log("Login Res Body:", bodyText);

  } catch (err) {
    console.error("Test error:", err);
  }
}

testFlow();
