import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, TouchableOpacity, Modal, Animated, FlatList, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Surface, Text, Card, List, useTheme, Avatar, ProgressBar, Divider, Button, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, Colors, Gradients } from '../../../constants';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const ComplaintStatus = {
  Open: 0,        // Bekliyor
  InProgress: 1,  // İşlemde
  Resolved: 2,    // Çözüldü
  Rejected: 3     // Reddedildi
};

const StatCard = ({ title, value, icon, gradient, onPress }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <Surface style={[styles.statCard]} elevation={5}>
        <View style={{ overflow: 'hidden', borderRadius: 16 }}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <Icon name={icon} size={28} color={theme.colors.text} />
            <Text style={[styles.statValue, { color: theme.colors.text, fontFamily:"Poppins-Regular" }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: theme.colors.text, fontFamily: "Lato-Bold",fontSize:12 }]}>{title}</Text>
          </LinearGradient>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const FinancialCard = ({ title, current, target, percentage, gradient }) => {
  const theme = useTheme();
  return (
    <Card style={[styles.financialCard, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      />
      <Card.Content style={styles.financialContent}>
        <Text variant="titleMedium" style={{ color: theme.colors.text, fontFamily: Fonts.lato.bold }}>{title}</Text>
        <Text variant="headlineMedium" style={[styles.financialAmount, { color: theme.colors.text, fontFamily: Fonts.lato.regular }]}>
          {(current || 0).toLocaleString('tr-TR')} ₺
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.textSecondary, fontFamily: Fonts.lato.italic }}>
          Hedef: {(target || 0).toLocaleString('tr-TR')} ₺
        </Text>
        <ProgressBar 
          progress={percentage / 100} 
          color={gradient[0]}
          style={styles.progressBar}
        />
      </Card.Content>
    </Card>
  );
};

// Custom animated progress bar component
const AnimatedProgressBar = ({ progress, color, style, duration = 1500 }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, []);
  
  return (
    <View style={[styles.progressBarContainer, style]}>
      <Animated.View 
        style={[
          styles.progressBarFill, 
          { 
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: color,
          }
        ]}
      >
        <View style={styles.progressBarGlow} />
      </Animated.View>
    </View>
  );
};

// Format currency helper function
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0 ₺';
  return value.toLocaleString('tr-TR') + ' ₺';
};

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return 'Belirtilmemiş';
  try {
    return new Date(dateString).toLocaleString('tr-TR');
  } catch (error) {
    return 'Geçersiz Tarih';
  }
};

