import React, { createContext, useContext, useMemo, useState } from 'react';
import { FLEET } from './data/fleet';
import { TECHS, CLIENTS, partById } from './data/knowledge';

const AppCtx = createContext(null);

export const STAGES = {
  new: 'ახალი',
  assigned: 'მიებული',
  enroute: 'გზაშია',
  onsite: 'ადგილზეა',
  waiting_part: 'ნაწილს ელოდება',
  done: 'დასრულდა',
  invoiced: 'ინვოისი გაგზავნილია',
};

export const STAGE_ORDER = ['new', 'assigned', 'enroute', 'onsite', 'waiting_part', 'done', 'invoiced'];

const LABOR_RATE = 60;
const CALLOUT = 150;
const VAT = 0.18;

let seq = 1043;
const nextId = () => String(seq++);

function truckLabel(plate) {
  const t = FLEET.find((x) => x.plate === plate);
  return t ? `${t.model} · ${t.plate}` : plate;
}

function ev(text, at) {
  return { at: at || now(), text };
}

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const SEED = [
  {
    id: '1039',
    clientId: 'c2',
    plate: 'CC438DD',
    issue: 'მუხრუჭი არ იჭერს',
    stage: 'done',
    techId: 't3',
    place: 'სენაკი, 34-ე კმ',
    note: 'წინა ხიდზე ხუნდები ბოლომდე იყო გაცვეთილი, დისკი კიდევ გამოდგება. შევცვალე ორივე მხარეს, ჰაერი შევამოწმე — გაჟონვა აღარაა.',
    parts: [{ partId: 'p1', name: 'სამუხრუჭე ხუნდები, წინა ხიდი', oem: 'A0034209920', supplier: 'თეგეტა მოტორსი', qty: 2, price: 480, delivery: 'courier', deliveryFee: 45, status: 'მიტანილია' }],
    hours: 2,
    events: [
      ev('მძღოლმა დაწერა: მუხრუჭი არ იჭერს', '09:12'),
      ev('AI-მ ურჩია შემოწმება — არ გამოვიდა', '09:18'),
      ev('ოპერატორმა მიიღო, მიება ზურა მ.', '09:25'),
      ev('ზურა გამოვიდა', '09:40'),
      ev('ადგილზეა, შეუკვეთა ხუნდები — თეგეტა', '10:30'),
      ev('კურიერმა მოიტანა ადგილზე', '12:05'),
      ev('გაასწორა, დაასრულა', '13:20'),
    ],
    invoiceSent: false,
  },
  {
    id: '1038',
    clientId: 'c2',
    plate: 'WW273UW',
    issue: 'შუქები ჩაქრა',
    stage: 'new',
    techId: null,
    place: 'ზუგდიდი, შესასვლელი',
    note: '',
    parts: [],
    hours: 0,
    events: [ev('მძღოლმა გამოიძახა', '08:05')],
    invoiceSent: false,
  },
  {
    id: '1035',
    clientId: 'c1',
    plate: 'DD991JJ',
    issue: 'წყალი ჩადის',
    stage: 'waiting_part',
    techId: 't1',
    place: 'ხაშური, ავტობანი',
    note: 'რადიატორი გაჟონავს ქვედა კუთხეში. შეკვეთილია.',
    parts: [{ partId: 'p3', name: 'რადიატორი, გამაგრილებელი', oem: 'A9605000003', supplier: 'ვაკო მოტორსი', qty: 1, price: 1450, delivery: 'courier', deliveryFee: 60, status: 'შეკვეთილია' }],
    hours: 1,
    events: [ev('მძღოლმა გამოიძახა', 'გუშინ 16:40'), ev('გიორგი ადგილზე იყო', 'გუშინ 18:10'), ev('შეუკვეთა რადიატორი', 'გუშინ 18:35')],
    invoiceSent: false,
  },
  {
    id: '1030',
    clientId: 'c3',
    plate: 'SV582VS',
    issue: 'ხუნდები გაცვდა',
    stage: 'invoiced',
    techId: 't2',
    place: 'თბილისი, ბაზა',
    note: 'ორივე ხიდზე შეიცვალა.',
    parts: [{ partId: 'p1', name: 'სამუხრუჭე ხუნდები, წინა ხიდი', oem: 'A0034209920', supplier: 'თეგეტა მოტორსი', qty: 4, price: 480, delivery: 'pickup', deliveryFee: 0, status: 'დაყენდა' }],
    hours: 3,
    events: [ev('შეკვეთა ბაზიდან', '11 ოქტ.'), ev('დაასრულა დათო კ.', '11 ოქტ.'), ev('ინვოისი გაიგზავნა', '12 ოქტ.')],
    invoiceSent: true,
  },
];

