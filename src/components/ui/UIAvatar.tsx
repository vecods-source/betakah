import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface UIAvatarProps {
  name?: string;
  initials?: string;
  imageUrl?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export function UIAvatar({
  name,
  initials: providedInitials,
  imageUrl,
  size = 40,
  backgroundColor = '#2c5282',
  textColor = '#ffffff',
}: UIAvatarProps) {
  const initials = providedInitials || (name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?');

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4, color: textColor }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});
