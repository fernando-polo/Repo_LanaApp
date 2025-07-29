import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HistorialTransacciones = ({ navigation }) => {
  const transactions = [
    { id: 1, name: 'sara BBVA', time: '1d', amount: '425.00', status: 'exitosa', type: 'transferencia' },
    { id: 2, name: 'Señor de la renta', time: '1d', amount: '3200.00', status: 'transito', type: 'pago' },
    { id: 3, name: 'daniela BBVA', time: '2d', amount: '500.00', status: 'exitosa', type: 'transferencia' },
    { id: 4, name: 'elena BANAMEX', time: '3d', amount: '320.00', status: 'exitosa', type: 'transferencia' },
    { id: 5, name: 'fernando OXXO', time: '4d', amount: '65.00', status: 'exitosa', type: 'retiro' },
    { id: 6, name: 'señor de la renta', time: '5d', amount: '800.00', status: 'exitosa', type: 'pago' },
    { id: 7, name: 'elena BANAMEX', time: '5d', amount: '45.00', status: 'rechazada', type: 'transferencia' },
  ];

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'transferencia':
        return <Ionicons name="swap-horizontal" size={20} color="#3B82F6" />;
      case 'pago':
        return <Ionicons name="card" size={20} color="#10B981" />;
      case 'retiro':
        return <Ionicons name="cash" size={20} color="#F59E0B" />;
      default:
        return <Ionicons name="receipt" size={20} color="#6366F1" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header mejorado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Transacciones</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Barra de búsqueda mejorada */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar transacción..."
          placeholderTextColor="#999"
        />
      </View>
      
      {/* Filtros rápidos */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Text style={[styles.filterText, styles.activeFilterText]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Transferencias</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Pagos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Retiros</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Lista de transacciones */}
      <ScrollView style={styles.transactionsList}>
        {transactions.map((transaction) => (
          <TouchableOpacity 
            key={transaction.id} 
            style={styles.transactionCard}
            onPress={() => navigation.navigate('DetalleTransaccion', { transaction })}
          >
            <View style={styles.transactionIcon}>
              {getTransactionIcon(transaction.type)}
            </View>
            
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionName}>{transaction.name}</Text>
              <Text style={styles.transactionTime}>{transaction.time} • {transaction.type}</Text>
            </View>
            
            <View style={styles.transactionAmountContainer}>
              <Text 
                style={[
                  styles.transactionAmount,
                  transaction.status === 'rechazada' && styles.amountRejected,
                  transaction.status === 'transito' && styles.amountPending
                ]}
              >
                {transaction.status === 'rechazada' ? '-' : ''}${transaction.amount}
              </Text>
              <Text 
                style={[
                  styles.transactionStatus,
                  transaction.status === 'rechazada' && styles.statusRejected,
                  transaction.status === 'transito' && styles.statusPending
                ]}
              >
                {transaction.status === 'exitosa' ? 'Completada' : 
                transaction.status === 'transito' ? 'En proceso' : 'Rechazada'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
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
    flex: 1,
    paddingHorizontal: 16,
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
    color: '#10B981',
    marginBottom: 4,
  },
  amountPending: {
    color: '#F59E0B',
  },
  amountRejected: {
    color: '#EF4444',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPending: {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  statusRejected: {
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
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