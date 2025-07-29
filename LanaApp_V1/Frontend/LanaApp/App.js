import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RecuperarPassword from './screens/RecuperarPassword';
import Dashboard from './screens/Dashboard';
import NuevaTransaccion from './screens/NuevaTransaccion';
import DetalleTransaccion from './screens/DetalleTransaccion';
import HistorialTransacciones from './screens/HistorialTransacciones';
import PerfilUsuario from './screens/PerfilUsuario';


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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;