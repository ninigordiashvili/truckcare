// საწყისი მონაცემები: ავტოპარკი, მომწოდებლები, ნაწილები, სიმპტომები, ხალხი.
// წყარო — იგივე ფაილები, რასაც აპი იყენებდა.
import { PrismaClient } from '@prisma/client';
import { FLEET, SERVICES } from '../../src/data/fleet.js';
import { PARTS, SYMPTOMS, TECHS, CLIENTS } from '../../src/data/knowledge.js';

const db = new PrismaClient();

async function main() {
  await db.invoiceLine.deleteMany();
  await db.invoice.deleteMany();
  await db.partOrder.deleteMany();
  await db.ticketEvent.deleteMany();
  await db.ticket.deleteMany();
  await db.offer.deleteMany();
  await db.part.deleteMany();
  await db.supplier.deleteMany();
  await db.truck.deleteMany();
  await db.user.deleteMany();
  await db.client.deleteMany();
  await db.symptom.deleteMany();

  // კლიენტი კომპანიები
  const clients = [];
  for (const c of CLIENTS) {
    clients.push(await db.client.create({ data: { name: c.name, taxId: null } }));
  }

  // ჩვენი ხალხი
  const techs = [];
  for (let i = 0; i < TECHS.length; i++) {
    techs.push(
      await db.user.create({
        data: { phone: `+99559900010${i + 1}`, name: TECHS[i].name, role: 'tech' },
      })
    );
  }
  const operator = await db.user.create({
    data: { phone: '+995599000100', name: 'ლევანი (ოპერატორი)', role: 'operator' },
  });
  const boss = await db.user.create({
    data: { phone: '+995599000200', name: 'უფროსი', role: 'admin' },
  });

  // მძღოლები — თითო კლიენტზე
  const drivers = [];
  for (let i = 0; i < clients.length; i++) {
    drivers.push(
      await db.user.create({
        data: {
          phone: `+99559900030${i + 1}`,
          name: `მძღოლი ${i + 1}`,
          role: 'driver',
          clientId: clients[i].id,
        },
      })
    );
  }

  // ავტოპარკი — კლიენტებზე თანაბრად გადანაწილებული.
  // ფაილში MV049MM ორჯერ წერია იმავე VIN-ით — ნომრით ვაუნიკალურებთ.
  const unique = [...new Map(FLEET.map((t) => [t.plate, t])).values()];
  const trucks = [];
  for (let i = 0; i < unique.length; i++) {
    const t = unique[i];
    trucks.push(
      await db.truck.create({
        data: {
          plate: t.plate,
          vin: t.vin,
          make: t.make,
          model: t.model,
          year: t.year,
          clientId: clients[i % clients.length].id,
        },
      })
    );
  }

  // მომწოდებლები — ფაილის ავტოსერვისები + ნაწილებში ნახსენები
  const supplierNames = new Set([
    ...SERVICES.map((s) => s.name.replace(/\s+/g, ' ').trim()),
    ...PARTS.flatMap((p) => p.offers.map((o) => o.supplier)),
  ]);
  const suppliers = {};
  for (const name of supplierNames) {
    const fromFile = SERVICES.find((s) => s.name.replace(/\s+/g, ' ').trim() === name);
    const offer = PARTS.flatMap((p) => p.offers).find((o) => o.supplier === name);
    suppliers[name] = await db.supplier.create({
      data: {
        name,
        city: offer ? offer.place : 'თბილისი',
        country: offer && /სტამბოლი/.test(offer.place) ? 'TR' : offer && /ჰამბურგი/.test(offer.place) ? 'DE' : 'GE',
        phone: fromFile ? fromFile.phone : null,
      },
    });
  }

  // ნაწილები და შეთავაზებები
  const parts = {};
  for (const p of PARTS) {
    const part = await db.part.create({
      data: {
        name: p.name,
        oem: p.oem,
        category: p.category,
        jargon: p.jargon.join(','),
        fits: p.fits.join(','),
      },
    });
    parts[p.id] = part;
    for (const o of p.offers) {
      await db.offer.create({
        data: {
          partId: part.id,
          supplierId: suppliers[o.supplier].id,
          kind: o.kind,
          price: o.price,
          stock: o.stock,
          lead: o.lead,
          verifiedAt: o.verified ? new Date() : null,
        },
      });
    }
  }

  // სიმპტომები — AI-ის ბაზა
  for (const s of SYMPTOMS) {
    await db.symptom.create({
      data: {
        keywords: s.keywords.join(','),
        question: s.question,
        answers: JSON.stringify(
          s.answers.map((a) => ({
            label: a.label,
            title: a.title,
            steps: a.steps,
            selfFix: a.selfFix,
            partOem: a.partId ? PARTS.find((p) => p.id === a.partId).oem : null,
            confirmed: a.confirmed,
          }))
        ),
        confirmed: false,
      },
    });
  }

  // ორი სადემონსტრაციო თიქეთი, რომ დაფა ცარიელი არ იყოს
  const truckByPlate = (plate) => trucks.find((t) => t.plate === plate);

  const t1 = await db.ticket.create({
    data: {
      number: 1039,
      clientId: clients[1].id,
      truckId: truckByPlate('CC438DD').id,
      techId: techs[2].id,
      createdById: drivers[1].id,
      issue: 'მუხრუჭი არ იჭერს',
      place: 'სენაკი, 34-ე კმ',
      stage: 'done',
      hours: 2,
      calloutFee: 150,
      note: 'წინა ხიდზე ხუნდები ბოლომდე იყო გაცვეთილი. შევცვალე ორივე მხარეს, ჰაერი შევამოწმე.',
    },
  });
  for (const e of [
    'მძღოლმა დაწერა: მუხრუჭი არ იჭერს',
    'AI-მ ურჩია შემოწმება — არ გამოვიდა',
    'ოპერატორმა მიიღო, მიება ზურა მ.',
    'ადგილზეა, შეუკვეთა ხუნდები',
    'კურიერმა მოიტანა ადგილზე',
    'გაასწორა, დაასრულა',
  ]) {
    await db.ticketEvent.create({ data: { ticketId: t1.id, text: e, kind: 'stage' } });
  }
  await db.partOrder.create({
    data: {
      ticketId: t1.id,
      partId: parts.p1.id,
      supplierId: suppliers['თეგეტა მოტორსი'].id,
      nameSnapshot: PARTS[0].name,
      oemSnapshot: PARTS[0].oem,
      qty: 2,
      unitPrice: 480,
      delivery: 'courier',
      deliveryFee: 45,
      status: 'მიტანილია',
    },
  });

  const t2 = await db.ticket.create({
    data: {
      number: 1038,
      clientId: clients[1].id,
      truckId: truckByPlate('WW273UW').id,
      createdById: drivers[1].id,
      issue: 'შუქები ჩაქრა',
      place: 'ზუგდიდი, შესასვლელი',
      stage: 'new',
    },
  });
  await db.ticketEvent.create({ data: { ticketId: t2.id, text: 'მძღოლმა გამოიძახა', kind: 'stage' } });

  console.log('მზადაა:');
  console.log(' კლიენტი', clients.length, '· სატვირთო', trucks.length, '· მომწოდებელი', Object.keys(suppliers).length);
  console.log(' ნაწილი', Object.keys(parts).length, '· სიმპტომი', SYMPTOMS.length, '· მომხმარებელი', techs.length + drivers.length + 2);
  console.log(' შესასვლელი ნომრები: ხელოსანი', techs[0].phone, '· ოპერატორი', operator.phone, '· უფროსი', boss.phone, '· მძღოლი', drivers[0].phone);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
