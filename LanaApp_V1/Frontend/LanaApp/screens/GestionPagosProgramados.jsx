import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { categoryService } from '../utils/categoryService';
import { accountService } from '../utils/accountService';
import { scheduledPaymentService } from '../utils/scheduledPaymentService';

const GestionPagosProgramados = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados para datos
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  
  // Estados del formulario
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [frecuencia, setFrecuencia] = useState('mensual');
  const [proximaFecha, setProximaFecha] = useState(new Date());
  const [notificarAntes, setNotificarAntes] = useState('2');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, [showInactive]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar pagos programados
      const paymentsData = await scheduledPaymentService.getScheduledPayments(!showInactive);
      setPayments(paymentsData);
      
      // Cargar categorías de gasto
      const categoriesData = await categoryService.getCategories();
      const expenseCategories = categoriesData.filter(cat => cat.tipo === 'gasto');
      setCategories(expenseCategories);
      
      // Cargar cuentas
      const accountsData = await accountService.getAccounts();
      setAccounts(accountsData);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openModal = () => {
    setDescripcion('');
    setMonto('');
    setFrecuencia('mensual');
    setProximaFecha(new Date());
    setNotificarAntes('2');
    setSelectedCategory(null);
    setSelectedAccount(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setShowCategorySelector(false);
    setShowAccountSelector(false);
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setDescripcion(payment.descripcion);
    setMonto(payment.monto.toString());
    setFrecuencia(payment.frecuencia);
    setProximaFecha(new Date(payment.proxima_fecha));
    setNotificarAntes(payment.notificar_antes.toString());
    
    // Encontrar categoria y cuenta seleccionadas
    const category = categories.find(c => c.id === payment.categoria_id);
    const account = accounts.find(a => a.id === payment.cuenta_id);
    setSelectedCategory(category);
    setSelectedAccount(account);
    
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingPayment(null);
  };

  const validateForm = () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return false;
    }
    
    if (!monto || parseFloat(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return false;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return false;
    }
    
    if (!selectedAccount) {
      Alert.alert('Error', 'Por favor selecciona una cuenta');
      return false;
    }
    
    if (!notificarAntes || parseInt(notificarAntes) < 1) {
      Alert.alert('Error', 'Los días de notificación deben ser al menos 1');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const paymentData = {
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        frecuencia,
        proxima_fecha: proximaFecha.toISOString().split('T')[0],
        activo: true,
        notificar_antes: parseInt(notificarAntes),
        categoria_id: selectedCategory.id,
        cuenta_id: selectedAccount.id
      };
      
      await scheduledPaymentService.createScheduledPayment(paymentData);
      
      Alert.alert('Éxito', 'Pago programado creado correctamente');
      closeModal();
      loadData();
      
    } catch (error) {
      console.error('Error guardando pago programado:', error);
      
      let errorMessage = 'No se pudo guardar el pago programado';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const paymentData = {
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        frecuencia,
        proxima_fecha: proximaFecha.toISOString().split('T')[0],
        notificar_antes: parseInt(notificarAntes),
        categoria_id: selectedCategory.id,
        cuenta_id: selectedAccount.id
      };
      
      await scheduledPaymentService.updateScheduledPayment(editingPayment.id, paymentData);
      
      Alert.alert('Éxito', 'Pago programado actualizado correctamente');
      closeEditModal();
      loadData();
      
    } catch (error) {
      console.error('Error actualizando pago programado:', error);
      Alert.alert('Error', 'No se pudo actualizar el pago programado');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (payment) => {
    try {
      const newActiveState = !payment.activo;
      await scheduledPaymentService.updateScheduledPayment(payment.id, {
        activo: newActiveState
      });
      
      Alert.alert(
        'Éxito', 
        newActiveState ? 'Pago programado activado' : 'Pago programado desactivado'
      );
      loadData();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado del pago');
    }
  };

  const handleDelete = (payment) => {
    Alert.alert(
      'Eliminar pago programado',
      `¿Estás seguro de que deseas eliminar "${payment.descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await scheduledPaymentService.deleteScheduledPayment(payment.id);
              Alert.alert('Éxito', 'Pago programado eliminado correctamente');
              loadData();
            } catch (error) {
              console.error('Error eliminando pago programado:', error);
              Alert.alert('Error', 'No se pudo eliminar el pago programado');
            }
          }
        }
      ]
    );
  };

  const getFrecuenciaLabel = (frecuencia) => {
    switch(frecuencia) {
      case 'mensual': return 'Mensual';
      case 'semanal': return 'Semanal';
      case 'anual': return 'Anual';
      case 'unica': return 'Única vez';
      default: return frecuencia;
    }
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('comida') || name.includes('alimento')) {
      return 'restaurant';
    } else if (name.includes('transporte')) {
      return 'car';
    } else if (name.includes('salud')) {
      return 'medical';
    } else if (name.includes('educación')) {
      return 'school';
    } else if (name.includes('entretenimiento')) {
      return 'game-controller';
    } else if (name.includes('hogar') || name.includes('renta')) {
      return 'home';
    } else if (name.includes('servicios')) {
      return 'build';
    }
    
    return 'arrow-up-circle';
  };

  const getDaysUntilPayment = (fecha) => {
    const today = new Date();
    const paymentDate = new Date(fecha);
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderPayment = ({ item }) => {
    const daysUntil = getDaysUntilPayment(item.proxima_fecha);
    const isOverdue = daysUntil < 0;
    const isUpcoming = daysUntil >= 0 && daysUntil <= 7;
    
    return (
      <TouchableOpacity 
        style={[
          styles.paymentCard,
          !item.activo && styles.paymentCardInactive
        ]}
        onPress={() => openEditModal(item)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={styles.paymentHeader}>
          <View style={[
            styles.paymentIcon,
            { backgroundColor: item.activo ? '#f0f0f0' : '#fafafa' }
          ]}>
            <Ionicons 
              name={getCategoryIcon(item.categoria.nombre)} 
              size={24} 
              color={item.activo ? '#666' : '#ccc'} 
            />
          </View>
          
          <View style={styles.paymentInfo}>
            <Text style={[
              styles.paymentDescription,
              !item.activo && styles.textInactive
            ]}>
              {item.descripcion}
            </Text>
            <Text style={[
              styles.paymentCategory,
              !item.activo && styles.textInactive
            ]}>
              {item.categoria.nombre} • {item.cuenta.nombre}
            </Text>
            <Text style={[
              styles.paymentFrequency,
              !item.activo && styles.textInactive
            ]}>
              {getFrecuenciaLabel(item.frecuencia)}
            </Text>
          </View>
          
          <View style={styles.paymentRight}>
            <Text style={[
              styles.paymentAmount,
              !item.activo && styles.textInactive
            ]}>
              ${item.monto.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </Text>
            
            {item.activo && (
              <Text style={[
                styles.paymentDate,
                isOverdue && styles.paymentDateOverdue,
                isUpcoming && styles.paymentDateUpcoming
              ]}>
                {isOverdue 
                  ? `Vencido hace ${Math.abs(daysUntil)} días`
                  : daysUntil === 0
                  ? 'Hoy'
                  : `En ${daysUntil} días`
                }
              </Text>
            )}
            
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => handleToggleActive(item)}
            >
              <Ionicons 
                name={item.activo ? 'pause-circle' : 'play-circle'} 
                size={28} 
                color={item.activo ? '#F59E0B' : '#10B981'} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {item.activo && (
          <View style={styles.paymentFooter}>
            <View style={styles.nextPaymentBadge}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.nextPaymentText}>
                Próximo pago: {new Date(item.proxima_fecha).toLocaleDateString('es-MX')}
              </Text>
            </View>
            
            <View style={styles.notificationBadge}>
              <Ionicons name="notifications-outline" size={14} color="#666" />
              <Text style={styles.notificationText}>
                Notificar {item.notificar_antes} días antes
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.selectorOption}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategorySelector(false);
      }}
    >
      <View style={styles.selectorOptionIcon}>
        <Ionicons name={getCategoryIcon(item.nombre)} size={20} color="#666" />
      </View>
      <Text style={styles.selectorOptionText}>{item.nombre}</Text>
      {selectedCategory?.id === item.id && (
        <Ionicons name="checkmark" size={20} color="#000" />
      )}
    </TouchableOpacity>
  );

  const renderAccount = ({ item }) => (
    <TouchableOpacity
      style={styles.selectorOption}
      onPress={() => {
        setSelectedAccount(item);
        setShowAccountSelector(false);
      }}
    >
      <View style={styles.selectorOptionIcon}>
        <Ionicons name="wallet-outline" size={20} color="#666" />
      </View>
      <Text style={styles.selectorOptionText}>{item.nombre}</Text>
      {selectedAccount?.id === item.id && (
        <Ionicons name="checkmark" size={20} color="#000" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagos Programados</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando pagos programados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagos Programados</Text>
        <TouchableOpacity onPress={openModal}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Filtro activos/inactivos */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={[styles.filterButton, !showInactive && styles.filterButtonActive]}
          onPress={() => setShowInactive(false)}
        >
          <Text style={[styles.filterText, !showInactive && styles.filterTextActive]}>
            Activos ({payments.filter(p => p.activo).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, showInactive && styles.filterButtonActive]}
          onPress={() => setShowInactive(true)}
        >
          <Text style={[styles.filterText, showInactive && styles.filterTextActive]}>
            Inactivos ({payments.filter(p => !p.activo).length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Lista de pagos */}
      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.paymentsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay pagos programados</Text>
            <Text style={styles.emptySubtext}>
              Automatiza tus pagos recurrentes tocando el botón +
            </Text>
          </View>
        }
      />
      
      {/* Modal para crear/editar pago */}
      <Modal
        visible={modalVisible || editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={modalVisible ? closeModal : closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPayment ? 'Editar pago programado' : 'Nuevo pago programado'}
              </Text>
              <TouchableOpacity onPress={modalVisible ? closeModal : closeEditModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Renta mensual, Netflix, etc."
                  value={descripcion}
                  onChangeText={setDescripcion}
                  editable={!saving}
                />
              </View>
              
              {/* Monto */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monto</Text>
                <View style={styles.montoContainer}>
                  <Text style={styles.montoSymbol}>$</Text>
                  <TextInput
                    style={styles.montoInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={monto}
                    onChangeText={setMonto}
                    editable={!saving}
                  />
                </View>
              </View>
              
              {/* Frecuencia */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Frecuencia</Text>
                <View style={styles.frequencySelector}>
                  {['mensual', 'semanal', 'anual', 'unica'].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyButton,
                        frecuencia === freq && styles.frequencyButtonActive
                      ]}
                      onPress={() => setFrecuencia(freq)}
                      disabled={saving}
                    >
                      <Text style={[
                        styles.frequencyButtonText,
                        frecuencia === freq && styles.frequencyButtonTextActive
                      ]}>
                        {getFrecuenciaLabel(freq)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Próxima fecha */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Próxima fecha de pago</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowDatePicker(true)}
                  disabled={saving}
                >
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.dateSelectorText}>
                    {proximaFecha.toLocaleDateString('es-MX')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {showDatePicker && (
                <DateTimePicker
                  value={proximaFecha}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setProximaFecha(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
              
              {/* Categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoría</Text>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setShowCategorySelector(true)}
                  disabled={saving}
                >
                  <Text style={[
                    styles.selectorText,
                    !selectedCategory && styles.placeholderText
                  ]}>
                    {selectedCategory ? selectedCategory.nombre : 'Selecciona una categoría'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Cuenta */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cuenta</Text>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setShowAccountSelector(true)}
                  disabled={saving}
                >
                  <Text style={[
                    styles.selectorText,
                    !selectedAccount && styles.placeholderText
                  ]}>
                    {selectedAccount ? selectedAccount.nombre : 'Selecciona una cuenta'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Días de notificación */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notificar antes (días)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  keyboardType="numeric"
                  value={notificarAntes}
                  onChangeText={setNotificarAntes}
                  editable={!saving}
                />
              </View>
              
              {/* Información */}
              <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Los pagos se crearán automáticamente como transacciones en la fecha indicada.
                  {frecuencia !== 'unica' && ' El pago se repetirá según la frecuencia seleccionada.'}
                </Text>
              </View>
              
              {/* Botones */}
              <View style={styles.modalButtons}>
                {saving ? (
                  <ActivityIndicator size="large" color="#000" />
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.modalButton} 
                      onPress={editingPayment ? handleUpdate : handleSave}
                    >
                      <Text style={styles.modalButtonText}>
                        {editingPayment ? 'Actualizar' : 'Crear pago'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonCancel]} 
                      onPress={modalVisible ? closeModal : closeEditModal}
                    >
                      <Text style={[styles.modalButtonText, styles.modalButtonCancelText]}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Modal selector de categorías */}
      <Modal
        visible={showCategorySelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategorySelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar categoría</Text>
              <TouchableOpacity onPress={() => setShowCategorySelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id.toString()}
              style={styles.selectorList}
            />
          </View>
        </View>
      </Modal>
      
      {/* Modal selector de cuentas */}
      <Modal
        visible={showAccountSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccountSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar cuenta</Text>
              <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={accounts}
              renderItem={renderAccount}
              keyExtractor={(item) => item.id.toString()}
              style={styles.selectorList}
            />
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#000',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  paymentsList: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardInactive: {
    opacity: 0.6,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentFrequency: {
    fontSize: 12,
    color: '#999',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  paymentDateOverdue: {
    color: '#EF4444',
    fontWeight: '600',
  },
  paymentDateUpcoming: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  toggleButton: {
    padding: 4,
  },
  textInactive: {
    color: '#999',
  },
  paymentFooter: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 16,
  },
  nextPaymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextPaymentText: {
    fontSize: 12,
    color: '#666',
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  montoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  montoSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  montoInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  frequencySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  frequencyButtonActive: {
    backgroundColor: '#000',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  frequencyButtonTextActive: {
    color: '#fff',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 56,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonCancelText: {
    color: '#666',
  },
  selectorModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  selectorList: {
    padding: 16,
  },
  selectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectorOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectorOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default GestionPagosProgramados;