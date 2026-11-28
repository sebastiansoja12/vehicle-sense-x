import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from './ui';
import { styles as s } from './theme';
export function MaintenanceModal({ title, busy, error, close, submit, children, label = 'Zapisz' }: PropsWithChildren<{ title: string; busy: boolean; error: string; close: () => void; submit: () => void; label?: string }>) {
  return <Modal visible transparent animationType="fade" onRequestClose={() => { if (!busy) close(); }}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalBackground}><View style={s.modal}>
    <View style={s.modalHeader}><Text accessibilityRole="header" style={[s.heading, { fontSize: 23, flex: 1 }]}>{title}</Text><Button label="Zamknij" secondary disabled={busy} onPress={close} /></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}><View pointerEvents={busy ? 'none' : 'auto'}>{children}</View>{error !== '' && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}<Button label={busy ? 'Zapisywanie…' : label} disabled={busy} onPress={submit} /></ScrollView>
  </View></KeyboardAvoidingView></Modal>;
}
export function MaintenanceField({ label, value, change, numeric = false, multiline = false, maxLength = 100 }: { label: string; value: string; change: (value: string) => void; numeric?: boolean; multiline?: boolean; maxLength?: number }) {
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={change} keyboardType={numeric ? 'decimal-pad' : 'default'} autoCapitalize="none" autoCorrect={false} multiline={multiline} maxLength={maxLength} style={[s.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]} /></View>;
}
