import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/store';
import { NavProvider, useNav } from './src/nav';
import { C, F, BOTTOM } from './src/theme';

import DriverHome from './src/screens/DriverHome';
import DriverChat from './src/screens/DriverChat';
import DriverParts from './src/screens/DriverParts';
import DriverEmergency from './src/screens/DriverEmergency';
import DriverStatus from './src/screens/DriverStatus';
import DriverTrucks from './src/screens/DriverTrucks';
import TechJobs from './src/screens/TechJobs';
import TechJob from './src/screens/TechJob';
import TechOrder from './src/screens/TechOrder';
import BossBoard from './src/screens/BossBoard';
import BossTicket from './src/screens/BossTicket';

const SCREENS = {
  Home: DriverHome,
  Chat: DriverChat,
  Parts: DriverParts,
  Emergency: DriverEmergency,
  Status: DriverStatus,
  Trucks: DriverTrucks,
  Jobs: TechJobs,
  Job: TechJob,
  Order: TechOrder,
  Board: BossBoard,
  Ticket: BossTicket,
};

const ROLES = [
  { key: 'driver', label: 'მძღოლი', initial: 'Home' },
  { key: 'tech', label: 'ხელოსანი', initial: 'Jobs' },
  { key: 'boss', label: 'უფროსი', initial: 'Board' },
];

function Router() {
  const nav = useNav();
  const Screen = SCREENS[nav.current.name] || DriverHome;
  return <Screen params={nav.current.params} />;
}

function RoleBar() {
  const app = useApp();
  return (
    <View style={s.bar}>
      {ROLES.map((r) => {
        const on = app.role === r.key;
        return (
          <Pressable key={r.key} onPress={() => app.setRole(r.key)} style={{ flex: 1 }}>
            <View style={[s.tab, on && s.tabOn]}>
              <Text style={[F.small, on && { color: C.onInk, fontWeight: '600' }]}>{r.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function Shell() {
  const app = useApp();
  const role = ROLES.find((r) => r.key === app.role);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <NavProvider key={app.role} initial={role.initial}>
          <Router />
        </NavProvider>
      </View>
      <RoleBar />
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: BOTTOM,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.bg,
  },
  tab: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabOn: { backgroundColor: C.ink, borderColor: C.ink },
});
