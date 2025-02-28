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
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';
import { ECharts } from 'react-native-echarts-wrapper';

function AdminHome() {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);

    // Mock data
    const mockDashboardData = {
        totalBuildings: 12,
        totalResidents: 450,
        activeComplaints: 8,
        pendingPayments: 15,
        monthlyIncome: [45000, 52000, 49000, 60000, 55000, 58000],
        occupancyRate: [
            { value: 85, text: 'Dolu', color: '#20A39E' },
            { value: 15, text: 'Boş', color: '#EF476F' }
        ],
        recentActivities: [
            {
                id: 1,
                activityType: "Payment",
                description: "Aidat ödemesi alındı - Daire 12",
                status: "Completed"
            },
            {
                id: 2,
                activityType: "Complaint",
                description: "Asansör arızası bildirimi",
                status: "Pending"
            }
        ]
    };

    useEffect(() => {
        setTimeout(() => {
            setDashboardData(mockDashboardData);
            setStatistics(mockDashboardData);
            setRecentActivities(mockDashboardData.recentActivities);
            setLoading(false);
        }, 1000);
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setDashboardData(mockDashboardData);
            setStatistics(mockDashboardData);
            setRecentActivities(mockDashboardData.recentActivities);
            setRefreshing(false);
        }, 1000);
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

    // ECharts için option
    const echartsOption = {
        backgroundColor: '#1B2B3E',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.2)',
                    width: 1,
                    type: 'solid'
                }
            }
        },
        grid: {
            top: 40,
            left: 60,
            right: 40,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            },
            axisLabel: {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            type: 'value',
            min: 1000,
            max: 5000,
            interval: 1000,
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            },
            axisLabel: {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                formatter: '{value}'
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    type: 'dashed'
                }
            }
        },
        series: [{
            name: 'Earnings',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: [2000, 2800, 1800, 3200, 4100, 3000, 3400, 3800],
            itemStyle: {
                color: '#00E1FD'
            },
            lineStyle: {
                width: 3,
                color: '#00E1FD'
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: 'rgba(0, 225, 253, 0.3)'
                    }, {
                        offset: 1,
                        color: 'rgba(0, 225, 253, 0.1)'
                    }]
                }
            }
        }]
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
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

            {/* Occupancy Rate Chart */}
            <Animatable.View animation="fadeInUp" delay={300}>
                <Card style={styles.chartCard}>
                    <Card.Content>
                        <Title>Doluluk Oranı</Title>
                        <View style={styles.pieChartContainer}>
                            <GiftedPieChart
                                data={mockDashboardData.occupancyRate}
                                donut
                                showText
                                textColor="#333"
                                radius={100}
                                textSize={12}
                                strokeWidth={2}
                                strokeColor="#fff"
                            />
                        </View>
                    </Card.Content>
                </Card>
            </Animatable.View>

            {/* Income Distribution Chart */}
            <Animatable.View animation="fadeInUp" delay={450}>
                <Card style={styles.chartCard}>
                    <Card.Content>
                        <Title>Gelir Dağılımı</Title>
                        <View style={styles.pieChartContainer}>
                            <GiftedPieChart
                                data={[
                                    { value: 65, text: 'Aidat', color: '#6C63FF' },
                                    { value: 25, text: 'Kira', color: '#2EC4B6' },
                                    { value: 10, text: 'Diğer', color: '#FF9F1C' }
                                ]}
                                donut
                                showText
                                textColor="#333"
                                radius={100}
                                textSize={12}
                                strokeWidth={2}
                                strokeColor="#fff"
                                innerRadius={70}
                            />
                        </View>
                    </Card.Content>
                </Card>
            </Animatable.View>

            {/* Monthly Income Chart */}
            <Animatable.View animation="fadeInUp" delay={500}>
                <Card style={styles.chartCard}>
                    <Card.Content>
                        <Title>Aylık Gelir Grafiği</Title>
                        <LineChart
                            data={{
                                labels: ["Oca", "Şub", "Mar", "Nis", "May", "Haz"],
                                datasets: [{
                                    data: mockDashboardData.monthlyIncome
                                }]
                            }}
                            width={Dimensions.get("window").width - 50}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#fff',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#6C63FF"
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

            {/* E-Chart */}
            <Animatable.View animation="fadeInUp" delay={300}>
                <Card style={styles.chartCard}>
                    <Card.Content>
                        <View style={styles.chartHeader}>
                            <Title style={styles.chartTitle}>E-Chart</Title>
                            <View style={styles.earningsBox}>
                                <Text style={styles.earningsLabel}>Earnings</Text>
                                <Text style={styles.earningsValue}>$ 2723</Text>
                            </View>
                        </View>
                        <View style={styles.echartContainer}>
                            <ECharts
                                option={echartsOption}
                                backgroundColor="#1B2B3E"
                                height={300}
                            />
                        </View>
                    </Card.Content>
                </Card>
            </Animatable.View>
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
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    pieChartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        height: 250,
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
    chart: {
        marginTop: 8,
        borderRadius: 16,
        backgroundColor: '#fff',
        padding: 16,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 20,
        color: '#2D3436',
        fontWeight: 'bold',
    },
    earningsBox: {
        backgroundColor: '#1B2B3E',
        padding: 15,
        borderRadius: 10,
    },
    earningsLabel: {
        color: '#00E1FD',
        fontSize: 14,
        marginBottom: 5,
    },
    earningsValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    echartContainer: {
        height: 300,
        backgroundColor: '#1B2B3E',
        borderRadius: 10,
        overflow: 'hidden',
    },
});

export default AdminHome;