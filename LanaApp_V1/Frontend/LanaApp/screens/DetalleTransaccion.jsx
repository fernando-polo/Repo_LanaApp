import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionService } from '../utils/transactionService';

const DetalleTransaccion = ({ navigation, route }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  const { transaction: initialTransaction, onDelete } = route.params || {};

  useEffect(() => {
    if (initialTransaction) {
      loadTransactionDetail(initialTransaction.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadTransactionDetail = async (transactionId) => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactionDetail(transactionId);
      setTransaction(data);
    } catch (error) {
      console.error('Error cargando detalle:', error);
      Alert.alert('Error', 'No se pudo cargar el detalle de la transacción');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    if (!transaction) return;
    
    setDeleting(true);
    
    try {
      await transactionService.deleteTransaction(transaction.id);
      
      Alert.alert(
        'Éxito',
        'Transacción eliminada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Llamar el callback si existe
              if (onDelete) {
                onDelete();
              }
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error eliminando transacción:', error);
      Alert.alert('Error', 'No se pudo eliminar la transacción');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de transacción</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando detalle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de transacción</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontró la transacción</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIngreso = transaction.categoria?.tipo === 'ingreso';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de transacción</Text>
        <TouchableOpacity onPress={handleDelete} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Monto principal */}
        <View style={styles.amountSection}>
          <View style={[
            styles.typeIcon,
            isIngreso ? styles.typeIconIngreso : styles.typeIconGasto
          ]}>
            <Ionicons 
              name={isIngreso ? "arrow-down-circle" : "arrow-up-circle"} 
              size={40} 
              color="#fff" 
            />
          </View>
          <Text style={[
            styles.amountText,
            isIngreso ? styles.amountIngreso : styles.amountGasto
          ]}>
            {isIngreso ? '+' : '-'}${transaction.monto.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Text>
          <Text style={styles.typeText}>
            {isIngreso ? 'Ingreso' : 'Gasto'}
          </Text>
        </View>
        
        {/* Información detallada */}
        <View style={styles.detailSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Descripción</Text>
            <Text style={styles.detailValue}>
              {transaction.descripcion || 'Sin descripción'}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Categoría</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {transaction.categoria?.nombre || 'General'}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cuenta</Text>
            <Text style={styles.detailText}>
              {transaction.cuenta?.nombre || 'Cuenta principal'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha</Text>
            <Text style={styles.detailText}>
              {formatDate(transaction.fecha)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hora de registro</Text>
            <Text style={styles.detailText}>
              {formatTime(transaction.created_at)}
            </Text>
          </View>
          
          {transaction.updated_at && transaction.updated_at !== transaction.created_at && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Última modificación</Text>
              <Text style={styles.detailText}>
                {formatDate(transaction.updated_at)} a las {formatTime(transaction.updated_at)}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          {/* ID de transacción */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID de transacción</Text>
            <Text style={styles.idText}>#{transaction.id}</Text>
          </View>
        </View>
        
        {/* Información adicional */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Esta transacción afecta el saldo de tu cuenta "{transaction.cuenta?.nombre || 'principal'}".
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Eliminar transacción</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  amountSection: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
  },
  typeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIconIngreso: {
    backgroundColor: '#10B981',
  },
  typeIconGasto: {
    backgroundColor: '#EF4444',
  },
  amountText: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  amountIngreso: {
    color: '#10B981',
  },
  amountGasto: {
    color: '#EF4444',
  },
  typeText: {
    fontSize: 16,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'right',
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  idText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  infoSection: {
    padding: 16,
    marginBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetalleTransaccion;