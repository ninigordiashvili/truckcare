import { Router } from 'express';
import { db, isStaff } from '../db.js';

export const catalog = Router();

// სატვირთოები. მძღოლი მხოლოდ თავისი კომპანიის მანქანებს ხედავს.
catalog.get('/trucks', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const where = {};
  if (!isStaff(req.user) && req.user.clientId) where.clientId = req.user.clientId;
  if (q) {
    where.OR = [
      { plate: { contains: q } },
      { vin: { contains: q } },
      { model: { contains: q } },
      { make: { contains: q } },
    ];
  }
  const trucks = await db.truck.findMany({ where, take: 60, orderBy: { plate: 'asc' } });
  res.json(trucks);
});

// ნაწილის ძებნა — ჟარგონითაც. „შკორნი“ → სამუხრუჭე ხუნდები.
catalog.get('/parts', async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const parts = await db.part.findMany({
    include: { offers: { include: { supplier: true }, orderBy: { price: 'asc' } } },
  });

  const list = q
    ? parts.filter((p) => {
        const hay = [p.name, p.oem, p.category, p.jargon].join(' ').toLowerCase();
        return q.split(/\s+/).some((w) => hay.includes(w));
      })
    : parts;

  res.json(list.map(shapePart));
});

catalog.get('/parts/:id', async (req, res) => {
  const part = await db.part.findUnique({
    where: { id: req.params.id },
    include: { offers: { include: { supplier: true }, orderBy: { price: 'asc' } } },
  });
  if (!part) return res.status(404).json({ error: 'ნაწილი არ მოიძებნა' });
  res.json(shapePart(part));
});

function shapePart(p) {
  return {
    id: p.id,
    name: p.name,
    oem: p.oem,
    category: p.category,
    jargon: p.jargon ? p.jargon.split(',') : [],
    fits: p.fits ? p.fits.split(',') : [],
    offers: p.offers.map((o) => ({
      id: o.id,
      supplierId: o.supplierId,
      supplier: o.supplier.name,
      place: o.supplier.city,
      kind: o.kind,
      price: o.price,
      currency: o.currency,
      stock: o.stock,
      lead: o.lead,
      // ფასი დღეს თუ არ გადამოწმებულა, აპი ამას პირდაპირ წერს
      verified: o.verifiedAt ? sameDay(o.verifiedAt, new Date()) : false,
      verifiedAt: o.verifiedAt,
    })),
  };
}

function sameDay(a, b) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}
