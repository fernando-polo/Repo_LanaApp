import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const DetalleTransaccion = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detalle de transacción</Text>
        <Text style={styles.timeText}>9:41</Text>
      </View>
      
      <View style={styles.detailSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Comisión y tiempo de respuesta</Text>
          <View style={styles.detailValue}>
            <Text style={styles.detailAmount}>$0.00</Text>
            <Text style={styles.detailTime}>Hoy mismo | 1-2 horas</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cuenta saliente</Text>
          <Text style={styles.detailText}>Visa *1234</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Receptor</Text>
          <Text style={styles.detailText}>CLABE 0125044(...)</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Monto de transacción</Text>
          <Text style={styles.detailAmount}>$450.00</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Subtotal</Text>
          <Text style={styles.detailAmount}>$450.00</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Comisión</Text>
          <Text style={styles.detailAmount}>$0.00</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={[styles.detailRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>$450.00</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.confirmButton}
        onPress={() => navigation.navigate('HistorialTransacciones')}
      >
        <Text style={styles.confirmButtonText}>CONFIRMAR TRANSACCIÓN</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  detailSection: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    alignItems: 'flex-end',
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  totalRow: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetalleTransaccion;