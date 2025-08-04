import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar todas las pantallas
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RecuperarPassword from './screens/RecuperarPassword';
import Dashboard from './screens/Dashboard';
import NuevaTransaccion from './screens/NuevaTransaccion';
import DetalleTransaccion from './screens/DetalleTransaccion';
import HistorialTransacciones from './screens/HistorialTransacciones';
import PerfilUsuario from './screens/PerfilUsuario';
import GestionCuentas from './screens/GestionCuentas';
import GestionCategorias from './screens/GestionCategorias';
import GestionPresupuestos from './screens/GestionPresupuestos';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RecuperarPassword" component={RecuperarPassword} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="NuevaTransaccion" component={NuevaTransaccion} />
        <Stack.Screen name="DetalleTransaccion" component={DetalleTransaccion} />
        <Stack.Screen name="HistorialTransacciones" component={HistorialTransacciones} />
        <Stack.Screen name="PerfilUsuario" component={PerfilUsuario} />
        <Stack.Screen name="GestionCuentas" component={GestionCuentas} />
        <Stack.Screen name="GestionCategorias" component={GestionCategorias} />
        <Stack.Screen name="GestionPresupuestos" component={GestionPresupuestos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;