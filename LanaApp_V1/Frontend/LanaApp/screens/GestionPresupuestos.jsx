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
import { categoryService } from '../utils/categoryService';
import { transactionService } from '../utils/transactionService';
import { budgetService } from '../utils/budgetService';

const GestionPresupuestos = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados para datos
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [editingBudget, setEditingBudget] = useState(null);
  
  // Estados del formulario
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [monto, setMonto] = useState('');
  const [editMonto, setEditMonto] = useState('');
  const [alerta80, setAlerta80] = useState(true);
  const [alerta100, setAlerta100] = useState(true);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  // Mes actual
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías de gasto
      const categoriesData = await categoryService.getCategories();
      const expenseCategories = categoriesData.filter(cat => cat.tipo === 'gasto');
      setCategories(expenseCategories);
      
      // Cargar presupuestos del mes actual
      const budgetsData = await budgetService.getBudgets(currentMonth, currentYear);
      setBudgets(budgetsData);
      
      // Cargar resumen de gastos por categoría del mes actual
      const summaryData = await transactionService.getCategoryReport(currentMonth, currentYear);
      
      // Convertir el resumen en un objeto de gastos por categoría
      const expensesByCategory = {};
      if (summaryData && summaryData.gastos) {
        summaryData.gastos.forEach(item => {
          // Buscar el ID de la categoría por nombre
          const category = expenseCategories.find(cat => cat.nombre === item.categoria);
          if (category) {
            expensesByCategory[category.id] = item.total;
          }
        });
      }
      setExpenses(expensesByCategory);
      
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
    setSelectedCategory(null);
    setMonto('');
    setAlerta80(true);
    setAlerta100(true);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCategory(null);
    setMonto('');
    setShowCategorySelector(false);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setEditMonto(budget.limite.toString());
    setAlerta80(budget.alerta_80);
    setAlerta100(budget.alerta_100);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingBudget(null);
    setEditMonto('');
  };

  const validateForm = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return false;
    }
    
    if (!monto || parseFloat(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return false;
    }
    
    // Verificar si ya existe un presupuesto para esta categoría
    const exists = budgets.some(b => b.categoria_id === selectedCategory.id);
    if (exists) {
      Alert.alert('Error', 'Ya existe un presupuesto para esta categoría');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const budgetData = {
        categoria_id: selectedCategory.id,
        mes: currentMonth,
        ano: currentYear,
        limite: parseFloat(monto),
        alerta_80: alerta80,
        alerta_100: alerta100
      };
      
      await budgetService.createBudget(budgetData);
      
      Alert.alert('Éxito', 'Presupuesto creado correctamente');
      closeModal();
      loadData(); // Recargar datos
      
    } catch (error) {
      console.error('Error guardando presupuesto:', error);
      
      let errorMessage = 'No se pudo guardar el presupuesto';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editMonto || parseFloat(editMonto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }
    
    setSaving(true);
    
    try {
      const updateData = {
        limite: parseFloat(editMonto),
        alerta_80: alerta80,
        alerta_100: alerta100
      };
      
      await budgetService.updateBudget(editingBudget.id, updateData);
      
      Alert.alert('Éxito', 'Presupuesto actualizado correctamente');
      closeEditModal();
      loadData(); // Recargar datos
      
    } catch (error) {
      console.error('Error actualizando presupuesto:', error);
      Alert.alert('Error', 'No se pudo actualizar el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (budget) => {
    Alert.alert(
      'Eliminar presupuesto',
      `¿Estás seguro de que deseas eliminar el presupuesto de ${budget.categoria.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await budgetService.deleteBudget(budget.id);
              Alert.alert('Éxito', 'Presupuesto eliminado correctamente');
              loadData(); // Recargar datos
            } catch (error) {
              console.error('Error eliminando presupuesto:', error);
              Alert.alert('Error', 'No se pudo eliminar el presupuesto');
            }
          }
        }
      ]
    );
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 50) return '#10B981';
    if (percentage <= 80) return '#F59E0B';
    return '#EF4444';
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
    } else if (name.includes('hogar')) {
      return 'home';
    } else if (name.includes('compras')) {
      return 'cart';
    } else if (name.includes('servicios')) {
      return 'build';
    }
    
    return 'arrow-up-circle';
  };

  const renderBudget = ({ item }) => {
    const spent = expenses[item.categoria_id] || 0;
    const percentage = (spent / item.limite) * 100;
    const remaining = item.limite - spent;
    const progressColor = getProgressColor(percentage);
    
    return (
      <TouchableOpacity 
        style={styles.budgetCard}
        onPress={() => openEditModal(item)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetIcon}>
            <Ionicons 
              name={getCategoryIcon(item.categoria.nombre)} 
              size={24} 
              color="#666" 
            />
          </View>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetCategory}>{item.categoria.nombre}</Text>
            <Text style={styles.budgetAmount}>
              ${spent.toLocaleString('es-MX', { minimumFractionDigits: 0 })} / 
              ${item.limite.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={styles.budgetStatus}>
            <Text style={[styles.budgetPercentage, { color: progressColor }]}>
              {percentage.toFixed(0)}%
            </Text>
            <Text style={styles.budgetRemaining}>
              {remaining >= 0 
                ? `Quedan $${remaining.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
                : `Excedido por $${Math.abs(remaining).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
              }
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: progressColor 
                }
              ]} 
            />
          </View>
        </View>
        
        {percentage > 80 && (
          <View style={[styles.warningBadge, { backgroundColor: progressColor + '20' }]}>
            <Ionicons 
              name={percentage >= 100 ? 'alert-circle' : 'warning'} 
              size={16} 
              color={progressColor} 
            />
            <Text style={[styles.warningText, { color: progressColor }]}>
              {percentage >= 100 ? 'Presupuesto excedido' : 'Cerca del límite'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAvailableCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryOption}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategorySelector(false);
      }}
    >
      <View style={styles.categoryOptionIcon}>
        <Ionicons name={getCategoryIcon(item.nombre)} size={20} color="#666" />
      </View>
      <Text style={styles.categoryOptionText}>{item.nombre}</Text>
      {selectedCategory?.id === item.id && (
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
          <Text style={styles.headerTitle}>Presupuestos</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando presupuestos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filtrar categorías que no tienen presupuesto
  const availableCategories = categories.filter(
    cat => !budgets.some(b => b.categoria_id === cat.id)
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Presupuestos</Text>
        <TouchableOpacity onPress={openModal} disabled={availableCategories.length === 0}>
          <Ionicons 
            name="add" 
            size={24} 
            color={availableCategories.length === 0 ? '#ccc' : '#000'} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Mes actual */}
      <View style={styles.monthSection}>
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth - 1]} {currentYear}
        </Text>
        <Text style={styles.monthSubtitle}>Gestiona tus gastos mensuales</Text>
      </View>
      
      {/* Lista de presupuestos */}
      <FlatList
        data={budgets}
        renderItem={renderBudget}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.budgetsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pie-chart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay presupuestos</Text>
            <Text style={styles.emptySubtext}>
              {availableCategories.length > 0 
                ? 'Agrega tu primer presupuesto tocando el botón +'
                : 'Primero crea categorías de gasto en Gestión de Categorías'
              }
            </Text>
          </View>
        }
      />
      
      {/* Modal para crear presupuesto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo presupuesto</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {/* Selector de categoría */}
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
              
              {/* Monto del presupuesto */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monto mensual</Text>
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
              
              {/* Configuración de alertas */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alertas</Text>
                <View style={styles.alertConfig}>
                  <TouchableOpacity
                    style={styles.alertItem}
                    onPress={() => setAlerta80(!alerta80)}
                  >
                    <Ionicons 
                      name={alerta80 ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={alerta80 ? '#000' : '#666'} 
                    />
                    <Text style={styles.alertText}>Alertar al 80%</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.alertItem}
                    onPress={() => setAlerta100(!alerta100)}
                  >
                    <Ionicons 
                      name={alerta100 ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={alerta100 ? '#000' : '#666'} 
                    />
                    <Text style={styles.alertText}>Alertar al 100%</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Información */}
              <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Recibirás notificaciones cuando tu gasto se acerque a los límites establecidos.
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
                      onPress={handleSave}
                    >
                      <Text style={styles.modalButtonText}>Crear presupuesto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonCancel]} 
                      onPress={closeModal}
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
      
      {/* Modal para editar presupuesto */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Editar presupuesto - {editingBudget?.categoria.nombre}
              </Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {/* Monto del presupuesto */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monto mensual</Text>
                <View style={styles.montoContainer}>
                  <Text style={styles.montoSymbol}>$</Text>
                  <TextInput
                    style={styles.montoInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={editMonto}
                    onChangeText={setEditMonto}
                    editable={!saving}
                  />
                </View>
              </View>
              
              {/* Configuración de alertas */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alertas</Text>
                <View style={styles.alertConfig}>
                  <TouchableOpacity
                    style={styles.alertItem}
                    onPress={() => setAlerta80(!alerta80)}
                  >
                    <Ionicons 
                      name={alerta80 ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={alerta80 ? '#000' : '#666'} 
                    />
                    <Text style={styles.alertText}>Alertar al 80%</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.alertItem}
                    onPress={() => setAlerta100(!alerta100)}
                  >
                    <Ionicons 
                      name={alerta100 ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={alerta100 ? '#000' : '#666'} 
                    />
                    <Text style={styles.alertText}>Alertar al 100%</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Botones */}
              <View style={styles.modalButtons}>
                {saving ? (
                  <ActivityIndicator size="large" color="#000" />
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.modalButton} 
                      onPress={handleUpdate}
                    >
                      <Text style={styles.modalButtonText}>Actualizar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonCancel]} 
                      onPress={closeEditModal}
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
              data={availableCategories}
              renderItem={renderAvailableCategory}
              keyExtractor={(item) => item.id.toString()}
              style={styles.categoriesList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No hay categorías disponibles
                  </Text>
                </View>
              }
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
  monthSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  monthSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  budgetsList: {
    padding: 16,
  },
  budgetCard: {
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
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 14,
    color: '#666',
  },
  budgetStatus: {
    alignItems: 'flex-end',
  },
  budgetPercentage: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  budgetRemaining: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
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
    paddingHorizontal: 32,
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
    maxHeight: '80%',
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
  alertConfig: {
    gap: 16,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertText: {
    fontSize: 16,
    color: '#333',
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
  categoriesList: {
    padding: 16,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default GestionPresupuestos;