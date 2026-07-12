import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthScreen } from './screens/AuthScreen';
import { FamilyGateScreen } from './screens/FamilyGateScreen';
import { MainApp } from './screens/MainApp';

export default function SuperCart() {
  const [session, setSession] = useState(null);
  const [family, setFamily] = useState(null);

  const screen = !session ? <AuthScreen onAuthenticated={setSession} /> : !family ? <FamilyGateScreen onFamilySelected={setFamily} onLogout={() => setSession(null)} /> : <MainApp session={session} family={family} onLogout={() => { setSession(null); setFamily(null); }} onLeaveFamily={() => setFamily(null)} />;
  return <SafeAreaProvider>{screen}</SafeAreaProvider>;
}
