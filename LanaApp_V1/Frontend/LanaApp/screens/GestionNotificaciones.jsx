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
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../utils/notificationService';

const GestionNotificaciones = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('todas'); // todas, leidas, pendientes
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Configuración de notificaciones (simulado - en producción vendría del backend)
  const [notificationSettings, setNotificationSettings] = useState({
    presupuesto_excedido: true,
    pago_programado: true,
    saldo_bajo: true,
  });

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      let params = {};
      if (filter === 'leidas') {
        params.leidas = true;
      } else if (filter === 'pendientes') {
        params.leidas = false;
      }
      
      const data = await notificationService.getNotifications(params);
      setNotifications(data);
      
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.estado === 'leida') return;
    
    try {
      await notificationService.markAsRead(notification.id);
      loadNotifications();
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      loadNotifications();
      
      // Si estaba en modo selección, quitar de la lista
      if (isSelectionMode) {
        setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      }
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      Alert.alert('Error', 'No se pudo eliminar la notificación');
    }
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Eliminar notificaciones',
      `¿Estás seguro de que deseas eliminar ${selectedNotifications.length} notificaciones?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Eliminar una por una (en producción podría ser un endpoint batch)
              for (const id of selectedNotifications) {
                await notificationService.deleteNotification(id);
              }
              
              setSelectedNotifications([]);
              setIsSelectionMode(false);
              loadNotifications();
              
              Alert.alert('Éxito', 'Notificaciones eliminadas correctamente');
            } catch (error) {
              console.error('Error eliminando notificaciones:', error);
              Alert.alert('Error', 'No se pudieron eliminar todas las notificaciones');
            }
          }
        }
      ]
    );
  };

  const toggleSelection = (notificationId) => {
    if (selectedNotifications.includes(notificationId)) {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    } else {
      setSelectedNotifications(prev => [...prev, notificationId]);
    }
  };

  const toggleAllSelection = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const getNotificationIcon = (tipo) => {
    switch(tipo) {
      case 'presupuesto_excedido':
        return 'warning';
      case 'pago_programado':
        return 'calendar';
      case 'saldo_bajo':
        return 'alert-circle';
      case 'recuperacion':
        return 'mail';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (tipo) => {
    switch(tipo) {
      case 'presupuesto_excedido':
        return '#F59E0B';
      case 'pago_programado':
        return '#3B82F6';
      case 'saldo_bajo':
        return '#EF4444';
      case 'recuperacion':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes === 0) {
          return 'Ahora mismo';
        }
        return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
      }
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-MX');
    }
  };

  const renderNotification = ({ item }) => {
    const isSelected = selectedNotifications.includes(item.id);
    const isRead = item.estado === 'leida';
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          isRead && styles.notificationCardRead,
          isSelected && styles.notificationCardSelected
        ]}
        onPress={() => {
          if (isSelectionMode) {
            toggleSelection(item.id);
          } else {
            handleMarkAsRead(item);
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            toggleSelection(item.id);
          }
        }}
      >
        <View style={styles.notificationContent}>
          {isSelectionMode && (
            <View style={styles.checkboxContainer}>
              <Ionicons 
                name={isSelected ? 'checkbox' : 'square-outline'} 
                size={24} 
                color={isSelected ? '#000' : '#666'} 
              />
            </View>
          )}
          
          <View 
            style={[
              styles.notificationIcon,
              { backgroundColor: getNotificationColor(item.tipo) + '20' }
            ]}
          >
            <Ionicons 
              name={getNotificationIcon(item.tipo)} 
              size={24} 
              color={getNotificationColor(item.tipo)} 
            />
          </View>
          
          <View style={styles.notificationInfo}>
            <Text style={[
              styles.notificationMessage,
              isRead && styles.notificationMessageRead
            ]}>
              {item.mensaje}
            </Text>
            <Text style={styles.notificationDate}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          
          {!isRead && (
            <View style={styles.unreadDot} />
          )}
          
          {!isSelectionMode && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSettingItem = (title, key, description) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={notificationSettings[key]}
        onValueChange={(value) => {
          setNotificationSettings(prev => ({
            ...prev,
            [key]: value
          }));
          // En producción, aquí se actualizaría en el backend
        }}
        trackColor={{ false: '#ccc', true: '#000' }}
        thumbColor="#fff"
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter(n => n.estado !== 'leida').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (isSelectionMode) {
            setIsSelectionMode(false);
            setSelectedNotifications([]);
          } else {
            navigation.goBack();
          }
        }}>
          <Ionicons name={isSelectionMode ? "close" : "arrow-back"} size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isSelectionMode 
            ? `${selectedNotifications.length} seleccionadas`
            : 'Notificaciones'
          }
        </Text>
        
        {isSelectionMode ? (
          <TouchableOpacity 
            onPress={toggleAllSelection}
            disabled={notifications.length === 0}
          >
            <Text style={styles.selectAllText}>
              {selectedNotifications.length === notifications.length ? 'Ninguna' : 'Todas'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>
      
      {/* Filtros */}
      {!isSelectionMode && (
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'todas' && styles.filterButtonActive]}
            onPress={() => setFilter('todas')}
          >
            <Text style={[styles.filterText, filter === 'todas' && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pendientes' && styles.filterButtonActive]}
            onPress={() => setFilter('pendientes')}
          >
            <Text style={[styles.filterText, filter === 'pendientes' && styles.filterTextActive]}>
              No leídas ({unreadCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'leidas' && styles.filterButtonActive]}
            onPress={() => setFilter('leidas')}
          >
            <Text style={[styles.filterText, filter === 'leidas' && styles.filterTextActive]}>
              Leídas
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Configuración de notificaciones */}
      {!isSelectionMode && filter === 'todas' && (
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Configuración de alertas</Text>
          {renderSettingItem(
            'Presupuestos excedidos',
            'presupuesto_excedido',
            'Recibe alertas cuando superes tus presupuestos'
          )}
          {renderSettingItem(
            'Pagos programados',
            'pago_programado',
            'Recordatorios de pagos próximos'
          )}
          {renderSettingItem(
            'Saldo bajo',
            'saldo_bajo',
            'Alertas cuando el saldo de tus cuentas esté bajo'
          )}
        </View>
      )}
      
      {/* Lista de notificaciones */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {filter === 'pendientes' 
                ? 'No tienes notificaciones sin leer'
                : filter === 'leidas'
                ? 'No tienes notificaciones leídas'
                : 'No hay notificaciones'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              Las alertas importantes aparecerán aquí
            </Text>
          </View>
        }
      />
      
      {/* Botón de acción para modo selección */}
      {isSelectionMode && selectedNotifications.length > 0 && (
        <View style={styles.selectionActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Marcar todas como leídas
              selectedNotifications.forEach(id => {
                const notification = notifications.find(n => n.id === id);
                if (notification && notification.estado !== 'leida') {
                  handleMarkAsRead(notification);
                }
              });
              setIsSelectionMode(false);
              setSelectedNotifications([]);
            }}
          >
            <Ionicons name="checkmark-done" size={24} color="#10B981" />
            <Text style={styles.actionButtonText}>Marcar como leídas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteActionButton]}
            onPress={handleDeleteSelected}
          >
            <Ionicons name="trash" size={24} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.deleteActionText]}>
              Eliminar ({selectedNotifications.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  selectAllText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  filterSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
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
  settingsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  notificationCardRead: {
    opacity: 0.7,
  },
  notificationCardSelected: {
    borderWidth: 2,
    borderColor: '#000',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationMessageRead: {
    fontWeight: '400',
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
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
  selectionActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  deleteActionButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  deleteActionText: {
    color: '#EF4444',
  },
});

export default GestionNotificaciones;