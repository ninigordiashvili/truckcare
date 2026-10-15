import { Router } from 'express';
import { db, env, STAGES, isStaff } from '../db.js';
import { buildInvoice } from '../billing.js';

export const tickets = Router();

const include = {
  client: true,
  truck: true,
  tech: true,
  orders: { include: { supplier: true } },
  events: { orderBy: { createdAt: 'asc' } },
  invoice: { include: { lines: true } },
};

function scopeFor(user, query) {
  const where = {};
  if (user.role === 'driver') where.clientId = user.clientId || '—';
  if (user.role === 'tech') where.techId = user.id;
  if (query.stage) where.stage = String(query.stage);
  if (query.open === '1') where.stage = { notIn: ['invoiced'] };
  if (query.unassigned === '1') where.techId = null;
  return where;
}

tickets.get('/tickets', async (req, res) => {
  const list = await db.ticket.findMany({
    where: scopeFor(req.user, req.query),
    include,
    orderBy: { number: 'desc' },
    take: 100,
  });
  res.json(list.map(shape));
});

tickets.get('/tickets/:id', async (req, res) => {
  const t = await db.ticket.findUnique({ where: { id: req.params.id }, include });
  if (!t) return res.status(404).json({ error: 'თიქეთი არ მოიძებნა' });
  if (!canSee(req.user, t)) return res.status(403).json({ error: 'უფლება არ გაქვს' });
  res.json(shape(t));
});

tickets.post('/tickets', async (req, res) => {
  const { truckId, issue, place, lat, lng } = req.body || {};
  const truck = await db.truck.findUnique({ where: { id: String(truckId || '') } });
  if (!truck) return res.status(400).json({ error: 'მანქანა არ მოიძებნა' });

  const last = await db.ticket.findFirst({ orderBy: { number: 'desc' } });
  const t = await db.ticket.create({
    data: {
      number: (last?.number || 1000) + 1,
      clientId: truck.clientId || req.user.clientId,
      truckId: truck.id,
      createdById: req.user.id,
      issue: String(issue || '').trim() || 'მძღოლმა ვერ აღწერა',
      place: place ? String(place) : null,
      lat: lat ?? null,
      lng: lng ?? null,
      stage: 'new',
      events: { create: { text: 'მძღოლმა გამოიძახა', kind: 'stage', userId: req.user.id } },
    },
    include,
  });
  res.status(201).json(shape(t));
});

tickets.post('/tickets/:id/assign', async (req, res) => {
  if (!isStaff(req.user)) return res.status(403).json({ error: 'მიბმა ოპერატორს შეუძლია' });
  const tech = await db.user.findUnique({ where: { id: String(req.body?.techId || '') } });
  if (!tech || tech.role !== 'tech') return res.status(400).json({ error: 'ასეთი ხელოსანი არ არის' });

  const t = await db.ticket.update({
    where: { id: req.params.id },
    data: {
      techId: tech.id,
      stage: 'assigned',
      calloutFee: env.calloutFee,
      events: { create: { text: `მიება ${tech.name}`, kind: 'stage', userId: req.user.id } },
    },
    include,
  });
  res.json(shape(t));
});

tickets.post('/tickets/:id/stage', async (req, res) => {
  const stage = String(req.body?.stage || '');
  if (!STAGES.includes(stage)) return res.status(400).json({ error: 'ასეთი ეტაპი არ არის' });

  const current = await db.ticket.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: 'თიქეთი არ მოიძებნა' });
  if (!isStaff(req.user) && current.techId !== req.user.id) {
    return res.status(403).json({ error: 'ეს თიქეთი შენზე არაა' });
  }

  const t = await db.ticket.update({
    where: { id: current.id },
    data: {
      stage,
      closedAt: stage === 'done' ? new Date() : current.closedAt,
      events: { create: { text: label(stage), kind: 'stage', userId: req.user.id } },
    },
    include,
  });
  res.json(shape(t));
});

tickets.patch('/tickets/:id', async (req, res) => {
  const current = await db.ticket.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: 'თიქეთი არ მოიძებნა' });
  if (!isStaff(req.user) && current.techId !== req.user.id) {
    return res.status(403).json({ error: 'ეს თიქეთი შენზე არაა' });
  }

  const data = {};
  if (req.body?.note !== undefined) data.note = String(req.body.note);
  if (req.body?.hours !== undefined) data.hours = Number(req.body.hours) || 0;

  const t = await db.ticket.update({
    where: { id: current.id },
    data: {
      ...data,
      events: data.note !== undefined ? { create: { text: 'ხელოსანმა ჩაწერა, რა გააკეთა', userId: req.user.id } } : undefined,
    },
    include,
  });
  res.json(shape(t));
});

