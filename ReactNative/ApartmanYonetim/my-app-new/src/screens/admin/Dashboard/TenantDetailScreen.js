import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import { Fonts, Colors } from '../../../constants';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TenantDetailScreen = ({ route, navigation }) => {
  const { tenantId } = route.params;
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    fetchTenantDetails();
  }, [tenantId]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.TENANT.GET_DETAILS(tenantId));
      if (response.data.success) {
        setTenant(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      Alert.alert('Hata', 'Kiracı bilgileri alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01T00:00:00') return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₺';
    return amount.toLocaleString('tr-TR') + ' ₺';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Kiracı bilgileri yükleniyor...</Text>
      </View>
    );
  }

  if (!tenant) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Kiracı bilgileri bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profil Başlığı */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#E0F2FE', '#DBEAFE', '#E0F2FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.profileSection}>
            <Image
              source={{ uri: tenant.profileImageUrl || 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{tenant.fullName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: tenant.isActive ? '#10B981' : '#EF4444' }]}>
                <Text style={styles.statusText}>
                  {tenant.isActive ? 'Aktif' : 'Pasif'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Kiracı Bilgileri */}
      <View style={styles.content}>
        <Card style={styles.sectionCard}>
          <LinearGradient
            colors={['#E0F2FE', '#DBEAFE', '#E0F2FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <Card.Content>
              <Text style={styles.sectionTitle}>Kiracı Bilgileri</Text>
              <View style={styles.infoGrid}>
                <InfoItem icon="email" label="E-posta" value={tenant.email} />
                <InfoItem icon="phone" label="Telefon" value={tenant.phoneNumber} />
                <InfoItem icon="office-building" label="Bina" value={tenant.buildingName} />
                <InfoItem icon="door" label="Daire" value={`${tenant.unitNumber}`} />
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>

        <Card style={styles.sectionCard}>
          <LinearGradient
            colors={['#E0F2FE', '#DBEAFE', '#E0F2FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <Card.Content>
              <Text style={styles.sectionTitle}>Kira Bilgileri</Text>
              <View style={styles.infoGrid}>
                <InfoItem icon="calendar-check" label="Giriş Tarihi" value={formatDate(tenant.leaseStartDate)} />
                <InfoItem icon="calendar-clock" label="Bitiş Tarihi" value={formatDate(tenant.leaseEndDate)} />
                <InfoItem icon="cash" label="Aylık Kira" value={formatCurrency(tenant.monthlyRent)} />
                <InfoItem icon="cash-multiple" label="Aidat" value={formatCurrency(tenant.monthlyDues)} />
                <InfoItem icon="calendar" label="Son Ödeme" value={formatDate(tenant.lastPaymentDate)} />
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>

        <Card style={styles.sectionCard}>
          <LinearGradient
            colors={['#E0F2FE', '#DBEAFE', '#E0F2FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <Card.Content>
              <Text style={styles.sectionTitle}>Yönetici Bilgileri</Text>
              <View style={styles.infoGrid}>
                <InfoItem icon="account" label="Ad Soyad" value={tenant.adminName} />
                <InfoItem icon="phone" label="Telefon" value={tenant.adminPhone} />
                <InfoItem icon="email" label="E-posta" value={tenant.adminEmail} />
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>

        <Card style={styles.sectionCard}>
          <LinearGradient
            colors={['#E0F2FE', '#DBEAFE', '#E0F2FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <Card.Content>
              <Text style={styles.sectionTitle}>Malik Bilgileri</Text>
              <View style={styles.infoGrid}>
                <InfoItem icon="account" label="Ad Soyad" value={tenant.ownerName} />
                <InfoItem icon="phone" label="Telefon" value={tenant.ownerPhone} />
                <InfoItem icon="email" label="E-posta" value={tenant.ownerEmail} />
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </View>
    </ScrollView>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconContainer}>
      <Icon name={icon} size={20} color="#3B82F6" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#1E293B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#EF4444',
  },
  header: {
    height: 200,
  },
  headerGradient: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: Fonts.lato.bold,
    color: '#1E293B',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.lato.bold,
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lato.bold,
    color: '#1E293B',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.lato.regular,
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.lato.bold,
    color: '#1E293B',
  },
});

export default TenantDetailScreen; 