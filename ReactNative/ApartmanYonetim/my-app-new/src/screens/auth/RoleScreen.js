import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_PADDING = 16;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - (CARD_PADDING * 2) - (CARD_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

const roles = [
  { 
    id: '1', 
    label: 'Yönetici', 
    value: 'admin', 
    icon: 'user-shield', 
    active: true,
    gradient: ['#6366F1', '#4F46E5'],
    description: 'Apartman yönetimi ve finansal işlemler'
  },
  { 
    id: '2', 
    label: 'Kiracı', 
    value: 'tenant', 
    icon: 'user', 
    active: true,
    gradient: ['#0EA5E9', '#0284C7'],
    description: 'Daire ve ödeme yönetimi'
  },
  { 
    id: '3', 
    label: 'Ev Sahibi', 
    value: 'owner', 
    icon: 'home', 
    active: false,
    gradient: ['#8B5CF6', '#7C3AED'],
    description: 'Mülk ve gelir takibi'
  },
  { 
    id: '4', 
    label: 'Personel', 
    value: 'worker', 
    icon: 'briefcase', 
    active: false,
    gradient: ['#10B981', '#059669'],
    description: 'Bakım ve onarım işlemleri'
  },
];

const RoleScreen = ({ navigation }) => {
  const selectRole = (role, active) => {
    if (active) {
      navigation.navigate('LoginScreen', { role });
    }
  };

  const renderRoleItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 200}
      duration={800}
      style={styles.cardContainer}
    >
      <TouchableOpacity 
        style={[styles.roleButton, !item.active && styles.inactiveButton]} 
        onPress={() => selectRole(item.value, item.active)}
        disabled={!item.active}
      >
        <LinearGradient
          colors={item.active ? item.gradient : ['#A0A0A0', '#808080']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <BlurView intensity={20} style={styles.blurOverlay}>
            <View style={[styles.iconContainer, !item.active && styles.inactiveIconContainer]}>
              <Icon name={item.icon} size={32} color={item.active ? '#FFFFFF' : '#D0D0D0'} />
            </View>
            <Text style={[styles.roleText, !item.active && styles.inactiveText]}>{item.label}</Text>
            <Text style={[styles.roleDescription, !item.active && styles.inactiveText]}>
              {item.description}
            </Text>
            {!item.active && (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Yakında</Text>
              </View>
            )}
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Animatable.View 
          animation="fadeInDown" 
          duration={1000}
          style={styles.headerContainer}
        >
          <Text style={styles.title}>Evin'i kim olarak{'\n'}kullanıyorsun?</Text>
          <Text style={styles.subtitle}>Size en uygun rolü seçin</Text>
        </Animatable.View>

        <FlatList
          data={roles}
          renderItem={renderRoleItem}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.flatListContainer}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: CARD_PADDING,
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0F172A',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  flatListContainer: {
    paddingVertical: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
  },
  roleButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
  inactiveButton: {
    opacity: 0.7,
  },
  inactiveIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  inactiveText: {
    color: '#D0D0D0',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RoleScreen;