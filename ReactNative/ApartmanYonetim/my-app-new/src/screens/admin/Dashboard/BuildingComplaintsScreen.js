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

const ComplaintCard = ({ complaint, onPress }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const getStatusGradient = (status) => {
    switch (status) {
      case 2: // Resolved
        return theme?.gradients?.success || Gradients.success || ['#4CAF50', '#45a049'];
      case 0: // Open
        return theme?.gradients?.warning || Gradients.warning || ['#FFC107', '#FFA000'];
      case 1: // InProgress
        return theme?.gradients?.info || Gradients.info || ['#2196F3', '#1976D2'];
      case 3: // Rejected
        return theme?.gradients?.danger || Gradients.danger || ['#FF5252', '#FF1744'];
      default:
        return [Colors.textSecondary, Colors.textSecondary];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 2:
        return 'Çözüldü';
      case 0:
        return 'Bekliyor';
      case 1:
        return 'İşlemde';
      case 3:
        return 'Reddedildi';
      default:
        return 'Bekliyor';
    }
  };

  const handlePress = async () => {
    if (!isExpanded) {
      setLoading(true);
      try {
        const response = await axios.get(API_ENDPOINTS.COMPLAINT.DETAIL(complaint.id));
        if (response.data.success) {
          setComplaintDetails(response.data.data);
        }
      } catch (error) {
        console.error('Şikayet detayları alınırken hata oluştu:', error);
        Alert.alert('Hata', 'Şikayet detayları alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const adminId = await getCurrentAdminId();
      await axios.post(API_ENDPOINTS.COMPLAINT.TAKE(complaint.id, adminId));
      Alert.alert('Başarılı', 'Şikayet işleme alındı.');
      setIsExpanded(false);
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
      setIsExpanded(false);
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
      setIsExpanded(false);
    } catch (error) {
      console.error('Şikayet reddedilirken hata oluştu:', error);
      Alert.alert('Hata', 'Şikayet reddedilirken bir hata oluştu.');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card style={[styles.complaintCard, isExpanded && styles.complaintCardExpanded]}>
        <LinearGradient
          colors={getStatusGradient(complaint.status)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        />
        <Card.Content>
          <View style={styles.complaintHeader}>
            <View style={styles.complaintHeaderLeft}>
              <Icon name="alert-circle" size={24} color="#FFFFFF" />
              <View style={styles.complaintHeaderInfo}>
                <Text style={styles.complaintTitle}>
                  {complaint.subject}
                </Text>
                <Text style={styles.complaintSubtitle}>
                  {complaint.createdByName}
                </Text>
              </View>
            </View>
            <View style={styles.complaintHeaderRight}>
              <Text style={styles.complaintDate}>
                {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
              </Text>
              <Badge style={styles.statusBadge}>
                {getStatusText(complaint.status)}
              </Badge>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.complaintContent}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#666666" />
                  <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.complaintDescription}>
                    {complaintDetails?.description}
                  </Text>

                  <View style={styles.complaintDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="home" size={16} color="#666666" />
                      <Text style={styles.detailText}>
                        {complaintDetails?.apartmentNumber || 'Daire bilgisi yok'}
                      </Text>
                    </View>
                    {complaintDetails?.phoneNumber && (
                      <View style={styles.detailRow}>
                        <Icon name="phone" size={16} color="#666666" />
                        <Text style={styles.detailText}>
                          {complaintDetails.phoneNumber}
                        </Text>
                      </View>
                    )}
                    {complaintDetails?.email && (
                      <View style={styles.detailRow}>
                        <Icon name="email" size={16} color="#666666" />
                        <Text style={styles.detailText}>
                          {complaintDetails.email}
                        </Text>
                      </View>
                    )}
                  </View>

                  {complaintDetails?.isOpen && (
                    <View style={styles.actionButtons}>
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
                            placeholderTextColor="#999999"
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
                  )}
                </>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const BuildingComplaintsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { buildingId, buildingName } = route.params;
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = async () => {
    try {
      const adminId = await getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.COMPLAINT.BY_BUILDING(buildingId));
      
      if (response.data.success) {
        setComplaints(response.data.data);
      } else {
        throw new Error(response.data.message || 'Şikayetler alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Şikayetler alınırken hata:', error);
      Alert.alert('Hata', 'Şikayetler alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [buildingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Şikayetler yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>{buildingName} - Şikayetler</Text>
      </View>
      <FlatList
        data={complaints}
        renderItem={({ item }) => <ComplaintCard complaint={item} />}
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
            <Icon name="alert-circle-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>
              Bu binada aktif şikayet bulunmuyor
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
  complaintCard: {
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
  complaintCardExpanded: {
    elevation: 8,
    shadowOpacity: 0.3,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  complaintTitle: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#F1F5F9',
    marginBottom: 4,
  },
  complaintSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: '#94A3B8',
  },
  complaintHeaderRight: {
    alignItems: 'flex-end',
  },
  complaintDate: {
    fontSize: 12,
    fontFamily: Fonts.lato.regular,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  complaintContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  complaintDescription: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: '#F1F5F9',
    marginBottom: 16,
    lineHeight: 20,
  },
  complaintDetails: {
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
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
  },
  actionButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.lato.bold,
    fontSize: 14,
  },
  rejectContainer: {
    marginTop: 8,
  },
  rejectInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontFamily: Fonts.lato.regular,
    color: '#F1F5F9',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rejectButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  rejectButton: {
    minWidth: 100,
    borderRadius: 8,
  },
  rejectButtonLabel: {
    color: '#94A3B8',
    fontFamily: Fonts.lato.bold,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#94A3B8',
    fontFamily: Fonts.lato.regular,
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

export default BuildingComplaintsScreen; 