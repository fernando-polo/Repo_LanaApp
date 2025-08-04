import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { transactionService } from '../utils/transactionService';
import { accountService } from '../utils/accountService';
import { categoryService } from '../utils/categoryService';

const NuevaTransaccion = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estados para los campos
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Estados para selección
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [transactionType, setTransactionType] = useState('gasto'); // 'ingreso' o 'gasto'
  
  // Estados para modales
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Datos de la API
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filtrar categorías según el tipo de transacción
    const filtered = categories.filter(cat => cat.tipo === transactionType);
    setFilteredCategories(filtered);
    
    // Resetear categoría seleccionada si cambió el tipo
    if (selectedCategory && selectedCategory.tipo !== transactionType) {
      setSelectedCategory(null);
    }
  }, [transactionType, categories]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar cuentas
      const accountsData = await accountService.getAccounts();
      setAccounts(accountsData);
      
      // Seleccionar primera cuenta por defecto
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0]);
      }
      
      // Cargar categorías
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const validateForm = () => {
    if (!monto || parseFloat(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return false;
    }
    
    if (!selectedAccount) {
      Alert.alert('Error', 'Por favor selecciona una cuenta');
      return false;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    console.log('Iniciando envío de transacción...');
    
    try {
      const transactionData = {
        monto: parseFloat(monto),
        fecha: fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
        descripcion: descripcion.trim() || `${selectedCategory.nombre}`,
        cuenta_id: selectedAccount.id,
        categoria_id: selectedCategory.id
      };
      
      console.log('Datos a enviar:', transactionData);
      
      const response = await transactionService.createTransaction(transactionData);
      console.log('Respuesta del servidor:', response);
      
      // Mostrar éxito
      setShowSuccess(true);
      
      // Esperar un momento para que se vea el mensaje
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      
    } catch (error) {
      console.error('Error creando transacción:', error);
      setSaving(false);
      
      // Mensaje de error más específico
      let errorMessage = 'No se pudo crear la transacción';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const renderAccountItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedAccount(item);
        setShowAccountModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.nombre}</Text>
      <Text style={styles.modalItemSubtext}>
        Saldo: ${item.saldo_inicial?.toLocaleString('es-MX')}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategoryModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla de éxito
  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={60} color="#fff" />
          </View>
          <Text style={styles.successTitle}>¡Transacción creada!</Text>
          <Text style={styles.successSubtitle}>
            Se ha registrado tu {transactionType} correctamente
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva transacción</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Selector de tipo de transacción */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              transactionType === 'gasto' && styles.typeButtonActive
            ]}
            onPress={() => setTransactionType('gasto')}
          >
            <Ionicons 
              name="arrow-up-circle" 
              size={24} 
              color={transactionType === 'gasto' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.typeButtonText,
              transactionType === 'gasto' && styles.typeButtonTextActive
            ]}>
              Gasto
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              transactionType === 'ingreso' && styles.typeButtonActive
            ]}
            onPress={() => setTransactionType('ingreso')}
          >
            <Ionicons 
              name="arrow-down-circle" 
              size={24} 
              color={transactionType === 'ingreso' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.typeButtonText,
              transactionType === 'ingreso' && styles.typeButtonTextActive
            ]}>
              Ingreso
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Campo de monto */}
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
        
        {/* Selector de cuenta */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cuenta</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowAccountModal(true)}
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
        
        {/* Selector de categoría */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Categoría</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCategoryModal(true)}
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
        
        {/* Campo de fecha */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowDatePicker(true)}
            disabled={saving}
          >
            <Text style={styles.selectorText}>
              {fecha.toLocaleDateString('es-MX', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Campo de descripción */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Descripción (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Añade una descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={3}
            editable={!saving}
          />
        </View>

        {/* Mensaje mientras guarda */}
        {saving && (
          <View style={styles.savingMessage}>
            <ActivityIndicator color="#666" style={{ marginRight: 8 }} />
            <Text style={styles.savingText}>Guardando transacción...</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Botón de guardar */}
      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <View style={styles.savingButton}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.saveButtonText}>Guardando...</Text>
          </View>
        ) : (
          <Text style={styles.saveButtonText}>Guardar transacción</Text>
        )}
      </TouchableOpacity>
      
      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      
      {/* Modal de cuentas */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar cuenta</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={accounts}
              renderItem={renderAccountItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
      
      {/* Modal de categorías */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Seleccionar categoría de {transactionType}
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.modalList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No hay categorías de {transactionType}
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
    backgroundColor: '#fff',
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#000',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
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
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  montoInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    textAlignVertical: 'top',
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
  savingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 16,
  },
  savingText: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#000',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  modalList: {
    padding: 16,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default NuevaTransaccion;