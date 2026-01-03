import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UIIconProps {
  name: string;
  size?: number;
  color?: string;
}

const iconMap: Record<string, string> = {
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'plus': 'plus',
  'plus.circle.fill': 'plus-circle',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'xmark': 'close',
  'xmark.circle.fill': 'close-circle',
  'person.fill': 'account',
  'person.2.fill': 'account-group',
  'person.crop.circle.badge.plus': 'account-plus',
  'envelope.fill': 'email',
  'envelope': 'email-outline',
  'calendar': 'calendar',
  'clock.fill': 'clock',
  'mappin': 'map-marker',
  'mappin.circle.fill': 'map-marker',
  'heart.fill': 'heart',
  'sparkles': 'star-four-points',
  'camera.fill': 'camera',
  'photo.fill': 'image',
  'video.fill': 'video',
  'bell.fill': 'bell',
  'bell.badge.fill': 'bell-badge',
  'bell.slash.fill': 'bell-off',
  'gearshape.fill': 'cog',
  'pencil': 'pencil',
  'pencil.circle.fill': 'pencil-circle',
  'trash.fill': 'trash-can',
  'magnifyingglass': 'magnify',
  'message.fill': 'message',
  'bubble.left.and.bubble.right.fill': 'forum',
  'paperplane.fill': 'send',
  'arrow.right': 'arrow-right',
  'rectangle.portrait.and.arrow.right': 'logout',
  'hourglass': 'timer-sand',
  'moon.stars.fill': 'moon-waning-crescent',
  'gift.fill': 'gift',
  'graduationcap.fill': 'school',
  'ring': 'ring',
  'figure.and.child.holdinghands': 'human-male-child',
  'party.popper.fill': 'party-popper',
  'party.popper': 'party-popper',
  'lock.fill': 'lock',
  'doc.text.fill': 'file-document',
  'doc.plaintext.fill': 'file-document-outline',
  'questionmark.circle.fill': 'help-circle',
  'nosign': 'cancel',
  'circle': 'circle-outline',
  'circle-outline': 'circle-outline',
  'square.fill': 'square',
  'leaf.fill': 'leaf',
  'crown.fill': 'crown',
  'checkmark.seal.fill': 'check-decagram',
  'exclamationmark.triangle.fill': 'alert',
};

export function UIIcon({ name, size = 24, color = '#1a202c' }: UIIconProps) {
  const mappedIcon = iconMap[name] || 'circle';

  return (
    <MaterialCommunityIcons
      name={mappedIcon as any}
      size={size}
      color={color}
    />
  );
}
