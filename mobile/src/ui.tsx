import type { PropsWithChildren } from 'react';
import { Pressable,Text,View,ScrollView } from 'react-native';
import { styles as s,colors } from './theme';
export function Button({label,onPress,secondary=false,disabled=false}:{label:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){
 return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,(disabled||pressed)&&s.disabled]}><Text style={[s.buttonText,secondary&&s.secondaryText]}>{label}</Text></Pressable>;
}
export function Page({children}:PropsWithChildren){return <ScrollView style={s.fill} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">{children}</ScrollView>;}
export function Title({title,subtitle,action}:{title:string;subtitle?:string;action?:React.ReactNode}){return <View style={{marginBottom:5}}><View style={s.pageHeader}><Text accessibilityRole="header" style={s.heading}>{title}</Text>{action}</View>{subtitle&&<Text style={s.muted}>{subtitle}</Text>}</View>;}
export function Section({title,children,action}:PropsWithChildren<{title:string;action?:React.ReactNode}>){return <View style={s.section}><View style={s.between}><Text accessibilityRole="header" style={s.sectionTitle}>{title}</Text>{action}</View>{children}</View>;}
export function Empty({title,description,action}: {title:string;description:string;action?:React.ReactNode}){return <View style={s.empty}><Text style={s.sectionTitle}>{title}</Text><Text style={s.muted}>{description}</Text>{action}</View>;}
export function Stat({label,value,unit}:{label:string;value:string;unit?:string}){return <View style={s.stat}><Text style={s.fine}>{label}</Text><Text style={s.statValue}>{value}<Text style={s.statUnit}> {unit}</Text></Text></View>;}
export function Note({children}:PropsWithChildren){return <View style={s.notice}><Text style={[s.muted,{color:colors.ink}]}>{children}</Text></View>;}
export const number=(value:number,digits=0)=>new Intl.NumberFormat('pl-PL',{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
export const money=(cents:number)=>number(cents/100,2)+' zł';
export const displayDate=(day:string)=>new Intl.DateTimeFormat('pl-PL',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${day}T12:00:00`));