const FinancialOverviewCard = ({ data }) => {
  const theme = useTheme();
  
  // Calculate percentage difference
  const calculateDifference = () => {
    if (!data?.monthlyCollectedAmount || !data?.monthlyExpectedIncome) {
      return {
        value: 0,
        percent: 0,
        isPositive: true
      };
    }
    const difference = data.monthlyCollectedAmount - data.monthlyExpectedIncome;
    const percentDiff = (difference / data.monthlyExpectedIncome) * 100;
    return {
      value: Math.abs(difference),
      percent: Math.abs(percentDiff).toFixed(1),
      isPositive: difference >= 0
    };
  };
  
  const difference = calculateDifference();
  
  return (
    <Card style={[styles.financialOverviewCard, { backgroundColor: "transparent"}]}>
      <Card.Content>
        <View style={styles.financialOverviewContent}>
          <View style={styles.monthlyIncomeContainer}>
            <LinearGradient
              colors={theme?.gradients?.success || Gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.monthlyIncomeGradient}
            >
              <View style={styles.monthlyIncomeContent}>
                <View style={styles.monthlyIncomeRow}>
                  <View style={styles.monthlyIncomeLeft}>
                    <View style={styles.monthlyIncomeHeader}>
                      <Icon name="chart-line" size={24} color="#FFFFFF" />
                      <Text style={[styles.monthlyIncomeTitle, { color: '#FFFFFF' }]}>Aylık Gelir</Text>
                    </View>
                    
                    <Text style={[styles.monthlyIncomeValue, { color: '#FFFFFF' }]}>
                      {formatCurrency(data?.monthlyCollectedAmount)}
                    </Text>
                    <Text style={[styles.monthlyIncomeSubtitle, { color: '#FFFFFF' }]}>
                      Beklenen: {formatCurrency(data?.monthlyExpectedIncome)}
                    </Text>
                  </View>
                  
                  <View style={styles.monthlyIncomeRight}>
                    <View style={styles.monthlyIncomeHeader}>
                      <Icon name="cash-multiple" size={24} color="#FFFFFF" />
                      <Text style={[styles.monthlyIncomeTitle, { color: '#FFFFFF' }]}>Toplam Gelir</Text>
                    </View>
                    
                    <Text style={[styles.monthlyIncomeValue, { color: '#FFFFFF' }]}>
                      {formatCurrency(data?.monthlyTotalIncome)}
                    </Text>
                    <View style={styles.incomeBreakdown}>
                      <Text style={[styles.incomeBreakdownText, { color: '#FFFFFF' }]}>
                        Kira: {formatCurrency(data?.monthlyRentAmount)}
                      </Text>
                      <Text style={[styles.incomeBreakdownText, { color: '#FFFFFF' }]}>
                        Aidat: {formatCurrency(data?.monthlyDuesAmount)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Collection Rate */}
                <View style={styles.monthlyIncomeRateContainer}>
                  <View style={styles.monthlyIncomeRateHeader}>
                    <Text style={[styles.monthlyIncomeRateLabel, { color: '#FFFFFF' }]}>Tahsilat Oranı</Text>
                    <Text style={[styles.monthlyIncomeRateValue, { color: '#FFFFFF' }]}>
                      {(data?.collectionRate || 0).toFixed(1)}%
                    </Text>
                  </View>
                  <AnimatedProgressBar 
                    progress={(data?.collectionRate || 0) / 100} 
                    color="#fff"
                    style={styles.monthlyIncomeProgress}
                    duration={2000}
                  />
                </View>

                {/* Collection Details */}
                <View style={styles.collectionDetails}>
                  <View style={styles.collectionDetailItem}>
                    <Text style={[styles.collectionDetailLabel, { color: '#FFFFFF' }]}>Tahsil Edilen Kira</Text>
                    <Text style={[styles.collectionDetailValue, { color: '#FFFFFF' }]}>
                      {formatCurrency(data?.collectedRentAmount)}
                    </Text>
                  </View>
                  <View style={styles.collectionDetailItem}>
                    <Text style={[styles.collectionDetailLabel, { color: '#FFFFFF' }]}>Tahsil Edilen Aidat</Text>
                    <Text style={[styles.collectionDetailValue, { color: '#FFFFFF' }]}>
                      {formatCurrency(data?.collectedDuesAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const getStatusGradient = (status) => {
  switch (status) {
    case ComplaintStatus.Resolved:
    case 'Ödendi':
    case 'Çözüldü':
      return theme?.gradients?.success || Gradients.success || ['#4CAF50', '#45a049'];
    case ComplaintStatus.Open:
    case 'Bekliyor':
      return theme?.gradients?.warning || Gradients.warning || ['#FFC107', '#FFA000'];
    case ComplaintStatus.InProgress:
    case 'İşlemde':
      return theme?.gradients?.info || Gradients.info || ['#2196F3', '#1976D2'];
    case ComplaintStatus.Rejected:
    case 'Reddedildi':
      return theme?.gradients?.danger || Gradients.danger || ['#FF5252', '#FF1744'];
    default:
      return [Colors.textSecondary, Colors.textSecondary];
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case ComplaintStatus.Resolved:
    case 'Ödendi':
    case 'Çözüldü':
      return '#4CAF50';
    case ComplaintStatus.Open:
    case 'Bekliyor':
      return '#FFC107';
    case ComplaintStatus.InProgress:
    case 'İşlemde':
      return '#2196F3';
    case ComplaintStatus.Rejected:
    case 'Reddedildi':
      return '#FF5252';
    default:
      return Colors.textSecondary;
  }
};

const ActivityItem = ({ activity }) => {
  const theme = useTheme();
  
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
      case ComplaintStatus.Resolved:
      case 'Ödendi':
      case 'Çözüldü':
        return theme?.gradients?.success || Gradients.success || ['#4CAF50', '#45a049'];
      case ComplaintStatus.Open:
      case 'Bekliyor':
        return theme?.gradients?.warning || Gradients.warning || ['#FFC107', '#FFA000'];
      case ComplaintStatus.InProgress:
      case 'İşlemde':
        return theme?.gradients?.info || Gradients.info || ['#2196F3', '#1976D2'];
      case ComplaintStatus.Rejected:
      case 'Reddedildi':
        return theme?.gradients?.danger || Gradients.danger || ['#FF5252', '#FF1744'];
      default:
        return [Colors.textSecondary, Colors.textSecondary];
    }
  };

  return (
    <List.Item
      style={styles.activityItem}
      title={props => (
        <Text style={{ color: '#2C3E50', fontFamily: Fonts.lato.bold }}>
          {activity.title}
        </Text>
      )}
      description={props => (
        <View>
          <Text style={{ color: '#34495E', fontFamily: Fonts.lato.regular }}>
            {activity.description}
          </Text>
          <Text style={{ color: '#7F8C8D', fontFamily: Fonts.lato.italic }}>
            {activity.userFullName}
          </Text>
        </View>
      )}
      left={props => (
        <View style={styles.activityIconContainer}>
          {activity.profileImageUrl ? (
            <>
              <Avatar.Image 
                size={48} 
                source={{ uri: activity.profileImageUrl }} 
                style={styles.profileAvatar}
              />
              <Text style={[styles.apartmentText, { color: '#2C3E50' }]}>
                {activity.relatedEntity}
              </Text>
            </>
          ) : (
            <>
              <LinearGradient
                colors={getStatusGradient(activity.status)}
                style={styles.activityIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name={getActivityIcon(activity.activityType)} size={24} color={Colors.text} />
              </LinearGradient>
              <Text style={[styles.apartmentText, { color: '#2C3E50' }]}>
                {activity.relatedEntity}
              </Text>
            </>
          )}
        </View>
      )}
      right={props => (
        <View style={styles.activityRight}>
          <Text style={{ color: '#7F8C8D', fontFamily: Fonts.lato.regular }}>
            {formatDate(activity?.activityDate)}
          </Text>
          {activity?.amount && (
            <Text style={{ color: '#2C3E50', fontFamily: Fonts.lato.bold }}>
              {formatCurrency(activity.amount)}
            </Text>
          )}
          <View style={styles.statusContainer}>
            <LinearGradient
              colors={getStatusGradient(activity.status)}
              style={styles.statusGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.statusText}>{activity?.status || 'Bekliyor'}</Text>
            </LinearGradient>
          </View>
        </View>
      )}
    />
  );
};

const PaymentItem = ({ payment }) => {
  const theme = useTheme();
  
  const getApartmentNumber = (description) => {
    if (!description) return '';
    const match = description.match(/Daire (\d+)/);
    return match ? match[1] : '';
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case ComplaintStatus.Resolved:
      case 'Ödendi':
      case 'Çözüldü':
        return theme?.gradients?.success || Gradients.success || ['#4CAF50', '#45a049'];
      case ComplaintStatus.Open:
      case 'Bekliyor':
        return theme?.gradients?.warning || Gradients.warning || ['#FFC107', '#FFA000'];
      case ComplaintStatus.InProgress:
      case 'İşlemde':
        return theme?.gradients?.info || Gradients.info || ['#2196F3', '#1976D2'];
      case ComplaintStatus.Rejected:
      case 'Reddedildi':
        return theme?.gradients?.danger || Gradients.danger || ['#FF5252', '#FF1744'];
      default:
        return [Colors.textSecondary, Colors.textSecondary];
    }
  };

  const apartmentNumber = getApartmentNumber(payment.description);
  const status = payment?.isPaid ? 'Ödendi' : 'Bekliyor';

  return (
    <List.Item
      style={[styles.activityItem, { backgroundColor: '#FFFFFF' }]}
      title={props => (
        <Text style={{ color: '#000000', fontFamily: Fonts.lato.bold }}>
          {payment.paymentType}
        </Text>
      )}
      description={props => (
        <View>
          <Text style={{ color: '#333333', fontFamily: Fonts.lato.regular }}>
            {formatCurrency(payment?.amount)}
          </Text>
          <Text style={{ color: '#666666', fontFamily: Fonts.lato.italic }}>
            {payment?.userFullName || 'İsimsiz Kullanıcı'}
          </Text>
        </View>
      )}
      left={props => (
        <View style={styles.activityIconContainer}>
          {payment.profileImageUrl ? (
            <>
              <Avatar.Image 
                size={48} 
                source={{ uri: payment.profileImageUrl }} 
                style={styles.profileAvatar}
              />
              <Text style={[styles.apartmentText, { color: '#000000' }]}>
                Daire {apartmentNumber}
              </Text>
            </>
          ) : (
            <>
              <LinearGradient
                colors={getStatusGradient(status)}
                style={styles.activityIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="cash" size={24} color={Colors.text} />
              </LinearGradient>
              <Text style={[styles.apartmentText, { color: '#000000' }]}>
                Daire {apartmentNumber}
              </Text>
            </>
          )}
        </View>
      )}
      right={props => (
        <View style={styles.statusContainer}>
          <LinearGradient
            colors={getStatusGradient(status)}
            style={styles.statusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statusText}>{status}</Text>
          </LinearGradient>
        </View>
      )}
    />
  );
};

const ComplaintItem = ({ complaint, onPress }) => {
  const theme = useTheme();
  
  const getStatusGradient = (status) => {
    switch (status) {
      case ComplaintStatus.Resolved:
      case 'Ödendi':
      case 'Çözüldü':
        return theme?.gradients?.success || Gradients.success || ['#4CAF50', '#45a049'];
      case ComplaintStatus.Open:
      case 'Bekliyor':
        return theme?.gradients?.warning || Gradients.warning || ['#FFC107', '#FFA000'];
      case ComplaintStatus.InProgress:
      case 'İşlemde':
        return theme?.gradients?.info || Gradients.info || ['#2196F3', '#1976D2'];
      case ComplaintStatus.Rejected:
      case 'Reddedildi':
        return theme?.gradients?.danger || Gradients.danger || ['#FF5252', '#FF1744'];
      default:
        return [Colors.textSecondary, Colors.textSecondary];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ComplaintStatus.Resolved:
        return 'Çözüldü';
      case ComplaintStatus.Open:
        return 'Bekliyor';
      case ComplaintStatus.InProgress:
        return 'İşlemde';
      case ComplaintStatus.Rejected:
        return 'Reddedildi';
      default:
        return 'Bekliyor';
    }
  };

  const status = getStatusText(complaint.status);

  return (
    <TouchableOpacity onPress={() => onPress(complaint)}>
      <List.Item
        style={[styles.activityItem, { backgroundColor: '#FFFFFF' }]}
        title={props => (
          <Text style={{ color: '#000000', fontFamily: Fonts.lato.bold }}>
            {complaint.subject}
          </Text>
        )}
        description={props => (
          <View>
            <Text style={{ color: '#333333', fontFamily: Fonts.lato.regular }}>
              {complaint.description}
            </Text>
            <Text style={{ color: '#666666', fontFamily: Fonts.lato.italic }}>
              {complaint.createdByName}
            </Text>
          </View>
        )}
        left={props => (
          <View style={styles.activityIconContainer}>
            {complaint.profileImageUrl ? (
              <>
                <Avatar.Image 
                  size={48} 
                  source={{ uri: complaint.profileImageUrl }} 
                  style={styles.profileAvatar}
                />
                <Text style={[styles.apartmentText, { color: '#000000' }]}>
                  Daire {complaint.apartmentNumber}
                </Text>
              </>
            ) : (
              <>
                <LinearGradient
                  colors={getStatusGradient(complaint.status)}
                  style={styles.activityIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="alert-circle" size={24} color={Colors.text} />
                </LinearGradient>
                <Text style={[styles.apartmentText, { color: '#000000' }]}>
                  Daire {complaint.apartmentNumber}
                </Text>
              </>
            )}
          </View>
        )}
        right={props => (
          <View style={styles.statusContainer}>
            <LinearGradient
              colors={getStatusGradient(complaint.status)}
              style={styles.statusGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.statusText}>{status}</Text>
            </LinearGradient>
          </View>
        )}
      />
    </TouchableOpacity>
  );
};

const ComplaintBottomSheet = ({ visible, complaint, onClose, onActionComplete }) => {
  const theme = useTheme();
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      if (complaint?.id) {
        setLoading(true);
        try {
          const response = await axios.get(API_ENDPOINTS.COMPLAINT.DETAIL(complaint.id));
          if (response.data.success) {
            const detailData = response.data.data;
            const mergedData = {
              ...detailData,
              profileImageUrl: detailData.profileImageUrl || complaint.profileImageUrl,
              apartmentNumber: detailData.apartmentNumber || complaint.apartmentNumber,
              phoneNumber: detailData.phoneNumber || complaint.phoneNumber,
              email: detailData.email || complaint.email,
              statusText: detailData.statusText || getStatusText(detailData.status),
              isResolved: detailData.isResolved || detailData.status === ComplaintStatus.Resolved,
              isInProgress: detailData.isInProgress || detailData.status === ComplaintStatus.InProgress,
              isRejected: detailData.isRejected || detailData.status === ComplaintStatus.Rejected,
              isOpen: detailData.isOpen || detailData.status === ComplaintStatus.Open
            };
            setComplaintDetails(mergedData);
          }
        } catch (error) {
          console.error('Şikayet detayları alınırken hata oluştu:', error);
          Alert.alert('Hata', 'Şikayet detayları alınırken bir hata oluştu.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (visible) {
      fetchComplaintDetails();
    }
  }, [complaint?.id, visible]);

  const getStatusText = (status) => {
    switch (status) {
      case ComplaintStatus.Resolved:
        return 'Çözüldü';
      case ComplaintStatus.Open:
        return 'Bekliyor';
      case ComplaintStatus.InProgress:
        return 'İşlemde';
      case ComplaintStatus.Rejected:
        return 'Reddedildi';
      default:
        return 'Bekliyor';
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const adminId = await getCurrentAdminId();
      await axios.post(API_ENDPOINTS.COMPLAINT.TAKE(complaint.id, adminId));
      Alert.alert('Başarılı', 'Şikayet işleme alındı.');
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Şikayet işleme alınırken hata oluştu:', error);
      Alert.alert('Hata', 'Şikayet işleme alınırken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const adminId = await getCurrentAdminId();
      await axios.post(API_ENDPOINTS.COMPLAINT.RESOLVE(complaint.id, adminId));
      Alert.alert('Başarılı', 'Şikayet çözüldü olarak işaretlendi.');
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Şikayet çözülürken hata oluştu:', error);
      Alert.alert('Hata', 'Şikayet çözülürken bir hata oluştu.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Uyarı', 'Lütfen reddetme sebebini giriniz.');
      return;
    }

    setIsRejecting(true);
    try {
      const adminId = await getCurrentAdminId();
      await axios.post(API_ENDPOINTS.COMPLAINT.REJECT(complaint.id, adminId), {
        reason: rejectReason
      });
      Alert.alert('Başarılı', 'Şikayet reddedildi.');
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Şikayet reddedilirken hata oluştu:', error);
      Alert.alert('Hata', 'Şikayet reddedilirken bir hata oluştu.');
    } finally {
      setIsRejecting(false);
    }
  };

  if (!complaint || !complaintDetails) return null;

  const status = getStatusText(complaintDetails.status);

  const renderActionButtons = () => {
    if (complaintDetails.isOpen) {
      return (
        <Button 
          mode="contained" 
          onPress={handleProcess}
          loading={isProcessing}
          disabled={isProcessing}
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          icon="check-circle"
          labelStyle={styles.actionButtonLabel}
        >
          İşleme Al
        </Button>
      );
    } else if (complaintDetails.isInProgress) {
      return (
        <View style={styles.actionButtons}>
          <Button 
            mode="contained" 
            onPress={handleResolve}
            loading={isResolving}
            disabled={isResolving}
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            icon="check"
            labelStyle={styles.actionButtonLabel}
          >
            Çözüldü
          </Button>
          {!showRejectInput ? (
            <Button 
              mode="contained" 
              onPress={() => setShowRejectInput(true)}
              style={[styles.actionButton, { backgroundColor: '#FF5252' }]}
              icon="close-circle"
              labelStyle={styles.actionButtonLabel}
            >
              Reddet
            </Button>
          ) : (
            <View style={styles.rejectContainer}>
              <TextInput
                style={styles.rejectInput}
                placeholder="Reddetme sebebini giriniz"
                placeholderTextColor="#B0B0B0"
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
              />
              <View style={styles.rejectButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setShowRejectInput(false);
                    setRejectReason('');
                  }}
                  style={styles.rejectButton}
                  labelStyle={styles.rejectButtonLabel}
                >
                  İptal
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleReject}
                  loading={isRejecting}
                  disabled={isRejecting}
                  style={[styles.rejectButton, { backgroundColor: '#FF5252' }]}
                  labelStyle={styles.actionButtonLabel}
                >
                  Onayla
                </Button>
              </View>
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.bottomSheetContainer}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={Gradients.normal}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.bottomSheetGradient}
            >
              <View style={[styles.bottomSheetHeader, { borderBottomWidth: 0 }]}>
                <View style={[styles.bottomSheetHandle, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', marginTop: 12 }}>Yükleniyor...</Text>
                </View>
              ) : (
                <ScrollView style={styles.bottomSheetContent}>
                  <View style={styles.complaintHeader}>
                    <View style={styles.complaintHeaderLeft}>
                      {complaintDetails.profileImageUrl ? (
                        <Avatar.Image 
                          size={56} 
                          source={{ uri: complaintDetails.profileImageUrl }} 
                          style={styles.profileAvatar}
                        />
                      ) : (
                        <Avatar.Icon 
                          size={56} 
                          icon="account" 
                          color="#FFFFFF"
                          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        />
                      )}
                      <View style={styles.complaintHeaderInfo}>
                        <Text style={{ fontSize: 18, fontFamily: Fonts.lato.bold, color: '#FFFFFF', marginBottom: 4 }}>
                          {complaintDetails.createdByName}
                        </Text>
                        <View style={styles.complaintHeaderDetails}>
                          <Icon name="home" size={16} color="#B0B0B0" />
                          <Text style={{ fontFamily: Fonts.lato.regular, color: '#B0B0B0', marginLeft: 4 }}>
                            {complaintDetails.apartmentNumber || 'Daire bilgisi yok'}
                          </Text>
                        </View>
                        {complaintDetails.phoneNumber && (
                          <View style={styles.complaintHeaderDetails}>
                            <Icon name="phone" size={16} color="#B0B0B0" />
                            <Text style={{ fontFamily: Fonts.lato.regular, color: '#B0B0B0', marginLeft: 4 }}>
                              {complaintDetails.phoneNumber}
                            </Text>
                          </View>
                        )}
                        {complaintDetails.email && (
                          <View style={styles.complaintHeaderDetails}>
                            <Icon name="email" size={16} color="#B0B0B0" />
                            <Text style={{ fontFamily: Fonts.lato.regular, color: '#B0B0B0', marginLeft: 4 }}>
                              {complaintDetails.email}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Badge 
                      style={[
                        styles.statusBadge,
                        { 
                          backgroundColor: complaintDetails.status === ComplaintStatus.Resolved 
                            ? '#4CAF50'
                            : complaintDetails.status === ComplaintStatus.Rejected
                            ? '#FF5252'
                            : complaintDetails.status === ComplaintStatus.InProgress
                            ? '#2196F3'
                            : '#FFC107'
                        }
                      ]}
                    >
                      {complaintDetails.statusText}
                    </Badge>
                  </View>

                  <View style={styles.complaintContent}>
                    <Text style={styles.complaintTitle}>
                      {complaintDetails.subject}
                    </Text>

                    <Text style={styles.complaintDescription}>
                      {complaintDetails.description}
                    </Text>

                    <View style={styles.complaintInfo}>
                      <View style={styles.infoRow}>
                        <Icon name="calendar" size={16} color="#B0B0B0" />
                        <Text style={styles.infoText}>
                          {new Date(complaintDetails.createdAt).toLocaleString('tr-TR')}
                        </Text>
                      </View>
                      {complaintDetails.resolvedAt && (
                        <View style={styles.infoRow}>
                          <Icon name="check-circle" size={16} color="#B0B0B0" />
                          <Text style={styles.infoText}>
                            {new Date(complaintDetails.resolvedAt).toLocaleString('tr-TR')}
                          </Text>
                        </View>
                      )}
                      {complaintDetails.daysOpen > 0 && (
                        <View style={styles.infoRow}>
                          <Icon name="clock-outline" size={16} color="#B0B0B0" />
                          <Text style={styles.infoText}>
                            {complaintDetails.daysOpen} gün açık kaldı
                          </Text>
                        </View>
                      )}
                    </View>

                    {renderActionButtons()}
                  </View>
                </ScrollView>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const DashboardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalBuildings: 0,
      totalTenants: 0,
      totalComplaints: 0,
      pendingPayments: 0
    },
    financialOverview: {
      monthlyCollectedAmount: 0,
      monthlyExpectedIncome: 0,
      monthlyTotalIncome: 0,
      collectionRate: 0
    },
    recentActivities: [],
    recentComplaints: [],
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth - 32;

    const fetchDashboardData = async () => {
      try {
        const adminId = await getCurrentAdminId();
        if (!adminId) {
          throw new Error('Admin ID bulunamadı');
        }
        
        console.log('Fetching dashboard data for adminId:', adminId);
        
        const response = await axios.get(API_ENDPOINTS.ADMIN.ENHANCED_DASHBOARD(adminId));
        console.log('Dashboard Data:', response.data);
        
        if (response.data && response.data.data) {
          setDashboardData(response.data.data);
        } else {
          console.error('Invalid API response structure:', response.data);
          Alert.alert('Hata', 'Dashboard verileri beklenmeyen formatta geldi.');
        }
      } catch (error) {
        console.error('Dashboard verisi alınırken hata oluştu:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          Alert.alert(
            'Hata',
            `Dashboard verileri yüklenirken bir hata oluştu. (${error.response.status})\nLütfen daha sonra tekrar deneyin.`
          );
        } else if (error.request) {
          console.error('Error request:', error.request);
          Alert.alert(
            'Bağlantı Hatası',
            'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.'
          );
        } else {
          Alert.alert(
            'Hata',
            'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleComplaintPress = (complaint) => {
    setSelectedComplaint(complaint);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedComplaint(null), 300);
  };

  const handleComplaintAction = async () => {
    await fetchDashboardData();
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / (screenWidth - 32) + 0.5);
    if (activeTab !== index) {
      setActiveTab(index);
    }
  };

  // Sürekli kaydırma sırasında da tab'ı güncelle
  const handleScrolling = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / (screenWidth - 32) + 0.5);
    if (index >= 0 && index <= 2) {
      setActiveTab(index);
    }
  };

  const TabHeader = () => (
    <View style={styles.tabHeader}>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 0 && styles.activeTabButton
        ]}
        onPress={() => handleTabChange(0)}
      >
        <Text style={[
          styles.tabText,
          activeTab === 0 && styles.activeTabText,
          { fontFamily: Fonts.lato.bold }
        ]}>
          Son Aktiviteler
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 1 && styles.activeTabButton
        ]}
        onPress={() => handleTabChange(1)}
      >
        <Text style={[
          styles.tabText,
          activeTab === 1 && styles.activeTabText,
          { fontFamily: Fonts.lato.bold }
        ]}>
          Şikayetler
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          activeTab === 2 && styles.activeTabButton
        ]}
        onPress={() => handleTabChange(2)}
      >
        <Text style={[
          styles.tabText,
          activeTab === 2 && styles.activeTabText,
          { fontFamily: Fonts.lato.bold }
        ]}>
          Ödemeler
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ActivitiesTab = () => (
    <ScrollView style={[styles.tabContent, { width: screenWidth - 32 }]} nestedScrollEnabled={true}>
      {dashboardData.recentActivities.length === 0 ? (
        <Text style={{ color: Colors.text, fontFamily: Fonts.lato.regular }}>
          Aktivite bulunamadı
        </Text>
      ) : (
        <>
          {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ActivityItem activity={activity} />
              {index < 4 && (
                <Divider style={[styles.itemDivider, { backgroundColor: Colors.textSecondary }]} />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </ScrollView>
  );

  const ComplaintsTab = () => (
    <ScrollView style={[styles.tabContent, { width: screenWidth - 32 }]} nestedScrollEnabled={true}>
      {dashboardData.recentComplaints.length === 0 ? (
        <Text style={{ color: Colors.text, fontFamily: Fonts.lato.regular }}>
          Şikayet bulunamadı
        </Text>
      ) : (
        <>
          {dashboardData.recentComplaints.map((complaint, index) => (
            <React.Fragment key={complaint.id}>
              <ComplaintItem 
                complaint={complaint} 
                onPress={handleComplaintPress}
              />
              {index < dashboardData.recentComplaints.length - 1 && (
                <Divider style={[styles.itemDivider, { backgroundColor: Colors.textSecondary }]} />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </ScrollView>
  );

  const PaymentsTab = () => (
    <ScrollView style={[styles.tabContent, { width: screenWidth - 32 }]} nestedScrollEnabled={true}>
      {dashboardData.recentPayments.length === 0 ? (
        <Text style={{ color: Colors.text, fontFamily: Fonts.lato.regular }}>
          Ödeme bulunamadı
        </Text>
      ) : (
        <>
          {dashboardData.recentPayments.map((payment, index) => (
            <React.Fragment key={payment.id}>
              <PaymentItem payment={payment} />
              {index < dashboardData.recentPayments.length - 1 && (
                <Divider style={[styles.itemDivider, { backgroundColor: Colors.textSecondary }]} />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderTabContent = ({ item, index }) => {
    switch (index) {
      case 0:
        return <ActivitiesTab />;
      case 1:
        return <ComplaintsTab />;
      case 2:
        return <PaymentsTab />;
      default:
        return null;
    }
  };
   
  if (loading || !dashboardData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{ color: Colors.text, fontFamily: Fonts.lato.regular }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView 
        nestedScrollEnabled={true}
      >
        <View style={styles.statsContainer}>
          <View style={styles.cardRow}>
            <StatCard
              title="Toplam Bina"
              value={dashboardData.summary.totalBuildings}
              icon="office-building"
              gradient={['#2196F3', '#1976D2']}
              onPress={() => navigation.navigate('BuildingsList')}
            />
            <StatCard
              title="Toplam Kiracı"
              value={dashboardData.summary.totalTenants}
              icon="account-group"
              gradient={['#7E22CE', '#A855F7']}
              onPress={() => navigation.navigate('TenantList')}
            />
          </View>
          <View style={styles.cardRow}>
            <StatCard
              title="Şikayetler"
              value={dashboardData.summary.totalComplaints}
              icon="alert-circle"
              gradient={['#FFC107', '#FFA000']}
              onPress={() => navigation.navigate('ComplaintList')}
            />
            <StatCard
              title="Bekleyen Ödeme"
              value={dashboardData.summary.pendingPayments}
              icon="cash-multiple"
              gradient={['#FF5252', '#D32F2F']}
              onPress={() => navigation.navigate('OverduePayments')}
            />
          </View>
        </View>

        <FinancialOverviewCard data={dashboardData.financialOverview} />

        <Card style={[styles.activitiesCard, { backgroundColor: '#F0F2F5' }]}>
          <TabHeader />
          <FlatList
            ref={flatListRef}
            data={[0, 1, 2]}
            renderItem={renderTabContent}
            keyExtractor={(item) => item.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onScroll={handleScrolling}
            scrollEventThrottle={16}
            initialScrollIndex={0}
            getItemLayout={(data, index) => ({
              length: itemWidth,
              offset: itemWidth * index,
              index,
            })}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
            decelerationRate="fast"
          />
        </Card>
      </ScrollView>

      <ComplaintBottomSheet 
        visible={modalVisible}
        complaint={selectedComplaint}
        onClose={handleCloseModal}
        onActionComplete={handleComplaintAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  statsContainer: {
    flexDirection: 'column',
    fontFamily: "Poppins-Regular",
    marginVertical: 0,
    marginBottom: -12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  statCard: {
    width: 185,
    marginBottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  gradientCard: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    marginTop: 4,
    color: '#FFFFFF',
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
    color: '#FFFFFF',
  },
  financialContainer: {
  
  },
  financialCard: {
   
    borderRadius: 16,
    overflow: 'hidden',
  },
  financialContent: {
    padding: 16,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  financialAmount: {
    marginVertical: 8,
    fontSize: 32,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  activitiesCard: {
    marginBottom: 80,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  activityIconContainer: {
    marginRight: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3'
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#2196F3',
  },
  profileAvatar: {
    marginBottom: 4,
  },
  apartmentText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Fonts.lato.medium,
    color: '#000000',
  },
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    zIndex: -1,
  },
  bottomSheetGradient: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 0,
  },
  bottomSheetHandle: {
    width: 32,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 56,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  complaintHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  complaintHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  complaintHeaderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontFamily: Fonts.lato.bold,
  },
  complaintContent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  complaintTitle: {
    fontSize: 18,
    fontFamily: Fonts.lato.bold,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  complaintDescription: {
    fontFamily: Fonts.lato.regular,
    color: '#B0B0B0',
    marginBottom: 16,
    lineHeight: 20,
  },
  complaintInfo: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: Fonts.lato.regular,
    color: '#B0B0B0',
    marginLeft: 8,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  actionButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.lato.bold,
    fontSize: 16,
  },
  rejectContainer: {
    marginTop: 16,
  },
  rejectInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontFamily: Fonts.lato.regular,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rejectButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  rejectButton: {
    minWidth: 120,
    borderRadius: 12,
  },
  rejectButtonLabel: {
    color: '#B0B0B0',
    fontFamily: Fonts.lato.bold,
  },
  itemDivider: {
    height: 1,
    opacity: 0.1,
    backgroundColor: '#000000',
  },
  flatList: {
    height: 550,
    backgroundColor: '#FFFFFF',
  },
  flatListContent: {
    flexGrow: 1,
  },
  tabContent: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  financialOverviewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    width: 425,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  financialOverviewContent: {
    padding: 8,
  },
  monthlyIncomeContainer: {
    marginTop: 0,
    borderRadius: 16,
    width: "100%",
  },
  monthlyIncomeGradient: {
    borderRadius: 16,
    width: "100%",
  },
  monthlyIncomeContent: {
    padding: 16,
    width: "100%",
  },
  monthlyIncomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  monthlyIncomeLeft: {
    flex: 1,
    marginRight: 16,
  },
  monthlyIncomeRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  monthlyIncomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthlyIncomeTitle: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    marginLeft: 8,
  },
  monthlyIncomeValue: {
    fontSize: 28,
    fontFamily: Fonts.lato.bold,
  },
  monthlyIncomeSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    opacity: 0.9,
    marginTop: 4,
  },
  monthlyIncomeRateContainer: {
    marginTop: 8,
  },
  monthlyIncomeRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthlyIncomeRateLabel: {
    fontSize: 14,
    fontFamily: Fonts.lato.bold,
  },
  monthlyIncomeRateValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  monthlyIncomeProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    position: 'relative',
  },
  progressBarGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 15,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: -1,
  },
  incomeBreakdown: {
    marginTop: 8,
    gap: 4,
  },
  incomeBreakdownText: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    opacity: 0.9,
  },
  collectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  collectionDetailItem: {
    flex: 1,
  },
  collectionDetailLabel: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    opacity: 0.9,
    marginBottom: 4,
  },
  collectionDetailValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  statusContainer: {
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontFamily: Fonts.lato.bold,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default DashboardScreen;