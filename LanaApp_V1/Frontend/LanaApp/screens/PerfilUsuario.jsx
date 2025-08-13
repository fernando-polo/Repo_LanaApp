import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../utils/auth';
import { userService } from '../utils/userService';

const PerfilUsuario = ({ navigation }) => {
  const [notificationsApp, setNotificationsApp] = useState(true);
  const [notificationsEmail, setNotificationsEmail] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para datos del usuario
  const [userData, setUserData] = useState(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoadingProfile(true);
      const user = await userService.getCurrentUser();
      console.log('Datos del usuario:', user);
      
      setUserData(user);
      setNombre(user.nombre || '');
      setCorreo(user.email || '');
      setTelefono(user.telefono || '');
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setLoadingProfile(false);
    }
  };

  const guardarCambios = async () => {
    // Validaciones
    if (!nombre || !correo) {
      Alert.alert('Error', 'El nombre y correo son obligatorios');
      return;
    }

    if (!correo.includes('@')) {
      Alert.alert('Error', 'Por favor introduce un correo válido');
      return;
    }

    if (telefono && telefono.length < 10) {
      Alert.alert('Error', 'El teléfono debe tener al menos 10 dígitos');
      return;
    }

    // Si se está cambiando la contraseña
    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        Alert.alert('Error', 'Debes llenar ambos campos de contraseña');
        return;
      }
      
      if (password.length < 8) {
        Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
    }

    setSaving(true);

    try {
      const updateData = {
        nombre,
        email: correo,
        telefono
      };

      // Solo incluir contraseña si se está cambiando
      if (password) {
        updateData.password = password;
      }

      const updatedUser = await userService.updateUser(updateData);
      console.log('Usuario actualizado:', updatedUser);
      
      setUserData(updatedUser);
      setPassword('');
      setConfirmPassword('');
      setModalVisible(false);
      
      Alert.alert('Éxito', 'Tus datos han sido actualizados correctamente');
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      
      let errorMessage = 'No se pudieron actualizar los datos';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      // Limpiar el storage
      await authService.logout();
      
      // Navegar al Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error durante logout:', error);
      // Aún si hay error, navegar al login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil de usuario</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
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
        <Text style={styles.headerTitle}>Perfil de usuario</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del usuario */}
        <View style={styles.profileSection}>
          <Text style={styles.profileName}>{userData?.nombre || 'Usuario'}</Text>
          <Text style={styles.profileEmail}>{userData?.email || 'No disponible'}</Text>
          <Text style={styles.profilePhone}>
            {userData?.telefono ? `Tel: ${userData.telefono}` : 'Teléfono no registrado'}
          </Text>
          <Text style={styles.profileDate}>
            Miembro desde: {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('es-MX') : 'N/A'}
          </Text>
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

        {/* Sección de Gestión */}
        <View style={styles.managementSection}>
          <Text style={styles.sectionTitle}>Administración</Text>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('GestionCuentas')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="wallet" size={24} color="#333" />
              <Text style={styles.menuItemText}>Gestión de cuentas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('GestionCategorias')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="pricetags" size={24} color="#333" />
              <Text style={styles.menuItemText}>Gestión de categorías</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('GestionPresupuestos')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="pie-chart" size={24} color="#333" />
              <Text style={styles.menuItemText}>Presupuestos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('GestionPagosProgramados')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="calendar" size={24} color="#333" />
              <Text style={styles.menuItemText}>Pagos programados</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Botones de acción */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {
            // Pre-llenar el modal con los datos actuales
            setNombre(userData?.nombre || '');
            setCorreo(userData?.email || '');
            setTelefono(userData?.telefono || '');
            setPassword('');
            setConfirmPassword('');
            setModalVisible(true);
          }}
        >
          <Text style={styles.actionButtonText}>Editar información</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]} 
          onPress={cerrarSesion}
          activeOpacity={0.7}
        >
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
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              editable={!saving}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              editable={!saving}
            />
            
            <View style={styles.passwordSection}>
              <Text style={styles.passwordTitle}>Cambiar contraseña (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!saving}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!saving}
              />
            </View>

            <View style={styles.modalButtons}>
              {saving ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.modalButton} 
                    onPress={guardarCambios}
                  >
                    <Text style={styles.modalButtonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonCancel]} 
                    onPress={() => setModalVisible(false)}
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
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="home" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => navigation.navigate('HistorialTransacciones')}
        >
          <Ionicons name="stats-chart" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => navigation.navigate('GestionNotificaciones')}
        >
          <Ionicons name="notifications" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, styles.activeTab]}
          onPress={() => {}} // Ya estamos en esta pantalla
        >
          <Ionicons name="person" size={24} color="#000" />
        </TouchableOpacity>
      </View>
            
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
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
    maxHeight: '80%',
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
  passwordSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  passwordTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  modalButtons: {
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
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
  profilePhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  profileDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
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
  managementSection: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
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
    marginBottom: 50,
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