// script to test via HTTP
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/fleet',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log("Got fleet, count:", parsed.trucks?.length);
      
      if (parsed.trucks && parsed.trucks.length > 0) {
        const testId = parsed.trucks[0].id;
        console.log("Will try to edit truck:", testId);
        
        const putReq = http.request({
          hostname: 'localhost',
          port: 3000,
          path: `/api/fleet/${testId}/edit`,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        }, putRes => {
          let putData = '';
          putRes.on('data', chunk => { putData += chunk; });
          putRes.on('end', () => {
            console.log("PUT status:", putRes.statusCode);
            console.log("PUT response:", putData);
          });
        });
        
        putReq.write(JSON.stringify({
          category: "Ciągnik",
          brand: "Test",
          model: "Test",
          plate: "TEST"
        }));
        putReq.end();
      }
    } catch(e) {
      console.log("Could not parse:", data);
    }
  });
});

req.on('error', e => {
  console.error("Error:", e);
});

req.end();
