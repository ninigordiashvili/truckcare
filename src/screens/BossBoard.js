import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Screen, Card, Row, Dot } from '../ui';
import { C, F } from '../theme';
import { useApp, STAGES } from '../store';
import { useNav } from '../nav';
import { TECHS } from '../data/knowledge';

const FILTERS = [
  { key: 'all', label: 'ყველა' },
  { key: 'open', label: 'ღია' },
  { key: 'new', label: 'მისაბმელი' },
  { key: 'waiting_part', label: 'ნაწილს ელოდება' },
  { key: 'billable', label: 'ინვოისი' },
];

function dotState(stage) {
  if (stage === 'done' || stage === 'invoiced') return 'done';
  if (stage === 'new' || stage === 'waiting_part') return 'wait';
  return 'now';
}

export default function BossBoard() {
  const app = useApp();
  const nav = useNav();
  const [f, setF] = useState('all');

  const list = app.tickets.filter((t) => {
    if (f === 'open') return t.stage !== 'done' && t.stage !== 'invoiced';
    if (f === 'new') return !t.techId;
    if (f === 'waiting_part') return t.stage === 'waiting_part';
    if (f === 'billable') return t.stage === 'done' || t.stage === 'invoiced';
    return true;
  });

  const load = TECHS.map((tech) => ({
    tech,
    count: app.tickets.filter((t) => t.techId === tech.id && t.stage !== 'invoiced').length,
  }));

  return (
    <Screen title="დაფა" subtitle={`${app.tickets.filter((t) => t.stage !== 'invoiced').length} ღია თიქეთი`}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {FILTERS.map((x) => {
          const on = f === x.key;
          return (
            <Pressable key={x.key} onPress={() => setF(x.key)}>
              <View
                style={{
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  backgroundColor: on ? C.ink : C.bg,
                  borderWidth: 1,
                  borderColor: on ? C.ink : C.line,
                }}
              >
                <Text style={{ fontSize: 14, color: on ? C.onInk : C.text }}>{x.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {list.map((t) => {
        const tech = app.tech(t.techId);
        return (
          <Card key={t.id} onPress={() => nav.push('Ticket', { id: t.id })}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={F.h3}>
                  № {t.id} · {app.truckLabel(t.plate)}
                </Text>
                <Text style={[F.tiny, { marginTop: 3 }]}>
                  {app.client(t.clientId).name} · {t.place}
                </Text>
              </View>
              <Text style={{ fontSize: 22 }}>›</Text>
            </Row>

            <Text style={[F.small, { marginTop: 10 }]}>{t.issue}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Dot state={dotState(t.stage)} />
              <Text style={F.small}>{STAGES[t.stage]}</Text>
              <Text style={F.tiny}>·</Text>
              <Text style={F.small}>{tech ? tech.name : 'ჯერ არავინ'}</Text>
            </View>

            {t.parts.length > 0 ? (
              <Text style={[F.tiny, { marginTop: 8 }]}>
                ნაწილი: {t.parts.map((p) => `${p.name} — ${p.status}`).join(' · ')}
              </Text>
            ) : null}

            {t.stage === 'done' ? (
              <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: C.lineSoft, paddingTop: 10 }}>
                <Text style={[F.small, { fontWeight: '600' }]}>ინვოისი გასაგზავნია — {app.totals(t).gross.toFixed(2)} ₾</Text>
              </View>
            ) : null}
          </Card>
        );
      })}

      <Card>
        <Text style={F.h3}>ხალხი დღეს</Text>
        {load.map(({ tech, count }) => (
          <Row key={tech.id} style={{ marginTop: 10 }}>
            <Text style={F.body}>{tech.name}</Text>
            <Text style={F.small}>{count ? `${count} თიქეთი` : 'თავისუფალია'}</Text>
          </Row>
        ))}
      </Card>
    </Screen>
  );
}
