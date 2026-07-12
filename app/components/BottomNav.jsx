import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const tabs = [{ icon: 'HOME', label: 'Home' }, { icon: 'LIST', label: 'Checklist' }, { icon: 'SET', label: 'Settings' }];
export function BottomNav({ index, onChange }) { return <View style={styles.nav}>{tabs.map((tab, tabIndex) => <Pressable key={tab.label} style={styles.tab} onPress={() => onChange(tabIndex)}><Text style={[styles.icon, index === tabIndex && styles.active]}>{tab.icon}</Text><Text style={[styles.label, index === tabIndex && styles.active]}>{tab.label}</Text>{index === tabIndex && <View style={styles.dot}/>}</Pressable>)}</View>; }
const styles = StyleSheet.create({nav:{height:70,backgroundColor:'#FFF',borderTopWidth:1,borderColor:'#E2ECE6',flexDirection:'row',paddingTop:8},tab:{flex:1,alignItems:'center'},icon:{fontSize:9,letterSpacing:.3,fontWeight:'900',color:'#829087',height:22},label:{fontSize:10,fontWeight:'700',color:'#829087'},active:{color:'#177A50'},dot:{height:4,width:4,borderRadius:2,backgroundColor:'#177A50',marginTop:3}});
