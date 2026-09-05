const fs = require('fs');
const path = require('path');

const files = [
  'app/api/finance/leasing/pay/route.js',
  'app/api/finance/services/[id]/pay/route.js',
  'app/api/finance/insurance/[id]/pay/route.js',
  'app/api/finance/bases/[id]/pay/route.js',
  'app/api/user/bank/transfer/route.js'
];

files.forEach(file => {
  const fullPath = path.join('c:/Users/defin/Documents/BMS WEBSITE/bms-website-temp', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // We add companyId = session.user.companyId || "BMS" if not present
    // Then replace where: { id: "BMS" } with where: { id: companyId }
    // For app/api/user/bank/transfer/route.js it's the same but the companyTransaction needs companyId.

    if (!content.includes('const companyId')) {
      content = content.replace('const body = await req.json();', 'const body = await req.json();\n    const companyId = session.user.companyId || "BMS";');
      // Some endpoints might not have `const body = await req.json();` right there. Let's do a more robust replace:
      content = content.replace('if (!session || !session.user', 'const companyId = session.user.companyId || "BMS";\n    if (!session || !session.user');
    }

    content = content.replace(/where:\s*{\s*id:\s*"BMS"\s*}/g, 'where: { id: companyId }');
    content = content.replace(/prisma\.companyTransaction\.create\(\s*{\s*data:\s*{/g, 'prisma.companyTransaction.create({ data: { companyId: companyId,');

    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
  } else {
    console.log('File not found: ' + file);
  }
});
