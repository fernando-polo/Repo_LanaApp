import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PerfilUsuario = ({ navigation }) => {
  const [notificationsApp, setNotificationsApp] = useState(true);
  const [notificationsEmail, setNotificationsEmail] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [nombre, setNombre] = useState('Fernando Gómez Maldonado');
  const [correo, setCorreo] = useState('fernando.gomez@gmail.com');
  const [contrasena, setContrasena] = useState('•••••••••••');

  const guardarCambios = () => {
    // Aquí podrías integrar backend o lógica adicional
    setModalVisible(false);
  };

  const cerrarSesion = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil de usuario</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Hora */}
      <Text style={styles.timeText}>9:41</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del usuario */}
        <View style={styles.profileSection}>
          <Text style={styles.profileName}>{nombre}</Text>
          <Text style={styles.profileEmail}>{correo}</Text>
          <Text style={styles.profilePassword}>{contrasena}</Text>
        </View>

        {/* Configuración de notificaciones */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Notificaciones en la app</Text>
            <Switch
              value={notificationsApp}
              onValueChange={setNotificationsApp}
              trackColor={{ false: '#f0f0f0', true: '#000' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Notificaciones en el correo</Text>
            <Switch
              value={notificationsEmail}
              onValueChange={setNotificationsEmail}
              trackColor={{ false: '#f0f0f0', true: '#000' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Botones de acción */}
        <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.actionButtonText}>Editar información</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={cerrarSesion}>
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para editar perfil */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
            />

            <View style={{ marginTop: 20 }}>
              <Button title="Guardar" onPress={guardarCambios} />
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#999" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="home" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('TransactionMenu')}>
          <Ionicons name="stats-chart" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Notificaciones')}>
          <Ionicons name="notifications" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Ionicons name="person" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (mantén todos tus estilos anteriores)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  profilePassword: {
    fontSize: 16,
    color: '#666',
  },
  settingsSection: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    marginBottom: 16,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#dc2626',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    justifyContent: 'space-around',
  },
  tabButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    opacity: 1,
  },
});

export default PerfilUsuario;