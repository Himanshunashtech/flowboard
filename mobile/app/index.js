import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { Users, Fingerprint, ArrowRight, Eye, EyeOff } from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for the confirmation link.');
      }
    } catch (err) {
      Alert.alert('Authentication Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8"
      >
        <View className="mb-12">
          <Text className="text-4xl font-black text-foreground tracking-tighter mb-2">
            {isLogin ? 'Welcome Back' : 'Join the Nexus'}
          </Text>
          <Text className="text-muted-foreground font-medium">
            {isLogin
              ? 'Authenticate your credentials to resume flow.'
              : 'Initialize your free environment in seconds.'}
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2">
              Authentication Hash (Email)
            </Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Users size={18} color="#6B7280" />
              </View>
              <TextInput
                className="w-full h-16 bg-secondary rounded-2xl pl-12 pr-4 text-foreground font-bold"
                placeholder="name@nexus.pro"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 mt-4">
              Security Vector (Password)
            </Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Fingerprint size={18} color="#6B7280" />
              </View>
              <TextInput
                className="w-full h-16 bg-secondary rounded-2xl pl-12 pr-12 text-foreground font-bold"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-4 z-10"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="w-full h-16 bg-primary rounded-2xl flex-row items-center justify-center mt-8 space-x-2 shadow-sm"
            onPress={handleAuth}
            disabled={loading}
          >
            <Text className="text-primary-foreground font-black uppercase tracking-widest text-xs">
              {loading ? 'Authenticating...' : (isLogin ? 'Establish Session' : 'Enlist in FlowBoard')}
            </Text>
            {!loading && <ArrowRight size={16} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text className="text-sm font-bold text-muted-foreground">
              {isLogin ? 'First time in the nexus? ' : 'Already enlisted? '}
              <Text className="text-primary">
                {isLogin ? 'Initialize Account' : 'Authenticate Instead'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}