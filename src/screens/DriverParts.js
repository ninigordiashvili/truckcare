import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Screen, Card, Chip, Row, Btn, Note } from '../ui';
import { C, F } from '../theme';
import { useApp } from '../store';
import { useNav } from '../nav';
import { searchParts } from '../data/knowledge';
import { FLEET } from '../data/fleet';

export default function DriverParts({ params }) {
  const app = useApp();
  const nav = useNav();
  const truck = FLEET.find((t) => t.plate === app.plate);

  const [q, setQ] = useState(params?.query || '');
  const [part, setPart] = useState(() => {
    const r = searchParts(params?.query || '');
    return r.length === 1 ? r[0] : null;
  });
  const [offer, setOffer] = useState(null);
  const [delivery, setDelivery] = useState('courier');

  const results = part ? [] : searchParts(q);

  function order() {
    const id = app.createTicket({ issue: `ნაწილის შეკვეთა: ${part.name}` });
    app.addPart(id, {
      partId: part.id,
      supplier: offer.supplier,
      price: offer.price,
      qty: 1,
      delivery,
    });
    nav.replace('Status', { id });
  }

  if (!part) {
    return (
      <Screen
        title="ნაწილი მჭირდება"
        subtitle={truck ? `${truck.model} · ${truck.plate}` : ''}
        onBack={nav.pop}
      >
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="დაწერე, როგორც გითქვამს — მაგ. შკორნი"
          placeholderTextColor={C.faint}
          style={{
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 14,
            fontSize: 16,
            color: C.text,
          }}
        />

        {results.map((p) => (
          <Card key={p.id} onPress={() => setPart(p)}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={F.h3}>{p.name}</Text>
                <Text style={[F.tiny, { marginTop: 3 }]}>
                  {p.oem} · {p.offers.length} შეთავაზება
                </Text>
                <Text style={[F.tiny, { marginTop: 2 }]}>ასევე ეძახიან: {p.jargon.join(', ')}</Text>
              </View>
              <Text style={{ fontSize: 22 }}>›</Text>
            </Row>
          </Card>
        ))}

        {q.trim() && results.length === 0 ? (
          <Note>
            ამას ბაზაში ვერ ვპოულობ. გადაუღე ფოტო ძველ ნაწილს ან ჩაწერე კოდი — ოპერატორი მოძებნის და
            ბაზაშიც ჩაწერს.
          </Note>
        ) : null}

        {!q.trim() ? (
          <Note>
            სახელი არ იცი — არა უშავს. დაწერე „შკორნი“, „ფილტრი“, „რადიატორი“ — მაინც გავიგებ.
          </Note>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen
      title={part.name}
      subtitle={`${part.oem} · ${truck ? truck.model + ' · ' + truck.plate : ''}`}
      onBack={() => (offer ? setOffer(null) : setPart(null))}
      footer={
        offer ? (
          <>
            <Row>
              <Text style={F.small}>ასაღები ჯამი</Text>
              <Text style={F.h3}>{offer.price} ₾</Text>
            </Row>
            <Btn dark title="შეუკვეთე" hint="უფროსს და ოპერატორს მაშინვე დაენახებათ" onPress={order} />
          </>
        ) : null
      }
    >
      {part.offers.map((o) => {
        const on = offer && offer.supplier === o.supplier;
        return (
          <Card key={o.supplier} selected={on} onPress={() => setOffer(o)}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={F.h3}>{o.supplier}</Text>
                <Text style={[F.tiny, { marginTop: 3 }]}>
                  {o.place} · {o.kind}
                </Text>
              </View>
              <Text style={F.h2}>{o.price} ₾</Text>
            </Row>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Chip dark={o.stock === 'მარაგშია'} text={o.stock} />
              <Chip text={o.lead} />
            </View>
            {!o.verified ? (
              <Text style={[F.tiny, { marginTop: 10, borderTopWidth: 1, borderTopColor: C.lineSoft, paddingTop: 10 }]}>
                ფასი ძველი პასუხიდანაა — დღეს არ გადამოწმებულა.
              </Text>
            ) : null}
          </Card>
        );
      })}

      {offer ? (
        <View style={{ gap: 10, marginTop: 6 }}>
          <Text style={F.small}>როგორ მიიღებ?</Text>
          <Card selected={delivery === 'courier'} onPress={() => setDelivery('courier')}>
            <Text style={F.h3}>მომიტანონ ადგილზე</Text>
            <Text style={[F.tiny, { marginTop: 4, lineHeight: 19 }]}>
              კურიერი აიღებს მაღაზიიდან და მოიტანს იქ, სადაც ხარ. ფასი და დრო გამოძახების მერე დაზუსტდება.
            </Text>
          </Card>
          <Card selected={delivery === 'pickup'} onPress={() => setDelivery('pickup')}>
            <Text style={F.h3}>თვითონ ავიღებ</Text>
            <Text style={[F.tiny, { marginTop: 4, lineHeight: 19 }]}>
              გადადებენ სახელზე, გზაში შეივლი.
            </Text>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
