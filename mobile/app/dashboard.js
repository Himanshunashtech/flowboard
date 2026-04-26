import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { Plus, Layout, Star, Clock, Zap, Settings, Users, LogOut } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/');
      return;
    }
    setUser(session.user);
    fetchData();
  };

  const fetchData = async () => {
    try {
      // Fetch basic workspace data for native dashboard
      const { data, error } = await supabase
        .from('workspaces')
        .select(`*, boards (*)`)
        .order('name');

      if (error) throw error;
      if (data) setWorkspaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const totalBoards = workspaces.reduce((acc, ws) => acc + (ws.boards?.length || 0), 0);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-8">
          <View className="flex-1">
            <Text className="text-4xl font-black text-foreground tracking-tighter">
              Welcome back!
            </Text>
            <Text className="text-muted-foreground mt-2 font-medium">
              You have {totalBoards} roadmap projects under review.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-10 h-10 bg-secondary rounded-full items-center justify-center ml-4"
          >
            <LogOut size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          {[
            { label: 'Total Boards', value: totalBoards, icon: Layout, color: '#3B82F6', bg: 'bg-blue-100' },
            { label: 'Starred', value: '0', icon: Star, color: '#EAB308', bg: 'bg-yellow-100' },
          ].map((stat, i) => (
            <View key={i} className="w-[48%] bg-card p-4 rounded-3xl border border-border mb-4 flex-row items-center space-x-3">
              <View className={`w-10 h-10 rounded-xl items-center justify-center ${stat.bg}`}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </Text>
                <Text className="text-2xl font-black text-foreground">
                  {stat.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Workspaces List */}
        <View className="mb-6">
          <Text className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
            Your Teams
          </Text>
          {workspaces.map((ws) => (
            <TouchableOpacity
              key={ws.id}
              className="bg-card border border-border p-5 rounded-3xl mb-4 shadow-sm flex-row items-center"
            >
              <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center mr-4">
                <Text className="text-primary-foreground font-black text-xl">
                  {ws.name[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-foreground tracking-tight">
                  {ws.name}
                </Text>
                <Text className="text-xs font-bold text-muted-foreground mt-1">
                  {ws.boards?.length || 0} Projects
                </Text>
              </View>
              <View className="flex-row space-x-2">
                <View className="w-8 h-8 bg-secondary rounded-lg items-center justify-center">
                  <Users size={16} color="#6B7280" />
                </View>
                <View className="w-8 h-8 bg-secondary rounded-lg items-center justify-center">
                  <Settings size={16} color="#6B7280" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-8 right-8 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={3} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}