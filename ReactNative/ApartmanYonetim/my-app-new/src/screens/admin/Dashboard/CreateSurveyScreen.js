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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_ENDPOINTS, getCurrentAdminId, api } from '../../../config/apiConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, Colors, Gradients } from '../../../constants';

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
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const adminId = await getCurrentAdminId();
      console.log('Fetching buildings for adminId:', adminId);
      
      const response = await api.get(API_ENDPOINTS.ADMIN.BUILDINGS(adminId));
      console.log('Buildings response:', response.data);
      
      if (response.data.success) {
        const buildingsData = response.data.data.map(building => ({
          id: building.buildingId,
          name: building.buildingName
        }));
        console.log('Processed buildings data:', buildingsData);
        setBuildings(buildingsData);
      } else {
        console.error('API response not successful:', response.data);
        Alert.alert('Hata', 'Bina verileri alınamadı.');
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      Alert.alert('Hata', 'Binalar yüklenirken bir hata oluştu.');
    }
  };

  const handleBuildingSelect = (buildingId) => {
    console.log('Selected building:', buildingId);
    setFormData(prev => ({
      ...prev,
      buildingIds: [buildingId]
    }));
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

  const validateForm = () => {
    const errors = {
      buildingIds: formData.buildingIds.length === 0,
      title: !formData.title.trim(),
      description: !formData.description.trim(),
      questions: formData.questions.length === 0
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      const adminId = await getCurrentAdminId();
      
      // Soruları temizle ve formatla
      const cleanedQuestions = formData.questions.map(q => ({
        questionText: q.questionText.trim(),
        questionType: 0, // MultipleChoice için 0
        isRequired: q.isRequired,
        options: q.options.filter(opt => opt.trim() !== '')
      }));

      const surveyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate.toISOString().split('T')[0], // Sadece tarih kısmını al
        endDate: formData.endDate.toISOString().split('T')[0], // Sadece tarih kısmını al
        buildingIds: formData.buildingIds,
        questions: cleanedQuestions
      };

      const endpoint = API_ENDPOINTS.SURVEY.CREATE(adminId);
      console.log('Survey endpoint:', endpoint);
      console.log('Submitting survey data:', surveyData);
      
      const response = await api.post(endpoint, surveyData);

      if (response.data.success) {
        Alert.alert('Başarılı', 'Anket başarıyla oluşturuldu.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error creating survey:', error);
      Alert.alert('Hata', 'Anket oluşturulurken bir hata oluştu.');
    }
  };

  const renderDatePicker = (show, value, onChange, label) => {
    if (Platform.OS === 'android') {
      return (
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => show(true)}
        >
          <Icon name="event" size={24} color="#2196f3" style={styles.dateIcon} />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabel}>{label}</Text>
            <Text style={styles.dateValue}>{value.toLocaleDateString('tr-TR')}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return show && (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onChange={onChange}
        minimumDate={new Date()}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={Gradients.normal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>Yeni Anket Oluştur</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Anket Başlığı</Text>
            <View style={[styles.inputWrapper, validationErrors.title && styles.errorInput]}>
              <Icon name="title" size={24} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Anket başlığını girin"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            {validationErrors.title && (
              <Text style={styles.errorText}>Anket başlığı zorunludur</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <View style={[styles.inputWrapper, validationErrors.description && styles.errorInput]}>
              <Icon name="description" size={24} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Anket açıklamasını girin"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
            {validationErrors.description && (
              <Text style={styles.errorText}>Açıklama zorunludur</Text>
            )}
          </View>

          <View style={styles.dateSection}>
            <Text style={styles.label}>Anket Tarihleri</Text>
            <View style={styles.dateContainer}>
              {renderDatePicker(
                setShowStartDatePicker,
                formData.startDate,
                (event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    setFormData(prev => ({ ...prev, startDate: selectedDate }));
                  }
                },
                'Başlangıç Tarihi'
              )}
              {renderDatePicker(
                setShowEndDatePicker,
                formData.endDate,
                (event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) {
                    setFormData(prev => ({ ...prev, endDate: selectedDate }));
                  }
                },
                'Bitiş Tarihi'
              )}
            </View>
          </View>

          <View style={styles.buildingsContainer}>
            <Text style={styles.label}>Bina Seçin</Text>
            <View style={styles.buildingsList}>
              {buildings.map((building) => (
                <TouchableOpacity
                  key={building.id}
                  style={[
                    styles.buildingItem,
                    formData.buildingIds.includes(building.id) && styles.selectedBuilding
                  ]}
                  onPress={() => handleBuildingSelect(building.id)}
                >
                  <LinearGradient
                    colors={formData.buildingIds.includes(building.id) ? Gradients.normal : ['#fff', '#fff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buildingGradient}
                  >
                    <Icon 
                      name="business" 
                      size={24} 
                      color={formData.buildingIds.includes(building.id) ? "#fff" : Colors.primary}
                      style={styles.buildingIcon}
                    />
                    <Text style={[
                      styles.buildingText,
                      formData.buildingIds.includes(building.id) && styles.selectedBuildingText
                    ]}>
                      {building.name}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            {validationErrors.buildingIds && (
              <Text style={styles.errorText}>Lütfen bir bina seçin</Text>
            )}
          </View>

          <View style={styles.questionsContainer}>
            <Text style={styles.label}>Sorular</Text>
            <View style={styles.questionForm}>
              <View style={styles.inputWrapper}>
                <Icon name="help-outline" size={24} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={currentQuestion.questionText}
                  onChangeText={(text) => setCurrentQuestion(prev => ({ ...prev, questionText: text }))}
                  placeholder="Soru metnini girin"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              
              {currentQuestion.questionType === 'MultipleChoice' && (
                <View style={styles.optionsContainer}>
                  {currentQuestion.options.map((option, index) => (
                    <View key={index} style={styles.optionInputWrapper}>
                      <Icon name="radio-button-unchecked" size={20} color={Colors.primary} style={styles.optionIcon} />
                      <TextInput
                        style={styles.optionInput}
                        value={option}
                        onChangeText={(text) => handleOptionChange(text, index)}
                        placeholder={`Seçenek ${index + 1}`}
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addOptionButton}
                    onPress={handleAddOption}
                  >
                    <LinearGradient
                      colors={Gradients.success}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Icon name="add-circle-outline" size={20} color="#fff" />
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
                  colors={Gradients.normal}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Icon name="add" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Soruyu Ekle</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {formData.questions.map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <View style={styles.questionHeader}>
                  <Icon name="help" size={20} color={Colors.primary} />
                  <Text style={styles.questionText}>{question.questionText}</Text>
                </View>
                {question.questionType === 'MultipleChoice' && (
                  <View style={styles.optionsList}>
                    {question.options.map((option, optIndex) => (
                      <View key={optIndex} style={styles.optionItem}>
                        <Icon name="radio-button-unchecked" size={16} color={Colors.primary} />
                        <Text style={styles.optionText}>{option}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
            {validationErrors.questions && (
              <Text style={styles.errorText}>En az bir soru eklemelisiniz</Text>
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={Gradients.normal}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Icon name="check-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>Anketi Oluştur</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.lato.bold,
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#000',
    paddingVertical: 12,
  },
  errorInput: {
    borderColor: Colors.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateSection: {
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: Fonts.lato.regular,
    color: '#666',
  },
  dateValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.medium,
    color: '#000',
  },
  buildingsContainer: {
    marginBottom: 20,
  },
  buildingsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buildingItem: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buildingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  buildingIcon: {
    marginRight: 8,
  },
  buildingText: {
    fontSize: 16,
    fontFamily: Fonts.lato.medium,
    color: '#000',
    flex: 1,
  },
  selectedBuildingText: {
    color: '#fff',
  },
  questionsContainer: {
    marginBottom: 20,
  },
  questionForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: Colors.text,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addOptionButton: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addQuestionButton: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  questionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    fontFamily: Fonts.lato.medium,
    color: '#000',
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
    color: '#666',
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 100,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
    zIndex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    marginLeft: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    marginTop: 4,
  },
});

export default CreateSurveyScreen;