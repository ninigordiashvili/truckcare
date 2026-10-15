import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Screen, Card, BigBtn, Row } from '../ui';
import { C, F } from '../theme';
import { useApp, STAGES } from '../store';
import { useNav } from '../nav';
import { FLEET } from '../data/fleet';

export default function DriverHome() {
  const app = useApp();
  const nav = useNav();
  const truck = FLEET.find((t) => t.plate === app.plate);
  const mine = app.tickets.filter((t) => t.plate === app.plate && t.stage !== 'invoiced');

  return (
    <Screen title="TRUCK CARE" subtitle="ჩვენ ვზრუნავთ, თქვენ აგრძელებთ გზას">
      <Card onPress={() => nav.push('Trucks')}>
        <Row>
          <View>
            <Text style={F.tiny}>ჩემი მანქანა</Text>
            <Text style={[F.h3, { marginTop: 3 }]}>
              {truck ? `${truck.model} · ${truck.plate}` : 'აირჩიე მანქანა'}
            </Text>
          </View>
          <Text style={F.tiny}>შეცვლა ›</Text>
        </Row>
      </Card>

      <BigBtn
        dark
        title="გაფუჭდა მანქანა"
        hint={'მიყევი რა ხდება — გეტყვი რა სჭირს\nდა საჭიროა თუ არა ხალხის გამოძახება'}
        onPress={() => nav.push('Chat')}
      />

      <BigBtn
        title="ნაწილი მჭირდება"
        hint={'დაწერე, როგორც გითქვამს —\nმოვძებნი და ფასს გეტყვი'}
        onPress={() => nav.push('Parts')}
      />

      <Card onPress={() => nav.push('Emergency')}>
        <Row>
          <View>
            <Text style={F.h3}>სასწრაფო გამოძახება</Text>
            <Text style={[F.tiny, { marginTop: 3 }]}>24 საათი · ადგილზე მოვალთ</Text>
          </View>
          <Text style={{ fontSize: 22, color: C.text }}>›</Text>
        </Row>
      </Card>

      {mine.length > 0 ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <Text style={F.small}>ჩემი საქმე</Text>
          {mine.map((t) => (
            <Card key={t.id} onPress={() => nav.push('Status', { id: t.id })}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Text style={F.body}>№ {t.id} · {t.issue}</Text>
                  <Text style={[F.tiny, { marginTop: 3 }]}>
                    {app.tech(t.techId) ? `${app.tech(t.techId).name} · ` : ''}
                    {STAGES[t.stage]}
                  </Text>
                </View>
                <Text style={{ fontSize: 22, color: C.text }}>›</Text>
              </Row>
            </Card>
          ))}
        </View>
      ) : null}

      <Pressable onPress={() => nav.push('Trucks')} style={{ paddingVertical: 10 }}>
        <Text style={[F.tiny, { textAlign: 'center' }]}>ავტოპარკში {FLEET.length} მანქანაა</Text>
      </Pressable>
    </Screen>
  );
}
