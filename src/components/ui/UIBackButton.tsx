import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../hooks';
import { Colors } from '../../constants/colors';

interface UIBackButtonProps {
  onPress?: () => void;
  style?: object;
}

export function UIBackButton({ onPress, style }: UIBackButtonProps) {
  const router = useRouter();
  const { isRTL } = useLocalization();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Text style={styles.arrow}>{isRTL ? '\u2192' : '\u2190'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: Colors.black,
    fontWeight: '600',
  },
});