export function AppProvider({ children }) {
  const [role, setRole] = useState('driver');
  const [tickets, setTickets] = useState(SEED);
  const [plate, setPlate] = useState('FT162TF');
  const [meTech] = useState('t1');

  const value = useMemo(() => {
    const update = (id, fn) => setTickets((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));

    return {
      role,
      setRole,
      tickets,
      plate,
      setPlate,
      meTech,
      truckLabel,
      client: (id) => CLIENTS.find((c) => c.id === id) || CLIENTS[0],
      tech: (id) => TECHS.find((t) => t.id === id) || null,
      ticket: (id) => tickets.find((t) => t.id === id) || null,
      myJobs: () => tickets.filter((t) => t.techId === meTech && t.stage !== 'invoiced'),

      createTicket: ({ issue, place, clientId }) => {
        const id = nextId();
        const t = {
          id,
          clientId: clientId || 'c1',
          plate,
          issue,
          stage: 'new',
          techId: null,
          place: place || 'ლოკაცია გაზიარებულია',
          note: '',
          parts: [],
          hours: 0,
          events: [ev('მძღოლმა გამოიძახა')],
          invoiceSent: false,
        };
        setTickets((ts) => [t, ...ts]);
        return id;
      },

      assign: (id, techId) =>
        update(id, (t) => ({
          ...t,
          techId,
          stage: t.stage === 'new' ? 'assigned' : t.stage,
          events: [...t.events, ev(`მიება ${TECHS.find((x) => x.id === techId).name}`)],
        })),

      setStage: (id, stage) =>
        update(id, (t) => ({
          ...t,
          stage,
          events: [...t.events, ev(STAGES[stage])],
        })),

      addNote: (id, note) =>
        update(id, (t) => ({ ...t, note, events: [...t.events, ev('ხელოსანმა ჩაწერა, რა გააკეთა')] })),

      setHours: (id, hours) => update(id, (t) => ({ ...t, hours })),

      addPart: (id, { partId, supplier, price, qty, delivery }) =>
        update(id, (t) => {
          const p = partById(partId);
          return {
            ...t,
            stage: 'waiting_part',
            parts: [
              ...t.parts,
              {
                partId,
                name: p.name,
                oem: p.oem,
                supplier,
                qty,
                price,
                delivery,
                deliveryFee: delivery === 'courier' ? 45 : 0,
                status: delivery === 'courier' ? 'კურიერთან' : 'ასაღებად გადადებულია',
              },
            ],
            events: [...t.events, ev(`შეუკვეთა ${p.name} — ${supplier}`)],
          };
        }),

      sendInvoice: (id) =>
        update(id, (t) => ({ ...t, stage: 'invoiced', invoiceSent: true, events: [...t.events, ev('ინვოისი გაეგზავნა კომპანიას')] })),

      totals: (t) => {
        const partsSum = t.parts.reduce((s, p) => s + p.price * p.qty, 0);
        const delivery = t.parts.reduce((s, p) => s + (p.deliveryFee || 0), 0);
        const callout = t.stage === 'new' ? 0 : CALLOUT;
        const labor = (t.hours || 0) * LABOR_RATE;
        const net = partsSum + delivery + callout + labor;
        const vat = net * VAT;
        return { partsSum, delivery, callout, labor, net, vat, gross: net + vat, rate: LABOR_RATE, calloutFee: CALLOUT };
      },
    };
  }, [role, tickets, plate, meTech]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error('AppProvider აკლია');
  return v;
}
