import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Button, Input } from '../../components/common';
import { Room } from '../../types';
import { liveApi } from '../../services/api';
import { DeviceCreatePayload } from '../../services/api/backendTypes';

interface AddDeviceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rooms: Room[];
}

const DEVICE_TYPES = [
  { label: 'ESP32 Node', value: 'ESP32_NODE' },
  { label: 'Relay Module', value: 'RELAY_MODULE' },
  { label: 'Smart Power Socket', value: 'SMART_POWER_SOCKET' },
  { label: 'Current Sensor', value: 'CURRENT_SENSOR' },
  { label: 'Lighting Bank', value: 'LIGHTING_BANK' },
  { label: 'HVAC / Fan Controller', value: 'HVAC_FAN_CONTROLLER' },
];

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  visible,
  onClose,
  onSuccess,
  rooms,
}) => {
  const [name, setName] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [deviceType, setDeviceType] = useState('ESP32_NODE');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    rooms.length > 0 ? parseInt(rooms[0].id, 10) : null
  );
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [channels, setChannels] = useState<Array<{ label: string; controllable: boolean; safetyLocked: boolean }>>([
    { label: 'Main Relay 1', controllable: true, safetyLocked: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setHardwareId('');
    setDeviceType('ESP32_NODE');
    setSelectedRoomId(rooms.length > 0 ? parseInt(rooms[0].id, 10) : null);
    setMacAddress('');
    setIpAddress('');
    setChannels([{ label: 'Main Relay 1', controllable: true, safetyLocked: false }]);
    setErrorMsg(null);
  };

  const handleAddChannel = () => {
    if (channels.length >= 8) {
      Alert.alert('Channel Limit', 'Maximum 8 relay channels supported per hardware node.');
      return;
    }
    setChannels(prev => [
      ...prev,
      { label: `Relay ${prev.length + 1}`, controllable: true, safetyLocked: false },
    ]);
  };

  const handleRemoveChannel = (index: number) => {
    setChannels(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Device name is required.');
      return;
    }
    if (!hardwareId.trim()) {
      setErrorMsg('Unique Hardware ID is required (e.g. ESP32-CS-101-01).');
      return;
    }
    if (!selectedRoomId) {
      setErrorMsg('Please select an active room.');
      return;
    }

    const payload: DeviceCreatePayload = {
      name: name.trim(),
      hardware_id: hardwareId.trim().toUpperCase(),
      device_type: deviceType,
      room: selectedRoomId,
      mac_address: macAddress.trim() || undefined,
      ip_address: ipAddress.trim() || undefined,
      automation_enabled: true,
      channels: channels.map((ch, idx) => ({
        channel_index: idx + 1,
        label: ch.label || `Channel ${idx + 1}`,
        is_on: false,
        is_controllable: ch.controllable,
        safety_locked: ch.safetyLocked,
      })),
    };

    setLoading(true);
    try {
      await liveApi.registerDevice(payload);
      Alert.alert(
        'Device Registered',
        `Device "${payload.name}" has been registered into campus inventory.\n\nStatus will remain UNKNOWN/OFFLINE until the physical ESP32 node delivers its first genuine authenticated heartbeat.`
      );
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.data?.hardware_id
        ? Array.isArray(err.data.hardware_id)
          ? err.data.hardware_id[0]
          : err.data.hardware_id
        : err.message || 'Failed to register device.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Register IoT Device</Text>
              <Text style={styles.headerSub}>Campus Hardware Provisioning</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Input
              label="Device Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. ESP32 Node CS-101 Main"
            />

            <Input
              label="Unique Hardware ID *"
              value={hardwareId}
              onChangeText={setHardwareId}
              autoCapitalize="characters"
              placeholder="e.g. ESP32-CS-101-01"
            />

            {/* Device Type Select */}
            <Text style={styles.fieldLabel}>Device Type *</Text>
            <View style={styles.typeWrap}>
              {DEVICE_TYPES.map(dt => {
                const isSelected = deviceType === dt.value;
                return (
                  <TouchableOpacity
                    key={dt.value}
                    style={[styles.typeChip, isSelected && styles.typeChipActive]}
                    onPress={() => setDeviceType(dt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                      {dt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Room Assignment */}
            <Text style={styles.fieldLabel}>Room Assignment *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroll}>
              {rooms.map(r => {
                const isSelected = selectedRoomId === parseInt(r.id, 10);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.roomChip, isSelected && styles.roomChipActive]}
                    onPress={() => setSelectedRoomId(parseInt(r.id, 10))}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.roomChipText, isSelected && styles.roomChipTextActive]}>
                      {r.roomNumber} - {r.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Input
              label="MAC Address (Optional)"
              value={macAddress}
              onChangeText={setMacAddress}
              autoCapitalize="characters"
              placeholder="24:6F:28:AB:CD:01"
            />

            <Input
              label="Static IP (Optional)"
              value={ipAddress}
              onChangeText={setIpAddress}
              placeholder="192.168.1.101"
              keyboardType="numeric"
            />

            {/* Relay Channels */}
            <View style={styles.channelHeader}>
              <Text style={styles.fieldLabel}>Relay Channels ({channels.length})</Text>
              <TouchableOpacity onPress={handleAddChannel} style={styles.addChannelBtn} activeOpacity={0.7}>
                <Plus size={14} color={Colors.primary} />
                <Text style={styles.addChannelText}>Add Channel</Text>
              </TouchableOpacity>
            </View>

            {channels.map((ch, idx) => (
              <View key={idx} style={styles.channelRow}>
                <View style={styles.channelBadge}>
                  <Text style={styles.channelBadgeText}>Ch #{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label=""
                    value={ch.label}
                    onChangeText={txt => {
                      const updated = [...channels];
                      updated[idx].label = txt;
                      setChannels(updated);
                    }}
                    placeholder={`Relay ${idx + 1} Label`}
                  />
                </View>
                {channels.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveChannel(idx)}
                    style={styles.delBtn}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={Colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                Hardware security tokens and communication keys are hashed and managed out-of-band via MQTT provisioning.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Button
              title="Register Device"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 34, 56, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.card,
    borderTopRightRadius: BorderRadius.card,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
  headerSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 500,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  fieldLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
  },
  typeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    minHeight: 36,
    justifyContent: 'center',
  },
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  typeChipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  typeChipTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  roomScroll: {
    marginBottom: Spacing.md,
  },
  roomChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    marginRight: Spacing.xs,
    minHeight: 36,
    justifyContent: 'center',
  },
  roomChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roomChipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  roomChipTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addChannelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 48,
    paddingHorizontal: 8,
  },
  addChannelText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  channelBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  channelBadgeText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
  delBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBanner: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  infoText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
  },
  submitBtn: {
    flex: 2,
    minHeight: 48,
  },
});
