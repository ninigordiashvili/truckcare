import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Card, Row, Btn, Dot, Line, Note } from '../ui';
import { C, F } from '../theme';
import { useApp, STAGES, STAGE_ORDER } from '../store';
import { useNav } from '../nav';

export default function DriverStatus({ params }) {
  const app = useApp();
  const nav = useNav();
  const t = app.ticket(params.id);
  if (!t) return <Screen title="ვერ ვიპოვე" onBack={nav.pop} />;

  const tech = app.tech(t.techId);
  const idx = STAGE_ORDER.indexOf(t.stage);

  const headline = {
    new: 'მოთხოვნა მივიღეთ',
    assigned: `${tech ? tech.name : 'ხელოსანი'} მიებული არის`,
    enroute: `${tech ? tech.name : 'ხელოსანი'} გზაშია`,
    onsite: `${tech ? tech.name : 'ხელოსანი'} ადგილზეა`,
    waiting_part: 'ნაწილს ველოდებით',
    done: 'დასრულდა',
    invoiced: 'ინვოისი გაგზავნილია',
  }[t.stage];

  return (
    <Screen
      title={`გამოძახება № ${t.id}`}
      subtitle={`${app.truckLabel(t.plate)} · ${t.issue}`}
      onBack={() => nav.reset('Home')}
      footer={tech ? <Btn dark title={`დაურეკე — ${tech.name}`} /> : null}
    >
      <Card selected>
        <Text style={F.tiny}>ახლა რა ხდება</Text>
        <Text style={[F.h2, { marginTop: 4 }]}>{headline}</Text>
        {t.stage === 'new' ? (
          <Text style={[F.small, { marginTop: 6 }]}>ოპერატორი ახლავე დაგირეკავს. ჯერ არავინ გამოსულა.</Text>
        ) : null}
      </Card>

      <View style={{ marginTop: 4 }}>
        {STAGE_ORDER.filter((s) => s !== 'invoiced').map((s, i, arr) => {
          const state = i < idx ? 'done' : i === idx ? 'now' : 'wait';
          const done = i <= idx;
          return (
            <View key={s} style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ width: 16, alignItems: 'center' }}>
                <Dot state={i === idx ? 'now' : done ? 'done' : 'wait'} />
                {i < arr.length - 1 ? <Line /> : null}
              </View>
              <View style={{ paddingBottom: 18, flex: 1 }}>
                <Text style={{ fontSize: 16, color: done ? C.text : C.muted, fontWeight: i === idx ? '600' : '400' }}>
                  {STAGES[s]}
                </Text>
                {!done ? <Text style={[F.tiny, { marginTop: 2 }]}>ჯერ არა</Text> : null}
              </View>
            </View>
          );
        })}
      </View>

      {t.parts.length > 0 ? (
        <Card>
          <Text style={F.h3}>ნაწილი</Text>
          {t.parts.map((p, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Row>
                <Text style={F.body}>{p.name}</Text>
                <Text style={F.h3}>{p.price * p.qty} ₾</Text>
              </Row>
              <Text style={[F.tiny, { marginTop: 3 }]}>
                {p.supplier} · {p.qty} ც. · {p.delivery === 'courier' ? 'კურიერით ადგილზე' : 'თვითონ აიღებ'} · {p.status}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <Text style={F.h3}>სად ხარ</Text>
        <Text style={[F.small, { marginTop: 4 }]}>{t.place}</Text>
      </Card>

      <Note>ყოველი ნაბიჯი იწერება — უფროსიც ხედავს, შენც.</Note>
    </Screen>
  );
}
