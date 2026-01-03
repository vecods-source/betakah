import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';
import { UIStack, UIText, UIIcon, UISpacer } from '../../components/ui';

type Props = RootStackScreenProps<'MediaViewer'>;

const { width } = Dimensions.get('window');

export default function MediaViewerModal({ navigation, route }: Props) {
  const { mediaId } = route.params;
  const [showControls, setShowControls] = useState(true);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity
        style={styles.mediaContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        {/* Placeholder for media content */}
        <View style={styles.mediaPlaceholder}>
          <UIStack spacing={16} align="center">
            <UIIcon name="photo.fill" color="#718096" size={64} />
            <UIText size="sm" color="#718096">
              Media ID: {mediaId}
            </UIText>
          </UIStack>
        </View>
      </TouchableOpacity>

      {showControls && (
        <>
          {/* Header */}
          <View style={styles.header}>
            <UIStack direction="horizontal" align="center">
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.goBack()}
              >
                <UIIcon name="xmark" color="white" size={18} />
              </TouchableOpacity>
              <UISpacer />
              <UIStack direction="horizontal" spacing={8}>
                <TouchableOpacity style={styles.headerButton}>
                  <UIIcon name="arrow.down.to.line" color="white" size={18} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                  <UIIcon name="square.and.arrow.up" color="white" size={18} />
                </TouchableOpacity>
              </UIStack>
            </UIStack>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <UIStack spacing={4}>
              <UIText weight="semibold" color="white">
                Uploaded by Host
              </UIText>
              <UIText size="sm" color="rgba(255, 255, 255, 0.7)">
                2 hours ago
              </UIText>
            </UIStack>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholder: {
    width: width,
    height: width,
    backgroundColor: '#1a202c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
