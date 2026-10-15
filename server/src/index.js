import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { db, env } from './db.js';
import { login, requireUser } from './auth.js';
import { catalog } from './routes/catalog.js';
import { tickets } from './routes/tickets.js';
import { ai } from './routes/ai.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', async (_req, res) => {
  const [trucks, parts, open] = await Promise.all([
    db.truck.count(),
    db.part.count(),
    db.ticket.count({ where: { stage: { not: 'invoiced' } } }),
  ]);
  res.json({ ok: true, trucks, parts, openTickets: open });
});

app.post('/auth/login', login);

app.use(requireUser);

app.get('/me', (req, res) => res.json(req.user));
app.get('/techs', async (_req, res) => {
  const list = await db.user.findMany({ where: { role: 'tech', isActive: true }, orderBy: { name: 'asc' } });
  const load = await db.ticket.groupBy({
    by: ['techId'],
    where: { stage: { not: 'invoiced' } },
    _count: { _all: true },
  });
  res.json(
    list.map((t) => ({
      id: t.id,
      name: t.name,
      phone: t.phone,
      openJobs: load.find((l) => l.techId === t.id)?._count._all || 0,
    }))
  );
});

app.use(catalog);
app.use(tickets);
app.use(ai);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'სერვერზე შეცდომაა' });
});

app.listen(env.port, () => {
  console.log(`Truck Care API — http://localhost:${env.port}`);
});
