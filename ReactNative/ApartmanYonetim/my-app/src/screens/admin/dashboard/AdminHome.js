import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    RefreshControl,
    StyleSheet,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { 
    Card, 
    Title, 
    Text, 
    useTheme,
    Avatar,
    List,
    Divider 
} from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import * as Animatable from 'react-native-animatable';
import { Svg, Path, Filter, Defs } from 'react-native-svg';

// SVG bileşenlerini memo ile sarmalayalım
const CustomSvgIcon = ({ ...props }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
    <Defs>
      {/* Her filter için unique bir id kullanalım */}
      <Filter id={`filter_${props.id || 'default'}`}>
        {/* Filter içeriği */}
      </Filter>
    </Defs>
    <Path d="..." fill={props.color} />
  </Svg>
);

function AdminHome() {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const adminId = 1; // Bu değer authentication'dan gelmeli

    const fetchDashboardData = async () => {
        try {
            const [dashboardRes, statsRes, activitiesRes] = await Promise.all([
                axios.get(API_ENDPOINTS.ADMIN.DASHBOARD(adminId)),
                axios.get(API_ENDPOINTS.ADMIN.STATISTICS(adminId)),
                axios.get(API_ENDPOINTS.ADMIN.ACTIVITIES(adminId))
            ]);

            setDashboardData(dashboardRes.data.data);
            setStatistics(statsRes.data.data);
            setRecentActivities(activitiesRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator 
                    size="large" 
                    color={theme.colors.primary || '#6C63FF'}
                />
            </View>
        );
    }

    const StatCard = ({ title, value, icon, color }) => (
        <Animatable.View animation="fadeInUp" style={styles.statCardContainer}>
            <Card style={[styles.statCard, { borderLeftColor: color }]}>
                <Card.Content style={styles.statCardContent}>
                    <MaterialCommunityIcons name={icon} size={30} color={color} />
                    <View>
                        <Text style={styles.statTitle}>{title}</Text>
                        <Title style={[styles.statValue, { color }]}>{value}</Title>
                    </View>
                </Card.Content>
            </Card>
        </Animatable.View>
    );

    return (
        <ScrollView 
            style={styles.container}
            contentInset={{ top: 40 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Stats Overview */}
            <View style={styles.statsGrid}>
                <StatCard 
                    title="Total Buildings"
                    value={dashboardData?.totalBuildings}
                    icon="office-building"
                    color="#4CAF50"
                />
                <StatCard 
                    title="Total Residents"
                    value={statistics?.totalResidents}
                    icon="account-group"
                    color="#2196F3"
                />
                <StatCard 
                    title="Active Complaints"
                    value={statistics?.activeComplaints}
                    icon="alert-circle"
                    color="#FF9800"
                />
                <StatCard 
                    title="Pending Payments"
                    value={statistics?.pendingPayments}
                    icon="cash-multiple"
                    color="#F44336"
                />
            </View>

            {/* Financial Chart */}
            <Animatable.View animation="fadeInUp" delay={300}>
                <Card style={styles.chartCard}>
                    <Card.Content>
                        <Title>Monthly Income Overview</Title>
                        <LineChart
                            data={{
                                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                                datasets: [{
                                    data: [
                                        dashboardData?.totalMonthlyIncome || 0,
                                        dashboardData?.totalMonthlyIncome * 0.8,
                                        dashboardData?.totalMonthlyIncome * 1.2,
                                        dashboardData?.totalMonthlyIncome * 0.9,
                                        dashboardData?.totalMonthlyIncome * 1.1,
                                        dashboardData?.totalMonthlyIncome || 0
                                    ]
                                }]
                            }}
                            width={Dimensions.get("window").width - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: theme.colors.surface,
                                backgroundGradientFrom: theme.colors.surface,
                                backgroundGradientTo: theme.colors.surface,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
                                labelColor: (opacity = 1) => theme.colors.text,
                                style: {
                                    borderRadius: 16
                                }
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </Card.Content>
                </Card>
            </Animatable.View>

            {/* Recent Activities */}
            <Animatable.View animation="fadeInUp" delay={600}>
                <Card style={styles.activitiesCard}>
                    <Card.Content>
                        <Title>Recent Activities</Title>
                        {recentActivities.map((activity, index) => (
                            <React.Fragment key={activity.id}>
                                <List.Item
                                    title={activity.activityType}
                                    description={activity.description}
                                    left={props => (
                                        <Avatar.Icon 
                                            {...props} 
                                            icon={
                                                activity.activityType === "Payment" ? "cash" :
                                                activity.activityType === "Complaint" ? "alert" : "calendar"
                                            }
                                            size={40}
                                        />
                                    )}
                                    right={props => (
                                        <Text {...props} style={styles.activityStatus}>
                                            {activity.status}
                                        </Text>
                                    )}
                                />
                                {index < recentActivities.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </Card.Content>
                </Card>
            </Animatable.View>

            {/* SVG bileşenini unique id'lerle kullanalım */}
            <CustomSvgIcon id="home_icon" color="#000" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCardContainer: {
        width: '48%',
        marginBottom: 16,
    },
    statCard: {
        borderLeftWidth: 4,
        elevation: 4,
    },
    statCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statTitle: {
        fontSize: 12,
        opacity: 0.6,
    },
    statValue: {
        fontSize: 20,
        marginTop: 4,
    },
    chartCard: {
        marginBottom: 16,
        elevation: 4,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    activitiesCard: {
        marginBottom: 16,
        elevation: 4,
    },
    activityStatus: {
        fontSize: 12,
        opacity: 0.6,
        alignSelf: 'center',
    },
});

export default AdminHome;