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
  Image,
} from 'react-native';
import { Card, useTheme, Avatar, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Fonts, Colors, Gradients } from '../../../constants';
import axios from 'axios';
import { API_BASE_URL, getCurrentAdminId } from '../../../config/apiConfig';
import { useNavigation, useRoute } from '@react-navigation/native';

const TenantCard = ({ tenant }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value) => {
    return value.toLocaleString('tr-TR') + ' ₺';
  };

  return (
    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
      <Card style={[styles.tenantCard, isExpanded && styles.tenantCardExpanded]}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        />
        <Card.Content>
          <View style={styles.tenantHeader}>
            <View style={styles.tenantHeaderLeft}>
              {tenant.profileImageUrl ? (
                <Avatar.Image 
                  size={48} 
                  source={{ uri: tenant.profileImageUrl }} 
                  style={styles.profileAvatar}
                />
              ) : (
                <Avatar.Icon 
                  size={48} 
                  icon="account" 
                  color="#FFFFFF"
                  style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                />
              )}
              <View style={styles.tenantHeaderInfo}>
                <Text style={styles.tenantName}>
                  {tenant.fullName}
                </Text>
                <Text style={styles.tenantApartment}>
                  Daire {tenant.apartmentNumber}
                </Text>
              </View>
            </View>
            <View style={styles.tenantHeaderRight}>
              <View style={[styles.statusBadge, { backgroundColor: tenant.isActive ? '#10B981' : '#EF4444' }]}>
                <Text style={styles.statusText}>
                  {tenant.isActive ? 'Aktif' : 'Pasif'}
                </Text>
              </View>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.tenantContent}>
              <View style={styles.tenantDetails}>
                <View style={styles.detailRow}>
                  <Icon name="phone" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>
                    {tenant.phoneNumber || 'Telefon bilgisi yok'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="email" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>
                    {tenant.email || 'E-posta bilgisi yok'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="calendar" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>
                    Giriş: {new Date(tenant.moveInDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                {tenant.moveOutDate && (
                  <View style={styles.detailRow}>
                    <Icon name="calendar" size={16} color="#94A3B8" />
                    <Text style={styles.detailText}>
                      Çıkış: {new Date(tenant.moveOutDate).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.financialInfo}>
                <View style={styles.financialItem}>
                  <View style={[styles.financialIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                    <Icon name="cash-multiple" size={20} color="#6366F1" />
                  </View>
                  <View style={styles.financialTextContainer}>
                    <Text style={styles.financialLabel}>Aylık Aidat</Text>
                    <Text style={styles.financialValue}>
                      {formatCurrency(tenant.monthlyDues)}
                    </Text>
                  </View>
                </View>
                <View style={styles.financialItem}>
                  <View style={[styles.financialIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                    <Icon name="clock-alert" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.financialTextContainer}>
                    <Text style={styles.financialLabel}>Bekleyen Tutar</Text>
                    <Text style={styles.financialValue}>
                      {formatCurrency(tenant.pendingAmount)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Button 
                  mode="contained" 
                  onPress={() => {}}
                  style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
                  icon="phone"
                  labelStyle={styles.actionButtonLabel}
                >
                  Ara
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => {}}
                  style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  icon="message"
                  labelStyle={styles.actionButtonLabel}
                >
                  Mesaj Gönder
                </Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const BuildingTenantsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { buildingId, buildingName } = route.params;
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTenants = async () => {
    try {
      const adminId = await getCurrentAdminId();
      const response = await axios.get(`${API_BASE_URL}/Tenant/building/${buildingId}`);
      
      if (response.data.success) {
        setTenants(response.data.data);
      } else {
        throw new Error(response.data.message || 'Kiracılar alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kiracılar alınırken hata:', error);
      Alert.alert('Hata', 'Kiracılar alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [buildingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenants();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Kiracılar yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>{buildingName} - Kiracılar</Text>
      </View>
      <FlatList
        data={tenants}
        renderItem={({ item }) => <TenantCard tenant={item} />}
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
            <Icon name="account-group-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>
              Bu binada kiracı bulunmuyor
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
    color: Colors.text,
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
  tenantCard: {
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
  tenantCardExpanded: {
    elevation: 8,
    shadowOpacity: 0.3,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    marginRight: 12,
  },
  tenantHeaderInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#F1F5F9',
    marginBottom: 4,
  },
  tenantApartment: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: '#94A3B8',
  },
  tenantHeaderRight: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontFamily: Fonts.lato.bold,
    fontSize: 12,
  },
  tenantContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tenantDetails: {
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
  financialInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  financialItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  financialTextContainer: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 12,
    fontFamily: Fonts.lato.regular,
    color: '#94A3B8',
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#F1F5F9',
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

export default BuildingTenantsScreen; 