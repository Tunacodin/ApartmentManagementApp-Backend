import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_ENDPOINTS } from '../config/apiConfig';
import axios from 'axios';

const CreateSurveyScreen = ({ navigation, route }) => {
  const { adminId, token } = route.params;
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      questionType: 'MultipleChoice',
      isRequired: true,
      options: ['']
    }
  ]);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.ADMIN.BUILDINGS(adminId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setBuildings(response.data.data);
      }
    } catch (error) {
      console.error('Bina yükleme hatası:', error);
      Alert.alert('Hata', 'Binalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'MultipleChoice',
        isRequired: true,
        options: ['']
      }
    ]);
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (text, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].questionText = text;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (text, questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = text;
    setQuestions(updatedQuestions);
  };

  const handleBuildingToggle = (buildingId) => {
    if (selectedBuildings.includes(buildingId)) {
      setSelectedBuildings(selectedBuildings.filter(id => id !== buildingId));
    } else {
      setSelectedBuildings([...selectedBuildings, buildingId]);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen anket başlığını girin.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Hata', 'Lütfen anket açıklamasını girin.');
      return false;
    }
    if (selectedBuildings.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir bina seçin.');
      return false;
    }
    if (startDate >= endDate) {
      Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
      return false;
    }
    for (const question of questions) {
      if (!question.questionText.trim()) {
        Alert.alert('Hata', 'Lütfen tüm soruları doldurun.');
        return false;
      }
      const validOptions = question.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        Alert.alert('Hata', 'Her soru için en az 2 seçenek girin.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const cleanedQuestions = questions.map(q => ({
        questionText: q.questionText.trim(),
        questionType: 0, // MultipleChoice için 0
        isRequired: q.isRequired,
        options: q.options.filter(opt => opt.trim() !== '')
      }));

      const surveyData = {
        title: title.trim(),
        description: description.trim(),
        startDate: startDate.toISOString().split('T')[0], // Sadece tarih kısmını al
        endDate: endDate.toISOString().split('T')[0], // Sadece tarih kısmını al
        buildingIds: selectedBuildings,
        questions: cleanedQuestions
      };

      // Detaylı log
      console.log('Anket verisi detayları:');
      console.log('Başlık:', surveyData.title);
      console.log('Açıklama:', surveyData.description);
      console.log('Başlangıç Tarihi:', surveyData.startDate);
      console.log('Bitiş Tarihi:', surveyData.endDate);
      console.log('Seçili Binalar:', surveyData.buildingIds);
      console.log('Sorular:', JSON.stringify(surveyData.questions, null, 2));

      const response = await axios.post(
        `${API_ENDPOINTS.SURVEY.BASE}?adminId=${adminId}`,
        surveyData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'Anket başarıyla oluşturuldu.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Hata', response.data.message || 'Anket oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Anket oluşturma hatası:', error);
      console.error('Hata detayı:', error.response?.data);
      console.error('Hata durumu:', error.response?.status);
      console.error('Hata mesajı:', error.response?.data?.message);
      console.error('Validation hataları:', error.response?.data?.errors);
      Alert.alert(
        'Hata', 
        `Anket oluşturulurken bir hata oluştu: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Yeni Anket Oluştur</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Anket Başlığı</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Anket başlığını girin"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Anket açıklamasını girin"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text>Başlangıç Tarihi: {startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text>Bitiş Tarihi: {endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}
      </View>

      <View style={styles.buildingsContainer}>
        <Text style={styles.label}>Binalar</Text>
        {buildings.map((building) => (
          <TouchableOpacity
            key={building.id}
            style={[
              styles.buildingItem,
              selectedBuildings.includes(building.id) && styles.selectedBuilding,
            ]}
            onPress={() => handleBuildingToggle(building.id)}
          >
            <Text>{building.buildingName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.questionsContainer}>
        <Text style={styles.label}>Sorular</Text>
        {questions.map((question, questionIndex) => (
          <View key={questionIndex} style={styles.questionContainer}>
            <TextInput
              style={styles.input}
              value={question.questionText}
              onChangeText={(text) => handleQuestionChange(text, questionIndex)}
              placeholder={`Soru ${questionIndex + 1}`}
            />
            {question.options.map((option, optionIndex) => (
              <TextInput
                key={optionIndex}
                style={styles.optionInput}
                value={option}
                onChangeText={(text) =>
                  handleOptionChange(text, questionIndex, optionIndex)
                }
                placeholder={`Seçenek ${optionIndex + 1}`}
              />
            ))}
            <TouchableOpacity
              style={styles.addOptionButton}
              onPress={() => handleAddOption(questionIndex)}
            >
              <Text style={styles.buttonText}>Seçenek Ekle</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addQuestionButton}
          onPress={handleAddQuestion}
        >
          <Text style={styles.buttonText}>Soru Ekle</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Oluşturuluyor...' : 'Anketi Oluştur'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2196f3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  buildingsContainer: {
    marginBottom: 16,
  },
  buildingItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedBuilding: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  questionsContainer: {
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  optionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  addOptionButton: {
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  addQuestionButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    opacity: 1,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateSurveyScreen; 