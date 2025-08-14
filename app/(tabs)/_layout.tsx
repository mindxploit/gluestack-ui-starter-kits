import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { Heading } from '@/components/ui/heading';
import { Image } from '@/components/ui/image';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: 'violet',
      tabBarStyle: {
        position: 'absolute',
        borderTopWidth: 0,
      },
      tabBarBackground: () => (
        <BlurView
          intensity={80}
          style={StyleSheet.absoluteFill}
        />
      )
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          headerShown: true,
          headerTitle: () => <Image size="xl" alt="avatarify_logo" source={require('@/assets/images/avatarify_logo.png')} resizeMode="contain" />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Entypo size={28} name="chat" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <AntDesign size={28} name="find" color={color} />,
          headerShown: true,
          headerTitle: () => <Image size="xl" alt="avatarify_logo" source={require('@/assets/images/avatarify_logo.png')} resizeMode="contain" />,
        }}
      />
    </Tabs>
  );
}
