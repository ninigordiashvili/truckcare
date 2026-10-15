import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { C, F, TOP, BOTTOM } from '../theme';
import { Btn, Note } from '../ui';
import { useApp } from '../store';
import { useNav } from '../nav';
import { findSymptom, partById } from '../data/knowledge';
import { FLEET } from '../data/fleet';

function Bubble({ me, children }) {
  return (
    <View
      style={{
        alignSelf: me ? 'flex-end' : 'flex-start',
        maxWidth: '88%',
        backgroundColor: me ? C.ink : C.surface,
        borderRadius: 14,
        borderBottomRightRadius: me ? 4 : 14,
        borderBottomLeftRadius: me ? 14 : 4,
        padding: 14,
      }}
    >
      {typeof children === 'string' ? (
        <Text style={{ fontSize: 16, lineHeight: 23, color: me ? C.onInk : C.text }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export default function DriverChat() {
  const app = useApp();
  const nav = useNav();
  const truck = FLEET.find((t) => t.plate === app.plate);
  const scroller = useRef(null);

  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState([
    { who: 'ai', text: 'მოიყევი, რა ხდება. ისე თქვი, როგორც გითხრიდი მეზობელს.' },
  ]);
  const [symptom, setSymptom] = useState(null);
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(id);
  }, [msgs, outcome]);

  const say = (who, t) => setMsgs((m) => [...m, { who, text: t }]);

  function send() {
    const t = text.trim();
    if (!t) return;
    setText('');
    say('me', t);
    const found = findSymptom(t);
    if (found) {
      setSymptom(found);
      setTimeout(() => say('ai', found.question), 350);
    } else {
      setTimeout(
        () =>
          say(
            'ai',
            'ასე ვერ მივხვდი. სცადე სხვანაირად: სად ისმის ხმა, რა დროს იწყება, რა გეუბნება დაფა. ან პირდაპირ ხალხი გამოიძახე.'
          ),
        350
      );
    }
  }

  function pick(ans) {
    say('me', ans.label);
    setSymptom(null);
    setTimeout(() => setOutcome(ans), 350);
  }

  const part = outcome && outcome.partId ? partById(outcome.partId) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: TOP,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: C.lineSoft,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Pressable onPress={nav.pop} hitSlop={12} style={{ width: 32, marginLeft: -8 }}>
          <Text style={{ fontSize: 30, lineHeight: 34 }}>‹</Text>
        </Pressable>
        <View>
          <Text style={F.h3}>რა სჭირს მანქანას</Text>
          <Text style={[F.tiny, { marginTop: 2 }]}>
            {truck ? `${truck.model} · ${truck.plate} · ${truck.year || ''}` : ''}
          </Text>
        </View>
      </View>

      <ScrollView ref={scroller} contentContainerStyle={{ padding: 20, gap: 12 }}>
        {msgs.map((m, i) => (
          <Bubble key={i} me={m.who === 'me'}>
            {m.text}
          </Bubble>
        ))}

        {symptom ? (
          <View style={{ gap: 8, marginTop: 2 }}>
            {symptom.answers.map((a) => (
              <Btn key={a.label} title={a.label} onPress={() => pick(a)} />
            ))}
          </View>
        ) : null}

        {outcome ? (
          <Bubble>
            <View style={{ gap: 10 }}>
              <Text style={[F.h3, { fontSize: 16 }]}>{outcome.title}</Text>
              {outcome.steps.map((st, i) => (
                <Text key={i} style={{ fontSize: 16, lineHeight: 23, color: C.text }}>
                  {i + 1}. {st}
                </Text>
              ))}
              {part ? (
                <Text style={[F.small, { marginTop: 2 }]}>
                  თუ არ გამოვიდა, სავარაუდოდ დაგჭირდება: {part.name} ({part.oem})
                </Text>
              ) : null}
              <View style={{ borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10 }}>
                <Text style={F.tiny}>
                  {outcome.confirmed
                    ? 'დადასტურებულია სერვის-წიგნით.'
                    : 'ეს ვარაუდია აღწერის მიხედვით. წიგნით დადასტურებული არაა.'}
                </Text>
              </View>
            </View>
          </Bubble>
        ) : null}

        {outcome ? null : (
          <Note>
            AI მხოლოდ იმას გეუბნება, რაც ბაზაშია. რასაც ვერ პოულობს, პირდაპირ ამბობს — არ იგონებს.
          </Note>
        )}
      </ScrollView>

      {outcome ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: BOTTOM,
            borderTopWidth: 1,
            borderTopColor: C.lineSoft,
            gap: 10,
          }}
        >
          <Btn title="გავასწორე, მადლობა" onPress={() => nav.reset('Home')} />
          {part ? (
            <Btn title="ნაწილი ვნახოთ" onPress={() => nav.push('Parts', { query: part.jargon[0] })} />
          ) : null}
          <Btn
            dark
            title="ვერ გავასწორე — გამოიძახე ხალხი"
            onPress={() => nav.push('Emergency', { issue: outcome.title })}
          />
        </View>
      ) : (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: BOTTOM,
            borderTopWidth: 1,
            borderTopColor: C.lineSoft,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            placeholder="მაგ. უკნიდან ჰაერი გადის"
            placeholderTextColor={C.faint}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: C.line,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 16,
              color: C.text,
            }}
          />
          <Pressable
            onPress={send}
            style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: C.onInk, fontSize: 22 }}>↑</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
