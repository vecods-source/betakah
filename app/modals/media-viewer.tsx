import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/constants/colors';

const { width, height } = Dimensions.get('window');

export default function MediaViewerModal() {
  const router = useRouter();
  const { url, type } = useLocalSearchParams<{ url: string; type: string }>();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.mediaContainer}>
        {url ? (
          <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.placeholder}>No media</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  closeButton: { position: 'absolute', top: 60, right: 24, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 20, color: Colors.white },
  mediaContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width, height: height * 0.8 },
  placeholder: { color: Colors.white, fontSize: 16 },
});
