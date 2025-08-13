import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransactionMenu = ({ visible, onClose, navigation }) => {
  const handleNavigate = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          {/* Nueva Transacción */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigate('NuevaTransaccion')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons name="add-circle" size={28} color="#10B981" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Nueva transacción</Text>
              <Text style={styles.menuItemSubtitle}>Registra un ingreso o gasto</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Historial */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigate('HistorialTransacciones')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons name="time" size={28} color="#3B82F6" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Historial</Text>
              <Text style={styles.menuItemSubtitle}>Ver todas las transacciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Presupuestos */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigate('GestionPresupuestos')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons name="pie-chart" size={28} color="#F59E0B" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Presupuestos</Text>
              <Text style={styles.menuItemSubtitle}>Administra tus límites de gasto</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Categorías */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigate('GestionCategorias')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons name="pricetags" size={28} color="#8B5CF6" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Categorías</Text>
              <Text style={styles.menuItemSubtitle}>Gestiona categorías de ingreso y gasto</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Botón de cancelar */}
          <TouchableOpacity
            style={[styles.menuItem, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
    marginHorizontal: 8,
  },
  cancelButton: {
    marginTop: 8,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
});

export default TransactionMenu;