import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { ProfileStackScreenProps } from '../../navigation/types';
import { UIStack, UIText, UIButton, UIIcon, UISpacer, UIHeader, UIEmptyState } from '../../components/ui';

type Props = ProfileStackScreenProps<'ImportantDates'>;

interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: 'BIRTHDAY' | 'ANNIVERSARY' | 'OTHER';
}

export default function ImportantDatesScreen({ navigation }: Props) {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState<'BIRTHDAY' | 'ANNIVERSARY' | 'OTHER'>('BIRTHDAY');

  const handleAddDate = () => {
    if (!newTitle.trim() || !newDate) return;

    const newImportantDate: ImportantDate = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      date: newDate,
      type: newType,
    };

    setDates([...dates, newImportantDate]);
    setNewTitle('');
    setNewDate('');
    setShowForm(false);
  };

  const handleRemoveDate = (id: string) => {
    setDates(dates.filter((d) => d.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BIRTHDAY':
        return 'gift.fill';
      case 'ANNIVERSARY':
        return 'heart.fill';
      default:
        return 'calendar';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BIRTHDAY':
        return '#e53e3e';
      case 'ANNIVERSARY':
        return '#d53f8c';
      default:
        return '#2c5282';
    }
  };

  const renderDateItem = ({ item }: { item: ImportantDate }) => (
    <View style={styles.dateCard}>
      <UIStack direction="horizontal" spacing={12} align="center">
        <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor(item.type)}15` }]}>
          <UIIcon
            name={getTypeIcon(item.type)}
            color={getTypeColor(item.type)}
            size={20}
          />
        </View>
        <UIStack spacing={2} style={{ flex: 1 }}>
          <UIText weight="medium">{item.title}</UIText>
          <UIText size="sm" color="#718096">
            {new Date(item.date).toLocaleDateString('en-QA', {
              month: 'long',
              day: 'numeric',
            })}
          </UIText>
        </UIStack>
        <UIButton variant="plain" onPress={() => handleRemoveDate(item.id)}>
          <UIText color="#e53e3e" size="sm">Remove</UIText>
        </UIButton>
      </UIStack>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UIEmptyState
        icon="calendar"
        title="No important dates"
        message="Add birthdays, anniversaries, and other special dates to get reminded"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <UIHeader
        title="Important Dates"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: 'Add',
          icon: 'plus',
          onPress: () => setShowForm(true),
        }}
      />

      {/* Add Form */}
      {showForm && (
        <View style={styles.formCard}>
          <UIText size="lg" weight="semibold">Add Important Date</UIText>

          <View style={styles.inputGroup}>
            <UIText size="sm" weight="medium" color="#4a5568">
              Title
            </UIText>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mom's Birthday"
              placeholderTextColor="#a0aec0"
              value={newTitle}
              onChangeText={setNewTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <UIText size="sm" weight="medium" color="#4a5568">
              Date
            </UIText>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#a0aec0"
              value={newDate}
              onChangeText={setNewDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <UIText size="sm" weight="medium" color="#4a5568">
              Type
            </UIText>
            <View style={styles.typeOptions}>
              {(['BIRTHDAY', 'ANNIVERSARY', 'OTHER'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newType === type && styles.typeOptionSelected,
                  ]}
                  onPress={() => setNewType(type)}
                >
                  <UIStack direction="horizontal" spacing={6} align="center">
                    <UIIcon
                      name={getTypeIcon(type)}
                      color={newType === type ? '#2c5282' : '#718096'}
                      size={16}
                    />
                    <UIText
                      size="xs"
                      weight="medium"
                      color={newType === type ? '#2c5282' : '#4a5568'}
                    >
                      {type}
                    </UIText>
                  </UIStack>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formButtons}>
            <UIStack direction="horizontal" spacing={12}>
              <View style={{ flex: 1 }}>
                <UIButton variant="secondary" onPress={() => setShowForm(false)}>
                  Cancel
                </UIButton>
              </View>
              <View style={{ flex: 1 }}>
                <UIButton
                  variant="primary"
                  disabled={!newTitle.trim() || !newDate}
                  onPress={handleAddDate}
                >
                  Save
                </UIButton>
              </View>
            </UIStack>
          </View>
        </View>
      )}

      <FlatList
        data={dates}
        keyExtractor={(item) => item.id}
        renderItem={renderDateItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!showForm ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  formCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  inputGroup: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a202c',
    marginTop: 8,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#ebf8ff',
    borderWidth: 1,
    borderColor: '#2c5282',
  },
  formButtons: {
    marginTop: 16,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  dateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
