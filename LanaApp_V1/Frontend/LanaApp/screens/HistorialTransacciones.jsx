import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionService } from '../utils/transactionService';
import { categoryService } from '../utils/categoryService';

const HistorialTransacciones = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchText, selectedFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar transacciones
      const transactionsData = await transactionService.getTransactions({
        limit: 100,
        skip: 0
      });
      
      // Ordenar por fecha más reciente
      const sortedTransactions = transactionsData.sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      
      setTransactions(sortedTransactions);
      
      // Cargar categorías para los filtros
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Filtrar por texto de búsqueda
    if (searchText) {
      filtered = filtered.filter(t => 
        t.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.categoria?.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.monto?.toString().includes(searchText)
      );
    }
    
    // Filtrar por tipo
    if (selectedFilter !== 'todas') {
      filtered = filtered.filter(t => {
        if (selectedFilter === 'ingresos') {
          return t.categoria?.tipo === 'ingreso';
        } else if (selectedFilter === 'gastos') {
          return t.categoria?.tipo === 'gasto';
        }
        return true;
      });
    }
    
    setFilteredTransactions(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getTransactionIcon = (categoria) => {
    const tipo = categoria?.tipo;
    const nombre = categoria?.nombre?.toLowerCase();
    
    // Iconos personalizados según la categoría
    if (nombre?.includes('comida') || nombre?.includes('alimento')) {
      return <Ionicons name="restaurant" size={20} color="#F59E0B" />;
    } else if (nombre?.includes('transporte')) {
      return <Ionicons name="car" size={20} color="#3B82F6" />;
    } else if (nombre?.includes('salud')) {
      return <Ionicons name="medical" size={20} color="#EF4444" />;
    } else if (nombre?.includes('educación')) {
      return <Ionicons name="school" size={20} color="#8B5CF6" />;
    } else if (nombre?.includes('entretenimiento')) {
      return <Ionicons name="game-controller" size={20} color="#EC4899" />;
    } else if (tipo === 'ingreso') {
      return <Ionicons name="arrow-down-circle" size={20} color="#10B981" />;
    } else {
      return <Ionicons name="arrow-up-circle" size={20} color="#EF4444" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const deleteTransaction = async (transactionId) => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que deseas eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.deleteTransaction(transactionId);
              Alert.alert('Éxito', 'Transacción eliminada correctamente');
              loadData(); // Recargar lista
            } catch (error) {
              console.error('Error eliminando transacción:', error);
              Alert.alert('Error', 'No se pudo eliminar la transacción');
            }
          }
        }
      ]
    );
  };

  const renderTransaction = ({ item }) => {
    const isIngreso = item.categoria?.tipo === 'ingreso';
    
    return (
      <TouchableOpacity 
        style={styles.transactionCard}
        onPress={() => navigation.navigate('DetalleTransaccion', { 
          transaction: item,
          onDelete: () => loadData() // Callback para recargar después de eliminar
        })}
        onLongPress={() => deleteTransaction(item.id)}
      >
        <View style={styles.transactionIcon}>
          {getTransactionIcon(item.categoria)}
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionName}>
            {item.descripcion || item.categoria?.nombre || 'Sin descripción'}
          </Text>
          <Text style={styles.transactionTime}>
            {formatDate(item.fecha)} • {item.cuenta?.nombre || 'Cuenta principal'}
          </Text>
        </View>
        
        <View style={styles.transactionAmountContainer}>
          <Text 
            style={[
              styles.transactionAmount,
              isIngreso ? styles.amountPositive : styles.amountNegative
            ]}
          >
            {isIngreso ? '+' : '-'}${item.monto.toLocaleString('es-MX', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </Text>
          <Text style={[styles.transactionStatus, styles.statusCompleted]}>
            {item.categoria?.nombre || 'General'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Transacciones</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando transacciones...</Text>
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
        <Text style={styles.headerTitle}>Historial de Transacciones</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar transacción..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filtros rápidos */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'todas' && styles.activeFilter]}
          onPress={() => setSelectedFilter('todas')}
        >
          <Text style={[styles.filterText, selectedFilter === 'todas' && styles.activeFilterText]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'ingresos' && styles.activeFilter]}
          onPress={() => setSelectedFilter('ingresos')}
        >
          <Text style={[styles.filterText, selectedFilter === 'ingresos' && styles.activeFilterText]}>
            Ingresos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'gastos' && styles.activeFilter]}
          onPress={() => setSelectedFilter('gastos')}
        >
          <Text style={[styles.filterText, selectedFilter === 'gastos' && styles.activeFilterText]}>
            Gastos
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Lista de transacciones */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.transactionsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? 'No se encontraron resultados' : 'Agrega tu primera transacción'}
            </Text>
          </View>
        }
      />
      
      {/* Botón flotante para nueva transacción */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('NuevaTransaccion')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#000',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
  },
  transactionsList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  transactionCard: {
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
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 13,
    color: '#888',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountPositive: {
    color: '#10B981',
  },
  amountNegative: {
    color: '#EF4444',
  },
  transactionStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusCompleted: {
    color: '#666',
    backgroundColor: '#F3F4F6',
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
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HistorialTransacciones;