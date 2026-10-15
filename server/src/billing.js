import { env } from './db.js';

// ინვოისი თიქეთიდან იკრიბება: ნაწილი → მიტანა → გასვლა → სამუშაო → დღგ.
// ხელით არაფერი იწერება, რომ უფროსმა არ დაივიწყოს რამე.
export function buildInvoice(ticket) {
  const lines = [];

  for (const o of ticket.orders) {
    lines.push({
      title: o.nameSnapshot,
      detail: [o.oemSnapshot, o.supplier?.name].filter(Boolean).join(' · '),
      qty: o.qty,
      unitPrice: o.unitPrice,
      sum: round(o.qty * o.unitPrice),
    });
  }

  const delivery = ticket.orders.reduce((s, o) => s + (o.deliveryFee || 0), 0);
  if (delivery > 0) {
    lines.push({ title: 'ნაწილის მიტანა ადგილზე', detail: ticket.place || null, qty: 1, unitPrice: delivery, sum: round(delivery) });
  }

  const callout = ticket.calloutFee || 0;
  if (callout > 0) {
    lines.push({ title: 'ხელოსნის გასვლა', detail: ticket.tech?.name || null, qty: 1, unitPrice: callout, sum: round(callout) });
  }

  if (ticket.hours > 0) {
    lines.push({
      title: 'სამუშაო',
      detail: `${ticket.hours} სთ × ${env.laborRate} ₾`,
      qty: ticket.hours,
      unitPrice: env.laborRate,
      sum: round(ticket.hours * env.laborRate),
    });
  }

  const net = round(lines.reduce((s, l) => s + l.sum, 0));
  const vat = round((net * env.vatPct) / 100);
  return { lines, net, vat, gross: round(net + vat) };
}

function round(n) {
  return Math.round(n * 100) / 100;
}
