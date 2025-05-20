import React, { useState, createContext, useContext } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text, Animated, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Theme';
// Dashboard Screens
import DashboardScreen from '../screens/admin/Dashboard/DashboardScreen';
import CreateMeetingScreen from '../screens/admin/Dashboard/CreateMeetingScreen';
import CreateAnnouncementScreen from '../screens/admin/Dashboard/CreateAnnouncementScreen';
import CreateNotificationScreen from '../screens/admin/Dashboard/CreateNotificationScreen';
import ActivitiesScreen from '../screens/admin/Dashboard/ActivitiesScreen';
import BuildingsListScreen from '../screens/admin/Dashboard/BuildingsListScreen';
import BuildingComplaintsScreen from '../screens/admin/Dashboard/BuildingComplaintsScreen';
import BuildingTenantsScreen from '../screens/admin/Dashboard/BuildingTenantsScreen';
import BuildingPaymentsScreen from '../screens/admin/Dashboard/BuildingPaymentsScreen';
import CreateSurveyScreen from '../screens/admin/Dashboard/CreateSurveyScreen';
import TenantListScreen from '../screens/admin/Dashboard/TenantListScreen';
import TenantDetailScreen from '../screens/admin/Dashboard/TenantDetailScreen';
import ComplaintListScreen from '../screens/admin/Dashboard/ComplaintListScreen';
import OverduePaymentsScreen from '../screens/admin/Dashboard/OverduePaymentsScreen';
import AdminCreateNavigator from '../screens/admin/create/AdminCreateNavigator';

// Management Screens
import ManagementScreen from '../screens/admin/Management/ManagementScreen';
import ApartmentsScreen from '../screens/admin/Management/ApartmentsScreen';
import UsersScreen from '../screens/admin/Management/UsersScreen';
import MeetingsScreen from '../screens/admin/Management/MeetingsScreen';
import SurveysScreen from '../screens/admin/Management/SurveysScreen';
import ComplaintsScreen from '../screens/admin/Management/ComplaintsScreen';
import ApartmentDetailsScreen from '../screens/admin/Management/ApartmentDetailsScreen';

// Finance Screens
import FinanceScreen from '../screens/admin/Finance/FinanceScreen';
import DuesScreen from '../screens/admin/Finance/DuesScreen';
import ExpensesScreen from '../screens/admin/Finance/ExpensesScreen';
import IncomeScreen from '../screens/admin/Finance/IncomeScreen';
import FinancialReportsScreen from '../screens/admin/Finance/FinancialReportsScreen';

// Reports Screens
import ReportsScreen from '../screens/admin/Reports/ReportsScreen';
import MeetingAttendanceScreen from '../screens/admin/Reports/MeetingAttendanceScreen';
import SurveyResultsScreen from '../screens/admin/Reports/SurveyResultsScreen';

// Profile Screens
import ProfileScreen from '../screens/admin/Profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Validation Context
export const ValidationContext = createContext({
  isValidationEnabled: false,
  toggleValidation: () => {},
});

// Validation Provider
export const ValidationProvider = ({ children }) => {
  const [isValidationEnabled, setIsValidationEnabled] = useState(false);

  const toggleValidation = () => {
    setIsValidationEnabled(prev => !prev);
  };

  return (
    <ValidationContext.Provider value={{ isValidationEnabled, toggleValidation }}>
      {children}
    </ValidationContext.Provider>
  );
};

// Validation Hook
export const useValidation = () => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
};

// Modern color palette
const colors = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: 'rgba(255, 255, 255, 0.9)',
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1E293B',
  textSecondary: '#64748B',
  active: 'rgba(255, 255, 255, 0.95)',
  inactive: '#94A3B8',
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
  fabActive: '#EC4899',
  fabInactive: '#94A3B8',
  fabBackground: 'rgba(255, 255, 255, 0.95)',
  menuBackground: 'rgba(255, 255, 255, 0.98)',
  navActive: 'rgba(255, 255, 255, 0.95)',
  navInactive: '#94A3B8',
};

