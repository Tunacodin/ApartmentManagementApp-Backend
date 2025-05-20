import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList, Dimensions, Modal, Image } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Button, Portal, Dialog, TextInput } from 'react-native-paper';
import Colors from '../../../constants/Colors';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ComplaintListScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionDialogVisible, setActionDialogVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchBuildings();
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      fetchComplaints(selectedBuilding.id);
    }
  }, [selectedBuilding]);

  const fetchBuildings = async () => {
    try {
      const adminId = await getCurrentAdminId();
      console.log('Fetching buildings for adminId:', adminId);
      console.log('API URL:', API_ENDPOINTS.ADMIN.BUILDINGS(adminId));
      
      const response = await axios.get(API_ENDPOINTS.ADMIN.BUILDINGS(adminId));
      console.log('Buildings response:', response.data);
      
      if (response.data.success) {
        // Sadece buildingId ve buildingName'i al ve undefined kontrolü yap
        const mappedBuildings = response.data.data
          .filter(building => building && building.buildingId && building.buildingName)
          .map(building => ({
            id: building.buildingId,
            name: building.buildingName
          }));
        console.log('Mapped buildings:', mappedBuildings);
        setBuildings(mappedBuildings);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      Alert.alert('Hata', 'Binalar alınırken bir hata oluştu.');
    }
  };

  const fetchComplaints = async (buildingId = null) => {
    try {
      setLoading(true);
      const adminId = await getCurrentAdminId();
      const url = buildingId 
        ? API_ENDPOINTS.COMPLAINT.BY_BUILDING(buildingId)
        : API_ENDPOINTS.COMPLAINT.BY_ADMIN(adminId);
      
      const response = await axios.get(url);
      if (response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      Alert.alert('Hata', 'Şikayetler alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintAction = async (action) => {
    if (!selectedComplaint) return;

    try {
      setProcessingAction(true);
      const adminId = await getCurrentAdminId();
      let response;

      switch (action) {
        case 'process':
          response = await axios.post(API_ENDPOINTS.COMPLAINT.TAKE(selectedComplaint.id, adminId));
          break;
        case 'resolve':
          response = await axios.post(API_ENDPOINTS.COMPLAINT.RESOLVE(selectedComplaint.id, adminId));
          break;
        case 'reject':
          if (!rejectReason.trim()) {
            Alert.alert('Hata', 'Lütfen red sebebini belirtin.');
            return;
          }
          response = await axios.post(API_ENDPOINTS.COMPLAINT.REJECT(selectedComplaint.id, adminId), {
            reason: rejectReason
          });
          break;
      }

      if (response.data.success) {
        Alert.alert('Başarılı', 'İşlem başarıyla tamamlandı.');
        setActionDialogVisible(false);
        setSelectedComplaint(null);
        setRejectReason('');
        fetchComplaints(); // Listeyi yenile
      }
    } catch (error) {
      console.error('Error processing complaint:', error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Çözüldü':
        return '#10B981';
      case 'İşlemde':
        return '#3B82F6';
      case 'Reddedildi':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const ComplaintCard = ({ complaint }) => (
    <TouchableOpacity onPress={() => {
      setSelectedComplaint(complaint);
      setActionDialogVisible(true);
    }}>
      <Card style={styles.complaintCard}>
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE', '#BFDBFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardMainContent}>
              {/* Sol taraf - Profil Resmi */}
              <View style={styles.profileSection}>
                <Image 
                  source={{ uri: complaint.profileImageUrl }} 
                  style={styles.profileImage}
                />
                <View style={styles.statusBadgeContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.statusText) }]}>
                    <Text style={styles.statusText}>{complaint.statusText}</Text>
                  </View>
                </View>
              </View>

              {/* Sağ taraf - Şikayet Detayları */}
              <View style={styles.detailsSection}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.subject}>{complaint.subject}</Text>
                  <Text style={styles.date}>
                    {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {complaint.description}
                </Text>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Icon name="account" size={16} color="#6366F1" />
                    <Text style={styles.detailText}>{complaint.createdByName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="home" size={16} color="#6366F1" />
                    <Text style={styles.detailText}>Daire {complaint.apartmentNumber}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="clock-outline" size={16} color="#6366F1" />
                    <Text style={styles.detailText}>{complaint.daysOpen} gün</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  const BuildingItem = ({ building }) => (
    <TouchableOpacity
      onPress={() => setSelectedBuilding(building)}
      style={[
        styles.buildingItem,
        selectedBuilding?.id === building.id && styles.selectedBuildingItem
      ]}
    >
      <LinearGradient
        colors={selectedBuilding?.id === building.id 
          ? ['#3B82F6', '#2563EB']
          : ['#EFF6FF', '#DBEAFE', '#BFDBFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buildingGradient}
      >
        <View style={styles.buildingItemContent}>
          <Icon 
            name="office-building" 
            size={24} 
            color={selectedBuilding?.id === building.id ? '#FFFFFF' : '#3B82F6'} 
          />
          <Text 
            style={[
              styles.buildingItemText,
              { color: selectedBuilding?.id === building.id ? '#FFFFFF' : '#1E293B' }
            ]}
            numberOfLines={1}
          >
            {building.name}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ActionDialog = () => {
    const isActionDisabled = selectedComplaint?.statusText === 'Çözüldü' || selectedComplaint?.statusText === 'Reddedildi';

    return (
      <Portal>
        <Dialog 
          visible={actionDialogVisible} 
          onDismiss={() => setActionDialogVisible(false)}
          style={styles.dialogContainer}
        >
          <Dialog.Title style={styles.dialogTitle}>
            <View style={styles.dialogTitleContainer}>
              <Icon name="alert-circle-outline" size={24} color="#3B82F6" />
              <Text style={styles.dialogTitleText}>Şikayet Detayı</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContentContainer}>
            {selectedComplaint && (
              <View style={styles.dialogContent}>
                <View style={styles.dialogHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedComplaint.statusText) }]}>
                    <Text style={styles.statusText}>{selectedComplaint.statusText}</Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <Icon name="calendar" size={16} color="#64748B" />
                    <Text style={styles.dialogDate}>
                      {new Date(selectedComplaint.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.dialogCard}>
                  <View style={styles.dialogSection}>
                    <Text style={styles.dialogLabel}>Şikayet Başlığı</Text>
                    <Text style={styles.dialogValue}>{selectedComplaint.subject}</Text>
                  </View>

                  <View style={styles.dialogSection}>
                    <Text style={styles.dialogLabel}>Açıklama</Text>
                    <Text style={styles.dialogValue}>{selectedComplaint.description}</Text>
                  </View>
                </View>

                <View style={styles.dialogCard}>
                  <Text style={styles.dialogSectionTitle}>Şikayet Eden Bilgileri</Text>
                  <View style={styles.userInfoContainer}>
                    <View style={styles.userInfo}>
                      <Icon name="account" size={16} color="#3B82F6" />
                      <Text style={styles.dialogValue}>{selectedComplaint.createdByName}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Icon name="phone" size={16} color="#3B82F6" />
                      <Text style={styles.dialogValue}>{selectedComplaint.phoneNumber}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Icon name="email" size={16} color="#3B82F6" />
                      <Text style={styles.dialogValue}>{selectedComplaint.email}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.dialogCard}>
                  <Text style={styles.dialogSectionTitle}>Konum Bilgisi</Text>
                  <View style={styles.locationInfo}>
                    <Icon name="home" size={16} color="#3B82F6" />
                    <Text style={styles.dialogValue}>Daire {selectedComplaint.apartmentNumber}</Text>
                  </View>
                </View>

                {!isActionDisabled && (
                  <View style={styles.dialogCard}>
                    <Text style={styles.dialogSectionTitle}>İşlem</Text>
                    <TextInput
                      label="Red sebebini yazın"
                      value={rejectReason}
                      onChangeText={setRejectReason}
                      multiline
                      numberOfLines={3}
                      style={styles.rejectInput}
                      mode="outlined"
                      outlineColor="#E2E8F0"
                      activeOutlineColor="#3B82F6"
                    />
                  </View>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              onPress={() => setActionDialogVisible(false)}
              style={[styles.dialogButton, styles.closeButton]}
              textColor="#1E293B"
              mode="outlined"
            >
              Kapat
            </Button>
            
            {!isActionDisabled && (
              <>
                {selectedComplaint?.statusText === 'Açık' && (
                  <Button 
                    onPress={() => handleComplaintAction('process')}
                    loading={processingAction}
                    disabled={processingAction}
                    style={[styles.dialogButton, styles.processButton]}
                    textColor="#3B82F6"
                  >
                    İşleme Al
                  </Button>
                )}
                
                {selectedComplaint?.statusText === 'İşlemde' && (
                  <Button 
                    onPress={() => handleComplaintAction('resolve')}
                    loading={processingAction}
                    disabled={processingAction}
                    style={[styles.dialogButton, styles.resolveButton]}
                    textColor="#10B981"
                  >
                    Çözüldü
                  </Button>
                )}
                
                <Button 
                  onPress={() => handleComplaintAction('reject')}
                  loading={processingAction}
                  disabled={processingAction || !rejectReason.trim()}
                  style={[styles.dialogButton, styles.rejectButton]}
                  textColor="#EF4444"
                >
                  Reddet
                </Button>
              </>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Şikayetler</Text>
      </View>

      <View style={styles.buildingsContainer}>
        <FlatList
          data={buildings}
          renderItem={({ item }) => <BuildingItem building={item} />}
          keyExtractor={item => `building-${item?.id || Math.random()}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buildingsList}
        />
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.loadingText, { color: Colors.text }]}>Şikayetler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={({ item }) => <ComplaintCard complaint={item} />}
          keyExtractor={(item) => `complaint-${item.id}`}
          contentContainerStyle={styles.complaintList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle-outline" size={48} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: '#64748B' }]}>
                Şikayet bulunamadı
              </Text>
            </View>
          }
        />
      )}

      <ActionDialog />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  complaintList: {
    padding: 16,
  },
  complaintCard: {
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
  cardContent: {
    padding: 16,
  },
  cardMainContent: {
    flexDirection: 'row',
    gap: 16,
  },
  profileSection: {
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsSection: {
    flex: 1,
    gap: 8,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    color: '#64748B',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
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
    textAlign: 'center',
  },
  dialogContainer: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  dialogTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  dialogContentContainer: {
    paddingHorizontal: 0,
  },
  dialogContent: {
    gap: 16,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dialogDate: {
    fontSize: 14,
    color: '#64748B',
  },
  dialogCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
  },
  dialogSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  dialogSection: {
    gap: 4,
  },
  dialogLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  dialogValue: {
    fontSize: 16,
    color: '#1E293B',
  },
  userInfoContainer: {
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rejectInput: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  dialogActions: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  dialogButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  closeButton: {
    borderColor: '#1E293B',
    borderWidth: 1,
  },
  processButton: {
    backgroundColor: '#EFF6FF',
  },
  resolveButton: {
    backgroundColor: '#ECFDF5',
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
  },
  buildingsContainer: {
    marginVertical: 8,
  },
  buildingsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  buildingItem: {
    width: width * 0.4,
    height: 80,
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedBuildingItem: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buildingGradient: {
    flex: 1,
    padding: 12,
  },
  buildingItemContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buildingItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ComplaintListScreen; 