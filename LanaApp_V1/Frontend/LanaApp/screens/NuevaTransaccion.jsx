import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  TextInput  // Añadimos TextInput
} from 'react-native';

const NuevaTransaccion = ({ navigation }) => {
  // Estados para los campos de texto
  const [monto, setMonto] = React.useState('');
  const [categoria, setCategoria] = React.useState('');
  const [descripcion, setDescripcion] = React.useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nueva transacción</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Monto a transferir</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 500"
            keyboardType="numeric"
            value={monto}
            onChangeText={setMonto}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Categoría</Text>
          <TextInput
            style={styles.input}
            placeholder="Selecciona una categoría"
            value={categoria}
            onChangeText={setCategoria}
          />
          <Text style={styles.dateText}>28/05/2025</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Descripción</Text>
          <TextInput
            style={styles.input}
            placeholder="Añade una descripción"
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </View>
      </View>
      
      <View style={styles.receiverSection}>
        <Text style={styles.sectionTitle}>Transferir a</Text>
        <View style={styles.receiverCard}>
          <Text style={styles.receiverName}>sara BBVA</Text>
          <Text style={styles.receiverAccount}>CLABE 0125044(...)</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={() => navigation.navigate('DetalleTransaccion')}
      >
        <Text style={styles.nextButtonText}>Siguiente</Text>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {  // Nuevo estilo para TextInput
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  receiverSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  receiverCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  receiverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  receiverAccount: {
    fontSize: 14,
    color: '#666',
  },
  nextButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NuevaTransaccion;