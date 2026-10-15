import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Screen, Card, Chip, Row } from '../ui';
import { C, F } from '../theme';
import { useApp } from '../store';
import { useNav } from '../nav';
import { FLEET } from '../data/fleet';

export default function DriverTrucks() {
  const app = useApp();
  const nav = useNav();
  const [q, setQ] = useState('');

  const list = FLEET.filter((t) => {
    const s = `${t.plate} ${t.model} ${t.vin} ${t.make}`.toLowerCase();
    return s.includes(q.trim().toLowerCase());
  }).slice(0, 40);

  return (
    <Screen
      title="ჩემი სატვირთოები"
      subtitle={`${FLEET.length} მანქანა ავტოპარკში`}
      onBack={nav.pop}
    >
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="ნომერი, მოდელი ან VIN"
        placeholderTextColor={C.faint}
        autoCapitalize="characters"
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

      {list.map((t) => (
        <Card
          key={t.plate + t.vin}
          selected={t.plate === app.plate}
          onPress={() => {
            app.setPlate(t.plate);
            nav.pop();
          }}
        >
          <Row>
            <View style={{ flex: 1 }}>
              <Text style={F.h3}>{t.plate}</Text>
              <Text style={[F.tiny, { marginTop: 3 }]}>
                {t.make} {t.model} · {t.year || '—'}
              </Text>
              <Text style={[F.tiny, { marginTop: 2, letterSpacing: 0.4 }]}>{t.vin}</Text>
            </View>
            {t.plate === app.plate ? <Chip dark text="არჩეული" /> : null}
          </Row>
        </Card>
      ))}

      {list.length === 0 ? (
        <Text style={F.small}>ვერ ვიპოვე. შეამოწმე ნომერი ან დაამატე ახალი მანქანა.</Text>
      ) : null}
    </Screen>
  );
}
