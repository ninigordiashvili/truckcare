import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Screen, Card, Btn, Row, Note } from '../ui';
import { C, F } from '../theme';
import { useApp } from '../store';
import { useNav } from '../nav';
import { FLEET } from '../data/fleet';

export default function DriverEmergency({ params }) {
  const app = useApp();
  const nav = useNav();
  const truck = FLEET.find((t) => t.plate === app.plate);

  const [issue, setIssue] = useState(params?.issue || '');
  const [place, setPlace] = useState('');
  const [photos, setPhotos] = useState(0);

  function send() {
    const id = app.createTicket({
      issue: issue.trim() || 'მძღოლმა ვერ აღწერა',
      place: place.trim() || 'ლოკაცია გაზიარებულია',
    });
    nav.replace('Status', { id });
  }

  return (
    <Screen
      title="გამოძახება"
      subtitle={truck ? `${truck.model} · ${truck.plate}` : ''}
      onBack={nav.pop}
      footer={<Btn dark title="გააგზავნე" hint="სანამ ოპერატორი არ დაადასტურებს, არ დაგპირდებით" onPress={send} />}
    >
      <View style={{ gap: 8 }}>
        <Text style={F.small}>რა მოხდა? ისე თქვი, როგორც არის.</Text>
        <TextInput
          value={issue}
          onChangeText={setIssue}
          multiline
          placeholder="მაგ. უკანა მარჯვენა ბორბალთან ჰაერი გადის"
          placeholderTextColor={C.faint}
          style={{
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 12,
            padding: 14,
            minHeight: 96,
            fontSize: 16,
            color: C.text,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <Card onPress={() => setPhotos((n) => n + 1)}>
        <Row>
          <View>
            <Text style={F.h3}>გადაუღე ფოტო</Text>
            <Text style={[F.tiny, { marginTop: 3 }]}>
              {photos ? `${photos} ფოტო მიმაგრებულია` : 'ხელოსანს ეხმარება, რომ ნაწილი თან წამოიღოს'}
            </Text>
          </View>
          <Text style={{ fontSize: 22 }}>+</Text>
        </Row>
      </Card>

      <View style={{ gap: 8 }}>
        <Text style={F.small}>სად ხარ?</Text>
        <TextInput
          value={place}
          onChangeText={setPlace}
          placeholder="მაგ. სენაკი–ფოთის გზა, 34-ე კმ"
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
        <Text style={F.tiny}>ტელეფონი ლოკაციას თვითონ გაგზავნის. ხელით მხოლოდ მაშინ, თუ ქსელი არ იჭერს.</Text>
      </View>

      <Note>
        გაგზავნის მერე ნომერს მიიღებ. ხელოსანს ოპერატორი მიაბამს — აპი თავისით არავის გზავნის.
      </Note>
    </Screen>
  );
}
