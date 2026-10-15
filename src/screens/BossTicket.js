import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Screen, Card, Chip, Row, Btn, Dot, Note } from '../ui';
import { C, F } from '../theme';
import { useApp, STAGES } from '../store';
import { useNav } from '../nav';
import { TECHS } from '../data/knowledge';

export default function BossTicket({ params }) {
  const app = useApp();
  const nav = useNav();
  const t = app.ticket(params.id);
  if (!t) return <Screen title="ვერ ვიპოვე" onBack={nav.pop} />;

  const client = app.client(t.clientId);
  const tech = app.tech(t.techId);
  const sum = app.totals(t);
  const billable = t.stage === 'done' || t.stage === 'invoiced';

  return (
    <Screen
      title={`თიქეთი № ${t.id}`}
      subtitle={`${app.truckLabel(t.plate)} · ${client.name}`}
      onBack={nav.pop}
      footer={
        billable ? (
          <Btn
            dark={!t.invoiceSent}
            disabled={t.invoiceSent}
            title={t.invoiceSent ? 'ინვოისი გაგზავნილია' : 'გააგზავნე კომპანიაზე'}
            hint={t.invoiceSent ? null : `${sum.gross.toFixed(2)} ₾ · ${client.name}`}
            onPress={() => {
              app.sendInvoice(t.id);
              Alert.alert('გაიგზავნა', `ინვოისი გაეგზავნა: ${client.name}`);
            }}
          />
        ) : null
      }
    >
      <Card selected>
        <Row>
          <Text style={F.h3}>{STAGES[t.stage]}</Text>
          <Chip text={tech ? tech.name : 'მისაბმელია'} dark={!tech} />
        </Row>
        <Text style={[F.body, { marginTop: 10 }]}>{t.issue}</Text>
        <Text style={[F.tiny, { marginTop: 6 }]}>{t.place}</Text>
      </Card>

      {!tech ? (
        <View style={{ gap: 8 }}>
          <Text style={F.small}>ვის მივაბათ</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TECHS.map((x) => {
              const busy = app.tickets.filter((y) => y.techId === x.id && y.stage !== 'invoiced').length;
              return (
                <Pressable key={x.id} onPress={() => app.assign(t.id, x.id)}>
                  <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 }}>
                    <Text style={F.body}>{x.name}</Text>
                    <Text style={F.tiny}>{busy ? `${busy} თიქეთი` : 'თავისუფალია'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <Card>
        <Text style={F.h3}>როგორ წავიდა</Text>
        <View style={{ marginTop: 12 }}>
          {t.events.map((e, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12 }}>
              <View style={{ paddingTop: 4 }}>
                <Dot state="done" />
              </View>
              <Text style={[F.small, { flex: 1 }]}>{e.text}</Text>
              <Text style={F.tiny}>{e.at}</Text>
            </View>
          ))}
        </View>
      </Card>

      {t.note ? (
        <Card>
          <Text style={F.h3}>{tech ? `${tech.name} — ჩანაწერი` : 'ჩანაწერი'}</Text>
          <Text style={[F.small, { marginTop: 8, lineHeight: 22 }]}>{t.note}</Text>
        </Card>
      ) : null}

      <Card selected={billable}>
        <Row>
          <Text style={F.h3}>ინვოისი</Text>
          <Chip text={t.invoiceSent ? 'გაგზავნილია' : billable ? 'გასაგზავნი' : 'ჯერ ადრეა'} />
        </Row>
        <Text style={[F.tiny, { marginTop: 4 }]}>
          {client.name} · ს/ნ {client.taxId}
        </Text>

        <View style={{ marginTop: 14 }}>
          {t.parts.map((p, i) => (
            <Row key={i} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.lineSoft }}>
              <View style={{ flex: 1 }}>
                <Text style={F.body}>{p.name}</Text>
                <Text style={F.tiny}>
                  {p.oem} · {p.supplier}
                </Text>
              </View>
              <Text style={F.tiny}>
                {p.qty} × {p.price} ₾
              </Text>
              <Text style={[F.body, { fontWeight: '600', minWidth: 78, textAlign: 'right' }]}>
                {(p.price * p.qty).toFixed(2)} ₾
              </Text>
            </Row>
          ))}

          {sum.delivery > 0 ? (
            <Row style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.lineSoft }}>
              <Text style={[F.body, { flex: 1 }]}>ნაწილის მიტანა ადგილზე</Text>
              <Text style={[F.body, { fontWeight: '600' }]}>{sum.delivery.toFixed(2)} ₾</Text>
            </Row>
          ) : null}

          {sum.callout > 0 ? (
            <Row style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.lineSoft }}>
              <Text style={[F.body, { flex: 1 }]}>ხელოსნის გასვლა</Text>
              <Text style={[F.body, { fontWeight: '600' }]}>{sum.callout.toFixed(2)} ₾</Text>
            </Row>
          ) : null}

          {sum.labor > 0 ? (
            <Row style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.lineSoft }}>
              <View style={{ flex: 1 }}>
                <Text style={F.body}>სამუშაო</Text>
                <Text style={F.tiny}>
                  {t.hours} სთ × {sum.rate} ₾
                </Text>
              </View>
              <Text style={[F.body, { fontWeight: '600' }]}>{sum.labor.toFixed(2)} ₾</Text>
            </Row>
          ) : null}
        </View>

        <Row style={{ marginTop: 14 }}>
          <Text style={F.small}>ჯამი</Text>
          <Text style={F.body}>{sum.net.toFixed(2)} ₾</Text>
        </Row>
        <Row style={{ marginTop: 8 }}>
          <Text style={F.small}>დღგ 18%</Text>
          <Text style={F.body}>{sum.vat.toFixed(2)} ₾</Text>
        </Row>
        <Row style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: C.ink, paddingTop: 12 }}>
          <Text style={F.h3}>სულ</Text>
          <Text style={F.h2}>{sum.gross.toFixed(2)} ₾</Text>
        </Row>
      </Card>

      <Note>
        ხაზები თვითონ აიკრიბა თიქეთიდან: შეკვეთილი ნაწილი, კურიერი, გასვლა და ხელოსნის საათები.
      </Note>
    </Screen>
  );
}
