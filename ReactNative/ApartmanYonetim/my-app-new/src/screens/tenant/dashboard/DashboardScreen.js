import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api, API_ENDPOINTS, getCurrentUserId } from '../../../config/apiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { Surface, useTheme, FAB, Portal, Menu, TextInput, Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Fonts, Colors, Gradients } from '../../../constants';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PaymentBottomSheet = ({ visible, onClose, paymentId, amount, paymentType, description }) => {
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [currentMonthPayments, setCurrentMonthPayments] = useState([]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₺';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const fetchTenantData = async () => {
    try {
      const [tenantResponse, paymentsResponse] = await Promise.all([
        api.get(API_ENDPOINTS.TENANT.GET_DETAILS(getCurrentUserId())),
        api.get(API_ENDPOINTS.TENANT.GET_CURRENT_MONTH_PAYMENTS(getCurrentUserId()))
      ]);
      
      setCurrentMonthPayments(paymentsResponse.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post(
        API_ENDPOINTS.TENANT.MAKE_PAYMENT(getCurrentUserId(), paymentId),
        {
          paymentId,
          amount,
          paymentMethod: 'credit_card',
          cardNumber,
          expiryDate,
          cvv
        }
      );

      if (response.data.success) {
        setPaymentDetails(response.data.data);
        setSuccess(true);
        // Close after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setPaymentDetails(null);
          // Reset form
          setCardNumber('');
          setExpiryDate('');
          setCvv('');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ödeme işlemi başarısız oldu');
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

  const getPaymentDetails = () => {
    if (!currentMonthPayments) return { rent: 0, dues: 0 };
    
    const rentPayment = currentMonthPayments.find(p => p.paymentType === 'Rent' && !p.isPaid);
    const duesPayment = currentMonthPayments.find(p => p.paymentType === 'Dues' && !p.isPaid);
    
    return {
      rent: rentPayment ? rentPayment.totalAmount : 0,
      dues: duesPayment ? duesPayment.totalAmount : 0
    };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
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
                    <Text style={styles.detailValue}>{formatCurrency(paymentDetails?.amount)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ödeme Tarihi:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(paymentDetails?.paymentDate).toLocaleDateString('tr-TR')}
                    </Text>
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
                      <Text style={styles.detailValue}>{formatCurrency(paymentDetails?.delayPenaltyAmount)}</Text>
                    </View>
                  )}
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Toplam Tutar:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(paymentDetails?.totalAmount)}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.paymentAmount}>
                  <View style={styles.paymentBreakdown}>
                    <View style={styles.paymentRow}>
                      <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.paymentBox}
                      >
                        <View style={styles.paymentBoxContent}>
                          <View style={styles.paymentBoxHeader}>
                            <Ionicons name="home" size={20} color="#FFFFFF" />
                            <Text style={styles.paymentBoxTitle}>Kira</Text>
                          </View>
                          <Text style={styles.paymentBoxAmount}>
                            {formatCurrency(getPaymentDetails().rent)}
                          </Text>
                        </View>
                      </LinearGradient>

                      <LinearGradient
                        colors={['#8B5CF6', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.paymentBox}
                      >
                        <View style={styles.paymentBoxContent}>
                          <View style={styles.paymentBoxHeader}>
                            <Ionicons name="building" size={20} color="#FFFFFF" />
                            <Text style={styles.paymentBoxTitle}>Aidat</Text>
                          </View>
                          <Text style={styles.paymentBoxAmount}>
                            {formatCurrency(getPaymentDetails().dues)}
                          </Text>
                        </View>
                      </LinearGradient>
                    </View>

                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.paymentBox, styles.totalBox]}
                    >
                      <View style={styles.paymentBoxContent}>
                        <Text style={styles.totalBoxTitle}>Toplam</Text>
                        <Text style={styles.totalBoxAmount}>
                          {formatCurrency(getPaymentDetails().rent + getPaymentDetails().dues)}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.formContainer}>
                  <TextInput
                    label="Kart Üzerindeki İsim"
                    value={cardName}
                    onChangeText={setCardName}
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
                    <Text style={styles.errorText}>{error}</Text>
                  ) : null}

                  <Button
                    mode="contained"
                    onPress={handlePayment}
                    loading={loading}
                    disabled={loading}
                    style={styles.payButton}
                    labelStyle={styles.payButtonLabel}
                  >
                    Ödemeyi Tamamla
                  </Button>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const ComplaintBottomSheet = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post(
        API_ENDPOINTS.COMPLAINT.CREATE,
        {
          title: title.trim(),
          description: description.trim()
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Close after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
          // Reset form
          setTitle('');
          setDescription('');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Şikayet oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>
                {success ? 'Şikayet Gönderildi' : 'Şikayet Oluştur'}
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
                <Text style={styles.successTitle}>Şikayetiniz Başarıyla Gönderildi!</Text>
                <Text style={styles.successMessage}>
                  En kısa sürede değerlendirilecektir.
                </Text>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <TextInput
                  label="Şikayet Başlığı"
                  value={title}
                  onChangeText={setTitle}
                  mode="outlined"
                  style={styles.input}
                  maxLength={100}
                />

                <TextInput
                  label="Şikayet Açıklaması"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={[styles.input, styles.textArea]}
                  maxLength={500}
                />

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                  labelStyle={styles.submitButtonLabel}
                >
                  Şikayeti Gönder
                </Button>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const DashboardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [complaintSheetVisible, setComplaintSheetVisible] = useState(false);
  const [currentMonthPayments, setCurrentMonthPayments] = useState([]);

  const fetchTenantData = async () => {
    try {
      const [tenantResponse, paymentsResponse] = await Promise.all([
        api.get(API_ENDPOINTS.TENANT.GET_DETAILS(getCurrentUserId())),
        api.get(API_ENDPOINTS.TENANT.GET_CURRENT_MONTH_PAYMENTS(getCurrentUserId()))
      ]);
      
      setTenantData(tenantResponse.data.data);
      setCurrentMonthPayments(paymentsResponse.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenantData();
  };

  const toggleMenu = () => {
    const toValue = menuVisible ? 0 : 1;
    Animated.spring(rotateAnim, {
      toValue,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 50 && !showFab) {
      setShowFab(true);
    }
  };

  const handleMakePayment = () => {
    if (!currentMonthPayments || currentMonthPayments.length === 0) {
      Alert.alert(
        'Bilgi',
        'Bu ay için henüz ödeme bulunmuyor.',
        [{ text: 'Tamam', style: 'default' }]
      );
      return;
    }

    const unpaidPayments = currentMonthPayments.filter(payment => !payment.isPaid);
    if (unpaidPayments.length === 0) {
      Alert.alert(
        'Bilgi',
        'Bu ay için tüm ödemeleriniz yapılmış.',
        [{ text: 'Tamam', style: 'default' }]
      );
      return;
    }

    // İlk ödenmemiş ödemeyi seç
    const paymentToMake = unpaidPayments[0];
    setSelectedPayment({
      id: paymentToMake.id,
      amount: paymentToMake.totalAmount,
      paymentType: paymentToMake.paymentType,
      dueDate: paymentToMake.dueDate,
      description: paymentToMake.description
    });
    setPaymentSheetVisible(true);
    setMenuVisible(false);
  };

  const handleCreateComplaint = () => {
    setComplaintSheetVisible(true);
    setMenuVisible(false);
  };

  const getPaymentStatus = () => {
    if (!currentMonthPayments || currentMonthPayments.length === 0) {
      return { text: 'Ödeme Yok', color: '#6B7280', icon: 'calendar' };
    }

    const unpaidPayments = currentMonthPayments.filter(payment => !payment.isPaid);
    if (unpaidPayments.length === 0) {
      return { text: 'Ödemeler Tamamlandı', color: '#4CAF50', icon: 'checkmark-circle' };
    }

    return { text: 'Ödeme Yap', color: '#FF5252', icon: 'cash' };
  };

  const getTotalUnpaidAmount = () => {
    if (!currentMonthPayments) return 0;
    return currentMonthPayments
      .filter(payment => !payment.isPaid)
      .reduce((total, payment) => total + payment.totalAmount, 0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "Belirtilmemiş";
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₺';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Header */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          </View>
          <Surface style={styles.card} elevation={0}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.profileContent}>
                <Image
                  source={{ uri: tenantData?.profileImageUrl }}
                  style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{tenantData?.fullName}</Text>
                  <Text style={styles.email}>{tenantData?.email}</Text>
                  <Text style={styles.phone}>{tenantData?.phoneNumber}</Text>
                </View>
              </View>
            </LinearGradient>
          </Surface>
        </View>

        {/* Apartment Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="office-building" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Daire Bilgileri</Text>
          </View>
          <Surface style={styles.card} elevation={0}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <InfoRow icon="business" label="Bina" value={tenantData?.buildingName} />
              <InfoRow icon="home" label="Daire No" value={tenantData?.apartmentNumber} />
              <InfoRow icon="calendar" label="Kira Başlangıç" value={formatDate(tenantData?.leaseStartDate)} />
              <InfoRow icon="calendar" label="Kira Bitiş" value={formatDate(tenantData?.leaseEndDate)} />
              <InfoRow icon="document-text" label="Sözleşme Durumu" value={tenantData?.contractStatus} />
            </LinearGradient>
          </Surface>
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cash-multiple" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Finansal Bilgiler</Text>
          </View>
          <Surface style={styles.card} elevation={0}>
            <LinearGradient
              colors={['#7E22CE', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <InfoRow icon="cash" label="Aylık Kira" value={formatCurrency(tenantData?.monthlyRent)} />
              <InfoRow icon="wallet" label="Aidat" value={formatCurrency(tenantData?.monthlyDues)} />
              <InfoRow icon="shield-checkmark" label="Depozito" value={formatCurrency(tenantData?.depositAmount)} />
              <InfoRow icon="time" label="Son Ödeme" value={formatDate(tenantData?.lastPaymentDate)} />
            </LinearGradient>
          </Surface>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-group" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
          </View>
          <Surface style={styles.card} elevation={0}>
            <LinearGradient
              colors={['#FFC107', '#FFA000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <InfoRow icon="person" label="Yönetici" value={tenantData?.adminName} />
              <InfoRow icon="call" label="Yönetici Tel" value={tenantData?.adminPhone} />
              <InfoRow icon="mail" label="Yönetici E-posta" value={tenantData?.adminEmail} />
              {tenantData?.ownerName && (
                <>
                  <InfoRow icon="person" label="Ev Sahibi" value={tenantData?.ownerName} />
                  <InfoRow icon="call" label="Ev Sahibi Tel" value={tenantData?.ownerPhone} />
                  <InfoRow icon="mail" label="Ev Sahibi E-posta" value={tenantData?.ownerEmail} />
                </>
              )}
            </LinearGradient>
          </Surface>
        </View>
      </ScrollView>

      {showFab && (
        <View style={styles.fabContainer}>
          {menuVisible && (
            <>
              <TouchableOpacity 
                style={[styles.fabAction, styles.fabActionTop]}
                onPress={handleMakePayment}
              >
                <View style={styles.fabActionContent}>
                  <Text style={styles.fabActionText}>
                    {getPaymentStatus().text}
                  </Text>
                  {getTotalUnpaidAmount() > 0 && (
                    <Text style={styles.fabActionSubtext}>
                      {formatCurrency(getTotalUnpaidAmount())}
                    </Text>
                  )}
                </View>
                <View style={[
                  styles.fabActionIcon, 
                  { backgroundColor: getPaymentStatus().color }
                ]}>
                  <Ionicons 
                    name={getPaymentStatus().icon}
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fabAction, styles.fabActionMiddle]}
                onPress={handleCreateComplaint}
              >
                <Text style={styles.fabActionText}>Şikayet Oluştur</Text>
                <View style={[styles.fabActionIcon, { backgroundColor: '#FFC107' }]}>
                  <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity 
            style={styles.fab}
            onPress={toggleMenu}
          >
            <Animated.View style={{
              transform: [{
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg']
                })
              }]
            }}>
              <Ionicons name="add" size={24} color="#6366F1" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}

      <PaymentBottomSheet
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
        paymentId={selectedPayment?.id}
        amount={selectedPayment?.amount}
        paymentType={selectedPayment?.paymentType}
        description={selectedPayment?.description}
      />

      <ComplaintBottomSheet
        visible={complaintSheetVisible}
        onClose={() => setComplaintSheetVisible(false)}
      />
    </View>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabel}>
      <Ionicons name={icon} size={20} color="#FFFFFF" />
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <Text style={styles.valueText}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  section: {
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: Fonts.lato.bold,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: Fonts.lato.regular,
  },
  valueText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: Fonts.lato.medium,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Fonts.lato.bold,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
    fontFamily: Fonts.lato.regular,
  },
  phone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Fonts.lato.regular,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabActionText: {
    marginRight: 8,
    color: '#1F2937',
    fontFamily: Fonts.lato.medium,
    fontSize: 14,
  },
  fabActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabActionTop: {
    marginBottom: 16,
  },
  fabActionMiddle: {
    marginBottom: 16,
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
    marginBottom: 20,
  },
  paymentBreakdown: {
    marginTop: 0,
  },
  formContainer: {
    gap: 16,
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
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
  },
  payButton: {
    marginTop: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 8,
  },
  payButtonLabel: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
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
  paymentDetails: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Fonts.lato.regular,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: Fonts.lato.medium,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: Fonts.lato.bold,
  },
  totalValue: {
    fontSize: 18,
    color: '#1F2937',
    fontFamily: Fonts.lato.bold,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#FFC107',
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Fonts.lato.regular,
  },
  paymentsButton: {
    padding: 16,
  },
  paymentsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentsInfo: {
    flex: 1,
  },
  paymentsTitle: {
    fontSize: 18,
    fontFamily: Fonts.lato.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  paymentsSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  fabActionContent: {
    flex: 1,
    marginRight: 8,
  },
  fabActionSubtext: {
    fontSize: 12,
    color: '#1F2937',
    opacity: 0.7,
    marginTop: 2,
    fontFamily: Fonts.lato.regular,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  paymentTypeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    fontFamily: Fonts.lato.bold,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: Fonts.lato.regular,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  paymentBox: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentBoxContent: {
    padding: 12,
  },
  paymentBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: Fonts.lato.bold,
  },
  paymentBoxAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Fonts.lato.bold,
  },
  totalBox: {
    marginTop: 4,
  },
  totalBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Fonts.lato.bold,
    marginBottom: 4,
  },
  totalBoxAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Fonts.lato.bold,
  },
});

export default DashboardScreen;
