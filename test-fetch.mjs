async function test() {
  const res = await fetch("http://localhost:3001/api/drivers/cmp78yatw0000v47k4rojgvm3", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aboutMe: "Hello!" })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.json());
}
test();
