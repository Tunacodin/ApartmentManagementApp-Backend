import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';

const SurveyResultsScreen = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get('api/Admin/surveys');
      setSurveys(response.data.data);
    } catch (error) {
      console.error('Anket bilgileri çekilemedi:', error);
      Alert.alert('Hata', 'Anket bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSurveyResults = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.SURVEYS.GET_RESULTS);
      setSurveyResults(response.data.data);
    } catch (error) {
      console.error('Anket sonuçları çekilemedi:', error);
      Alert.alert('Hata', 'Anket sonuçları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportResults = async (surveyId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.SURVEYS.EXPORT_RESULTS(surveyId), {
        responseType: 'blob'
      });
      // Handle export logic
    } catch (error) {
      Alert.alert('Hata', 'Sonuçlar dışa aktarılırken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSurveys();
  };

  const calculateParticipationRate = (results) => {
    if (!results || !results.totalParticipants || !results.totalResidents) return 0;
    return ((results.totalParticipants / results.totalResidents) * 100).toFixed(1);
  };

  const renderQuestionResults = (question) => {
    if (!question.options) return null;

    const totalVotes = question.options.reduce((sum, option) => sum + option.votes, 0);

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
        {question.options.map((option, index) => {
          const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
          return (
            <View key={index} style={styles.optionContainer}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionText}>{option.text}</Text>
                <Text style={styles.voteCount}>{option.votes} oy (%{percentage})</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { width: `${percentage}%` }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSurveyItem = ({ item }) => (
    <View style={styles.surveyItem}>
      <View style={styles.surveyHeader}>
        <Text style={styles.surveyTitle}>{item.title}</Text>
        <Text style={styles.surveyDate}>
          {new Date(item.endDate).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.surveyDetails}>
        <Text style={styles.detailText}>Durum: {
          new Date(item.endDate) < new Date() ? 'Tamamlandı' : 'Devam Ediyor'
        }</Text>
        {item.results && (
          <Text style={styles.detailText}>
            Katılım Oranı: %{calculateParticipationRate(item.results)}
          </Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => {
          if (selectedSurvey === item.id) {
            setSelectedSurvey(null);
          } else {
            fetchSurveyResults(item.id);
          }
        }}
      >
        <Text style={styles.viewButtonText}>
          {selectedSurvey === item.id ? 'Sonuçları Gizle' : 'Sonuçları Göster'}
        </Text>
      </TouchableOpacity>

      {selectedSurvey === item.id && item.results && (
        <View style={styles.resultsContainer}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Toplam Katılımcı</Text>
              <Text style={styles.summaryValue}>{item.results.totalParticipants}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Toplam Soru</Text>
              <Text style={styles.summaryValue}>{item.results.questions.length}</Text>
            </View>
          </View>

          {item.results.questions.map((question, index) => (
            <View key={index}>
              {renderQuestionResults(question)}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Anket Sonuçları</Text>
      </View>

      <FlatList
        data={surveys}
        renderItem={renderSurveyItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
  },
  surveyItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  surveyDate: {
    fontSize: 14,
    color: '#666',
  },
  surveyDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  viewButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionContainer: {
    marginBottom: 10,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  voteCount: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
});

export default SurveyResultsScreen;
