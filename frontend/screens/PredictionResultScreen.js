import React from 'react';
import { View, StyleSheet, Share, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

function PredictionResultScreen({ navigation, route }) {
  const { prediction } = route.params;
  const theme = useTheme();
  console.log("📊 Prediction:", prediction);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Dyslexia App Analysis Result:\n\n` +
                 `Readability Score: ${(prediction.score * 100).toFixed(1)}%\n` +
                 `Difficulty Level: ${prediction.label}\n` +
                 `${prediction.simplified ? `\nSimplified Text:\n${prediction.simplified}` : ''}`,
        title: 'Dyslexia App Analysis'
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  const getReadabilityColor = (score) => {
    if (score >= 0.7) return '#4CAF50';
    if (score >= 0.4) return '#FFC107';
    return '#F44336';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <Title style={styles.title}>Analiz Sonuçları</Title>
              <IconButton
                icon="share-variant"
                size={24}
                onPress={handleShare}
                style={styles.shareButton}
              />
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Okunabilirlik Skoru:</Text>
              <Text 
                style={[
                  styles.scoreValue, 
                  { color: getReadabilityColor(prediction.score) }
                ]}
              >
                {(prediction.score * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Zorluk Seviyesi:</Text>
              <Text style={styles.infoValue}>{prediction.label}</Text>
            </View>

            {prediction.simplified && (
              <View style={styles.simplifiedContainer}>
                <Text style={styles.sectionTitle}>Sadeleştirilmiş Metin</Text>
                <View style={styles.simplifiedTextContainer}>
                  <Text style={styles.simplifiedText}>
                    {prediction.simplified}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
            icon="arrow-left"
            contentStyle={styles.buttonContent}
          >
            Başka bir metin analiz et
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA' // Açık ve yumuşak zemin
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 24,
    backgroundColor: '#FFFFFF'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000' // Keskin başlık rengi
  },
  shareButton: {
    margin: 0
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F00FF' // Mor mavi uyumlu skor rengi
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 12
  },
  infoLabel: {
    fontSize: 16,
    marginRight: 6,
    fontWeight: '500',
    color: '#444'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000'
  },
  easyLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16
  },
  difficultLabel: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 16
  },
  simplifiedContainer: {
    marginTop: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1C1C1E'
  },
  simplifiedTextContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#0A3D91'
  },
  simplifiedText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000000'
  },
  buttonContainer: {
    paddingHorizontal: 8
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#388E3C' // Daha koyu yeşil – daha profesyonel görünüm
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    padding: 8
  }
});



export default PredictionResultScreen;