// Common header options with EVIN title
const screenOptions = {
  headerShown: true,
  headerTitle: () => (
    <Text style={styles.headerTitle}>EVIN</Text>
  ),
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: "#1A202C",
  },
  headerShadowVisible: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  animation: 'slide_from_right',
  headerBackVisible: false,
};

// Dashboard Stack Navigator
const DashboardStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{
        headerShown: true,
        headerTitle: () => (
          <Text style={styles.headerTitle}>EVIN</Text>
        ),
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="TenantList" 
      component={TenantListScreen}
      options={{
        title: 'Kiracı Listesi',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="Activities" 
      component={ActivitiesScreen}
      options={{
        title: 'Etkinlikler',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="CreateMeeting" 
      component={CreateMeetingScreen}
      options={{
        title: 'Toplantı Oluştur',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="CreateAnnouncement" 
      component={CreateAnnouncementScreen}
      options={{
        title: 'Duyuru Oluştur',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="CreateNotification" 
      component={CreateNotificationScreen}
      options={{
        title: 'Bildirim Oluştur',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="BuildingsList" 
      component={BuildingsListScreen}
      options={{
        title: 'Binalarınız',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="BuildingComplaints" 
      component={BuildingComplaintsScreen}
      options={{
        title: 'Bina Şikayetleri',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="BuildingTenants" 
      component={BuildingTenantsScreen}
      options={{
        title: 'Bina Kiracıları',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="BuildingPayments" 
      component={BuildingPaymentsScreen}
      options={{
        title: 'Bina Ödemeleri',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="CreateSurvey" 
      component={CreateSurveyScreen}
      options={{
        title: 'Anket Oluştur',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen name="TenantDetail" component={TenantDetailScreen} />
    
    <Stack.Screen 
      name="ComplaintList" 
      component={ComplaintListScreen}/>
    <Stack.Screen 
      name="OverduePayments" 
      component={OverduePaymentsScreen}
      options={{
        title: 'Gecikmiş Ödemeler',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
  </Stack.Navigator>
);

// Management Stack Navigator
const ManagementStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ManagementMain" component={ManagementScreen} />
    <Stack.Screen name="Apartments" component={ApartmentsScreen} />
    <Stack.Screen name="Users" component={UsersScreen} />
    <Stack.Screen name="Meetings" component={MeetingsScreen} />
    <Stack.Screen name="Surveys" component={SurveysScreen} />
    <Stack.Screen name="Complaints" component={ComplaintsScreen} />
    <Stack.Screen name="CreateMeeting" component={CreateMeetingScreen} />
    <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
    <Stack.Screen name="ApartmentDetails" component={ApartmentDetailsScreen} />
  </Stack.Navigator>
);

// Finance Stack Navigator
const FinanceStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="FinanceMain" component={FinanceScreen} />
    <Stack.Screen name="Dues" component={DuesScreen} />
    <Stack.Screen name="Expenses" component={ExpensesScreen} />
    <Stack.Screen name="Income" component={IncomeScreen} />
    <Stack.Screen name="FinancialReports" component={FinancialReportsScreen} />
  </Stack.Navigator>
);

// Reports Stack Navigator
const ReportsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ReportsMain" component={ReportsScreen} />
    <Stack.Screen name="MeetingAttendance" component={MeetingAttendanceScreen} />
    <Stack.Screen name="SurveyResults" component={SurveyResultsScreen} />
    <Stack.Screen 
      name="TenantList" 
      component={TenantListScreen}
      options={{
        title: 'Kiracı Bilgileri',
        headerTitleStyle: styles.headerTitle,
        headerBackVisible: false,
      }}
    />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const menuAnim = React.useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.spring(menuAnim, {
        toValue,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
    ]).start();

    setIsMenuOpen(!isMenuOpen);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const menuItemsStyle = {
    transform: [
      {
        translateY: menuAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
    opacity: menuAnim,
  };

  const renderFABMenu = () => {
    // Sadece Dashboard ekranında FAB menüsünü göster
    const isDashboard = state.index === 0;
    if (!isDashboard) return null;

    return (
      <View style={styles.fabContainer}>
        <Animated.View style={[styles.fabMenuItem, menuItemsStyle]}>
          <BlurView intensity={90} tint="light" style={[styles.menuItemBlur, { backgroundColor: colors.menuBackground }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                navigation.navigate('Dashboard', {
                  screen: 'CreateMeeting'
                });
              }}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Ionicons name="calendar" size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Toplantı Oluştur</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        <Animated.View 
          style={[
            styles.fabMenuItem, 
            {
              transform: [
                {
                  translateY: menuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -120],
                  }),
                },
              ],
              opacity: menuAnim,
            }
          ]}
        >
          <BlurView intensity={90} tint="light" style={[styles.menuItemBlur, { backgroundColor: colors.menuBackground }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                navigation.navigate('Dashboard', {
                  screen: 'CreateNotification'
                });
              }}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
                <Ionicons name="notifications" size={18} color={colors.fabActive} />
              </View>
              <Text style={styles.menuItemText}>Bildirim Oluştur</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        <Animated.View 
          style={[
            styles.fabMenuItem,
            {
              transform: [
                {
                  translateY: menuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -180],
                  }),
                },
              ],
              opacity: menuAnim,
            }
          ]}
        >
          <BlurView intensity={90} tint="light" style={[styles.menuItemBlur, { backgroundColor: colors.menuBackground }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                navigation.navigate('Dashboard', {
                  screen: 'CreateSurvey'
                });
              }}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="clipboard" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.menuItemText}>Anket Oluştur</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        <TouchableOpacity
          style={styles.fab}
          onPress={toggleMenu}
        >
          <BlurView intensity={90} tint="light" style={[styles.fabBlur, { backgroundColor: colors.fabBackground }]}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons name="add" size={30} color={isMenuOpen ? colors.fabActive : colors.primary} />
            </Animated.View>
          </BlurView>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      {renderFABMenu()}
      <BlurView intensity={50} tint="light" style={styles.blurView}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

        let iconName;
        switch (route.name) {
          case 'Dashboard':
                iconName = isFocused ? 'home' : 'home-outline';
            break;
          case 'Management':
                iconName = isFocused ? 'business' : 'business-outline';
            break;
          case 'Finance':
                iconName = isFocused ? 'wallet' : 'wallet-outline';
            break;
          case 'Reports':
                iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
            break;
          case 'Profile':
                iconName = isFocused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'ellipse';
        }

            return (
              <Pressable
                key={index}
                onPress={onPress}
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonActive
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={28}
                  color={isFocused ? colors.active : colors.inactive}
                  style={styles.tabIcon}
                />
                <Text 
                  numberOfLines={1} 
                  style={[
                    styles.tabLabelText,
                    { color: isFocused ? colors.active : colors.inactive }
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

// Bottom Tab Navigator
const AdminTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardStack}
      options={{
        title: 'AnaSayfa',
      }}
    />
    <Tab.Screen 
      name="Management" 
      component={ManagementStack}
      options={{
        title: 'Yönetim',
      }}
    />
    <Tab.Screen 
      name="Finance" 
      component={FinanceStack}
      options={{
        title: 'Finans',
      }}
    />
    <Tab.Screen 
      name="Reports" 
      component={ReportsStack}
      options={{
        title: 'Raporlar',
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack}
      options={{
        title: 'Profil',
      }}
    />
  </Tab.Navigator>
);

// Main Admin Navigator
const AdminNavigator = () => {
  return (
    <ValidationProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
        <Stack.Screen name="AdminCreate" component={AdminCreateNavigator} />
      </Stack.Navigator>
    </ValidationProvider>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  blurView: {
    width: '92%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
  },
  tabBar: {
    flexDirection: 'row',
  
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 3,
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabelText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: '100%',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'center',
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabBlur: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabMenuItem: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 180,
  },
  menuItemBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
   
  },
  menuItemText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    flex: 1,
  },
  menuItemIcon: {
    width: 34,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#FFFFFF",
    letterSpacing: 2,
    fontFamily:"Lato-Bold",
  },
});

export default AdminNavigator;