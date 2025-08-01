// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const Tab = createBottomTabNavigator();

const notifications = [
  {
    id: '1',
    title: 'Próximo pago programado',
    amount: '$425.00',
    description: 'Comprar despensa',
  },
  {
    id: '2',
    title: 'Cobro pago automático',
    amount: '$500.00',
    description: 'Gasolina',
  },
  {
    id: '3',
    title: 'Estatus de transacción',
    amount: '$425.00',
    description: 'Sara BBVA, Transacción exitosa',
  },
  {
    id: '4',
    title: 'Estatus de transacción',
    amount: '$45.00',
    description: 'elena BANAMEX, Transacción rechazada',
  },
  {
    id: '5',
    title: 'Próximo pago programado',
    amount: '$200.00',
    description: 'Comprar carne',
  },
];

const NotificationItem = ({ title, amount, description }) => (
  <TouchableOpacity style={styles.item}>
    <View style={styles.itemText}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemAmount}>{amount}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#999" />
  </TouchableOpacity>
);

const NotificationsScreen = () => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.header}>Notificaciones</Text>
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationItem
          title={item.title}
          amount={item.amount}
          description={item.description}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  </SafeAreaView>
);

const DummyScreen = ({ title }) => (
  <View style={styles.dummy}>
    <Text>{title}</Text>
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Inicio') iconName = 'home-outline';
            else if (route.name === 'Buscar') iconName = 'search-outline';
            else if (route.name === 'Carrito') iconName = 'cart-outline';
            else if (route.name === 'Notificaciones') iconName = 'notifications-outline';
            else if (route.name === 'Perfil') iconName = 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#888',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Inicio" children={() => <DummyScreen title="Inicio" />} />
        <Tab.Screen name="Buscar" children={() => <DummyScreen title="Buscar" />} />
        <Tab.Screen name="Carrito" children={() => <DummyScreen title="Carrito" />} />
        <Tab.Screen name="Notificaciones" component={NotificationsScreen} />
        <Tab.Screen name="Perfil" children={() => <DummyScreen title="Perfil" />} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    color: '#555',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginVertical: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  dummy: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
