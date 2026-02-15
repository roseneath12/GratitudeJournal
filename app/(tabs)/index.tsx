import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [gratitudes, setGratitudes] = useState(['', '', '']);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const getTodayKey = () => {
    const today = new Date();
    return `gratitude_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
  };

  const loadTodayEntry = async () => {
    try {
      const todayKey = getTodayKey();
      const saved = await AsyncStorage.getItem(todayKey);
      if (saved) {
        setGratitudes(JSON.parse(saved));
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  const saveEntry = async () => {
    // Check if at least one gratitude is filled
    const hasContent = gratitudes.some(g => g.trim().length > 0);
    
    if (!hasContent) {
      Alert.alert('Empty Entry', 'Please write at least one thing you\'re grateful for today! 💛');
      return;
    }

    try {
      const todayKey = getTodayKey();
      await AsyncStorage.setItem(todayKey, JSON.stringify(gratitudes));
      setIsSaved(true);
      Alert.alert('Saved! ✨', 'Your gratitude entry has been saved. Keep shining! 🌟');
    } catch (error) {
      Alert.alert('Error', 'Could not save your entry. Please try again.');
      console.error('Error saving entry:', error);
    }
  };

  const updateGratitude = (index: number, text: string) => {
    const newGratitudes = [...gratitudes];
    newGratitudes[index] = text;
    setGratitudes(newGratitudes);
    if (isSaved) setIsSaved(false);
  };

  const getTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🌅</Text>
          <Text style={styles.title}>Today was good because...</Text>
          <Text style={styles.date}>{getTodayDate()}</Text>
        </View>

        <View style={styles.gratitudeContainer}>
          <Text style={styles.prompt}>
            What are 3 things that made today special? 💛
          </Text>

          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.inputWrapper}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={`Something that made you smile...`}
                placeholderTextColor="#B8A991"
                value={gratitudes[index]}
                onChangeText={(text) => updateGratitude(index, text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaved && styles.savedButton]} 
          onPress={saveEntry}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isSaved ? '✓ Saved' : 'Save Today\'s Gratitude ✨'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Gratitude turns what we have into enough" 🌟
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D97757',
    textAlign: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
  },
  gratitudeContainer: {
    marginBottom: 24,
  },
  prompt: {
    fontSize: 18,
    color: '#8B7355',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD4A3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 12,
  },
  numberText: {
    color: '#D97757',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#5A4A3A',
    minHeight: 80,
    borderWidth: 2,
    borderColor: '#FFE4B5',
    shadowColor: '#D97757',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#E89A71',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#D97757',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  savedButton: {
    backgroundColor: '#87C4A5',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#B8A991',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});