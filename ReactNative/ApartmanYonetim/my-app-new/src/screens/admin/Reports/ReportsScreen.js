import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  FlatList
} from 'react-native';
import { Card, Surface, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { Colors, Gradients } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import * as Animatable from 'react-native-animatable';
import { Icon } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [tenantsPage, setTenantsPage] = useState(1);
  const [complaintsPage, setComplaintsPage] = useState(1);
  const [surveysPage, setSurveysPage] = useState(1);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [meetingsPage, setMeetingsPage] = useState(1);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [surveysLoading, setSurveysLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const ITEMS_PER_PAGE = 5;

  const fetchReportData = async () => {
    try {
      const adminId = getCurrentAdminId();
      console.log('Fetching report data for admin:', adminId);
      console.log('Using endpoint:', API_ENDPOINTS.ADMIN.REPORTS.SUMMARY(adminId));
      
      const response = await axios.get(API_ENDPOINTS.ADMIN.REPORTS.SUMMARY(adminId));
      console.log('Raw API Response:', response);
      
      if (response.data && response.data.success) {
        console.log('Setting report data:', response.data.data);
        setReportData(response.data.data);
        setError(null);
      } else {
        console.error('API response missing success or data:', response.data);
        throw new Error(response.data.message || 'Veri alınamadı');
      }
    } catch (error) {
      console.error('Rapor verileri yüklenirken hata:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      setError('Rapor verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportData();
  };

  const CardHeader = ({ title, icon, currentPage, totalItems, onPageChange, gradientColors }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.cardHeaderWithPagination}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          <View style={styles.headerPaginationControls}>
        <TouchableOpacity 
              onPress={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
              style={[
                styles.headerPaginationButton,
                currentPage === 1 && styles.headerPaginationButtonDisabled
              ]}
        >
          <MaterialCommunityIcons 
            name="chevron-left" 
            size={24} 
                color={currentPage === 1 ? '#FFFFFF50' : '#FFFFFF'} 
          />
        </TouchableOpacity>
            <Text style={styles.headerPaginationText}>
          {currentPage}/{totalPages}
        </Text>
        <TouchableOpacity 
              onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
              style={[
                styles.headerPaginationButton,
                currentPage === totalPages && styles.headerPaginationButtonDisabled
              ]}
        >
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
                color={currentPage === totalPages ? '#FFFFFF50' : '#FFFFFF'} 
          />
        </TouchableOpacity>
      </View>
        </View>
      </LinearGradient>
    );
  };

  const CardLoadingIndicator = () => (
    <View style={styles.cardLoadingContainer}>
      <ActivityIndicator size="small" color={Colors.primary} />
    </View>
  );

  const BuildingSummaryCard = memo(() => (
    <Animatable.View animation="fadeInUp" duration={800} delay={100}>
      <Card style={styles.card}>
        <LinearGradient
          colors={Gradients.primary || ['#2C3E50', '#3498DB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="office-building" size={24} color="#FFFFFF" />
            <Text style={styles.cardTitle}>Bina Özeti</Text>
          </View>
        </LinearGradient>
        <Card.Content style={styles.cardContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData?.buildingSummary?.totalBuildings || 0}</Text>
              <Text style={styles.statLabel}>Toplam Bina</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData?.buildingSummary?.totalApartments || 0}</Text>
              <Text style={styles.statLabel}>Toplam Daire</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(reportData?.buildingSummary?.occupancyRate || 0).toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Doluluk Oranı</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData?.buildingSummary?.totalTenants || 0}</Text>
              <Text style={styles.statLabel}>Toplam Kiracı</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData?.buildingSummary?.activeComplaints || 0}</Text>
              <Text style={styles.statLabel}>Aktif Şikayet</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData?.buildingSummary?.pendingPayments || 0}</Text>
              <Text style={styles.statLabel}>Bekleyen Ödeme</Text>
            </View>
            <View style={[styles.statItem, { width: '100%', backgroundColor: '#EEF2FF' }]}>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                {(reportData?.buildingSummary?.totalMonthlyIncome || 0).toLocaleString('tr-TR')} ₺
              </Text>
              <Text style={styles.statLabel}>Toplam Aylık Gelir</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.highlightSection}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>En Yüksek Gelirli Bina</Text>
              <Text style={styles.highlightValue}>
                {reportData?.buildingSummary?.highestIncomeBuilding?.buildingName || 'Veri yok'}
              </Text>
              <Text style={styles.highlightSubvalue}>
                {(reportData?.buildingSummary?.highestIncomeBuilding?.monthlyIncome || 0).toLocaleString('tr-TR')} ₺/ay
              </Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>En Yüksek Kira Ortalaması</Text>
              <Text style={styles.highlightValue}>
                {reportData?.buildingSummary?.highestRentBuilding?.buildingName || 'Veri yok'}
              </Text>
              <Text style={styles.highlightSubvalue}>
                {(reportData?.buildingSummary?.highestRentBuilding?.averageRent || 0).toLocaleString('tr-TR')} ₺/ay
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  ));

  const RecentComplaintsCard = memo(({ data, page, loading, onPageChange }) => {
    const complaints = data?.recentComplaints || [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedComplaints = complaints.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <Animatable.View animation="fadeInUp" duration={800} delay={500}>
        <Card style={styles.card}>
          <CardHeader
            title="Son Şikayetler"
            icon="alert-circle"
            currentPage={page}
            totalItems={complaints.length}
            onPageChange={onPageChange}
            gradientColors={Gradients.warning || ['#D97706', '#F59E0B']}
          />
          <Card.Content style={styles.cardContent}>
            {loading ? (
              <CardLoadingIndicator />
            ) : (
              <FlatList
                data={paginatedComplaints}
                keyExtractor={(item) => `complaint-${item?.id}`}
                renderItem={({ item }) => (
                  <Surface style={styles.complaintItem}>
                    <View style={styles.complaintHeader}>
                      <Text style={styles.complaintTitle}>{item.subject || 'Başlıksız Şikayet'}</Text>
                      <View style={[
                        styles.statusBadge,
                        { 
                          backgroundColor: item.status === 'Bekliyor' ? '#FEF3C7' : 
                                         item.status === 'İşleme Alındı' ? '#DBEAFE' :
                                         item.status === 'Çözüldü' ? '#D1FAE5' : '#FEE2E2'
                        }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { 
                            color: item.status === 'Bekliyor' ? '#B45309' : 
                                   item.status === 'İşleme Alındı' ? '#1D4ED8' :
                                   item.status === 'Çözüldü' ? '#047857' : '#DC2626'
                          }
                        ]}>{item.status || 'Durum Yok'}</Text>
                      </View>
                    </View>
                    <View style={styles.complaintDetails}>
                      <Text style={styles.complaintBuilding}>{item.buildingName || 'Bina Belirtilmemiş'}</Text>
                      <Text style={styles.complaintTenant}>{item.tenantName || 'Kiracı Belirtilmemiş'}</Text>
                    </View>
                    <Text style={styles.complaintDate}>
                      {new Date(item.createdAt).toLocaleDateString('tr-TR')} ({item.daysOpen} gün)
                    </Text>
                  </Surface>
                )}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyListContainer}>
                    <Icon name="alert-circle-outline" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyListText}>Aktif şikayet bulunmuyor</Text>
                  </View>
                )}
              />
            )}
          </Card.Content>
        </Card>
      </Animatable.View>
    );
  });

  const RecentSurveysCard = memo(({ data, page, loading, onPageChange }) => {
    const surveys = data?.recentSurveys || [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedSurveys = surveys.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <Animatable.View animation="fadeInUp" duration={800} delay={700}>
        <Card style={styles.card}>
          <CardHeader
            title="Son Anketler"
            icon="poll"
            currentPage={page}
            totalItems={surveys.length}
            onPageChange={onPageChange}
            gradientColors={Gradients.info || ['#0284C7', '#38BDF8']}
          />
          <Card.Content style={styles.cardContent}>
            {loading ? (
              <CardLoadingIndicator />
            ) : (
              <FlatList
                data={paginatedSurveys}
                keyExtractor={(item) => `survey-${item?.id}`}
                renderItem={({ item }) => (
                  <Surface style={styles.surveyItem}>
                    <View style={styles.surveyHeader}>
                      <Text style={styles.surveyTitle}>{item.title || 'Başlıksız Anket'}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.statusText, { color: '#047857' }]}>
                          %{item.participationRate || 0}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.surveyDetails}>
                      <Text style={styles.surveyParticipants}>
                        {item.responseCount || 0}/{item.totalParticipants || 0} Katılımcı
                      </Text>
                      <Text style={styles.surveyDate}>
                        Bitiş: {item.endDate ? new Date(item.endDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                      </Text>
                    </View>
                    <Text style={styles.surveyCreatedAt}>
                      Oluşturulma: {new Date(item.createdAt).toLocaleDateString('tr-TR')} ({item.daysSinceCreated} gün)
                    </Text>
                  </Surface>
                )}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyListContainer}>
                    <Icon name="poll" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyListText}>Aktif anket bulunmuyor</Text>
                  </View>
                )}
              />
            )}
          </Card.Content>
        </Card>
      </Animatable.View>
    );
  });

  const RecentTenantsCard = memo(({ data, page, loading, onPageChange }) => {
    const uniqueTenants = data?.recentTenants?.filter((tenant, index, self) =>
      index === self.findIndex((t) => t.id === tenant.id)
    ) || [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedTenants = uniqueTenants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getContractStatus = (daysUntilContractEnds) => {
      const monthsRemaining = Math.floor(daysUntilContractEnds / 30);
      const weeksOverdue = Math.abs(Math.floor(daysUntilContractEnds / 7));

      if (daysUntilContractEnds < 0) {
        return {
          text: `Süresi Doldu (${weeksOverdue} Hafta)`,
          backgroundColor: '#FEE2E2',
          textColor: '#DC2626'
        };
      } else if (daysUntilContractEnds === 0) {
        return {
          text: 'Bugün Bitiyor',
          backgroundColor: '#FEF3C7',
          textColor: '#D97706'
        };
      } else if (monthsRemaining === 0) {
        return {
          text: `${daysUntilContractEnds} Gün Kaldı`,
          backgroundColor: '#FEF3C7',
          textColor: '#D97706'
        };
      } else {
        return {
          text: `${monthsRemaining} Ay Kaldı`,
          backgroundColor: '#DCFCE7',
          textColor: '#16A34A'
        };
      }
    };

    return (
      <Animatable.View animation="fadeInUp" duration={800} delay={900}>
        <Card style={styles.card}>
          <CardHeader
            title="Son Kiracılar"
            icon="account-multiple"
            currentPage={page}
            totalItems={uniqueTenants.length}
            onPageChange={onPageChange}
            gradientColors={Gradients.secondary || ['#7E22CE', '#A855F7']}
          />
          <Card.Content style={styles.cardContent}>
            {loading ? (
              <CardLoadingIndicator />
            ) : (
              <FlatList
                data={paginatedTenants}
                keyExtractor={(item) => `tenant-${item.id}`}
                renderItem={({ item }) => {
                  const contractStatus = getContractStatus(item.daysUntilContractEnds);

                  return (
                    <Surface style={styles.tenantItem}>
                      <View style={styles.tenantHeader}>
                        <Text style={styles.tenantName}>{item.fullName || 'İsimsiz Kiracı'}</Text>
                        <Text style={styles.monthlyRent}>
                          {(item.monthlyRent || 0).toLocaleString('tr-TR')} ₺/ay
                        </Text>
                      </View>
                      <View style={styles.tenantDetails}>
                        <View style={styles.tenantLocation}>
                          <Text style={styles.buildingInfo}>
                            {item.buildingName || 'Bina Belirtilmemiş'} - No: {item.apartmentNumber || '?'}
                          </Text>
                        </View>
                        <View style={styles.tenantDates}>
                          <View style={[
                            styles.contractStatus,
                            { backgroundColor: contractStatus.backgroundColor }
                          ]}>
                            <Text style={[
                              styles.contractStatusText,
                              { color: contractStatus.textColor }
                            ]}>
                              {contractStatus.text}
                            </Text>
                          </View>
                          <Text style={styles.dateInfo}>
                            Giriş: {new Date(item.moveInDate).toLocaleDateString('tr-TR')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.lastPaymentDate}>
                        Son Ödeme: {item.lastPaymentDate && item.lastPaymentDate !== '0001-01-01T00:00:00' ? 
                          new Date(item.lastPaymentDate).toLocaleDateString('tr-TR') : 'Henüz ödeme yapılmadı'}
                      </Text>
                    </Surface>
                  );
                }}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyListContainer}>
                    <MaterialCommunityIcons name="account-multiple" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyListText}>Yeni kiracı bulunmuyor</Text>
                  </View>
                )}
              />
            )}
          </Card.Content>
        </Card>
      </Animatable.View>
    );
  });

  const RecentNotificationsCard = memo(({ data, page, loading, onPageChange }) => {
    const notifications = data?.recentNotifications || [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedNotifications = notifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <Animatable.View animation="fadeInUp" duration={800} delay={1100}>
        <Card style={styles.card}>
          <CardHeader
            title="Son Bildirimler"
            icon="bell"
            currentPage={page}
            totalItems={notifications.length}
            onPageChange={onPageChange}
            gradientColors={Gradients.error || ['#DC2626', '#EF4444']}
          />
          <Card.Content style={styles.cardContent}>
            {loading ? (
              <CardLoadingIndicator />
            ) : (
              <FlatList
                data={paginatedNotifications}
                keyExtractor={(item) => `notification-${item.id}`}
                renderItem={({ item }) => (
                  <Surface style={styles.notificationItem}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.statusText, { color: '#DC2626' }]}>
                          {item.readRate}% Okunma
                        </Text>
                      </View>
                    </View>
                    <View style={styles.notificationDetails}>
                      <Text style={styles.notificationDate}>
                        {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                      </Text>
                      <Text style={styles.notificationStats}>
                        {item.readCount}/{item.recipientCount} Okundu
                      </Text>
                    </View>
                  </Surface>
                )}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyListContainer}>
                    <MaterialCommunityIcons name="bell-off" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyListText}>Bildirim bulunmuyor</Text>
                  </View>
                )}
              />
            )}
          </Card.Content>
        </Card>
      </Animatable.View>
    );
  });

  const RecentMeetingsCard = memo(({ data, page, loading, onPageChange }) => {
    const meetings = data?.recentMeetings || [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedMeetings = meetings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <Animatable.View animation="fadeInUp" duration={800} delay={1300}>
        <Card style={styles.card}>
          <CardHeader
            title="Son Toplantılar"
            icon="calendar-clock"
            currentPage={page}
            totalItems={meetings.length}
            onPageChange={onPageChange}
            gradientColors={['#059669', '#10B981']}
          />
          <Card.Content style={styles.cardContent}>
            {loading ? (
              <CardLoadingIndicator />
            ) : (
              <FlatList
                data={paginatedMeetings}
                keyExtractor={(item) => `meeting-${item.id}`}
                renderItem={({ item }) => (
                  <Surface style={styles.meetingItem}>
                    <View style={styles.meetingHeader}>
                      <Text style={styles.meetingTitle}>{item.title}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.isCompleted ? '#DCFCE7' : '#FEF3C7' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: item.isCompleted ? '#16A34A' : '#D97706' }
                        ]}>
                          {item.isCompleted ? 'Tamamlandı' : 'Planlandı'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.meetingDetails}>
                      <View style={styles.meetingInfo}>
                        <MaterialCommunityIcons name="office-building" size={16} color="#64748B" />
                        <Text style={styles.meetingBuilding}>{item.buildingName}</Text>
                      </View>
                      <View style={styles.meetingInfo}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
                        <Text style={styles.meetingDate}>
                          {new Date(item.meetingDate).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.meetingStats}>
                      <Text style={styles.meetingParticipants}>
                        Katılım: {item.actualParticipants}/{item.expectedParticipants} (%{item.participationRate})
                      </Text>
                    </View>
                  </Surface>
                )}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyListContainer}>
                    <MaterialCommunityIcons name="calendar-blank" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyListText}>Toplantı bulunmuyor</Text>
                  </View>
                )}
              />
            )}
          </Card.Content>
        </Card>
      </Animatable.View>
    );
  });

  // Memoized page change handlers
  const handleTenantsPageChange = useCallback((page) => {
    setTenantsLoading(true);
    setTenantsPage(page);
    setTimeout(() => setTenantsLoading(false), 300);
  }, []);

  const handleComplaintsPageChange = useCallback((page) => {
    setComplaintsLoading(true);
    setComplaintsPage(page);
    setTimeout(() => setComplaintsLoading(false), 300);
  }, []);

  const handleSurveysPageChange = useCallback((page) => {
    setSurveysLoading(true);
    setSurveysPage(page);
    setTimeout(() => setSurveysLoading(false), 300);
  }, []);

  const handleNotificationsPageChange = useCallback((page) => {
    setNotificationsLoading(true);
    setNotificationsPage(page);
    setTimeout(() => setNotificationsLoading(false), 300);
  }, []);

  const handleMeetingsPageChange = useCallback((page) => {
    setMeetingsLoading(true);
    setMeetingsPage(page);
    setTimeout(() => setMeetingsLoading(false), 300);
  }, []);

  const renderCard = useCallback(({ item }) => {
    switch (item.type) {
      case 'complaints':
        return (
          <View style={styles.horizontalCard}>
            <RecentComplaintsCard 
              data={reportData}
              page={complaintsPage}
              loading={complaintsLoading}
              onPageChange={handleComplaintsPageChange}
            />
          </View>
        );
      case 'surveys':
        return (
          <View style={styles.horizontalCard}>
            <RecentSurveysCard 
              data={reportData}
              page={surveysPage}
              loading={surveysLoading}
              onPageChange={handleSurveysPageChange}
            />
          </View>
        );
      case 'tenants':
        return (
          <View style={styles.horizontalCard}>
            <RecentTenantsCard 
              data={reportData}
              page={tenantsPage}
              loading={tenantsLoading}
              onPageChange={handleTenantsPageChange}
            />
          </View>
        );
      case 'notifications':
        return (
          <View style={styles.horizontalCard}>
            <RecentNotificationsCard 
              data={reportData}
              page={notificationsPage}
              loading={notificationsLoading}
              onPageChange={handleNotificationsPageChange}
            />
          </View>
        );
      case 'meetings':
        return (
          <View style={styles.horizontalCard}>
            <RecentMeetingsCard 
              data={reportData}
              page={meetingsPage}
              loading={meetingsLoading}
              onPageChange={handleMeetingsPageChange}
            />
          </View>
        );
      default:
        return null;
    }
  }, [reportData, complaintsPage, surveysPage, tenantsPage, notificationsPage, meetingsPage,
      complaintsLoading, surveysLoading, tenantsLoading, notificationsLoading, meetingsLoading,
      handleComplaintsPageChange, handleSurveysPageChange, handleTenantsPageChange,
      handleNotificationsPageChange, handleMeetingsPageChange]);

  const horizontalCards = [
    { id: 'complaints', type: 'complaints' },
    { id: 'surveys', type: 'surveys' },
    { id: 'tenants', type: 'tenants' },
    { id: 'notifications', type: 'notifications' },
    { id: 'meetings', type: 'meetings' }
  ];

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
        <MaterialCommunityIcons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <BuildingSummaryCard />
      
      <FlatList
        horizontal
        data={horizontalCards}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContainer}
        snapToAlignment="center"
        decelerationRate={0.85}
        snapToInterval={width - 32}
        getItemLayout={(data, index) => ({
          length: width - 32,
          offset: (width - 32) * index,
          index,
        })}
        style={styles.horizontalList}
        pagingEnabled
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 90,
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
    marginTop: 10,
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  gradientHeader: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: Fonts.urbanist.bold,
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  highlightSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  highlightTitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
    marginBottom: 8,
  },
  highlightValue: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  highlightSubvalue: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.success,
  },
  complaintItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintTitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
  },
  complaintDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  complaintBuilding: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  complaintTenant: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  surveyItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  surveyTitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#334155',
  },
  surveyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surveyParticipants: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  surveyDate: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  surveyCreatedAt: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tenantItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tenantName: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#334155',
  },
  monthlyRent: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.success,
  },
  tenantDetails: {
    gap: 8,
  },
  tenantLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buildingInfo: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  tenantDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  contractStatusText: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
  },
  dateInfo: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  loadMoreButton: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.primary,
  },
  cardHeaderWithPagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerPaginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  headerPaginationButton: {
    padding: 4,
    borderRadius: 6,
  },
  headerPaginationButtonDisabled: {
    opacity: 0.5,
  },
  headerPaginationText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#FFFFFF',
    marginHorizontal: 8,
    minWidth: 32,
    textAlign: 'center',
  },
  cardLoadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  notificationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  notificationStats: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  meetingItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingTitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  meetingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meetingBuilding: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  meetingDate: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  meetingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingParticipants: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  horizontalList: {
    marginTop: 0,
  },
  horizontalListContainer: {
    paddingHorizontal: width / 2 - (width - 32) / 2,
    paddingTop: 0,
  },
  horizontalCard: {
    width: width - 32,
    marginRight: 0,
    marginTop: 0,
  },
});

export default ReportsScreen;