import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface GratitudeEntry {
  date: string;
  gratitudes: string[];
  dateObj: Date;
}

export default function ExploreScreen() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<GratitudeEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadAllEntries();
  }, []);

  // Reload entries when screen comes into focus (when user navigates to this tab)
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllEntries();
    }, 1000); // Check every second when on this screen

    return () => clearInterval(interval);
  }, []);

  const loadAllEntries = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const gratitudeKeys = keys.filter(key => key.startsWith('gratitude_'));
      
      const allEntries = await Promise.all(
        gratitudeKeys.map(async (key) => {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            // Parse the key to get date: gratitude_YYYY_M_D
            const parts = key.split('_');
            const year = parseInt(parts[1]);
            const month = parseInt(parts[2]) - 1; // JS months are 0-indexed
            const day = parseInt(parts[3]);
            const dateObj = new Date(year, month, day);
            
            return {
              date: dateObj.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              gratitudes: JSON.parse(value),
              dateObj,
            };
          }
          return null;
        })
      );

      // Filter out null entries and sort by date (most recent first)
      const validEntries = allEntries
        .filter((entry): entry is GratitudeEntry => entry !== null)
        .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

      setEntries(validEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const openEntry = (entry: GratitudeEntry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEntry(null);
  };

  const getEmoji = (index: number) => {
    const emojis = ['🌟', '💛', '✨', '🌸', '🌈', '☀️', '🦋', '🌺'];
    return emojis[index % emojis.length];
  };

  const renderEntry = ({ item, index }: { item: GratitudeEntry; index: number }) => {
    const hasContent = item.gratitudes.some(g => g.trim().length > 0);
    if (!hasContent) return null;

    return (
      <TouchableOpacity 
        style={styles.entryCard} 
        onPress={() => openEntry(item)}
        activeOpacity={0.7}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryEmoji}>{getEmoji(index)}</Text>
          <View style={styles.entryHeaderText}>
            <Text style={styles.entryDate}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.previewContainer}>
          {item.gratitudes.map((gratitude, idx) => {
            if (!gratitude.trim()) return null;
            return (
              <Text key={idx} style={styles.previewText} numberOfLines={1}>
                {idx + 1}. {gratitude}
              </Text>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📖</Text>
        <Text style={styles.title}>Your Gratitude Journey</Text>
        <Text style={styles.subtitle}>
          {entries.length} {entries.length === 1 ? 'beautiful moment' : 'beautiful moments'} recorded ✨
        </Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyText}>
            Start your gratitude journey today!
          </Text>
          <Text style={styles.emptySubtext}>
            Go to the Home tab and write what made today special
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>✨</Text>
              <Text style={styles.modalDate}>{selectedEntry?.date}</Text>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalPrompt}>Today was good because...</Text>
              {selectedEntry?.gratitudes.map((gratitude, index) => {
                if (!gratitude.trim()) return null;
                return (
                  <View key={index} style={styles.gratitudeItem}>
                    <View style={styles.gratitudeNumber}>
                      <Text style={styles.gratitudeNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.gratitudeText}>{gratitude}</Text>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFE4B5',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D97757',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7355',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D97757',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE4B5',
    shadowColor: '#D97757',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  entryHeaderText: {
    flex: 1,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97757',
  },
  previewContainer: {
    gap: 6,
  },
  previewText: {
    fontSize: 14,
    color: '#5A4A3A',
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF8E7',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 3,
    borderColor: '#FFD4A3',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97757',
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 20,
    textAlign: 'center',
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFE4B5',
  },
  gratitudeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD4A3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gratitudeNumberText: {
    color: '#D97757',
    fontSize: 14,
    fontWeight: '700',
  },
  gratitudeText: {
    flex: 1,
    fontSize: 16,
    color: '#5A4A3A',
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#E89A71',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
