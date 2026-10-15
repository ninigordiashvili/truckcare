import { Router } from 'express';
import { db } from '../db.js';

export const ai = Router();

// სიმპტომის ამოცნობა ბაზიდან. მოდელი აქ არაფერს იგონებს —
// თუ ბაზაში არ არის, პირდაპირ ვამბობთ, რომ არ ვიცით.
ai.post('/ai/triage', async (req, res) => {
  const text = String(req.body?.text || '').toLowerCase();
  if (!text.trim()) return res.status(400).json({ error: 'ტექსტი საჭიროა' });

  const symptoms = await db.symptom.findMany();
  let best = null;
  let bestScore = 0;

  for (const s of symptoms) {
    const score = s.keywords.split(',').filter((k) => text.includes(k.trim())).length;
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }

  if (!best) {
    return res.json({
      found: false,
      say: 'ასე ვერ მივხვდი. მითხარი, სად ისმის ხმა, რა დროს იწყება, ან პირდაპირ ხალხი გამოიძახე.',
    });
  }

  res.json({
    found: true,
    symptomId: best.id,
    question: best.question,
    answers: JSON.parse(best.answers).map((a) => ({ label: a.label })),
    source: best.source,
  });
});

// პასუხის არჩევის შემდეგ — ნაბიჯები და სავარაუდო ნაწილი.
ai.post('/ai/answer', async (req, res) => {
  const { symptomId, label } = req.body || {};
  const s = await db.symptom.findUnique({ where: { id: String(symptomId || '') } });
  if (!s) return res.status(404).json({ error: 'სიმპტომი არ მოიძებნა' });

  const answer = JSON.parse(s.answers).find((a) => a.label === label);
  if (!answer) return res.status(400).json({ error: 'ასეთი პასუხი არ არის' });

  let part = null;
  if (answer.partOem) {
    const p = await db.part.findFirst({ where: { oem: answer.partOem } });
    if (p) part = { id: p.id, name: p.name, oem: p.oem };
  }

  res.json({
    title: answer.title,
    steps: answer.steps,
    selfFix: answer.selfFix,
    part,
    confirmed: Boolean(answer.confirmed),
    disclaimer: answer.confirmed
      ? 'დადასტურებულია სერვის-წიგნით.'
      : 'ეს ვარაუდია აღწერის მიხედვით. წიგნით დადასტურებული არაა.',
  });
});
