import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  ActivityIndicator, 
  Card, 
  Text, 
  Button, 
  useTheme,
  Appbar,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { fetchHistory, clearHistory } from '../services/apiService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';


function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const exportHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${api.defaults.baseURL}/history/export`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
  
      const csvText = await response.text();
      const fileUri = `${FileSystem.documentDirectory}history.csv`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvText, {
        encoding: FileSystem.EncodingType.UTF8,
      });
  
      // Dosyayı paylaş
      await Sharing.shareAsync(fileUri);
      
    } catch (err) {
      console.error('Export Error:', err);
    }
  };
  
  const loadHistory = useCallback(async () => {
    try {
      setError('');
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history. Please try again.');
      if (err.response?.status === 401) {
        navigation.navigate('Login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, [loadHistory]);

  const clearUserHistory = async () => {
    try {
      setLoading(true);
      await clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear history.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
      return () => {};
    }, [loadHistory])
  );

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Okunabilirlik Skoru:</Text>
            <Text style={[styles.scoreValue, { color: getReadabilityColor(item.score) }]}>
              {(item.score * 100).toFixed(1)}%
            </Text>
          </View>
          <Text style={[styles.label, { backgroundColor: getLabelColor(item.label), color: '#fff' }]}>
            {item.label}
          </Text>
        </View>
        <Text style={styles.originalText} numberOfLines={5}>{item.text}</Text>
        {item.simplified && (
          <View style={styles.simplifiedContainer}>
            <Text style={styles.simplifiedText} numberOfLines={3}>{item.simplified}</Text>
          </View>
        )}
        <Text style={styles.date}>{new Date(item.timestamp).toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );

  const getReadabilityColor = (score) => {
    if (score >= 0.7) return '#4CAF50';
    if (score >= 0.4) return '#FFC107';
    return '#F44336';
  };

  const getLabelColor = (label) => {
    const colors = {
      EASY: '#4CAF50',
      MEDIUM: '#FFC107',
      HARD: '#F44336',
    };
    return colors[label.toUpperCase()] || '#757575';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Geçmiş" />
        <Appbar.Action icon="refresh" onPress={onRefresh} disabled={refreshing} />
        <Appbar.Action icon="trash-can-outline" onPress={clearUserHistory} />
        <Appbar.Action icon="download" onPress={exportHistory} />
      </Appbar.Header>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadHistory}>Tekrar Dene</Button>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Geçmiş bulunamadı</Text>
          <Button mode="contained" onPress={() => navigation.navigate('Predict')}>Metin Analizi Yap</Button>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA' // Açık nötr zemin
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 16,
    paddingBottom: 24
  },
  card: {
    borderRadius: 10,
    marginBottom: 14,
    elevation: 3,
    backgroundColor: '#FFFFFF'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scoreLabel: {
    fontSize: 15,
    color: '#444',
    marginRight: 6,
    fontWeight: '500'
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  label: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  simplifiedContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    padding: 12,
    marginTop: 8
  },
  simplifiedText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#000000'
  },
  originalText: {
    fontSize: 15,
    color: '#1C1C1E',
    marginTop: 6,
    marginBottom: 6,
    fontWeight: '500'
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'right'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16
  },
  divider: {
    height: 10,
    backgroundColor: 'transparent'
  }
});


export default HistoryScreen;
