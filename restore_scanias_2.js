const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const deletedTrucks = [
  'cmp7em4vr0001v4x4h86jmzd0 - W1 DUSK',
  'cmp7em5lc0002v4x4dtshw8mx - W6 BOJAR',
  'cmp7em7u20006v4x4ktfqj48j - W2 GIGA',
  'cmp7em9hs0009v4x4d22uqizd - W9 BOJAR',
  'cmp7emagt000av4x40q32pr86 - W1 HEAVY',
  'cmp7emwvb002uv4x4ui7ggxen - S7 BOJAR',
  'cmpwt2ttg0002k304yhmcg430 - GDA 911HS',
  'cmpwt7bk20003k304xnftk55p - GDA 913HS',
  'cmpwtdhiv0001jx04scxw7tqh - GDA 918HS',
  'cmpwtfhxv0002jx04x0qfo8nt - GDA 919HS',
  'cmpwti2ch0005jx04qawo9pum - GDA 920HS',
  'cmpwtl1y90006jx04z4vvy3qx - W1 NASI',
  'cmpwtsc320000l2040k0a8hc4 - GA 9410B',
  'cmpwtyzxy0007jx04s09soax9 - GA 9411B',
  'cmpwub61y0001l204yfgim2tl - GA 9412B',
  'cmpwuha5i0002l2049fqvrz94 - W1 GIGA',
  'cmpwusuj50009jx04t3537gz9 - GA 9414B',
  'cmpwuuohq000ajx04cexlhygf - WGM 534BV',
  'cmpwv4t76000bjx0467mv4go4 - WGM 535BV',
  'cmpwv7i6g0000l204w27y7eh4 - WGM 536BV',
  'cmpwv99ha0001l2044le03zz6 - WGM 4584B',
  'cmpwvawkd0003l204gb2qr5jk - WGM 4585B',
  'cmpwvdh1m0004l204hliucust - WGM 4586B',
  'cmpwvh9xt0005l204mlf8crds - WGM 4587B',
  'cmpwvqukw0006l2041lmpinpw - WGM 4578B',
  'cmpwvsshu0000ju04iva61525 - WGM 345HB',
  'cmpwvuhr50001ju04c99057md - WGM 346HB',
  'cmpwvxfr00002ju04z1rked2q - WGM 347HB',
  'cmpwvywxd0007l204sx8hrwiw - WGM 348HB',
  'cmpww09ap0003ju04bouy520g - WGM 349HB',
  'cmpww1yfw0008l204pld598w9 - WGM 350HB',
  'cmpwwcvay0006ju04ju61m0qb - WML 2536C'
];

async function main() {
  for (const line of deletedTrucks) {
    const [id, ...rest] = line.split(' - ');
    const plate = rest.join(' - ').trim();

    let model = 'S450 Rekrutowa';
    if (plate.startsWith('W')) model = 'S650 V8 High Line';
    if (plate.startsWith('S7')) model = 'Scania S770 V8 High Line';

    try {
      await prisma.truck.create({
        data: {
          id: id.trim(),
          brand: 'Scania',
          model: model,
          plate: plate,
          status: 'AVAILABLE',
          fleetNumber: '' // Provide required field
        }
      });
      console.log('Restored:', id, plate);
    } catch (e) {
      console.log('Failed to restore:', id, plate, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
