import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Surface, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Fonts, Colors } from '../../../constants';
import { API_ENDPOINTS, getCurrentUserId, api } from '../../../config/apiConfig';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../../styles/colors';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { BlurView } from 'expo-blur';

const PaymentBottomSheet = ({ visible, onClose, payment, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (!visible) {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setError('');
      setSuccess(false);
    }
  }, [visible]);

  if (!payment) return null;

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      
      const requestBody = {
        paymentMethod: 'CreditCard',
        cardNumber: cleanCardNumber,
        cardHolderName,
        expiryDate,
        cvv,
        amount: payment.totalAmount
      };

      console.log('Ödeme başlatılıyor...', {
        url: API_ENDPOINTS.TENANT.MAKE_PAYMENT(getCurrentUserId(), payment.id),
        body: requestBody
      });

      const response = await api.post(
        API_ENDPOINTS.TENANT.MAKE_PAYMENT(getCurrentUserId(), payment.id),
        requestBody
      );

      console.log('API Yanıtı:', response.data);

      if (response.data.success) {
        console.log('Ödeme başarılı:', response.data.data);
        setPaymentDetails(response.data.data);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setPaymentDetails(null);
          onSuccess();
          setCardNumber('');
          setCardHolderName('');
          setExpiryDate('');
          setCvv('');
        }, 2000);
      } else {
        console.log('Ödeme başarısız:', response.data.message);
        setError(response.data.message || 'Ödeme işlemi başarısız oldu');
      }
    } catch (error) {
      console.error('Ödeme hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 404) {
        setError('Ödeme bulunamadı');
      } else if (error.response?.status === 400) {
        setError('Yetersiz ödeme tutarı');
      } else {
        setError('Ödeme işlemi başarısız oldu');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.bottomSheet}>
                <View style={styles.bottomSheetHeader}>
                  <Text style={styles.bottomSheetTitle}>
                    {success ? 'Ödeme Başarılı' : 'Ödeme Yap'}
                  </Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#1F2937" />
                  </TouchableOpacity>
                </View>

                {success ? (
                  <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                      <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                    </View>
                    <Text style={styles.successTitle}>Ödeme Başarılı!</Text>
                    <View style={styles.paymentDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ödeme Tutarı:</Text>
                        <Text style={styles.detailValue}>{paymentDetails?.amount} TL</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ödeme Tipi:</Text>
                        <Text style={styles.detailValue}>
                          {paymentDetails?.paymentType === 'Rent' ? 'Kira' : 'Aidat'}
                        </Text>
                      </View>
                      {paymentDetails?.delayPenaltyAmount > 0 && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Gecikme Cezası:</Text>
                          <Text style={styles.detailValue}>{paymentDetails?.delayPenaltyAmount} TL</Text>
                        </View>
                      )}
                      <View style={[styles.detailRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Toplam Tutar:</Text>
                        <Text style={styles.totalValue}>{paymentDetails?.totalAmount} TL</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ödeme Tarihi:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(paymentDetails?.paymentDate).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                      {paymentDetails?.delayedDays > 0 && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Gecikme Günü:</Text>
                          <Text style={styles.detailValue}>{paymentDetails?.delayedDays} gün</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.paymentAmount}>
                      <Text style={styles.amountLabel}>Ödeme Tutarı</Text>
                      <Text style={styles.amountValue}>{payment.totalAmount} TL</Text>
                    </View>

                    <View style={styles.formContainer}>
                      <TextInput
                        label="Kart Üzerindeki İsim"
                        value={cardHolderName}
                        onChangeText={setCardHolderName}
                        mode="outlined"
                        style={styles.input}
                      />

                      <TextInput
                        label="Kart Numarası"
                        value={cardNumber}
                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                        mode="outlined"
                        keyboardType="numeric"
                        maxLength={19}
                        style={styles.input}
                      />

                      <View style={styles.row}>
                        <TextInput
                          label="Son Kullanma Tarihi"
                          value={expiryDate}
                          onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                          mode="outlined"
                          keyboardType="numeric"
                          maxLength={5}
                          style={[styles.input, styles.halfInput]}
                          placeholder="AA/YY"
                        />

                        <TextInput
                          label="CVV"
                          value={cvv}
                          onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 3))}
                          mode="outlined"
                          keyboardType="numeric"
                          maxLength={3}
                          style={[styles.input, styles.halfInput]}
                          secureTextEntry
                        />
                      </View>

                      {error ? (
                        <View style={styles.errorContainer}>
                          <Ionicons name="alert-circle" size={20} color="#EF4444" style={styles.errorIcon} />
                          <Text style={styles.errorText}>{error}</Text>
                        </View>
                      ) : null}

                      <Button
                        mode="contained"
                        onPress={handlePayment}
                        loading={loading}
                        disabled={loading}
                        style={styles.bottomSheetPayButton}
                        labelStyle={styles.bottomSheetPayButtonLabel}
                      >
                        Ödemeyi Tamamla
                      </Button>
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getPaymentStatus = (payment) => {
  const now = new Date();
  const dueDate = new Date(payment.dueDate);

  if (payment.isPaid) {
    return 'Ödendi';
  } else if (dueDate < now) {
    return 'Gecikmiş';
  } else {
    return 'Gelecek';
  }
};

const getStatusGradient = (status) => {
  switch (status) {
    case 'Ödendi':
      return ['#4CAF50', '#45a049']; // Yeşil
    case 'Gecikmiş':
      return ['#FF5252', '#FF1744']; // Kırmızı
    case 'Gelecek':
      return ['#2196F3', '#1976D2']; // Mavi
    default:
      return ['#6B7280', '#4B5563']; // Gri
  }
};

const PaymentsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'paid', 'overdue'
  const [payments, setPayments] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      console.log('Fetching payments for user:', userId);
      
      const [paymentsResponse, upcomingResponse] = await Promise.all([
        api.get(`/Tenant/${userId}/payments`),
        api.get(`/Tenant/${userId}/next-payments`)
      ]);

      console.log('Payments Response:', paymentsResponse.data);
      console.log('Upcoming Payments Response:', upcomingResponse.data);

      if (paymentsResponse.data?.data) {
        setPayments(paymentsResponse.data.data);
      }
      if (upcomingResponse.data?.data) {
        const formattedUpcomingPayments = upcomingResponse.data.data.map(payment => ({
          ...payment,
          paymentTypeTurkish: payment.paymentType === 'Rent' ? 'Kira' : 'Aidat',
          status: payment.isPaid ? 'Ödendi' : 'Bekliyor'
        }));
        setUpcomingPayments(formattedUpcomingPayments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      setError('Ödemeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getFilteredPayments = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return upcomingPayments;
      case 'paid':
        return payments.filter(p => p.isPaid);
      case 'overdue':
        return payments.filter(p => !p.isPaid && new Date(p.dueDate) < now);
      default:
        return [];
    }
  };

  const renderTabButton = (tab, label, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon 
        name={icon} 
        size={20} 
        color={activeTab === tab ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} 
      />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPaymentItem = ({ item }) => {
    const status = getPaymentStatus(item);
    const statusGradient = getStatusGradient(status);

    return (
      <TouchableOpacity
        style={styles.paymentCard}
        onPress={() => {
          if (!item.isPaid) {
            setSelectedPayment(item);
            setShowPaymentModal(true);
          }
        }}
      >
        <LinearGradient
          colors={statusGradient}
          style={styles.paymentCardGradient}
        >
          <View style={styles.paymentHeader}>
            <View style={styles.paymentTypeContainer}>
              <Icon 
                name={item.paymentType === 'Rent' ? 'home' : 'building'} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.paymentType}>
                {item.paymentTypeTurkish || (item.paymentType === 'Rent' ? 'Kira' : 'Aidat')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusGradient[1] }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Tutar</Text>
              <Text style={styles.amount}>{formatCurrency(item.totalAmount)}</Text>
              {item.delayPenaltyAmount > 0 && (
                <Text style={styles.penaltyText}>
                  Gecikme: {formatCurrency(item.delayPenaltyAmount)}
                </Text>
              )}
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Son Ödeme</Text>
              <Text style={styles.date}>{formatDate(item.dueDate)}</Text>
              {item.delayedDays > 0 && (
                <Text style={styles.delayText}>
                  {item.delayedDays} gün gecikme
                </Text>
              )}
            </View>
          </View>

          {!item.isPaid && (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => {
                setSelectedPayment(item);
                setShowPaymentModal(true);
              }}
            >
              <Text style={styles.payButtonText}>Ödeme Yap</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
      <View style={styles.tabContainer}>
        {renderTabButton('upcoming', 'Gelecek', 'calendar')}
        {renderTabButton('paid', 'Ödenen', 'check-circle')}
        {renderTabButton('overdue', 'Gecikmiş', 'exclamation-circle')}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-circle" size={40} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPayments}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getFilteredPayments()}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchPayments();
              }}
              colors={['#FFFFFF']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="receipt" size={40} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>
                {activeTab === 'paid' 
                  ? 'Henüz ödenmiş ödeme bulunmuyor'
                  : activeTab === 'overdue'
                  ? 'Gecikmiş ödeme bulunmuyor'
                  : 'Gelecek ödeme bulunmuyor'}
              </Text>
            </View>
          }
        />
      )}

      {/* Payment Modal */}
      <PaymentBottomSheet
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        payment={selectedPayment}
        onSuccess={fetchPayments}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Fonts.lato.bold,
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 15,
  },
  paymentCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentCardGradient: {
    padding: 15,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentType: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  payButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonLabel: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#FFFFFF',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: Fonts.lato.medium,
    flex: 1,
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  bottomSheet: {
    padding: 20,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Fonts.lato.bold,
  },
  closeButton: {
    padding: 4,
  },
  paymentAmount: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Fonts.lato.bold,
  },
  formContainer: {
    gap: 16,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 24,
    fontFamily: Fonts.lato.bold,
  },
  paymentCardDisabled: {
    opacity: 0.7,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  totalValue: {
    fontSize: 14,
    fontFamily: Fonts.lato.medium,
    color: '#FFFFFF',
  },
  penaltyText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  delayText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  bottomSheetPayButton: {
    marginTop: 16,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomSheetPayButtonLabel: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#FFFFFF',
  },
});

export default PaymentsScreen; 