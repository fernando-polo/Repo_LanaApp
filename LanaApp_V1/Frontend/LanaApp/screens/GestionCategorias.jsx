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
import { categoryService } from '../utils/categoryService';

const GestionCategorias = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState('gasto'); // 'gasto' o 'ingreso'
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('gasto');

  // Filtrar categorías según el tab seleccionado
  const filteredCategories = categories.filter(cat => cat.tipo === selectedTab);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNombre(category.nombre);
      setTipo(category.tipo);
    } else {
      setEditingCategory(null);
      setNombre('');
      setTipo(selectedTab); // Usar el tab actual como tipo por defecto
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    setNombre('');
    setTipo('gasto');
  };

  const validateForm = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return false;
    }
    
    // Verificar si ya existe una categoría con el mismo nombre y tipo
    const exists = categories.some(cat => 
      cat.nombre.toLowerCase() === nombre.trim().toLowerCase() && 
      cat.tipo === tipo &&
      cat.id !== editingCategory?.id
    );
    
    if (exists) {
      Alert.alert('Error', 'Ya existe una categoría con ese nombre');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const categoryData = {
        nombre: nombre.trim(),
        tipo
      };
      
      if (editingCategory) {
        // Actualizar categoría existente
        await categoryService.updateCategory(editingCategory.id, categoryData);
        Alert.alert('Éxito', 'Categoría actualizada correctamente');
      } else {
        // Crear nueva categoría
        await categoryService.createCategory(categoryData);
        Alert.alert('Éxito', 'Categoría creada correctamente');
      }
      
      closeModal();
      loadCategories();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      
      let errorMessage = 'No se pudo guardar la categoría';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Estás seguro de que deseas eliminar la categoría "${category.nombre}"?\n\nNota: Solo puedes eliminar categorías sin transacciones asociadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryService.deleteCategory(category.id);
              Alert.alert('Éxito', 'Categoría eliminada correctamente');
              loadCategories();
            } catch (error) {
              console.error('Error eliminando categoría:', error);
              
              let errorMessage = 'No se pudo eliminar la categoría';
              if (error.response?.status === 400) {
                errorMessage = 'No se puede eliminar una categoría con transacciones asociadas';
              }
              
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    // Iconos para gastos
    if (name.includes('comida') || name.includes('alimento') || name.includes('restaurante')) {
      return 'restaurant';
    } else if (name.includes('transporte') || name.includes('gasolina') || name.includes('uber')) {
      return 'car';
    } else if (name.includes('salud') || name.includes('medicina') || name.includes('doctor')) {
      return 'medical';
    } else if (name.includes('educación') || name.includes('escuela') || name.includes('curso')) {
      return 'school';
    } else if (name.includes('entretenimiento') || name.includes('ocio') || name.includes('diversión')) {
      return 'game-controller';
    } else if (name.includes('hogar') || name.includes('casa') || name.includes('renta')) {
      return 'home';
    } else if (name.includes('compras') || name.includes('shopping') || name.includes('ropa')) {
      return 'cart';
    } else if (name.includes('servicios') || name.includes('luz') || name.includes('agua')) {
      return 'build';
    } else if (name.includes('viajes') || name.includes('vacaciones')) {
      return 'airplane';
    } else if (name.includes('regalo') || name.includes('donación')) {
      return 'gift';
    }
    
    // Iconos para ingresos
    else if (name.includes('salario') || name.includes('sueldo') || name.includes('nómina')) {
      return 'briefcase';
    } else if (name.includes('freelance') || name.includes('proyecto')) {
      return 'laptop';
    } else if (name.includes('inversión') || name.includes('rendimiento')) {
      return 'trending-up';
    } else if (name.includes('venta')) {
      return 'pricetag';
    } else if (name.includes('bono') || name.includes('premio')) {
      return 'trophy';
    }
    
    // Icono por defecto
    return selectedTab === 'ingreso' ? 'arrow-down-circle' : 'arrow-up-circle';
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => openModal(item)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={[
        styles.categoryIcon,
        item.tipo === 'ingreso' ? styles.categoryIconIngreso : styles.categoryIconGasto
      ]}>
        <Ionicons 
          name={getCategoryIcon(item.nombre)} 
          size={24} 
          color="#fff" 
        />
      </View>
      
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.nombre}</Text>
        <Text style={styles.categoryType}>
          {item.tipo === 'ingreso' ? 'Categoría de ingreso' : 'Categoría de gasto'}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión de Categorías</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
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
        <Text style={styles.headerTitle}>Gestión de Categorías</Text>
        <TouchableOpacity onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'gasto' && styles.activeTab]}
          onPress={() => setSelectedTab('gasto')}
        >
          <Text style={[styles.tabText, selectedTab === 'gasto' && styles.activeTabText]}>
            Gastos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'ingreso' && styles.activeTab]}
          onPress={() => setSelectedTab('ingreso')}
        >
          <Text style={[styles.tabText, selectedTab === 'ingreso' && styles.activeTabText]}>
            Ingresos
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Información */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Presiona una categoría para editarla o mantén presionado para eliminarla.
          </Text>
        </View>
      </View>
      
      {/* Lista de categorías */}
      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.categoriesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={selectedTab === 'ingreso' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'} 
              size={64} 
              color="#ccc" 
            />
            <Text style={styles.emptyText}>
              No hay categorías de {selectedTab}
            </Text>
            <Text style={styles.emptySubtext}>
              Agrega tu primera categoría tocando el botón +
            </Text>
          </View>
        }
      />
      
      {/* Modal para crear/editar categoría */}
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
                {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              {/* Nombre de la categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre de la categoría</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Comida, Transporte, Salario..."
                  value={nombre}
                  onChangeText={setNombre}
                  editable={!saving}
                  autoCapitalize="sentences"
                />
              </View>
              
              {/* Tipo de categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de categoría</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      tipo === 'gasto' && styles.typeButtonActive
                    ]}
                    onPress={() => setTipo('gasto')}
                    disabled={saving || editingCategory}
                  >
                    <Ionicons 
                      name="arrow-up-circle" 
                      size={24} 
                      color={tipo === 'gasto' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.typeButtonText,
                      tipo === 'gasto' && styles.typeButtonTextActive
                    ]}>
                      Gasto
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      tipo === 'ingreso' && styles.typeButtonActive
                    ]}
                    onPress={() => setTipo('ingreso')}
                    disabled={saving || editingCategory}
                  >
                    <Ionicons 
                      name="arrow-down-circle" 
                      size={24} 
                      color={tipo === 'ingreso' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.typeButtonText,
                      tipo === 'ingreso' && styles.typeButtonTextActive
                    ]}>
                      Ingreso
                    </Text>
                  </TouchableOpacity>
                </View>
                {editingCategory && (
                  <Text style={styles.typeNote}>
                    No puedes cambiar el tipo de una categoría existente
                  </Text>
                )}
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
                        {editingCategory ? 'Actualizar' : 'Crear'}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
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
  categoriesList: {
    padding: 16,
  },
  categoryCard: {
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
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIconGasto: {
    backgroundColor: '#EF4444',
  },
  categoryIconIngreso: {
    backgroundColor: '#10B981',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryType: {
    fontSize: 14,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 16,
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
  typeNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
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
});

export default GestionCategorias;