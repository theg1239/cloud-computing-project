import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const canSeeMaintenance = !!user && can(user, 'maintenance:view');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 64,
          borderRadius: 32,
          backgroundColor: colorScheme === 'dark' ? 'rgba(28, 28, 30, 0.78)' : 'rgba(255, 255, 255, 0.78)',
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 32,
              overflow: 'hidden',
            }}
          />
        ),
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
        tabBarItemStyle: { marginHorizontal: 4 },
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={
          canSeeMaintenance
            ? {
                title: 'Maintenance',
                tabBarLabel: 'Maintenance',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="wrench" color={color} />,
              }
            : {
                // Hide the tab for users without permission
                href: null,
              }
        }
      />

  <Tabs.Screen name="ticket" options={{ href: null, headerShown: false }} />
  <Tabs.Screen name="request-equipment" options={{ href: null, headerShown: false }} />
    <Tabs.Screen name="equipment-detail" options={{ href: null, headerShown: false }} />
    <Tabs.Screen name="upload-report" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="book" options={{ href: null }} />
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="report-issue" options={{ href: null }} />
      <Tabs.Screen name="labs" options={{ href: null }} />
      <Tabs.Screen name="equipment" options={{ href: null }} />
      <Tabs.Screen name="experiments" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="users" options={{ href: null }} />
  <Tabs.Screen name="user" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
