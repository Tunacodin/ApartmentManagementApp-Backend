import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_ENDPOINTS, getCurrentAdminId, api } from '../../../config/apiConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, Colors } from '../../../constants';

const CreateSurveyScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    buildingIds: [],
    questions: []
  });
  const [buildings, setBuildings] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'MultipleChoice',
    isRequired: true,
    options: ['']
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const adminId = await getCurrentAdminId();
      const response = await api.get(`${API_ENDPOINTS.ADMIN.BASE}/management/${adminId}`);
      
      if (response.data && response.data.success) {
        setBuildings(response.data.data.buildings || []);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      Alert.alert('Hata', 'Binalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBuildingSelection = (buildingId) => {
    setFormData(prev => {
      const currentBuildingIds = [...prev.buildingIds];
      const index = currentBuildingIds.indexOf(buildingId);
      
      if (index === -1) {
        currentBuildingIds.push(buildingId);
      } else {
        currentBuildingIds.splice(index, 1);
      }
      
      return { ...prev, buildingIds: currentBuildingIds };
    });
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      Alert.alert('Hata', 'Lütfen soru metnini girin.');
      return;
    }

    if (currentQuestion.questionType === 'MultipleChoice' && 
        currentQuestion.options.some(opt => !opt.trim())) {
      Alert.alert('Hata', 'Lütfen tüm seçenekleri doldurun.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, currentQuestion]
    }));

    setCurrentQuestion({
      questionText: '',
      questionType: 'MultipleChoice',
      isRequired: true,
      options: ['']
    });
  };

  const handleAddOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleOptionChange = (text, index) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? text : opt)
    }));
  };

  const handleSubmit = async () => {
    if (formData.buildingIds.length === 0 || !formData.title || !formData.description || formData.questions.length === 0) {
      Alert.alert('Uyarı', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      const adminId = await getCurrentAdminId();
      
      const cleanedQuestions = formData.questions.map(q => ({
        questionText: q.questionText.trim(),
        questionType: 0,
        isRequired: q.isRequired,
        options: q.options.filter(opt => opt.trim() !== '')
      }));

      const surveyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        buildingIds: formData.buildingIds,
        questions: cleanedQuestions
      };

      const response = await api.post(API_ENDPOINTS.SURVEY.CREATE(adminId), surveyData);

      if (response.data.success) {
        Alert.alert('Başarılı', response.data.message || 'Anket başarıyla oluşturuldu.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error creating survey:', error);
      Alert.alert('Hata', 'Anket oluşturulurken bir hata oluştu.');
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (loading) {
      return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
          </View>
      );
    }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Binalar</Text>
            <View style={styles.selectContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {buildings.map((building) => (
                  <TouchableOpacity
                    key={building.id}
                    style={[
                      styles.buildingItem,
                      formData.buildingIds.includes(building.id) && styles.selectedBuildingItem
                    ]}
                    onPress={() => toggleBuildingSelection(building.id)}
                  >
      <LinearGradient
                      colors={formData.buildingIds.includes(building.id) 
                        ? ['#6366F1', '#8B5CF6']
                        : ['#F1F5F9', '#E2E8F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
                      style={styles.buildingGradient}
      >
                      <View style={styles.buildingItemContent}>
                        <Icon 
                          name="office-building" 
                          size={24} 
                          color={formData.buildingIds.includes(building.id) ? '#FFFFFF' : '#6366F1'} 
                        />
                        <Text 
                          style={[
                            styles.buildingItemText,
                            { color: formData.buildingIds.includes(building.id) ? '#FFFFFF' : '#1E293B' }
                          ]}
                          numberOfLines={1}
                        >
                          {building.name}
                        </Text>
                      </View>
      </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Anket Başlığı</Text>
            <View style={styles.inputWrapper}>
              <Icon name="format-title" size={20} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Anket başlığını girin"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <View style={styles.inputWrapper}>
              <Icon name="text" size={20} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Anket açıklamasını girin"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

            <View style={styles.dateContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.label}>Başlangıç Tarihi</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.dateButtonGradient}
                >
                  <View style={styles.dateButtonContent}>
                    <Icon name="calendar-start" size={24} color="#FFFFFF" />
                    <Text style={styles.dateButtonText}>
                      {formatDate(formData.startDate)}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
          </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.label}>Bitiş Tarihi</Text>
                <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
                >
                  <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  style={styles.dateButtonGradient}
                  >
                  <View style={styles.dateButtonContent}>
                    <Icon name="calendar-end" size={24} color="#FFFFFF" />
                    <Text style={styles.dateButtonText}>
                      {formatDate(formData.endDate)}
                    </Text>
                  </View>
                  </LinearGradient>
                </TouchableOpacity>
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={formData.startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) {
                  setFormData(prev => ({ ...prev, startDate: selectedDate }));
                }
              }}
              minimumDate={new Date()}
              textColor="#FFFFFF"
              accentColor="#000000"
              themeVariant="dark"
              locale="tr-TR"
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={formData.endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) {
                  setFormData(prev => ({ ...prev, endDate: selectedDate }));
                }
              }}
              minimumDate={formData.startDate}
              textColor="#FFFFFF"
              accentColor="#000000"
              themeVariant="dark"
              locale="tr-TR"
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Soru Ekle</Text>
              <View style={styles.inputWrapper}>
              <Icon name="help-circle" size={20} color="#6366F1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={currentQuestion.questionText}
                  onChangeText={(text) => setCurrentQuestion(prev => ({ ...prev, questionText: text }))}
                  placeholder="Soru metnini girin"
                placeholderTextColor="#94A3B8"
                />
              </View>
              
              {currentQuestion.questionType === 'MultipleChoice' && (
                <View style={styles.optionsContainer}>
                  {currentQuestion.options.map((option, index) => (
                    <View key={index} style={styles.optionInputWrapper}>
                    <Icon name="circle-outline" size={20} color="#6366F1" style={styles.optionIcon} />
                      <TextInput
                        style={styles.optionInput}
                        value={option}
                        onChangeText={(text) => handleOptionChange(text, index)}
                        placeholder={`Seçenek ${index + 1}`}
                      placeholderTextColor="#94A3B8"
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addOptionButton}
                    onPress={handleAddOption}
                  >
                    <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                    <Icon name="plus" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Seçenek Ekle</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.addQuestionButton}
                onPress={handleAddQuestion}
              >
                <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                <Icon name="plus" size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Soruyu Ekle</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          {formData.questions.length > 0 && (
            <View style={styles.questionsList}>
              <Text style={styles.label}>Eklenen Sorular</Text>
            {formData.questions.map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <View style={styles.questionHeader}>
                    <Icon name="help-circle" size={20} color="#6366F1" />
                  <Text style={styles.questionText}>{question.questionText}</Text>
                </View>
                {question.questionType === 'MultipleChoice' && (
                  <View style={styles.optionsList}>
                    {question.options.map((option, optIndex) => (
                      <View key={optIndex} style={styles.optionItem}>
                          <Icon name="circle-outline" size={16} color="#6366F1" />
                        <Text style={styles.optionText}>{option}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
            </View>
            )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              <View style={styles.submitButtonContent}>
                <Text style={styles.submitButtonText}>Anketi Oluştur</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  formContainer: {
    borderRadius: 20,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    fontFamily: Fonts.lato.regular,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buildingItem: {
    width: 160,
    height: 80,
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedBuildingItem: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buildingGradient: {
    flex: 1,
    padding: 12,
  },
  buildingItemContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buildingItemText: {
    fontSize: 14,
    fontFamily: Fonts.lato.bold,
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateButtonGradient: {
    padding: 12,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#FFFFFF',
  },
  optionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  optionInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    padding: 12,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#000000',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
  },
  addOptionButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addQuestionButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    marginLeft: 8,
  },
  questionsList: {
    marginTop: 20,
  },
  questionItem: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    fontFamily: Fonts.lato.medium,
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  optionsList: {
    marginLeft: 28,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: '#64748B',
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
});

export default CreateSurveyScreen;