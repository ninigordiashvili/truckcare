// ტექნიკური ბაზა — ხელით აწყობილი, ხელოსნების ენაზე.
// ეს ფაილი არის იმის ნიმუში, რაც მომავალში ბაზაში უნდა იწეროს:
// ჟარგონი → ოფიციალური სახელი → OEM ნომერი → წყარო.

export const TECHS = [
  { id: 't1', name: 'გიორგი ბ.', phone: '[ნომერი]' },
  { id: 't2', name: 'დათო კ.', phone: '[ნომერი]' },
  { id: 't3', name: 'ზურა მ.', phone: '[ნომერი]' },
  { id: 't4', name: 'ვაჟა ს.', phone: '[ნომერი]' },
];

export const CLIENTS = [
  { id: 'c1', name: 'შპს „ტრანსლაინი“', taxId: '[საიდენტიფიკაციო]' },
  { id: 'c2', name: 'შპს „ჯეო-ტრანსი“', taxId: '[საიდენტიფიკაციო]' },
  { id: 'c3', name: 'შპს „ლოჯიქსი“', taxId: '[საიდენტიფიკაციო]' },
];

// ნაწილები. `jargon` — როგორც მძღოლი ეძახის.
// `offers.verified: false` ნიშნავს, რომ ფასი ძველი წერილიდანაა და დღეს არ გადამოწმებულა.
export const PARTS = [
  {
    id: 'p1',
    name: 'სამუხრუჭე ხუნდები, წინა ხიდი',
    jargon: ['შკორნი', 'ხუნდი', 'ხუნდები', 'კოლოდკა', 'მუხრუჭის ხუნდი'],
    oem: 'A0034209920',
    category: 'სამუხრუჭე',
    fits: ['ACTROS', 'ANTOS', 'ATEGO'],
    offers: [
      { supplier: 'თეგეტა მოტორსი', place: 'თბილისი', kind: 'ორიგინალი', price: 480, lead: 'დღესვე', stock: 'მარაგშია', verified: true },
      { supplier: 'Kadir Otomotiv', place: 'სტამბოლი', kind: 'ანალოგი, Sampa', price: 310, lead: '4–6 დღე', stock: 'შეკვეთით', verified: false },
      { supplier: 'Nordwest NFZ', place: 'ჰამბურგი', kind: 'ორიგინალი', price: 560, lead: '10–14 დღე', stock: 'შეკვეთით', verified: false },
    ],
  },
  {
    id: 'p2',
    name: 'საწვავის ფილტრი',
    jargon: ['ფილტრი', 'სალიარკის ფილტრი', 'საწვავის ფილტრი'],
    oem: 'A4570920105',
    category: 'ძრავა',
    fits: ['ACTROS', 'ATEGO', 'AXOR', 'ANTOS'],
    offers: [
      { supplier: 'კა-მოტორსი', place: 'თბილისი', kind: 'ორიგინალი', price: 95, lead: 'დღესვე', stock: 'მარაგშია', verified: true },
      { supplier: 'ამბოლი', place: 'ქუთაისი', kind: 'ანალოგი, Mann', price: 58, lead: '1–2 დღე', stock: 'მარაგშია', verified: false },
    ],
  },
  {
    id: 'p3',
    name: 'რადიატორი, გამაგრილებელი',
    jargon: ['რადიატორი', 'წყლის რადიატორი', 'ბალონი'],
    oem: 'A9605000003',
    category: 'გაგრილება',
    fits: ['ACTROS', 'ANTOS'],
    offers: [
      { supplier: 'ვაკო მოტორსი', place: 'თბილისი', kind: 'ანალოგი, Nissens', price: 1450, lead: '2–3 დღე', stock: 'შეკვეთით', verified: true },
      { supplier: 'Kadir Otomotiv', place: 'სტამბოლი', kind: 'ანალოგი', price: 1120, lead: '5–7 დღე', stock: 'შეკვეთით', verified: false },
    ],
  },
  {
    id: 'p4',
    name: 'ჰაერის ოსუშიტელის პატრონი',
    jargon: ['ოსუშიტელი', 'ჰაერის ფილტრი', 'ოსუშკა', 'პატრონი'],
    oem: 'A0004291795',
    category: 'სამუხრუჭე',
    fits: ['ACTROS', 'ATEGO', 'AXOR'],
    offers: [
      { supplier: 'დბ მოტორსი', place: 'თბილისი', kind: 'ორიგინალი, Knorr', price: 210, lead: 'დღესვე', stock: 'მარაგშია', verified: true },
      { supplier: 'ზმ მოტორსი', place: 'რუსთავი', kind: 'ანალოგი', price: 140, lead: '1 დღე', stock: 'მარაგშია', verified: false },
    ],
  },
  {
    id: 'p5',
    name: 'გენერატორი',
    jargon: ['გენერატორი', 'ალტერნატორი'],
    oem: 'A0131542702',
    category: 'ელექტრო',
    fits: ['ACTROS', 'ATEGO', 'AXOR', 'ANTOS'],
    offers: [
      { supplier: 'გევა მოტორსი', place: 'თბილისი', kind: 'აღდგენილი', price: 680, lead: '1 დღე', stock: 'მარაგშია', verified: false },
      { supplier: 'Nordwest NFZ', place: 'ჰამბურგი', kind: 'ორიგინალი', price: 1890, lead: '10–14 დღე', stock: 'შეკვეთით', verified: false },
    ],
  },
  {
    id: 'p6',
    name: 'ჰაერის მილის შეერთება (ფიტინგი)',
    jargon: ['მილი', 'შლანგი', 'ფიტინგი', 'ჰაერის მილი'],
    oem: 'A0089973482',
    category: 'სამუხრუჭე',
    fits: ['ACTROS', 'ATEGO', 'ANTOS', 'AXOR'],
    offers: [
      { supplier: 'ამბოლი', place: 'ქუთაისი', kind: 'ანალოგი', price: 24, lead: 'დღესვე', stock: 'მარაგშია', verified: true },
    ],
  },
];

