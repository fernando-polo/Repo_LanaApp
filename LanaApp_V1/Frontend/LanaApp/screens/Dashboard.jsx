import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TransactionMenu from './TransactionMenu';
import { userService } from '../utils/userService';
import { transactionService } from '../utils/transactionService';
import { accountService } from '../utils/accountService';

const { width } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showTransactionMenu, setShowTransactionMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para datos reales
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Referencias para animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const balanceCountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos del usuario
      const user = await userService.getCurrentUser();
      setUserData(user);
      
      // Obtener cuentas
      const accountsData = await accountService.getAccounts();
      setAccounts(accountsData);
      
      // Calcular saldo total
      const totalBalance = accountsData.reduce((sum, account) => sum + account.saldo_inicial, 0);
      
      // Obtener transacciones recientes
      const transactionsData = await transactionService.getTransactions({ limit: 10 });
      setTransactions(transactionsData);
      
      // Calcular saldo actual considerando transacciones
      const transactionBalance = await calculateTransactionBalance(transactionsData);
      const currentBalance = totalBalance + transactionBalance;
      setBalance(currentBalance);
      
      // Animar el contador de balance
      Animated.timing(balanceCountAnim, {
        toValue: currentBalance,
        duration: 1500,
        useNativeDriver: false,
      }).start();
      
      // Obtener datos del mes actual
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Obtener resumen de categorías
      const categoryReport = await transactionService.getCategoryReport(currentMonth, currentYear);
      if (categoryReport) {
        setMonthlyData(categoryReport.balance_total);
        
        // Preparar datos para la gráfica de dona
        const topCategories = await transactionService.getTopCategories('gasto', {
          mes: currentMonth,
          ano: currentYear,
          limite: 4
        });
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        const formattedCategories = topCategories.map((cat, index) => ({
          name: cat.categoria,
          value: cat.total,
          color: colors[index],
          percentage: cat.porcentaje
        }));
        
        setCategoryData(formattedCategories);
      }
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTransactionBalance = async (transactions) => {
    let balance = 0;
    for (const transaction of transactions) {
      if (transaction.categoria?.tipo === 'ingreso') {
        balance += transaction.monto;
      } else {
        balance -= transaction.monto;
      }
    }
    return balance;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Datos para la gráfica de línea (últimos 7 días)
  const getExpenseData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.fecha);
        return tDate.toDateString() === date.toDateString() && 
               t.categoria?.tipo === 'gasto';
      });
      
      const dayTotal = dayTransactions.reduce((sum, t) => sum + t.monto, 0);
      
      data.push({
        date: date.getDate().toString(),
        amount: dayTotal
      });
    }
    
    return data;
  };

  // Componente para gráfica de línea simple con animación
  const LineChart = ({ data, height = 120 }) => {
    const chartWidth = width - 80;
    const maxValue = Math.max(...data.map(d => d.amount), 1);
    const minValue = 0;
    const range = maxValue || 1;

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = height - ((item.amount - minValue) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const pathData = `M ${points.split(' ').join(' L ')}`;

    return (
      <View style={{ height: height + 40 }}>
        <Svg width={chartWidth} height={height + 40} style={{ alignSelf: 'center' }}>
          <Path
            d={pathData}
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            const y = height - ((item.amount - minValue) / range) * height;
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })}
        </Svg>
        <View style={styles.chartLabels}>
          {data.map((item, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.chartLabel,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              {item.date}
            </Animated.Text>
          ))}
        </View>
      </View>
    );
  };

  // Componente para gráfica de dona simple con animación
  const DonutChart = ({ data, size = 120 }) => {
    const radius = size / 2 - 10;
    const innerRadius = radius - 20;
    const center = size / 2;
    let currentAngle = 0;

    return (
      <View style={{ alignItems: 'center' }}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }}
        >
          <Svg width={size} height={size}>
            {data.map((item, index) => {
              const angle = (item.percentage / 100) * 2 * Math.PI;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;

              const x1 = center + radius * Math.cos(startAngle - Math.PI / 2);
              const y1 = center + radius * Math.sin(startAngle - Math.PI / 2);
              const x2 = center + radius * Math.cos(endAngle - Math.PI / 2);
              const y2 = center + radius * Math.sin(endAngle - Math.PI / 2);

              const largeArcFlag = angle > Math.PI ? 1 : 0;

              const pathData = [
                `M ${center} ${center}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              return (
                <Path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  opacity={0.9}
                />
              );
            })}
            {/* Círculo interior para hacer dona */}
            <Circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="#f8f9fa"
            />
          </Svg>
        </Animated.View>
      </View>
    );
  };

  const TabButton = ({ iconName, isActive, onPress, index }) => {
    const tabScale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(tabScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(tabScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      if (index === 1) {
        setShowTransactionMenu(true);
      } else if (index === 3) {
        navigation.navigate('PerfilUsuario');
      } else {
        onPress();
      }
    };

    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTab]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: tabScale }] }}>
          <Ionicons
            name={iconName}
            size={24}
            color={isActive ? '#000' : '#999'}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando tus datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const expenseData = getExpenseData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircles}>
                <View style={[styles.circle, styles.circle1]} />
                <View style={[styles.circle, styles.circle2]} />
              </View>
            </View>
          </View>

          <Text style={styles.greeting}>Hola, {userData?.nombre?.split(' ')[0] || 'Usuario'}</Text>

          {/* Saldo en cuenta */}
          <Animated.View
            style={[
              styles.balanceCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              }
            ]}
          >
            <Text style={styles.balanceLabel}>Saldo en cuenta</Text>
            <Animated.Text style={styles.balanceAmount}>
              ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Animated.Text>
            <Animated.View
              style={[
                styles.trendContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.trendText}>
                {monthlyData?.diferencia > 0 ? '+' : ''}{((monthlyData?.diferencia / balance) * 100).toFixed(1)}% al mes pasado
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Ingresos y Gastos */}
          <Animated.View
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Animated.View
              style={[
                styles.statCard,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.statLabel}>Ingresos</Text>
              <Text style={styles.statAmount}>
                {monthlyData?.total_ingresos?.toLocaleString('es-MX', { minimumFractionDigits: 0 }) || '0'}
              </Text>
              <View style={styles.trendContainer}>
                <Text style={styles.trendTextGreen}>Este mes</Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.statCard,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.statLabel}>Gastos</Text>
              <Text style={styles.statAmount}>
                {monthlyData?.total_gastos?.toLocaleString('es-MX', { minimumFractionDigits: 0 }) || '0'}
              </Text>
              <View style={styles.trendContainer}>
                <Text style={styles.trendTextRed}>Este mes</Text>
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Gráfica de gastos */}
        <Animated.View
          style={[
            styles.chartContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }
          ]}
        >
          <Text style={styles.chartTitle}>Gastos últimos 7 días</Text>
          <LineChart data={expenseData} />
        </Animated.View>

        {/* Gráfica por categorías */}
        {categoryData.length > 0 && (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              }
            ]}
          >
            <Text style={styles.chartTitle}>Gastos por categoría</Text>
            <View style={styles.donutContainer}>
              <DonutChart data={categoryData} />
              <Animated.View
                style={[
                  styles.legend,
                  { opacity: fadeAnim }
                ]}
              >
                {categoryData.map((item, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.legendItem,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateX: slideAnim.interpolate({
                              inputRange: [0, 50],
                              outputRange: [0, 20],
                            })
                          }
                        ],
                      }
                    ]}
                  >
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.name}</Text>
                    <Text style={styles.legendValue}>
                      ${item.value.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                    </Text>
                  </Animated.View>
                ))}
              </Animated.View>
            </View>
          </Animated.View>
        )}

        {/* Alertas importantes */}
        <Animated.View
          style={[
            styles.alertsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.alertsHeader}>
            <Text style={styles.alertsTitle}>INFORMACIÓN</Text>
            <Text style={styles.alertsArrow}>›</Text>
          </View>

          <View style={styles.alertsGrid}>
            <Animated.View
              style={[
                styles.alertCard,
                styles.rentAlert,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.alertIcon}>📊</Text>
              <Text style={styles.alertDescription}>Transacciones del mes</Text>
              <Text style={styles.alertTitle}>MOVIMIENTOS</Text>
              <Text style={styles.alertAmount}>{transactions.length}</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.alertCard,
                styles.budgetAlert,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.alertIcon}>💰</Text>
              <Text style={styles.alertDescription}>Balance del mes</Text>
              <Text style={styles.alertTitle}>DIFERENCIA</Text>
              <Text style={[
                styles.alertAmount,
                { color: monthlyData?.diferencia >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                ${monthlyData?.diferencia?.toLocaleString('es-MX', { minimumFractionDigits: 0 }) || '0'}
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TabButton
          iconName="home"
          isActive={activeTab === 0}
          onPress={() => setActiveTab(0)}
          index={0}
        />
        <TabButton
          iconName="stats-chart"
          isActive={activeTab === 1}
          onPress={() => setActiveTab(1)}
          index={1}
        />
        <TabButton
          iconName="notifications"
          isActive={activeTab === 2}
          onPress={() => setActiveTab(2)}
          index={2}
        />
        <TabButton
          iconName="person"
          isActive={activeTab === 3}
          onPress={() => setActiveTab(3)}
          index={3}
        />
      </View>

      {/* Menú de Transacciones */}
      <TransactionMenu
        visible={showTransactionMenu}
        onClose={() => setShowTransactionMenu(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircles: {
    flexDirection: 'row',
    marginRight: 12,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  circle1: {
    backgroundColor: '#ffa500',
    zIndex: 1,
  },
  circle2: {
    backgroundColor: '#ff8c00',
    marginLeft: -8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 1,
  },
  bellIcon: {
    fontSize: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  trendIconRed: {
    fontSize: 12,
    marginRight: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#10B981',
  },
  trendTextGreen: {
    fontSize: 12,
    color: '#10B981',
  },
  trendTextRed: {
    fontSize: 12,
    color: '#EF4444',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#999',
  },
  yAxisLabels: {
    position: 'absolute',
    right: 0,
    top: 60,
    height: 120,
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#999',
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legend: {
    flex: 1,
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  alertsContainer: {
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  alertsArrow: {
    fontSize: 18,
    color: '#999',
  },
  alertsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  alertCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  rentAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  budgetAlert: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  alertIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    justifyContent: 'space-around',
  },
  tabButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    opacity: 1,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
});

export default Dashboard;