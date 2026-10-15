import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Screen, Card, Chip, Row, Btn, Note } from '../ui';
import { C, F } from '../theme';
import { useApp, STAGES } from '../store';
import { useNav } from '../nav';

const FLOW = [
  { stage: 'enroute', label: 'გამოვედი' },
  { stage: 'onsite', label: 'ადგილზე ვარ' },
  { stage: 'done', label: 'გავასწორე' },
];

export default function TechJob({ params }) {
  const app = useApp();
  const nav = useNav();
  const t = app.ticket(params.id);
  const [note, setNote] = useState(t ? t.note : '');
  if (!t) return <Screen title="ვერ ვიპოვე" onBack={nav.pop} />;

  const reached = (stage) => {
    const order = ['new', 'assigned', 'enroute', 'onsite', 'waiting_part', 'done', 'invoiced'];
    return order.indexOf(t.stage) >= order.indexOf(stage);
  };

  return (
    <Screen
      title={`№ ${t.id} · ${app.truckLabel(t.plate)}`}
      subtitle={`${app.client(t.clientId).name} · ${t.place}`}
      onBack={nav.pop}
      footer={
        <Btn
          dark={t.stage !== 'done' && t.stage !== 'invoiced'}
          title={t.stage === 'done' || t.stage === 'invoiced' ? 'დასრულებულია' : 'შეინახე ჩანაწერი'}
          disabled={t.stage === 'invoiced'}
          onPress={() => {
            app.addNote(t.id, note);
            nav.pop();
          }}
        />
      }
    >
      <Card selected>
        <Row>
          <Text style={F.h3}>რას ამბობს მძღოლი</Text>
          <Chip text={STAGES[t.stage]} />
        </Row>
        <Text style={[F.body, { marginTop: 10, lineHeight: 23 }]}>{t.issue}</Text>
      </Card>

      <Text style={F.small}>სად ხარ ახლა — დააჭირე</Text>
      {FLOW.map((f) => {
        const on = reached(f.stage);
        return (
          <Pressable key={f.stage} onPress={() => app.setStage(t.id, f.stage)}>
            <View
              style={{
                borderWidth: on ? 2 : 1,
                borderColor: on ? C.ink : C.line,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 18 }}>{on ? '✓' : '○'}</Text>
              <Text style={[F.body, { fontWeight: on ? '600' : '400' }]}>{f.label}</Text>
            </View>
          </Pressable>
        );
      })}

      <Card onPress={() => nav.push('Order', { id: t.id })} style={{ backgroundColor: C.ink, borderColor: C.ink }}>
        <Row>
          <View style={{ flex: 1 }}>
            <Text style={[F.h3, { color: C.onInk }]}>ნაწილი მჭირდება</Text>
            <Text style={[F.tiny, { color: '#D6D6D6', marginTop: 3 }]}>
              შეუკვეთე — ან წაიღე, ან მოგიტანონ ადგილზე
            </Text>
          </View>
          <Text style={{ fontSize: 22, color: C.onInk }}>›</Text>
        </Row>
      </Card>

      {t.parts.length > 0 ? (
        <Card>
          <Text style={F.h3}>შეკვეთილი ნაწილები</Text>
          {t.parts.map((p, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Row>
                <Text style={F.body}>
                  {p.name} × {p.qty}
                </Text>
                <Text style={F.h3}>{p.price * p.qty} ₾</Text>
              </Row>
              <Text style={[F.tiny, { marginTop: 3 }]}>
                {p.supplier} · {p.delivery === 'courier' ? 'კურიერით' : 'თვითონ ავიღებ'} · {p.status}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <View style={{ gap: 8 }}>
        <Text style={F.small}>რამდენი საათი დაგჭირდა</Text>
        <Row style={{ justifyContent: 'flex-start', gap: 10 }}>
          {[0, 1, 2, 3, 4].map((h) => (
            <Pressable key={h} onPress={() => app.setHours(t.id, h)}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  borderWidth: t.hours === h ? 2 : 1,
                  borderColor: t.hours === h ? C.ink : C.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={[F.body, { fontWeight: t.hours === h ? '700' : '400' }]}>{h}</Text>
              </View>
            </Pressable>
          ))}
        </Row>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={F.small}>რა გააკეთე</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="ჩაწერე მოკლედ — უფროსი და ინვოისი აქედან იკრიბება"
          placeholderTextColor={C.faint}
          style={{
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 12,
            padding: 14,
            minHeight: 100,
            fontSize: 16,
            color: C.text,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <Note>რასაც აქ ჩაწერ, ის გადადის ინვოისში და მანქანის ისტორიაში.</Note>
    </Screen>
  );
}
