import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PrimaryButton, TopBar } from '../components/ui';
import { createFamily } from '../data/models';

export function FamilyGateScreen({ onFamilySelected, onLogout }) {
  const [name, setName] = useState(''); const [code, setCode] = useState('');
  const makeFamily = () => name.trim() ? onFamilySelected(createFamily(name.trim())) : Alert.alert('Family name required');
  const joinFamily = () => code.length === 6 ? onFamilySelected({ ...createFamily('My Family'), code }) : Alert.alert('Enter the six-digit family code');
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}><StatusBar style="dark" /><TopBar title="SuperCart" action="Log out" onAction={onLogout} /><View style={styles.content}><Text style={styles.title}>Choose your family</Text><Text style={styles.intro}>You need a shared family space before you can start a list.</Text><View style={styles.panel}><Text style={styles.panelTitle}>Create a new family</Text><Text style={styles.panelSub}>Start a new shared shopping list.</Text><TextInput value={name} onChangeText={setName} placeholder="Family name" placeholderTextColor="#88958D" style={styles.input}/><PrimaryButton label="Create family" onPress={makeFamily}/></View><Text style={styles.divider}>OR</Text><View style={styles.panel}><Text style={styles.panelTitle}>Join an existing family</Text><Text style={styles.panelSub}>Enter the six-digit code from a family member.</Text><TextInput value={code} onChangeText={setCode} placeholder="000000" placeholderTextColor="#88958D" keyboardType="number-pad" maxLength={6} style={[styles.input, styles.code]}/><PrimaryButton label="Join family" onPress={joinFamily}/></View></View></SafeAreaView>;
}
const styles = StyleSheet.create({root:{flex:1,backgroundColor:'#F6FAF7'},content:{padding:24},title:{fontSize:29,fontWeight:'800',color:'#173426',marginTop:18},intro:{fontSize:15,lineHeight:22,color:'#587062',marginTop:8,marginBottom:22},panel:{backgroundColor:'#FFF',padding:18,borderRadius:18,borderWidth:1,borderColor:'#E2ECE6'},panelTitle:{fontSize:18,fontWeight:'800',color:'#1E382A'},panelSub:{fontSize:13,color:'#6D7F74',marginTop:4},input:{height:50,borderRadius:12,borderWidth:1,borderColor:'#DCE7E0',paddingHorizontal:13,color:'#173426',fontSize:15,marginTop:16},code:{textAlign:'center',letterSpacing:6,fontWeight:'800'},divider:{textAlign:'center',fontSize:11,fontWeight:'800',letterSpacing:1,color:'#8A9A90',marginVertical:15}});
