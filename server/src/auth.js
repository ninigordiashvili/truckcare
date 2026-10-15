import jwt from 'jsonwebtoken';
import { db, env } from './db.js';

// დეველოპმენტის ავტორიზაცია: მხოლოდ ნომერი.
// პროდაქშენში აქ SMS-კოდი უნდა იდგეს — იგივე endpoint, ერთი ნაბიჯით მეტი.
export async function login(req, res) {
  const phone = String(req.body?.phone || '').trim();
  if (!phone) return res.status(400).json({ error: 'ნომერი საჭიროა' });

  const user = await db.user.findUnique({ where: { phone }, include: { client: true } });
  if (!user || !user.isActive) return res.status(401).json({ error: 'ასეთი მომხმარებელი არ არის' });

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: '30d' });
  res.json({ token, user });
}

export async function requireUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'ტოკენი აკლია' });

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await db.user.findUnique({ where: { id: payload.sub }, include: { client: true } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'მომხმარებელი არ მოიძებნა' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'ტოკენი არ ვარგა' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'უფლება არ გაქვს' });
    next();
  };
}
