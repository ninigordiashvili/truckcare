import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Card, Chip, Row, Note } from '../ui';
import { F } from '../theme';
import { useApp, STAGES } from '../store';
import { useNav } from '../nav';

export default function TechJobs() {
  const app = useApp();
  const nav = useNav();
  const me = app.tech(app.meTech);
  const jobs = app.myJobs();

  return (
    <Screen title={me.name} subtitle={`${jobs.length} თიქეთი ჩემზეა`}>
      {jobs.map((t, i) => (
        <Card key={t.id} selected={i === 0} onPress={() => nav.push('Job', { id: t.id })}>
          <Row>
            <View style={{ flex: 1 }}>
              <Text style={F.h3}>
                № {t.id} · {app.truckLabel(t.plate)}
              </Text>
              <Text style={[F.tiny, { marginTop: 3 }]}>
                {app.client(t.clientId).name} · {t.place}
              </Text>
            </View>
            <Chip dark={i === 0} text={i === 0 ? 'ახლა' : STAGES[t.stage]} />
          </Row>
          <Text style={[F.small, { marginTop: 10 }]}>{t.issue}</Text>
        </Card>
      ))}

      {jobs.length === 0 ? <Note>ახლა თიქეთი არ გაქვს. უფროსი მოგაბამს.</Note> : null}
    </Screen>
  );
}
