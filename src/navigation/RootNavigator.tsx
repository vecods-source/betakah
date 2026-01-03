import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAppSelector, useAppDispatch } from '../hooks';
import { loadStoredAuth } from '../store/slices/authSlice';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Modal Screens
import RSVPModal from '../screens/modals/RSVPModal';
import MediaViewerModal from '../screens/modals/MediaViewerModal';
import InvitationPreviewModal from '../screens/modals/InvitationPreviewModal';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Load stored auth on app start
    dispatch(loadStoredAuth());
  }, [dispatch]);

  // Check if user needs to complete verification
  const isPendingVerification = user?.verificationStatus === 'PENDING';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />

          {/* Modal Screens */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="RSVPModal" component={RSVPModal} />
            <Stack.Screen name="MediaViewer" component={MediaViewerModal} />
            <Stack.Screen name="InvitationPreview" component={InvitationPreviewModal} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
