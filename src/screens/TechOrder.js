import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Screen, Card, Chip, Row, Btn, Note } from '../ui';
import { C, F } from '../theme';
import { useApp } from '../store';
import { useNav } from '../nav';
import { searchParts, PARTS } from '../data/knowledge';

export default function TechOrder({ params }) {
  const app = useApp();
  const nav = useNav();
  const t = app.ticket(params.id);

  const [q, setQ] = useState('');
  const [part, setPart] = useState(null);
  const [offer, setOffer] = useState(null);
  const [qty, setQty] = useState(1);
  const [delivery, setDelivery] = useState('courier');

  if (!t) return <Screen title="ვერ ვიპოვე" onBack={nav.pop} />;

  const results = q.trim() ? searchParts(q) : PARTS;

  function confirm() {
    app.addPart(t.id, { partId: part.id, supplier: offer.supplier, price: offer.price, qty, delivery });
    nav.pop();
  }

  return (
    <Screen
      title="ნაწილის შეკვეთა"
      subtitle={`თიქეთი № ${t.id} · ${app.truckLabel(t.plate)}`}
      onBack={nav.pop}
      footer={
        part && offer ? (
          <>
            <Row>
              <Text style={F.small}>ნაწილი × {qty}</Text>
              <Text style={F.h3}>{offer.price * qty} ₾</Text>
            </Row>
            <Row>
              <Text style={F.small}>ვინ იხდის</Text>
              <Text style={F.small}>{app.client(t.clientId).name}</Text>
            </Row>
            <Btn dark title="შეუკვეთე" hint="უფროსს დაენახება მაშინვე" onPress={confirm} />
          </>
        ) : null
      }
    >
      {!part ? (
        <>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="ნაწილის სახელი, ჟარგონი ან კოდი"
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
                    {p.oem} · {p.category}
                  </Text>
                </View>
                <Text style={{ fontSize: 22 }}>›</Text>
              </Row>
            </Card>
          ))}
          {results.length === 0 ? (
            <Note>ბაზაში არ არის. ჩაწერე ხელით და ოპერატორი მოძებნის — შემდეგისთვის ბაზაშიც შევა.</Note>
          ) : null}
        </>
      ) : (
        <>
          <Card>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={F.h3}>{part.name}</Text>
                <Text style={[F.tiny, { marginTop: 3 }]}>{part.oem}</Text>
              </View>
              <Pressable onPress={() => { setPart(null); setOffer(null); }}>
                <Text style={F.tiny}>შეცვლა</Text>
              </Pressable>
            </Row>
          </Card>

          <Text style={F.small}>სად შევუკვეთოთ</Text>
          {part.offers.map((o) => (
            <Card key={o.supplier} selected={offer && offer.supplier === o.supplier} onPress={() => setOffer(o)}>
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
            </Card>
          ))}

          <Row style={{ marginTop: 6 }}>
            <Text style={F.small}>რამდენი ცალი</Text>
            <Row style={{ justifyContent: 'flex-end', gap: 12 }}>
              <Pressable onPress={() => setQty((n) => Math.max(1, n - 1))}>
                <View style={box}><Text style={F.h3}>−</Text></View>
              </Pressable>
              <Text style={F.h3}>{qty}</Text>
              <Pressable onPress={() => setQty((n) => n + 1)}>
                <View style={box}><Text style={F.h3}>+</Text></View>
              </Pressable>
            </Row>
          </Row>

          <Text style={[F.small, { marginTop: 6 }]}>როგორ მიიღებ</Text>
          <Card selected={delivery === 'courier'} onPress={() => setDelivery('courier')}>
            <Text style={F.h3}>მომიტანონ ადგილზე</Text>
            <Text style={[F.tiny, { marginTop: 4, lineHeight: 19 }]}>
              კურიერი აიღებს მაღაზიიდან და მოიტანს: {t.place}. ფასი და დრო გამოძახების მერე დაზუსტდება.
            </Text>
          </Card>
          <Card selected={delivery === 'pickup'} onPress={() => setDelivery('pickup')}>
            <Text style={F.h3}>თვითონ ავიღებ</Text>
            <Text style={[F.tiny, { marginTop: 4, lineHeight: 19 }]}>
              გადადებენ სახელზე, გზაში შევივლი.
            </Text>
          </Card>
        </>
      )}
    </Screen>
  );
}

const box = {
  width: 52,
  height: 52,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: C.line,
  alignItems: 'center',
  justifyContent: 'center',
};
