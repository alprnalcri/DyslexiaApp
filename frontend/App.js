// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginScreen from './screens/LoginScreen';
import PredictScreen from './screens/PredictScreen';
import PredictionResultScreen from './screens/PredictionResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import StatisticsScreen from './screens/StatisticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Analyze" 
        component={PredictScreen}
        options={{
          tabBarLabel: 'Analyze',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="text-box-search" size={size || 24} color={color || 'black'} />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size || 24} color={color || 'black'} />
          ),
        }}
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size || 24} color={color || 'black'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


function AppNavigator() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {userToken ? (
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PredictionResult" 
            component={PredictionResultScreen} 
            options={{ 
              title: 'Analysis Results',
              headerBackTitle: 'Back'
            }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Login', headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

const App = () => {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;
