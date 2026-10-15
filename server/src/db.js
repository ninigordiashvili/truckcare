import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  laborRate: Number(process.env.LABOR_RATE || 60),
  calloutFee: Number(process.env.CALLOUT_FEE || 150),
  vatPct: Number(process.env.VAT_PCT || 18),
};

export const STAGES = ['new', 'assigned', 'enroute', 'onsite', 'waiting_part', 'done', 'invoiced'];

export function isStaff(user) {
  return user.role === 'operator' || user.role === 'admin';
}
