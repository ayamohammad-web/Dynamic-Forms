import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@/hooks/useColors';
import type { FormFieldSchema } from '@/types';

interface DynamicFormFieldProps {
  field: FormFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

function DateField({
  field,
  value,
  onChange,
  colors,
  error,
}: {
  field: FormFieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
  colors: ReturnType<typeof useColors>;
  error?: string;
}) {
  return (
    <View>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? '#EF4444' : colors.border,
            color: colors.foreground,
            textAlign: 'right',
          },
        ]}
        value={typeof value === 'string' ? value : ''}
        onChangeText={onChange}
        placeholder={field.placeholder ?? 'YYYY-MM-DD'}
        placeholderTextColor={colors.mutedForeground}
        keyboardType="numeric"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function DropdownField({
  field,
  value,
  onChange,
  colors,
  error,
}: {
  field: FormFieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
  colors: ReturnType<typeof useColors>;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const selected = field.dropdownOptions?.find((o) => o.value === value);

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.input,
          styles.dropdownBtn,
          {
            backgroundColor: colors.card,
            borderColor: error ? '#EF4444' : colors.border,
          },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
        <Text
          style={[
            styles.dropdownText,
            { color: selected ? colors.foreground : colors.mutedForeground },
          ]}
        >
          {selected ? selected.label : (field.placeholder ?? 'اختر...')}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
          activeOpacity={1}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{field.label}</Text>
            <FlatList
              data={field.dropdownOptions ?? []}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    item.value === value && {
                      backgroundColor: colors.primary + '15',
                    },
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Ionicons
                    name={item.value === value ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={item.value === value ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: item.value === value ? colors.primary : colors.foreground },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function ImageField({
  field,
  value,
  onChange,
  colors,
}: {
  field: FormFieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const images: string[] = Array.isArray(value) ? (value as string[]) : [];

  const pickImage = async (useCamera: boolean) => {
    if (Platform.OS !== 'web') {
      const perm = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('الإذن مطلوب', 'يرجى السماح بالوصول للكاميرا أو معرض الصور');
        return;
      }
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: field.multiple ?? false,
          quality: 0.7,
        });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      onChange(field.multiple ? [...images, ...newUris] : [newUris[0]]);
    }
  };

  const removeImage = (uri: string) => {
    onChange(images.filter((img) => img !== uri));
  };

  return (
    <View>
      {/* Thumbnails */}
      {images.length > 0 && (
        <View style={styles.imageGrid}>
          {images.map((uri) => (
            <View key={uri} style={styles.thumbWrapper}>
              <Image source={{ uri }} style={styles.thumb} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(uri)}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.imageActions}>
        <TouchableOpacity
          style={[styles.imageBtn, { borderColor: colors.primary }]}
          onPress={() => pickImage(false)}
          activeOpacity={0.7}
        >
          <Ionicons name="images-outline" size={18} color={colors.primary} />
          <Text style={[styles.imageBtnText, { color: colors.primary }]}>من المعرض</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.imageBtn, { borderColor: colors.primary }]}
          onPress={() => pickImage(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-outline" size={18} color={colors.primary} />
          <Text style={[styles.imageBtnText, { color: colors.primary }]}>الكاميرا</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const colors = useColors();

  const inputStyle = {
    backgroundColor: colors.card,
    borderColor: error ? '#EF4444' : colors.border,
    color: colors.foreground,
    textAlign: 'right' as const,
  };

  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        {field.required && <Text style={styles.required}>*</Text>}
        <Text style={[styles.label, { color: colors.foreground }]}>{field.label}</Text>
      </View>

      {(field.type === 'text' || field.type === 'number' || field.type === 'phone') && (
        <>
          <TextInput
            style={[styles.input, inputStyle]}
            value={typeof value === 'string' ? value : value !== undefined ? String(value) : ''}
            onChangeText={onChange}
            placeholder={field.placeholder ?? ''}
            placeholderTextColor={colors.mutedForeground}
            keyboardType={
              field.type === 'number' ? 'numeric'
                : field.type === 'phone' ? 'phone-pad'
                : 'default'
            }
            maxLength={field.digits ?? field.maxLength}
            secureTextEntry={false}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </>
      )}

      {field.type === 'textarea' && (
        <>
          <TextInput
            style={[styles.input, styles.textarea, inputStyle]}
            value={typeof value === 'string' ? value : ''}
            onChangeText={onChange}
            placeholder={field.placeholder ?? ''}
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </>
      )}

      {field.type === 'date' && (
        <DateField field={field} value={value} onChange={onChange} colors={colors} error={error} />
      )}

      {field.type === 'dropdown' && (
        <DropdownField
          field={field}
          value={value}
          onChange={onChange}
          colors={colors}
          error={error}
        />
      )}

      {field.type === 'image' && (
        <ImageField field={field} value={value} onChange={onChange} colors={colors} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  textarea: {
    minHeight: 90,
    paddingTop: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    textAlign: 'right',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    borderRadius: 14,
    width: '100%',
    maxHeight: 400,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    textAlign: 'right',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  thumbWrapper: {
    position: 'relative',
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
  },
  imageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingVertical: 10,
  },
  imageBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});
