import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api, API_ENDPOINTS } from '../../../config/apiConfig';
import { getCurrentUserId } from '../../../config/apiConfig';
import { Surface, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

const ActivityCard = ({ title, description, date, icon, gradient, status, amount, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
    <Surface style={styles.card} elevation={0}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={24} color="#fff" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              {status && (
                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                  <Text style={styles.statusText}>{status.text}</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.cardDescription}>{description}</Text>
          
          {amount && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Tutar</Text>
              <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
            </View>
          )}
          
          <View style={styles.cardFooter}>
            <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.dateText}>
              {new Date(date).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  </TouchableOpacity>
);

const EmptyStateCard = ({ title, icon, gradient }) => (
  <Surface style={styles.emptyCard} elevation={0}>
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.emptyCardGradient}
    >
      <View style={styles.emptyCardContent}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name={icon} size={32} color="rgba(255, 255, 255, 0.8)" />
        </View>
        <Text style={styles.emptyCardText}>{title}</Text>
      </View>
    </LinearGradient>
  </Surface>
);

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'Payment':
        return 'cash';
      case 'Complaint':
        return 'alert-circle';
      default:
        return 'information';
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'Ödendi':
      case 'Çözüldü':
        return ['#4CAF50', '#45a049'];
      case 'Bekliyor':
        return ['#FFC107', '#FFA000'];
      default:
        return ['#64748B', '#64748B'];
    }
  };

  return (
    <LinearGradient
      colors={getStatusGradient(activity.status)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.activityCard}
    >
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <View style={styles.activityIconContainer}>
            <Ionicons name={getActivityIcon(activity.type)} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.activityTitleContainer}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDate}>
              {new Date(activity.date).toLocaleDateString('tr-TR')}
            </Text>
          </View>
          <View style={styles.activityStatus}>
            <Text style={styles.statusText}>{activity.status}</Text>
          </View>
        </View>
        <View style={styles.activityDetails}>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          {activity.amount && (
            <Text style={styles.activityAmount}>
              {activity.amount.toLocaleString('tr-TR')} ₺
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const ActivitiesScreen = () => {
  const theme = useTheme();
  const [activitiesData, setActivitiesData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivitiesData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      console.log('Fetching activities for user:', userId);
      const response = await api.get(API_ENDPOINTS.TENANT.ACTIVITIES(userId));
      
      console.log('Activities response:', response.data);
      
      if (response.data.success) {
        setActivitiesData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activities data:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      if (error.response?.status === 400) {
        Alert.alert(
          'Veri Hatası',
          'Aktivite bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      }
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      console.log('Fetching payment history for user:', userId);
      const response = await api.get(API_ENDPOINTS.TENANT.GET_PAYMENTS(userId));
      
      console.log('Payment history response:', response.data);
      
      if (response.data.success) {
        setPaymentHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      if (error.response?.status === 400) {
        Alert.alert(
          'Veri Hatası',
          'Ödeme bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      }
    }
  };

  const handlePayment = async (payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPayment) return;

    if (!paymentForm.cardNumber || !paymentForm.cardHolderName || !paymentForm.expiryDate || !paymentForm.cvv) {
      Alert.alert('Hata', 'Lütfen tüm kart bilgilerini doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      const response = await api.post(
        API_ENDPOINTS.TENANT.MAKE_PAYMENT(userId),
        {
          paymentId: selectedPayment.id,
          amount: selectedPayment.totalAmount,
          ...paymentForm
        }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'Ödeme işlemi başarıyla tamamlandı.');
        setIsPaymentModalVisible(false);
        fetchPaymentHistory();
      }
    } catch (error) {
      console.error('Ödeme işlemi sırasında hata:', error);
      Alert.alert('Ödeme Hatası', 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesData();
    fetchPaymentHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchActivitiesData(), fetchPaymentHistory()])
      .finally(() => setRefreshing(false));
  };

  if (!activitiesData) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const renderPaymentModal = () => (
    <Modal
      visible={isPaymentModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsPaymentModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard} elevation={4}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ödeme Yap</Text>
              <TouchableOpacity
                onPress={() => setIsPaymentModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kart Numarası</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChangeText={(text) => setPaymentForm({...paymentForm, cardNumber: text.replace(/\D/g, '')})}
                  keyboardType="numeric"
                  maxLength={16}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kart Sahibi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  value={paymentForm.cardHolderName}
                  onChangeText={(text) => setPaymentForm({...paymentForm, cardHolderName: text})}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Son Kullanma Tarihi</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={paymentForm.expiryDate}
                    onChangeText={(text) => setPaymentForm({...paymentForm, expiryDate: text})}
                    maxLength={5}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChangeText={(text) => setPaymentForm({...paymentForm, cvv: text.replace(/\D/g, '')})}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handlePaymentSubmit}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Ödeniyor...' : `${formatCurrency(selectedPayment?.totalAmount)} Öde`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
      >
        {/* Payment History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cash-multiple" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Ödemeler</Text>
          </View>
          {paymentHistory.length > 0 ? (
            paymentHistory.map((payment) => (
              <ActivityCard
                key={payment.id}
                title={payment.description}
                description={`${payment.paymentType} - ${payment.isPaid ? 'Ödendi' : 'Bekliyor'}`}
                date={payment.paymentDate}
                icon="cash"
                gradient={payment.isPaid ? ['#4CAF50', '#45a049'] : ['#FFC107', '#FFA000']}
                status={{
                  text: payment.isPaid ? 'Ödendi' : 'Öde',
                  color: payment.isPaid ? '#4CAF50' : '#FFC107',
                }}
                amount={payment.totalAmount}
                onPress={() => handlePayment(payment)}
              />
            ))
          ) : (
            <EmptyStateCard
              title="Ödenmemiş ödeme bulunmuyor"
              icon="cash-outline"
              gradient={['#4CAF50', '#45a049']}
            />
          )}
        </View>

        {/* Meeting History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#6366F1" />
            <Text style={styles.sectionTitle}>Toplantılar</Text>
          </View>
          {activitiesData.meetingHistory.length > 0 ? (
            activitiesData.meetingHistory.map((meeting) => (
              <ActivityCard
                key={meeting.id}
                title={meeting.title}
                description={meeting.description}
                date={meeting.meetingDate}
                icon="calendar"
                gradient={['#2196F3', '#1976D2']}
              />
            ))
          ) : (
            <EmptyStateCard
              title="Henüz toplantı geçmişi bulunmuyor"
              icon="calendar-outline"
              gradient={['#2196F3', '#1976D2']}
            />
          )}
        </View>

        {/* Survey History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clipboard-text" size={24} color="#6366F1" />
            <Text style={styles.sectionTitle}>Anketler</Text>
          </View>
          {activitiesData.surveyHistory.length > 0 ? (
            activitiesData.surveyHistory.map((survey) => (
              <ActivityCard
                key={survey.id}
                title={survey.title}
                description={survey.description}
                date={survey.startDate}
                icon="clipboard"
                gradient={survey.isActive ? ['#9C27B0', '#7B1FA2'] : ['#757575', '#616161']}
                status={
                  survey.isActive
                    ? { text: 'Aktif', color: '#4CAF50' }
                    : { text: 'Tamamlandı', color: '#757575' }
                }
              />
            ))
          ) : (
            <EmptyStateCard
              title="Henüz anket geçmişi bulunmuyor"
              icon="clipboard-outline"
              gradient={['#9C27B0', '#7B1FA2']}
            />
          )}
        </View>

        {/* Complaint History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#6366F1" />
            <Text style={styles.sectionTitle}>Şikayetler</Text>
          </View>
          {activitiesData.complaintHistory.length > 0 ? (
            activitiesData.complaintHistory.map((complaint) => (
              <ActivityCard
                key={complaint.id}
                title={complaint.title}
                description={complaint.description}
                date={complaint.createdDate}
                icon="alert-circle"
                gradient={
                  complaint.isResolved
                    ? ['#4CAF50', '#45a049']
                    : complaint.isInProgress
                    ? ['#FFC107', '#FFA000']
                    : ['#FF5722', '#F4511E']
                }
                status={{
                  text: complaint.isResolved
                    ? 'Çözüldü'
                    : complaint.isInProgress
                    ? 'İşlemde'
                    : 'Bekliyor',
                  color: complaint.isResolved
                    ? '#4CAF50'
                    : complaint.isInProgress
                    ? '#FFC107'
                    : '#FF5722',
                }}
              />
            ))
          ) : (
            <EmptyStateCard
              title="Henüz şikayet geçmişi bulunmuyor"
              icon="alert-circle-outline"
              gradient={['#FF5722', '#F4511E']}
            />
          )}
        </View>
      </ScrollView>
      {renderPaymentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: 'System',
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardGradient: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    fontFamily: 'System',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontFamily: 'System',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'System',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 6,
    fontFamily: 'System',
  },
  emptyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  emptyCardGradient: {
    borderRadius: 16,
  },
  emptyCardContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyCardText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontFamily: 'System',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default ActivitiesScreen; 