// ✅ StatisticsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Appbar, Card, useTheme, Title, Subheading } from 'react-native-paper';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { fetchStatistics } from '../services/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Color palette
const COLORS = {
  primary: '#3F00FF',     // Mor-mavi geçişli güçlü vurgu
  secondary: '#0A3D91',   // Gece mavisi
  accent: '#4895EF',      // Canlı mavi
  success: '#2ECC71',     // Net yeşil (KOLAY)
  warning: '#FFC107',     // Sarı (ORTA)
  danger: '#D32F2F',      // Parlak kırmızı (ZOR)
  light: '#F8F9FA',
  dark: '#212121',
  gray: '#6C757D',
  white: '#FFFFFF',
  background: '#F4F6F8',
  card: '#FFFFFF',
  text: '#000000',         // Düz siyah yazılar için
  textSecondary: '#444444' // Orta koyulukta yazı
};


const StatisticsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchStatistics();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return (
    <View style={[styles.container, styles.centerContent]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
  
  if (error) return (
    <View style={[styles.container, styles.centerContent]}>
      <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.danger} style={styles.errorIcon} />
      <Text style={styles.errorText}>{error}</Text>
      <Button 
        mode="contained" 
        onPress={loadStats}
        style={styles.retryButton}
        labelStyle={styles.buttonLabel}
      >
        Try Again
      </Button>
    </View>
  );
  
  if (!stats) return (
    <View style={[styles.container, styles.centerContent]}>
      <MaterialCommunityIcons name="chart-box-outline" size={48} color={COLORS.gray} />
      <Text style={styles.noDataText}>istatistikler bulunamadı  </Text>
    </View>
  );

  const chartWidth = Dimensions.get('window').width - 32;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadStats}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }>
      <Appbar.Header theme={{ colors: { primary: COLORS.primary } }}>
        <Appbar.Content 
          title="istatistikler" 
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action 
          icon="refresh" 
          color={COLORS.white} 
          onPress={loadStats} 
        />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <MaterialCommunityIcons 
                name="chart-bar" 
                size={24} 
                color={COLORS.secondary} 
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{stats.total_texts}</Text>
              <Text style={styles.statLabel}>Toplam Tahmin</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content>
              <MaterialCommunityIcons 
                name="chart-line" 
                size={24} 
                color={COLORS.accent} 
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{(stats.average_score * 100).toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Ortalama Skor</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Okunabilirlik Dağılımı</Text>
            <PieChart
              data={Object.entries(stats.label_counts).map(([label, count]) => ({
                name: label,
                population: count,
                color: label === 'Easy' ? COLORS.success : COLORS.danger,
                legendFontColor: COLORS.text,
                legendFontSize: 12,
              }))}
              width={chartWidth - 32}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="24"
              absolute
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Karşılaştırma</Text>
            <BarChart
              data={{
                labels: Object.keys(stats.label_counts),
                datasets: [{
                  data: Object.values(stats.label_counts),
                  colors: [
                    (opacity = 1) => COLORS.success,
                    (opacity = 1) => COLORS.danger
                  ]
                }]
              }}
              width={chartWidth - 32}
              height={220}
              chartConfig={chartConfig}
              fromZero
              showBarTops={false}
              withInnerLines={false}
              withOuterLines={false}
              style={styles.barChart}
            />
          </Card.Content>
        </Card>

        {stats.last_analysis && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons 
                  name="clock-time-four-outline" 
                  size={20} 
                  color={COLORS.gray} 
                />
                <Text style={styles.infoText}>
                  Last analyzed: {new Date(stats.last_analysis).toLocaleString()}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: COLORS.white,
  backgroundGradientTo: COLORS.white,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(43, 45, 66, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(43, 45, 66, ${opacity})`,
  propsForLabels: {
    fontSize: 10,
  },
  barPercentage: 0.6,
  barRadius: 4,
  fillShadowGradient: COLORS.primary,
  fillShadowGradientOpacity: 1,
  style: {
    borderRadius: 8,
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#e9ecef',
    strokeDasharray: '0',
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: COLORS.primary,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerTitle: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    elevation: 2,
    backgroundColor: COLORS.card,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.card,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 16,
  },
  barChart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  infoCard: {
    borderRadius: 12,
    backgroundColor: COLORS.card,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  noDataText: {
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    elevation: 2,
  },
  buttonLabel: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default StatisticsScreen;
