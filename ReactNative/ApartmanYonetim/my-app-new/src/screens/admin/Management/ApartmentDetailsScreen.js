import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Surface,
  Text,
  ActivityIndicator,
  Avatar,
  Badge,
  Divider,
  Card,
} from 'react-native-paper';
import { Colors, Gradients } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { LinearGradient } from 'expo-linear-gradient';

const CustomBadge = ({ children, style, textStyle }) => (
  <View style={[styles.customBadge, style]}>
    <Text style={[styles.customBadgeText, textStyle]}>{children}</Text>
  </View>
);

const ApartmentDetailsScreen = ({ route, navigation }) => {
  const { apartmentId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apartmentDetails, setApartmentDetails] = useState(null);

  useEffect(() => {
    fetchApartmentDetails();
  }, []);

  const fetchApartmentDetails = async () => {
    try {
      console.log('=== Fetching Apartment Details ===');
      console.log('Apartment ID:', apartmentId);
      console.log('API Endpoint:', API_ENDPOINTS.APARTMENT.DETAIL(apartmentId));
      
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.APARTMENT.DETAIL(apartmentId));
      
      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        setApartmentDetails(response.data.data);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Veri alınamadı');
      }
    } catch (err) {
      console.error('=== Error Fetching Apartment Details ===');
      console.error('Error Type:', err.name);
      console.error('Error Message:', err.message);
      if (err.response) {
        console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
        console.error('Error Status:', err.response.status);
      }
      setError('Daire detayları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "Belirtilmemiş";
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!apartmentDetails) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="home-remove" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Daire bilgisi bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Surface style={styles.headerCard} elevation={2}>
        <LinearGradient
          colors={Gradients.greenBlue}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Icon name="office-building" size={32} color={Colors.surface} />
              <View style={styles.headerInfo}>
                <Text style={styles.buildingName}>{apartmentDetails.buildingName}</Text>
                <Text style={styles.apartmentNumber}>Daire {apartmentDetails.unitNumber}</Text>
              </View>
            </View>
            <CustomBadge 
              style={{ backgroundColor: apartmentDetails.status === 'Dolu' ? Colors.primaryLight : Colors.warningLight }}
              textStyle={{ color: apartmentDetails.status === 'Dolu' ? Colors.surface : Colors.warning }}
            >
              {apartmentDetails.status}
            </CustomBadge>
          </View>
        </LinearGradient>
      </Surface>

      {/* Apartment Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Daire Bilgileri</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Icon name="floor-plan" size={24} color={Colors.primary} />
              <View>
                <Text style={styles.detailLabel}>Kat</Text>
                <Text style={styles.detailValue}>{apartmentDetails.floor}. Kat</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Icon name="home-variant" size={24} color={Colors.primary} />
              <View>
                <Text style={styles.detailLabel}>Tip</Text>
                <Text style={styles.detailValue}>{apartmentDetails.type}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Icon name="cash" size={24} color={Colors.primary} />
              <View>
                <Text style={styles.detailLabel}>Kira</Text>
                <Text style={styles.detailValue}>{formatCurrency(apartmentDetails.rentAmount)}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Icon name="safe" size={24} color={Colors.primary} />
              <View>
                <Text style={styles.detailLabel}>Depozito</Text>
                <Text style={styles.detailValue}>{formatCurrency(apartmentDetails.depositAmount)}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Icon name="balcony" size={24} color={Colors.primary} />
              <View>
                <Text style={styles.detailLabel}>Balkon</Text>
                <Text style={styles.detailValue}>{apartmentDetails.hasBalcony ? 'Var' : 'Yok'}</Text>
              </View>
            </View>
          </View>
          {apartmentDetails.notes && (
            <View style={styles.notesContainer}>
              <Icon name="note-text" size={20} color={Colors.primary} />
              <Text style={styles.notesText}>{apartmentDetails.notes}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Owner Information */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Ev Sahibi Bilgileri</Text>
          <View style={styles.contactInfo}>
            <Avatar.Image
              size={50}
              source={{ uri: apartmentDetails.ownerProfileImage }}
              style={styles.avatar}
            />
            <View style={styles.contactDetails}>
              <Text style={styles.contactName}>{apartmentDetails.ownerName}</Text>
              <TouchableOpacity style={styles.contactButton}>
                <Icon name="phone" size={20} color={Colors.primary} />
                <Text style={styles.contactButtonText}>{apartmentDetails.ownerContact}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Current Tenant */}
      {apartmentDetails.currentTenant && (
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Mevcut Kiracı</Text>
            <View style={styles.contactInfo}>
              <Avatar.Image
                size={50}
                source={{ uri: apartmentDetails.currentTenant.profileImage }}
                style={styles.avatar}
              />
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{apartmentDetails.currentTenant.fullName}</Text>
                <View style={styles.tenantDetails}>
                  <TouchableOpacity style={styles.contactButton}>
                    <Icon name="phone" size={20} color={Colors.primary} />
                    <Text style={styles.contactButtonText}>{apartmentDetails.currentTenant.phoneNumber}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactButton}>
                    <Icon name="email" size={20} color={Colors.primary} />
                    <Text style={styles.contactButtonText}>{apartmentDetails.currentTenant.email}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.leaseInfo}>
                  <Text style={styles.leaseLabel}>Kontrat Başlangıç:</Text>
                  <Text style={styles.leaseValue}>
                    {formatDate(apartmentDetails.currentTenant.leaseStartDate)}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Recent Payments */}
      {apartmentDetails.recentPayments && apartmentDetails.recentPayments.length > 0 && (
        <Card style={[styles.detailsCard, { marginBottom: 70 }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Son Ödemeler</Text>
            {apartmentDetails.recentPayments.map((payment, index) => (
              <React.Fragment key={payment.paymentId}>
                <View style={styles.paymentItem}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                    <Text style={styles.paymentType}>{payment.paymentType}</Text>
                  </View>
                  <View style={styles.paymentStatus}>
                    <Text style={styles.paymentDate}>{formatDate(payment.paymentDate)}</Text>
                    <CustomBadge
                      style={{ backgroundColor: payment.isPaid ? Colors.successLight : Colors.warningLight }}
                      textStyle={{ color: payment.isPaid ? Colors.success : Colors.warning }}
                    >
                      {payment.isPaid ? 'Ödendi' : 'Bekliyor'}
                    </CustomBadge>
                  </View>
                </View>
                {index < apartmentDetails.recentPayments.length - 1 && <Divider style={styles.divider} />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    fontFamily: Fonts.urbanist.medium,
    marginTop: 8,
  },
  headerCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerInfo: {
    gap: 4,
  },
  buildingName: {
    fontSize: 20,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.surface,
  },
  apartmentNumber: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.surface,
    opacity: 0.9,
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.urbanist.bold,
    color: '#334155',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '45%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#334155',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#475569',
  },
  contactInfo: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    backgroundColor: '#E0F2FE',
  },
  contactDetails: {
    flex: 1,
    gap: 8,
  },
  contactName: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: '#334155',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E0F2FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#0369A1',
  },
  tenantDetails: {
    gap: 8,
  },
  leaseInfo: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaseLabel: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  leaseValue: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#334155',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  paymentInfo: {
    gap: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: '#334155',
  },
  paymentType: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  paymentStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentDate: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  divider: {
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  customBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'center',
    borderWidth: 1,
  },
  customBadgeText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    textAlign: 'center',
  },
});

export default ApartmentDetailsScreen; 