// ნაწილის შეკვეთა თიქეთზე — ან ასაღებად, ან კურიერით ადგილზე
tickets.post('/tickets/:id/orders', async (req, res) => {
  const { partId, supplierId, qty = 1, delivery = 'pickup', deliveryFee } = req.body || {};
  const current = await db.ticket.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: 'თიქეთი არ მოიძებნა' });

  const part = await db.part.findUnique({ where: { id: String(partId || '') } });
  if (!part) return res.status(400).json({ error: 'ნაწილი არ მოიძებნა' });

  const offer = await db.offer.findFirst({
    where: { partId: part.id, supplierId: String(supplierId || '') },
    include: { supplier: true },
  });
  if (!offer) return res.status(400).json({ error: 'ამ მომწოდებელს ეს ნაწილი არ აქვს' });

  await db.partOrder.create({
    data: {
      ticketId: current.id,
      partId: part.id,
      supplierId: offer.supplierId,
      nameSnapshot: part.name,
      oemSnapshot: part.oem,
      qty: Number(qty) || 1,
      unitPrice: offer.price,
      delivery: delivery === 'courier' ? 'courier' : 'pickup',
      deliveryFee: delivery === 'courier' ? Number(deliveryFee ?? 45) : 0,
      status: delivery === 'courier' ? 'კურიერთან' : 'ასაღებად გადადებულია',
    },
  });

  const t = await db.ticket.update({
    where: { id: current.id },
    data: {
      stage: 'waiting_part',
      events: { create: { text: `შეუკვეთა ${part.name} — ${offer.supplier.name}`, kind: 'part', userId: req.user.id } },
    },
    include,
  });
  res.status(201).json(shape(t));
});

// ინვოისის გამოთვლა — ჯერ მხოლოდ ანგარიში, არაფერი ინახება
tickets.get('/tickets/:id/invoice/preview', async (req, res) => {
  const t = await db.ticket.findUnique({ where: { id: req.params.id }, include });
  if (!t) return res.status(404).json({ error: 'თიქეთი არ მოიძებნა' });
  res.json(buildInvoice(t));
});

// ინვოისის შექმნა და გაგზავნა — მხოლოდ ოპერატორს/უფროსს
tickets.post('/tickets/:id/invoice', async (req, res) => {
  if (!isStaff(req.user)) return res.status(403).json({ error: 'ინვოისს ოპერატორი აგზავნის' });

  const t = await db.ticket.findUnique({ where: { id: req.params.id }, include });
  if (!t) return res.status(404).json({ error: 'თიქეთი არ მოიძებნა' });
  if (t.stage !== 'done' && t.stage !== 'invoiced') {
    return res.status(400).json({ error: 'ჯერ სამუშაო უნდა დასრულდეს' });
  }
  if (t.invoice?.sentAt) return res.status(409).json({ error: 'ინვოისი უკვე გაგზავნილია' });

  const calc = buildInvoice(t);
  const year = new Date().getFullYear();
  const count = await db.invoice.count();
  const number = `${year}-${String(count + 1).padStart(4, '0')}`;

  const invoice = await db.invoice.upsert({
    where: { ticketId: t.id },
    create: {
      number,
      ticketId: t.id,
      clientId: t.clientId,
      net: calc.net,
      vat: calc.vat,
      gross: calc.gross,
      sentAt: new Date(),
      lines: { create: calc.lines },
    },
    update: { sentAt: new Date(), net: calc.net, vat: calc.vat, gross: calc.gross },
    include: { lines: true },
  });

  await db.ticket.update({
    where: { id: t.id },
    data: {
      stage: 'invoiced',
      events: { create: { text: `ინვოისი ${invoice.number} გაეგზავნა ${t.client.name}`, kind: 'invoice', userId: req.user.id } },
    },
  });

  res.json(invoice);
});

function canSee(user, t) {
  if (isStaff(user)) return true;
  if (user.role === 'tech') return t.techId === user.id;
  return t.clientId === user.clientId;
}

function label(stage) {
  return {
    new: 'ახალი',
    assigned: 'მიებული',
    enroute: 'გზაშია',
    onsite: 'ადგილზეა',
    waiting_part: 'ნაწილს ელოდება',
    done: 'დასრულდა',
    invoiced: 'ინვოისი გაგზავნილია',
  }[stage];
}

function shape(t) {
  return {
    id: t.id,
    number: t.number,
    stage: t.stage,
    issue: t.issue,
    place: t.place,
    note: t.note,
    hours: t.hours,
    createdAt: t.createdAt,
    client: t.client ? { id: t.client.id, name: t.client.name, taxId: t.client.taxId } : null,
    truck: t.truck ? { id: t.truck.id, plate: t.truck.plate, model: t.truck.model, make: t.truck.make, vin: t.truck.vin, year: t.truck.year } : null,
    tech: t.tech ? { id: t.tech.id, name: t.tech.name, phone: t.tech.phone } : null,
    orders: t.orders.map((o) => ({
      id: o.id,
      name: o.nameSnapshot,
      oem: o.oemSnapshot,
      supplier: o.supplier?.name || null,
      qty: o.qty,
      unitPrice: o.unitPrice,
      delivery: o.delivery,
      deliveryFee: o.deliveryFee,
      status: o.status,
    })),
    events: t.events.map((e) => ({ id: e.id, text: e.text, kind: e.kind, at: e.createdAt })),
    invoice: t.invoice
      ? { id: t.invoice.id, number: t.invoice.number, gross: t.invoice.gross, sentAt: t.invoice.sentAt }
      : null,
    totals: buildInvoice(t),
  };
}
