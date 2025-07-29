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
} from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TransactionMenu from './TransactionMenu';

const { width } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showTransactionMenu, setShowTransactionMenu] = useState(false);

  // Referencias para animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const balanceCountAnim = useRef(new Animated.Value(0)).current;
  const chartDrawAnim = useRef(new Animated.Value(0)).current;

  // Animación de entrada al cargar el componente
  useEffect(() => {
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
      Animated.timing(balanceCountAnim, {
        toValue: 3775,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(chartDrawAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // Datos de ejemplo para la grafica
  const expenseData = [
    { date: 'Nov 23', amount: 1800 },
    { date: '24', amount: 2200 },
    { date: '25', amount: 2800 },
    { date: '26', amount: 3200 },
    { date: '27', amount: 4500 },
    { date: '28', amount: 5800 },
    { date: '29', amount: 7200 },
    { date: '30', amount: 9500 }
  ];

  const categoryData = [
    { name: 'Alimentación', value: 2500, color: '#FF6B6B', percentage: 38 },
    { name: 'Transporte', value: 1800, color: '#4ECDC4', percentage: 27 },
    { name: 'Entretenimiento', value: 1200, color: '#45B7D1', percentage: 18 },
    { name: 'Servicios', value: 1075, color: '#96CEB4', percentage: 17 }
  ];

  // Componente para gráfica de línea simple con animación
  const LineChart = ({ data, height = 120 }) => {
    const chartWidth = width - 80;
    const maxValue = Math.max(...data.map(d => d.amount));
    const minValue = Math.min(...data.map(d => d.amount));
    const range = maxValue - minValue || 1;

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
              {item.date.length > 3 ? item.date.slice(-2) : item.date}
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

      // Mostrar menú solo para el segundo ícono (stats-chart)
      if (index === 1) {
        setShowTransactionMenu(true);
      } else if (index === 3) {
        // Navegar a PerfilUsuario cuando se presiona el ícono de person (índice 3)
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView showsVerticalScrollIndicator={false}>
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

          <Text style={styles.greeting}>Hola, Fernando</Text>

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
              ${Math.floor(balanceCountAnim._value).toLocaleString()}
            </Animated.Text>
            <Animated.View
              style={[
                styles.trendContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.trendText}>+20% al mes pasado</Text>
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
              <Text style={styles.statAmount}>10,353</Text>
              <View style={styles.trendContainer}>
                <Text style={styles.trendTextRed}>-8% al mes pasado</Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.statCard,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.statLabel}>Gastos</Text>
              <Text style={styles.statAmount}>6,575</Text>
              <View style={styles.trendContainer}>
                <Text style={styles.trendTextRed}>-8% al mes pasado</Text>
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
          <Text style={styles.chartTitle}>Gráfica de gastos</Text>
          <LineChart data={expenseData} />
          <View style={styles.yAxisLabels}>
            <Text style={styles.yAxisLabel}>$10K</Text>
            <Text style={styles.yAxisLabel}>$8K</Text>
            <Text style={styles.yAxisLabel}>$6K</Text>
            <Text style={styles.yAxisLabel}>$4K</Text>
            <Text style={styles.yAxisLabel}>$2K</Text>
          </View>
        </Animated.View>

        {/* Gráfica por categorías */}
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
                  <Text style={styles.legendValue}>${item.value.toLocaleString()}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          </View>
        </Animated.View>

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
            <Text style={styles.alertsTitle}>ALERTA IMPORTANTE</Text>
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
              <Text style={styles.alertIcon}>🏠</Text>
              <Text style={styles.alertDescription}>Próximo pago</Text>
              <Text style={styles.alertTitle}>RENTA</Text>
              <Text style={styles.alertAmount}>$4,500</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.alertCard,
                styles.budgetAlert,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.alertIcon}>💰</Text>
              <Text style={styles.alertDescription}>Bajo presupuesto</Text>
              <Text style={styles.alertTitle}>SALDO DISPONIBLE</Text>
              <Text style={styles.alertAmount}>$3,775</Text>
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