// სიმპტომები. ყოველ შემთხვევაში — ერთი დამაზუსტებელი კითხვა, მერე პასუხი.
// `confirmed: false` ნიშნავს, რომ ეს ვარაუდია და არა მანუალით დადასტურებული.
export const SYMPTOMS = [
  {
    id: 's1',
    keywords: ['ჰაერი', 'შიშინ', 'გადის', 'ჟონავს ჰაერი'],
    question: 'შიშინი ბორბალთან ისმის თუ შუაში, ბაკთან?',
    answers: [
      {
        label: 'ბორბალთან',
        title: 'სავარაუდოდ ჰაერის მილია მოშვებული',
        steps: [
          'გამორთე ძრავა, ჩაუშვი ჰაერი.',
          'ბორბალთან მილის შეერთება მოძებნე.',
          'ხელით შეამოწმე — თუ ფხვიერია, მოუჭირე.',
          'აუშვი ჰაერი და ისევ მოუსმინე.',
        ],
        selfFix: true,
        partId: 'p6',
        confirmed: false,
      },
      {
        label: 'შუაში, ბაკთან',
        title: 'ოსუშიტელი ან კომპრესორი უშვებს',
        steps: [
          'შეხედე, ბაკქვეშ სველია თუ არა.',
          'ჩაუშვი კონდენსატი ბაკიდან.',
          'თუ ხმა არ გაჩერდა — ოსუშიტელის პატრონი იცვლება.',
        ],
        selfFix: false,
        partId: 'p4',
        confirmed: false,
      },
    ],
  },
  {
    id: 's2',
    keywords: ['მუხრუჭი', 'ვერ იჭერს', 'რბილად', 'ტორმოზი', 'არ იჭერს'],
    question: 'პედალი ფსკერამდე მიდის თუ იჭერს, მაგრამ სუსტად?',
    answers: [
      {
        label: 'ფსკერამდე მიდის',
        title: 'ჰაერი აკლია სისტემას — არ იარო',
        steps: [
          'მანქანა გააჩერე უსაფრთხო ადგილას.',
          'მანომეტრს დახედე — რამდენია წნევა.',
          'არ გააგრძელო სვლა. ხალხი უნდა გამოიძახო.',
        ],
        selfFix: false,
        partId: null,
        confirmed: false,
      },
      {
        label: 'იჭერს, მაგრამ სუსტად',
        title: 'ხუნდები გაცვეთილია',
        steps: [
          'ბორბალში შეიხედე — ხუნდის სისქე თუ 3 მმ-ზე ნაკლებია, იცვლება.',
          'დისკი თუ ღარიანია, ისიც გაჩვენე ხელოსანს.',
        ],
        selfFix: false,
        partId: 'p1',
        confirmed: false,
      },
    ],
  },
  {
    id: 's3',
    keywords: ['არ ქაჩავს', 'არ ეწევა', 'ძალა', 'სუსტად მიდის', 'ძრავა'],
    question: 'ბოლო დროს საწვავი სად ჩაასხი — ჩვეულ ადგილას თუ გზაში?',
    answers: [
      {
        label: 'გზაში, უცხო ადგილას',
        title: 'საწვავის ფილტრი ჩაიხერგა',
        steps: [
          'ფილტრის ჭიქაში ჩაიხედე — წყალი ან ჭუჭყი თუ დგას.',
          'წყალი ჩაუშვი დრენაჟის ხრახნით.',
          'თუ არ გამოსწორდა — ფილტრი იცვლება.',
        ],
        selfFix: true,
        partId: 'p2',
        confirmed: false,
      },
      {
        label: 'ჩვეულ ადგილას',
        title: 'ტურბინა ან ფილტრი — ადგილზე უნდა შემოწმდეს',
        steps: [
          'შეამოწმე, შავ კვამლს ხომ არ უშვებს.',
          'დაფაზე გაფრთხილების ნიშანს დახედე და გადაუღე ფოტო.',
        ],
        selfFix: false,
        partId: null,
        confirmed: false,
      },
    ],
  },
  {
    id: 's4',
    keywords: ['წყალი', 'ტემპერატურა', 'ადუღდა', 'ჩადის წყალი', 'გაცხელდა'],
    question: 'ტემპერატურა ადის თუ უბრალოდ წყალი აკლდება?',
    answers: [
      {
        label: 'ტემპერატურა ადის',
        title: 'გააჩერე — ძრავას გაფუჭება ემუქრება',
        steps: [
          'გააჩერე და ძრავა გამორთე. ცხელ რადიატორს თავსახური არ მოუხსნა.',
          'გაცივების მერე დონეს დახედე.',
          'ხალხი გამოიძახე — გზაში გაგრძელება ძვირი დაგიჯდება.',
        ],
        selfFix: false,
        partId: 'p3',
        confirmed: false,
      },
      {
        label: 'წყალი აკლდება',
        title: 'სადღაც ჟონავს — ადგილი უნდა მოიძებნოს',
        steps: [
          'ქვეშ შეხედე, სველი ლაქა სად არის.',
          'პატრუბკების შეერთებები ხელით შეამოწმე.',
          'დაამატე წყალი და გაზომე, რამდენად სწრაფად აკლდება.',
        ],
        selfFix: true,
        partId: 'p3',
        confirmed: false,
      },
    ],
  },
  {
    id: 's5',
    keywords: ['შუქი', 'ელექტრიკა', 'არ ანთია', 'აკუმულატორი', 'არ ტრიალებს'],
    question: 'საერთოდ არაფერი ანთია თუ მხოლოდ ერთი რამ?',
    answers: [
      {
        label: 'მხოლოდ ერთი რამ',
        title: 'დიდი ალბათობით დამცველია (პრედოხრანიტელი)',
        steps: [
          'დამცველების ყუთი გახსენი — ჩვეულებრივ საჭესთან, მარცხნივ.',
          'სქემას დახედე, რომელი უჯრაა შენი შუქის.',
          'დამწვარი დამცველი შეცვალე იმავე ამპერაჟით.',
        ],
        selfFix: true,
        partId: null,
        confirmed: false,
      },
      {
        label: 'საერთოდ არაფერი',
        title: 'აკუმულატორი ან გენერატორი',
        steps: [
          'კლემები შეამოწმე — ფხვიერი ხომ არაა, ჟანგი ხომ არ ადევს.',
          'მოუჭირე და ისევ სცადე.',
          'თუ იარა და გზაში ჩაჯდა — გენერატორი არ ტენის.',
        ],
        selfFix: false,
        partId: 'p5',
        confirmed: false,
      },
    ],
  },
];

export function findSymptom(text) {
  const t = (text || '').toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const s of SYMPTOMS) {
    const score = s.keywords.filter((k) => t.includes(k)).length;
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return best;
}

export function searchParts(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return PARTS.filter((p) => {
    const hay = [p.name, p.oem, p.category, ...p.jargon].join(' ').toLowerCase();
    return q.split(/\s+/).some((w) => hay.includes(w));
  });
}

export function partById(id) {
  return PARTS.find((p) => p.id === id) || null;
}
