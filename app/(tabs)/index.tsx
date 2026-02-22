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
                placeholderTextColor="#9e8f93"
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
    backgroundColor: '#0f0d0e',
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
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ff4785',
    textAlign: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 20,
    color: '#9e8f93',
    textAlign: 'center',
  },
  gratitudeContainer: {
    marginBottom: 24,
  },
  prompt: {
    fontSize: 22,
    color: '#9e8f93',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2e2628',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 12,
  },
  numberText: {
    color: '#ff4785',
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e1a1b',
    borderRadius: 16,
    padding: 16,
    fontSize: 20,
    color: '#f5f0f2',
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#2e2628',
    shadowColor: '#ff4785',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#ff4785',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#ff4785',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  savedButton: {
    backgroundColor: '#ffab21',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 18,
    color: '#9e8f93',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});