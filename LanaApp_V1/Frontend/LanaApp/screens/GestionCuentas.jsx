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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accountService } from '../utils/accountService';

const GestionCuentas = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('banco');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [showTipoSelector, setShowTipoSelector] = useState(false);

  const tiposCuenta = [
    { value: 'banco', label: 'Banco', icon: 'business' },
    { value: 'tarjeta', label: 'Tarjeta', icon: 'card' },
    { value: 'efectivo', label: 'Efectivo', icon: 'cash' },
    { value: 'otro', label: 'Otro', icon: 'wallet' },
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      Alert.alert('Error', 'No se pudieron cargar las cuentas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAccounts();
  };

  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setNombre(account.nombre);
      setTipo(account.tipo);
      setSaldoInicial(account.saldo_inicial.toString());
    } else {
      setEditingAccount(null);
      setNombre('');
      setTipo('banco');
      setSaldoInicial('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAccount(null);
    setNombre('');
    setTipo('banco');
    setSaldoInicial('');
    setShowTipoSelector(false);
  };

  const validateForm = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la cuenta');
      return false;
    }
    
    if (!saldoInicial || isNaN(parseFloat(saldoInicial))) {
      Alert.alert('Error', 'Por favor ingresa un saldo inicial válido');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const accountData = {
        nombre: nombre.trim(),
        tipo,
        saldo_inicial: parseFloat(saldoInicial)
      };
      
      if (editingAccount) {
        // Actualizar cuenta existente
        await accountService.updateAccount(editingAccount.id, accountData);
        Alert.alert('Éxito', 'Cuenta actualizada correctamente');
      } else {
        // Crear nueva cuenta
        await accountService.createAccount(accountData);
        Alert.alert('Éxito', 'Cuenta creada correctamente');
      }
      
      closeModal();
      loadAccounts();
    } catch (error) {
      console.error('Error guardando cuenta:', error);
      
      let errorMessage = 'No se pudo guardar la cuenta';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (account) => {
    Alert.alert(
      'Eliminar cuenta',
      `¿Estás seguro de que deseas eliminar la cuenta "${account.nombre}"?\n\nNota: Solo puedes eliminar cuentas sin transacciones asociadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await accountService.deleteAccount(account.id);
              Alert.alert('Éxito', 'Cuenta eliminada correctamente');
              loadAccounts();
            } catch (error) {
              console.error('Error eliminando cuenta:', error);
              
              let errorMessage = 'No se pudo eliminar la cuenta';
              if (error.response?.status === 400) {
                errorMessage = 'No se puede eliminar una cuenta con transacciones asociadas';
              }
              
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const getIconForTipo = (tipo) => {
    const tipoInfo = tiposCuenta.find(t => t.value === tipo);
    return tipoInfo?.icon || 'wallet';
  };

  const renderAccount = ({ item }) => (
    <TouchableOpacity 
      style={styles.accountCard}
      onPress={() => openModal(item)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.accountIcon}>
        <Ionicons name={getIconForTipo(item.tipo)} size={24} color="#666" />
      </View>
      
      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{item.nombre}</Text>
        <Text style={styles.accountType}>
          {tiposCuenta.find(t => t.value === item.tipo)?.label || item.tipo}
        </Text>
      </View>
      
      <View style={styles.accountBalance}>
        <Text style={styles.balanceLabel}>Saldo inicial</Text>
        <Text style={styles.balanceAmount}>
          ${item.saldo_inicial.toLocaleString('es-MX', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión de Cuentas</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando cuentas...</Text>
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
        <Text style={styles.headerTitle}>Gestión de Cuentas</Text>
        <TouchableOpacity onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Información */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Presiona una cuenta para editarla o mantén presionado para eliminarla.
          </Text>
        </View>
      </View>
      
      {/* Lista de cuentas */}
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.accountsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay cuentas</Text>
            <Text style={styles.emptySubtext}>
              Agrega tu primera cuenta tocando el botón +
            </Text>
          </View>
        }
      />
      
      {/* Modal para crear/editar cuenta */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAccount ? 'Editar cuenta' : 'Nueva cuenta'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              {/* Nombre de la cuenta */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre de la cuenta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Cuenta principal"
                  value={nombre}
                  onChangeText={setNombre}
                  editable={!saving}
                />
              </View>
              
              {/* Tipo de cuenta */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de cuenta</Text>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setShowTipoSelector(true)}
                  disabled={saving}
                >
                  <View style={styles.selectorContent}>
                    <Ionicons 
                      name={getIconForTipo(tipo)} 
                      size={20} 
                      color="#666" 
                      style={styles.selectorIcon}
                    />
                    <Text style={styles.selectorText}>
                      {tiposCuenta.find(t => t.value === tipo)?.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Saldo inicial */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Saldo inicial</Text>
                <View style={styles.montoContainer}>
                  <Text style={styles.montoSymbol}>$</Text>
                  <TextInput
                    style={styles.montoInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={saldoInicial}
                    onChangeText={setSaldoInicial}
                    editable={!saving}
                  />
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
                      onPress={handleSave}
                    >
                      <Text style={styles.modalButtonText}>
                        {editingAccount ? 'Actualizar' : 'Crear'}
                      </Text>
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
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal selector de tipo */}
      <Modal
        visible={showTipoSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTipoSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar tipo de cuenta</Text>
              <TouchableOpacity onPress={() => setShowTipoSelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {tiposCuenta.map((tipoItem) => (
              <TouchableOpacity
                key={tipoItem.value}
                style={styles.tipoOption}
                onPress={() => {
                  setTipo(tipoItem.value);
                  setShowTipoSelector(false);
                }}
              >
                <Ionicons 
                  name={tipoItem.icon} 
                  size={24} 
                  color={tipo === tipoItem.value ? '#000' : '#666'} 
                />
                <Text style={[
                  styles.tipoOptionText,
                  tipo === tipoItem.value && styles.tipoOptionTextActive
                ]}>
                  {tipoItem.label}
                </Text>
                {tipo === tipoItem.value && (
                  <Ionicons name="checkmark" size={24} color="#000" />
                )}
              </TouchableOpacity>
            ))}
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
  infoSection: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  accountsList: {
    padding: 16,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#666',
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
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
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorIcon: {
    marginRight: 12,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
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
  modalButtons: {
    marginTop: 32,
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
    padding: 20,
  },
  tipoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tipoOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 16,
  },
  tipoOptionTextActive: {
    color: '#000',
    fontWeight: '600',
  },
});

export default GestionCuentas;