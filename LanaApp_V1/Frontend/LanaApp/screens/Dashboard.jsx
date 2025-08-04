import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  
  // Estados para datos reales
  const [userData, setUserData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountBalances, setAccountBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);

  // Referencias para animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Cargar datos cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      console.log('Dashboard recibió foco, recargando datos...');
      loadDashboardData();
    }, [])
  );

  useEffect(() => {
    startAnimations();
  }, []);

  useEffect(() => {
    // Cuando cambia la cuenta seleccionada, actualizar los datos mostrados
    if (selectedAccount) {
      loadAccountSpecificData(selectedAccount);
    }
  }, [selectedAccount]);

  useEffect(() => {
    // Animar el icono del dropdown
    Animated.timing(rotateAnim, {
      toValue: showAccountSelector ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showAccountSelector]);

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
      console.log('Cargando datos del dashboard...');
      
      // Obtener datos del usuario
      const user = await userService.getCurrentUser();
      setUserData(user);
      
      // Obtener cuentas (forzar recarga desde la API)
      const accountsData = await accountService.getAccounts();
      console.log('Cuentas cargadas:', accountsData);
      setAccounts(accountsData);
      
      if (accountsData.length > 0) {
        // Si hay una cuenta seleccionada, mantenerla si todavía existe
        let accountToSelect = selectedAccount;
        
        // Verificar si la cuenta seleccionada todavía existe
        if (selectedAccount) {
          const stillExists = accountsData.find(acc => acc.id === selectedAccount.id);
          if (stillExists) {
            // Actualizar con los datos nuevos
            accountToSelect = stillExists;
          } else {
            // Si no existe, seleccionar la primera
            accountToSelect = accountsData[0];
          }
        } else {
          // Si no hay cuenta seleccionada, seleccionar la primera
          accountToSelect = accountsData[0];
        }
        
        setSelectedAccount(accountToSelect);
        
        // Calcular saldos de todas las cuentas
        await calculateAllAccountBalances(accountsData);
      }
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateAllAccountBalances = async (accountsList) => {
    try {
      // Obtener todas las transacciones
      const allTransactions = await transactionService.getTransactions({ limit: 1000 });
      
      const balances = {};
      let total = 0;
      
      // Calcular saldo para cada cuenta
      for (const account of accountsList) {
        // Saldo inicial de la cuenta (actualizado)
        let accountBalance = account.saldo_inicial || 0;
        console.log(`Cuenta ${account.nombre} - Saldo inicial: ${accountBalance}`);
        
        // Filtrar transacciones de esta cuenta
        const accountTransactions = allTransactions.filter(t => t.cuenta_id === account.id);
        
        // Calcular el balance de transacciones
        accountTransactions.forEach(transaction => {
          if (transaction.categoria?.tipo === 'ingreso') {
            accountBalance += parseFloat(transaction.monto) || 0;
          } else if (transaction.categoria?.tipo === 'gasto') {
            accountBalance -= parseFloat(transaction.monto) || 0;
          }
        });
        
        console.log(`Cuenta ${account.nombre} - Saldo final: ${accountBalance}`);
        balances[account.id] = accountBalance;
        total += accountBalance;
      }
      
      setAccountBalances(balances);
      setTotalBalance(total);
      
      console.log('Saldos calculados:', balances);
      console.log('Saldo total:', total);
    } catch (error) {
      console.error('Error calculando saldos:', error);
    }
  };

  const loadAccountSpecificData = async (account) => {
    try {
      // Obtener transacciones de la cuenta seleccionada
      const allTransactions = await transactionService.getTransactions({ limit: 100 });
      const accountTransactions = allTransactions.filter(t => t.cuenta_id === account.id);
      setTransactions(accountTransactions);
      
      // Obtener datos del mes actual para esta cuenta
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Calcular ingresos y gastos del mes para esta cuenta
      let monthIncome = 0;
      let monthExpenses = 0;
      
      accountTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.fecha);
        if (transactionDate.getMonth() + 1 === currentMonth && 
            transactionDate.getFullYear() === currentYear) {
          if (transaction.categoria?.tipo === 'ingreso') {
            monthIncome += parseFloat(transaction.monto) || 0;
          } else if (transaction.categoria?.tipo === 'gasto') {
            monthExpenses += parseFloat(transaction.monto) || 0;
          }
        }
      });
      
      setMonthlyData({
        total_ingresos: monthIncome,
        total_gastos: monthExpenses,
        diferencia: monthIncome - monthExpenses
      });
      
      // Obtener categorías top para esta cuenta
      const topCategories = await transactionService.getTopCategories('gasto', {
        mes: currentMonth,
        ano: currentYear,
        limite: 4
      });
      
      // Filtrar solo las categorías que tienen transacciones en esta cuenta
      const accountCategories = topCategories.filter(cat => {
        return accountTransactions.some(t => 
          t.categoria?.nombre === cat.categoria && 
          t.categoria?.tipo === 'gasto'
        );
      });
      
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
      const formattedCategories = accountCategories.map((cat, index) => ({
        name: cat.categoria,
        value: cat.total,
        color: colors[index],
        percentage: cat.porcentaje
      }));
      
      setCategoryData(formattedCategories);
      
    } catch (error) {
      console.error('Error cargando datos de la cuenta:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const selectAccount = (account) => {
    setSelectedAccount(account);
    setShowAccountSelector(false);
  };

  const getAccountIcon = (tipo) => {
    switch(tipo) {
      case 'banco': return 'business';
      case 'tarjeta': return 'card';
      case 'efectivo': return 'cash';
      default: return 'wallet';
    }
  };

  const getAccountTypeLabel = (tipo) => {
    switch(tipo) {
      case 'banco': return 'Cuenta bancaria';
      case 'tarjeta': return 'Tarjeta de crédito/débito';
      case 'efectivo': return 'Efectivo';
      default: return 'Otra cuenta';
    }
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
      
      const dayTotal = dayTransactions.reduce((sum, t) => sum + (parseFloat(t.monto) || 0), 0);
      
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

    if (!data || data.length === 0) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', height: size }}>
          <Text style={{ color: '#999' }}>Sin datos</Text>
        </View>
      );
    }

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
  const currentBalance = selectedAccount ? (accountBalances[selectedAccount.id] || 0) : 0;

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
            <TouchableOpacity onPress={() => navigation.navigate('GestionCuentas')}>
              <Ionicons name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.greeting}>Hola, {userData?.nombre?.split(' ')[0] || 'Usuario'}</Text>

          {/* Selector de cuenta */}
          {accounts.length > 0 ? (
            <TouchableOpacity 
              style={styles.accountSelector}
              onPress={() => setShowAccountSelector(true)}
              activeOpacity={0.7}
            >
              <View style={styles.accountSelectorLeft}>
                <View style={styles.accountIcon}>
                  <Ionicons 
                    name={getAccountIcon(selectedAccount?.tipo)} 
                    size={20} 
                    color="#666" 
                  />
                </View>
                <View>
                  <Text style={styles.accountSelectorLabel}>Cuenta seleccionada</Text>
                  <Text style={styles.accountSelectorName}>{selectedAccount?.nombre}</Text>
                </View>
              </View>
              <Animated.View
                style={{
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg']
                    })
                  }]
                }}
              >
                <Ionicons name="chevron-down" size={24} color="#666" />
              </Animated.View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.noAccountCard}
              onPress={() => navigation.navigate('GestionCuentas')}
            >
              <Ionicons name="add-circle-outline" size={48} color="#999" />
              <Text style={styles.noAccountText}>Agrega tu primera cuenta</Text>
            </TouchableOpacity>
          )}

          {/* Saldo de la cuenta seleccionada */}
          {selectedAccount && (
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
              <Text style={styles.balanceLabel}>Saldo disponible</Text>
              <Text style={styles.balanceAmount}>
                ${currentBalance.toLocaleString('es-MX', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </Text>
              <Animated.View
                style={[
                  styles.trendContainer,
                  { opacity: fadeAnim }
                ]}
              >
                <Text style={[
                  styles.trendText,
                  monthlyData?.diferencia < 0 && styles.trendTextRed
                ]}>
                  {monthlyData?.diferencia > 0 ? '+' : ''}{((monthlyData?.diferencia / (currentBalance || 1)) * 100).toFixed(1)}% este mes
                </Text>
              </Animated.View>
            </Animated.View>
          )}

          {/* Ingresos y Gastos de la cuenta seleccionada */}
          {selectedAccount && (
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
                <Text style={styles.statLabel}>Ingresos del mes</Text>
                <Text style={styles.statAmount}>
                  ${(monthlyData?.total_ingresos || 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                </Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.statCard,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <Text style={styles.statLabel}>Gastos del mes</Text>
                <Text style={styles.statAmount}>
                  ${(monthlyData?.total_gastos || 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                </Text>
              </Animated.View>
            </Animated.View>
          )}
        </View>

        {/* Gráficas solo si hay cuenta seleccionada */}
        {selectedAccount && (
          <>
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
                    { color: (monthlyData?.diferencia || 0) >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    ${(monthlyData?.diferencia || 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                  </Text>
                </Animated.View>
              </View>

              {/* Saldo total de todas las cuentas */}
              <View style={styles.totalBalanceSection}>
                <Text style={styles.totalBalanceTitle}>Patrimonio total</Text>
                <Text style={styles.totalBalanceSubtitle}>Suma de todas tus cuentas</Text>
                <Text style={styles.totalBalanceAmount}>
                  ${totalBalance.toLocaleString('es-MX', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Text>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Modal selector de cuentas */}
      <Modal
        visible={showAccountSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccountSelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountSelector(false)}
        >
          <View style={styles.accountSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar cuenta</Text>
              <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.accountsList}>
              {accounts.map((account) => {
                const balance = accountBalances[account.id] || 0;
                const isSelected = selectedAccount?.id === account.id;

                return (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountItem,
                      isSelected && styles.accountItemSelected
                    ]}
                    onPress={() => selectAccount(account)}
                  >
                    <View style={styles.accountItemLeft}>
                      <View style={[
                        styles.accountItemIcon,
                        isSelected && styles.accountItemIconSelected
                      ]}>
                        <Ionicons 
                          name={getAccountIcon(account.tipo)} 
                          size={24} 
                          color={isSelected ? '#fff' : '#666'} 
                        />
                      </View>
                      <View>
                        <Text style={[
                          styles.accountItemName,
                          isSelected && styles.accountItemNameSelected
                        ]}>
                          {account.nombre}
                        </Text>
                        <Text style={[
                          styles.accountItemType,
                          isSelected && styles.accountItemTypeSelected
                        ]}>
                          {getAccountTypeLabel(account.tipo)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.accountItemRight}>
                      <Text style={[
                        styles.accountItemBalance,
                        isSelected && styles.accountItemBalanceSelected
                      ]}>
                        ${balance.toLocaleString('es-MX', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color="#000" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  accountSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  accountSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountSelectorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  accountSelectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  noAccountCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 32,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noAccountText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  balanceCard: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    color: '#10B981',
  },
  trendTextRed: {
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
    marginBottom: 24,
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
  totalBalanceSection: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
  },
  totalBalanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  totalBalanceSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 12,
  },
  totalBalanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B5E20',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  accountSelectorModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountsList: {
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  accountItemSelected: {
    backgroundColor: '#000',
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountItemIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  accountItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  accountItemNameSelected: {
    color: '#fff',
  },
  accountItemType: {
    fontSize: 14,
    color: '#666',
  },
  accountItemTypeSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  accountItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  accountItemBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountItemBalanceSelected: {
    color: '#fff',
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
});

export default Dashboard;