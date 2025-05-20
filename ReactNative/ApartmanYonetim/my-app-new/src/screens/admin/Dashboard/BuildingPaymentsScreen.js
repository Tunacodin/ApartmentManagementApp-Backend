import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, useTheme, Badge, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Fonts, Colors, Gradients } from '../../../constants';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { useNavigation, useRoute } from '@react-navigation/native';

const PaymentCard = ({ payment }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (value) => {
    return value.toLocaleString('tr-TR') + ' ₺';
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const adminId = await getCurrentAdminId();
      await axios.post(API_ENDPOINTS.PAYMENT.PROCESS(payment.id, adminId));
      Alert.alert('Başarılı', 'Ödeme işleme alındı.');
      setIsExpanded(false);
    } catch (error) {
      console.error('Ödeme işleme alınırken hata oluştu:', error);
      Alert.alert('Hata', 'Ödeme işleme alınırken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
      <Card style={[styles.paymentCard, isExpanded && styles.paymentCardExpanded]}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        />
        <Card.Content>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentHeaderLeft}>
              <Icon name="cash-multiple" size={24} color="#FFFFFF" />
              <View style={styles.paymentHeaderInfo}>
                <Text style={styles.paymentTitle}>
                  {payment.paymentType}
                </Text>
                <Text style={styles.paymentSubtitle}>
                  {payment.userFullName}
                </Text>
              </View>
            </View>
            <View style={styles.paymentHeaderRight}>
              <Text style={styles.paymentAmount}>
                {formatCurrency(payment.amount)}
              </Text>
              <Badge style={[styles.statusBadge, { backgroundColor: payment.isPaid ? '#10B981' : '#F59E0B' }]}>
                {payment.isPaid ? 'Ödendi' : 'Bekliyor'}
              </Badge>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.paymentContent}>
              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <Icon name="home" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>
                    Daire {payment.apartmentNumber}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="calendar" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>
                    Son Ödeme: {new Date(payment.dueDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="clock-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>
                    {payment.daysOverdue} gün gecikme
                  </Text>
                </View>
              </View>

              {!payment.isPaid && (
                <View style={styles.actionButtons}>
                  <Button 
                    mode="contained" 
                    onPress={handleProcess}
                    loading={isProcessing}
                    disabled={isProcessing}
                    style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
                    icon="check-circle"
                    labelStyle={styles.actionButtonLabel}
                  >
                    İşleme Al
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={() => {}}
                    style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                    icon="message"
                    labelStyle={styles.actionButtonLabel}
                  >
                    Hatırlat
                  </Button>
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const BuildingPaymentsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { buildingId, buildingName } = route.params;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    try {
      const adminId = await getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.FINANCE.PAYMENTS.BY_BUILDING(buildingId));
      
      if (response.data.success) {
        setPayments(response.data.data);
      } else {
        throw new Error(response.data.message || 'Ödemeler alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ödemeler alınırken hata:', error);
      Alert.alert('Hata', 'Ödemeler alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [buildingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Ödemeler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#F1F5F9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{buildingName} - Ödemeler</Text>
      </View>
      <FlatList
        data={payments}
        renderItem={({ item }) => <PaymentCard payment={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cash-multiple" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>
              Bu binada bekleyen ödeme bulunmuyor
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.lato.bold,
    color: '#F1F5F9',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#F1F5F9',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  paymentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 16,
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  paymentCardExpanded: {
    elevation: 8,
    shadowOpacity: 0.3,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#F1F5F9',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: '#94A3B8',
  },
  paymentHeaderRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#F1F5F9',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  paymentDetails: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: '#94A3B8',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  actionButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.lato.bold,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default BuildingPaymentsScreen; 