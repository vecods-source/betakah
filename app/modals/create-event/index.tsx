import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Pressable,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import { useAppDispatch, useAppSelector } from '../../../src/hooks';
import { createEvent } from '../../../src/store/slices/eventsSlice';
import { Colors } from '../../../src/constants/colors';
import { EventType, GenderRestriction } from '../../../src/types';
import {
  getTemplatesForEventType,
  getDefaultTemplate,
  InvitationTemplate,
  colorPresets,
  availableFonts,
} from '../../../src/themes';
import { InvitationSlideSheet } from '../../../src/components/InvitationSlideSheet';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;
// Calculate card height: screen height - header(120) - stepIndicator(76) - title/subtitle(60) - bottomNav(92) - padding(48) - gaps(36)
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - 120 - 76 - 60 - 92 - 48 - 36;
const MIN_CARD_HEIGHT = 80;
const CALCULATED_CARD_HEIGHT = AVAILABLE_HEIGHT / 4; // 4 rows of cards
const CARD_HEIGHT = Math.max(CALCULATED_CARD_HEIGHT, MIN_CARD_HEIGHT);
const NEEDS_SCROLL = CALCULATED_CARD_HEIGHT < MIN_CARD_HEIGHT;

interface EventTypeConfig {
  type: EventType;
  icon: string;
  iconFamily: 'feather' | 'ionicons' | 'material';
  labelKey: string;
  color: string;
  bgColor: string;
  gradient: string[];
}

const eventTypes: EventTypeConfig[] = [
  {
    type: 'WEDDING',
    icon: 'heart',
    iconFamily: 'feather',
    labelKey: 'events.types.wedding',
    color: '#E91E63',
    bgColor: '#FCE4EC',
    gradient: ['#FCE4EC', '#F8BBD9'],
  },
  {
    type: 'ENGAGEMENT',
    icon: 'diamond-outline',
    iconFamily: 'ionicons',
    labelKey: 'events.types.engagement',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    gradient: ['#F3E5F5', '#E1BEE7'],
  },
  {
    type: 'BIRTHDAY',
    icon: 'cake-variant',
    iconFamily: 'material',
    labelKey: 'events.types.birthday',
    color: '#FF5722',
    bgColor: '#FBE9E7',
    gradient: ['#FBE9E7', '#FFCCBC'],
  },
  {
    type: 'GRADUATION',
    icon: 'school-outline',
    iconFamily: 'ionicons',
    labelKey: 'events.types.graduation',
    color: '#3F51B5',
    bgColor: '#E8EAF6',
    gradient: ['#E8EAF6', '#C5CAE9'],
  },
  {
    type: 'BABY_SHOWER',
    icon: 'baby-carriage',
    iconFamily: 'material',
    labelKey: 'events.types.baby_shower',
    color: '#00BCD4',
    bgColor: '#E0F7FA',
    gradient: ['#E0F7FA', '#B2EBF2'],
  },
  {
    type: 'EID_GATHERING',
    icon: 'moon-outline',
    iconFamily: 'ionicons',
    labelKey: 'events.types.religious',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    gradient: ['#E8F5E9', '#C8E6C9'],
  },
  {
    type: 'PRIVATE_PARTY',
    icon: 'party-popper',
    iconFamily: 'material',
    labelKey: 'events.types.social',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    gradient: ['#FFF3E0', '#FFE0B2'],
  },
  {
    type: 'CONDOLENCE',
    icon: 'flower-outline',
    iconFamily: 'ionicons',
    labelKey: 'events.types.other',
    color: '#607D8B',
    bgColor: '#ECEFF1',
    gradient: ['#ECEFF1', '#CFD8DC'],
  },
];

const EventTypeIcon = ({ config, size = 32 }: { config: EventTypeConfig; size?: number }) => {
  switch (config.iconFamily) {
    case 'ionicons':
      return <Ionicons name={config.icon as any} size={size} color={config.color} />;
    case 'material':
      return <MaterialCommunityIcons name={config.icon as any} size={size} color={config.color} />;
    default:
      return <Feather name={config.icon as any} size={size} color={config.color} />;
  }
};

const TOTAL_STEPS = 5;

export default function CreateEventScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { isLoading } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);

  // Step state
  const [step, setStep] = useState(1);

  // Step 1: Event Type
  const [selectedType, setSelectedType] = useState<EventType | null>(null);

  // Step 2: Event Details
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  // Step 3: Date & Location
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [location, setLocation] = useState('');
  const [locationAr, setLocationAr] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Default to Qatar (Doha)
  const defaultRegion = {
    latitude: 25.2854,
    longitude: 51.5310,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // Silver/Grayscale map style
  const silverMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  ];

  // Step 4: Theme
  const [availableTemplates, setAvailableTemplates] = useState<InvitationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationTemplate | null>(null);
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string | null>(null);

  // Step 5: Settings
  const [genderRestriction, setGenderRestriction] = useState<GenderRestriction>('MIXED');

  // Guest lists
  interface Guest {
    id: string;
    name: string;
    phone: string;
    gender: 'male' | 'female';
  }
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showGuestSheet, setShowGuestSheet] = useState(false);
  const [guestSheetMode, setGuestSheetMode] = useState<'contacts' | 'manual'>('contacts');
  const [showPreviewSheet, setShowPreviewSheet] = useState(false);
  const [guestSheetGender, setGuestSheetGender] = useState<'male' | 'female'>('male');
  const [manualGuestName, setManualGuestName] = useState('');
  const [manualGuestPhone, setManualGuestPhone] = useState('');

  // Contacts state
  const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsSearch, setContactsSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Co-hosts state
  interface CoHost {
    id: string;
    name: string;
    phone: string;
  }
  const [coHosts, setCoHosts] = useState<CoHost[]>([]);
  const [showCoHostSheet, setShowCoHostSheet] = useState(false);
  const [coHostSheetMode, setCoHostSheetMode] = useState<'contacts' | 'manual'>('contacts');
  const [manualCoHostName, setManualCoHostName] = useState('');
  const [manualCoHostPhone, setManualCoHostPhone] = useState('');
  const [selectedCoHostContacts, setSelectedCoHostContacts] = useState<Set<string>>(new Set());

  // Date picker modal
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [activeDateField, setActiveDateField] = useState<'start' | 'end'>('start');
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Map modal
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState<Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>>([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Update templates when event type changes
  useEffect(() => {
    if (selectedType) {
      const templates = getTemplatesForEventType(selectedType);
      setAvailableTemplates(templates);
      if (!selectedTemplate || !templates.find(t => t.id === selectedTemplate.id)) {
        setSelectedTemplate(templates[0] || null);
      }
    }
  }, [selectedType]);

  // Date picker animation
  useEffect(() => {
    if (showDatePicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [showDatePicker]);

  // Debounced map search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapSearchQuery.trim().length >= 3) {
        searchMapLocation(mapSearchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [mapSearchQuery]);

  const openDatePicker = (field: 'start' | 'end', mode: 'date' | 'time' = 'date') => {
    setActiveDateField(field);
    setDatePickerMode(mode);
    setTempDate(field === 'start' ? startDate : (endDate || new Date()));
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    if (activeDateField === 'start') {
      setStartDate(tempDate);
    } else {
      setEndDate(tempDate);
    }
    setShowDatePicker(false);
  };

  // Load contacts from device
  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          sort: Contacts.SortTypes.FirstName,
        });
        // Filter contacts that have phone numbers
        const contactsWithPhones = data.filter(
          contact => contact.phoneNumbers && contact.phoneNumbers.length > 0
        );
        setDeviceContacts(contactsWithPhones);
      } else {
        Alert.alert(
          isArabic ? 'إذن مطلوب' : 'Permission Required',
          isArabic
            ? 'يرجى السماح بالوصول إلى جهات الاتصال لإضافة الضيوف'
            : 'Please allow access to contacts to add guests',
          [{ text: isArabic ? 'حسناً' : 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  // Open contacts sheet
  const openContactsSheet = (gender: 'male' | 'female') => {
    setGuestSheetGender(gender);
    setGuestSheetMode('contacts');
    setContactsSearch('');
    setSelectedContacts(new Set());
    setShowGuestSheet(true);
    if (deviceContacts.length === 0) {
      loadContacts();
    }
  };

  // Filter contacts by search
  const filteredContacts = deviceContacts.filter(contact => {
    const name = contact.name?.toLowerCase() || '';
    const search = contactsSearch.toLowerCase();
    return name.includes(search);
  });

  // Toggle contact selection
  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  // Add selected contacts as guests
  const addSelectedContacts = () => {
    const newGuests: Guest[] = [];
    selectedContacts.forEach(contactId => {
      const contact = deviceContacts.find(c => c.id === contactId);
      if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        // Check if already added
        const phone = contact.phoneNumbers[0].number || '';
        const alreadyExists = guests.some(g => g.phone === phone);
        if (!alreadyExists) {
          newGuests.push({
            id: contactId,
            name: contact.name || '',
            phone: phone,
            gender: guestSheetGender,
          });
        }
      }
    });
    setGuests([...guests, ...newGuests]);
    setSelectedContacts(new Set());
    setShowGuestSheet(false);
  };

  // Open co-host contacts sheet
  const openCoHostContactsSheet = () => {
    setCoHostSheetMode('contacts');
    setContactsSearch('');
    setSelectedCoHostContacts(new Set());
    setShowCoHostSheet(true);
    if (deviceContacts.length === 0) {
      loadContacts();
    }
  };

  // Toggle co-host contact selection
  const toggleCoHostContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedCoHostContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedCoHostContacts(newSelected);
  };

  // Add selected contacts as co-hosts
  const addSelectedCoHosts = () => {
    const newCoHosts: CoHost[] = [];
    selectedCoHostContacts.forEach(contactId => {
      const contact = deviceContacts.find(c => c.id === contactId);
      if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        const phone = contact.phoneNumbers[0].number || '';
        const alreadyExists = coHosts.some(c => c.phone === phone);
        if (!alreadyExists) {
          newCoHosts.push({
            id: contactId,
            name: contact.name || '',
            phone: phone,
          });
        }
      }
    });
    setCoHosts([...coHosts, ...newCoHosts]);
    setSelectedCoHostContacts(new Set());
    setShowCoHostSheet(false);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return selectedType !== null;
      case 2:
        const currentTitle = isArabic ? titleAr : title;
        return currentTitle.trim().length > 0;
      case 3:
        return startDate !== null;
      case 4:
        return selectedTemplate !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleCreateEvent();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateEvent = async () => {
    const currentTitle = isArabic ? titleAr : title;
    const currentDescription = isArabic ? descriptionAr : description;

    if (!selectedType || !currentTitle.trim()) return;

    try {
      await dispatch(createEvent({
        type: selectedType,
        title: isArabic ? '' : title.trim(),
        titleAr: isArabic ? titleAr.trim() : '',
        description: isArabic ? '' : description.trim(),
        descriptionAr: isArabic ? descriptionAr.trim() : '',
        location: location.trim() || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
      })).unwrap();

      Alert.alert(
        t('common.success'),
        t('create.eventCreated'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error || t('errors.generic'));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(isArabic ? 'ar-QA' : 'en-QA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          isArabic ? 'الإذن مطلوب' : 'Permission Required',
          isArabic ? 'يرجى السماح بالوصول إلى الموقع' : 'Please allow location access'
        );
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setSelectedCoordinates(coords);
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);

      // Reverse geocode to get address
      await reverseGeocode(coords.latitude, coords.longitude);
    } catch (error) {
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'تعذر الحصول على الموقع' : 'Could not get location'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const addr = results[0];
        const parts = [addr.name, addr.street, addr.district, addr.city].filter(Boolean);
        const address = parts.join(', ');
        setLocation(address);
      }
    } catch (error) {
      // Silently fail - user can manually enter location
    }
  };

  // Search for locations by address
  const searchMapLocation = async (query: string) => {
    if (query.trim().length < 3) {
      setMapSearchResults([]);
      return;
    }

    setIsSearchingMap(true);
    try {
      // Add Qatar context to search for better results
      const searchQuery = query.includes('Qatar') ? query : `${query}, Qatar`;
      const results = await Location.geocodeAsync(searchQuery);

      if (results.length > 0) {
        // Get address details for each result
        const detailedResults = await Promise.all(
          results.slice(0, 5).map(async (result) => {
            try {
              const reverseResults = await Location.reverseGeocodeAsync({
                latitude: result.latitude,
                longitude: result.longitude,
              });
              const addr = reverseResults[0] || {};
              const parts = [addr.name, addr.street, addr.district, addr.city].filter(Boolean);
              return {
                name: addr.name || query,
                address: parts.join(', ') || `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`,
                latitude: result.latitude,
                longitude: result.longitude,
              };
            } catch {
              return {
                name: query,
                address: `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`,
                latitude: result.latitude,
                longitude: result.longitude,
              };
            }
          })
        );
        setMapSearchResults(detailedResults);
      } else {
        setMapSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setMapSearchResults([]);
    } finally {
      setIsSearchingMap(false);
    }
  };

  // Select a search result
  const selectSearchResult = (result: { name: string; address: string; latitude: number; longitude: number }) => {
    const coords = {
      latitude: result.latitude,
      longitude: result.longitude,
    };
    setSelectedCoordinates(coords);
    setLocation(result.address);
    setMapSearchQuery('');
    setMapSearchResults([]);
    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedCoordinates({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const getStepIcon = (stepNum: number): string => {
    switch (stepNum) {
      case 1: return 'grid';
      case 2: return 'edit-3';
      case 3: return 'calendar';
      case 4: return 'image';
      case 5: return 'settings';
      default: return 'circle';
    }
  };

  // Step Indicator Component
  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((s, index) => (
        <React.Fragment key={s}>
          <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
            <Feather
              name={getStepIcon(s) as any}
              size={16}
              color={step >= s ? Colors.primary : Colors.gray[400]}
            />
          </View>
          {index < 4 && (
            <View style={[styles.stepLine, step > s && styles.stepLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // Step 1: Event Type
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, isArabic && styles.textRTL]}>
        {t('create.step1.title')}
      </Text>
      <Text style={[styles.stepSubtitle, isArabic && styles.textRTL]}>
        {t('create.step1.subtitle')}
      </Text>

      <View style={styles.typesGrid}>
        {eventTypes.map((item) => {
          const isSelected = selectedType === item.type;
          return (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeCard,
                { backgroundColor: item.bgColor },
                isSelected && [styles.typeCardSelected, { borderColor: item.color }],
              ]}
              onPress={() => setSelectedType(item.type)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.typeIconContainer,
                  { backgroundColor: isSelected ? item.color : `${item.color}20` },
                ]}
              >
                <EventTypeIcon
                  config={item}
                  size={24}
                />
                {isSelected && (
                  <View style={[styles.typeIconOverlay, { backgroundColor: item.color }]}>
                    <Feather name="check" size={24} color="#fff" />
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.typeLabel,
                  { color: isSelected ? item.color : Colors.gray[700] },
                  isSelected && styles.typeLabelSelected,
                ]}
              >
                {t(item.labelKey)}
              </Text>
              {isSelected && (
                <View style={[styles.selectedIndicator, { backgroundColor: item.color }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Step 2: Event Details
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, isArabic && styles.textRTL]}>
        {t('create.step2.title')}
      </Text>
      <Text style={[styles.stepSubtitle, isArabic && styles.textRTL]}>
        {t('create.step2.subtitle')}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isArabic && styles.textRTL]}>
          {t('events.form.title')} *
        </Text>
        <TextInput
          style={[styles.input, isArabic && styles.inputRTL]}
          placeholder={t('create.step2.titlePlaceholder')}
          placeholderTextColor={Colors.gray[400]}
          value={isArabic ? titleAr : title}
          onChangeText={isArabic ? setTitleAr : setTitle}
          maxLength={100}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isArabic && styles.textRTL]}>
          {t('events.form.description')}
        </Text>
        <TextInput
          style={[styles.input, styles.descriptionInput, isArabic && styles.inputRTL]}
          placeholder={t('create.step2.descriptionPlaceholder')}
          placeholderTextColor={Colors.gray[400]}
          value={isArabic ? descriptionAr : description}
          onChangeText={(text) => isArabic ? setDescriptionAr(text) : setDescription(text)}
          multiline
          maxLength={500}
          editable={true}
          selectTextOnFocus={false}
        />
      </View>

      {/* Event Type Badge */}
      {selectedType && (
        <View style={styles.eventTypeBadgeContainer}>
          <View style={[
            styles.eventTypeBadge,
            { backgroundColor: eventTypes.find(e => e.type === selectedType)?.bgColor }
          ]}>
            <Text style={[
              styles.eventTypeBadgeText,
              { color: eventTypes.find(e => e.type === selectedType)?.color }
            ]}>
              {t(`events.types.${selectedType.toLowerCase()}`)}
            </Text>
          </View>
        </View>
      )}

      {/* Quick Insert Chips */}
      <View style={styles.quickInsertContainer}>
        <Text style={[styles.quickInsertLabel, isArabic && styles.textRTL]}>
          {isArabic ? 'إضافة سريعة' : 'Quick add'}
        </Text>
        <View style={styles.quickInsertChips}>
          {(isArabic ? [
            'أنتم مدعوون للاحتفال معنا',
            'يسعدنا دعوتكم',
            'بحضوركم يكتمل فرحنا',
            'نتشرف بدعوتكم',
          ] : [
            "You're invited to celebrate!",
            'Join us for a special occasion',
            'Save the date!',
            'We would be honored by your presence',
          ]).map((phrase, index) => {
            const currentDesc = isArabic ? descriptionAr : description;
            const isAdded = currentDesc.includes(phrase);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.quickInsertChip, isAdded && styles.quickInsertChipAdded]}
                onPress={() => {
                  if (isAdded) {
                    // Remove phrase from description
                    const newDesc = currentDesc.replace(phrase, '').replace(/\s+/g, ' ').trim();
                    if (isArabic) {
                      setDescriptionAr(newDesc);
                    } else {
                      setDescription(newDesc);
                    }
                  } else {
                    // Add phrase to description
                    const newDesc = currentDesc ? `${currentDesc} ${phrase}` : phrase;
                    if (isArabic) {
                      setDescriptionAr(newDesc);
                    } else {
                      setDescription(newDesc);
                    }
                  }
                }}
              >
                <Text style={[styles.quickInsertChipText, isAdded && styles.quickInsertChipTextAdded]}>
                  {phrase}
                </Text>
                <Feather
                  name={isAdded ? "x" : "plus"}
                  size={14}
                  color={isAdded ? Colors.gray[400] : Colors.primary}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  // Step 3: Date & Location
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, isArabic && styles.textRTL]}>
        {t('create.step3.title')}
      </Text>
      <Text style={[styles.stepSubtitle, isArabic && styles.textRTL]}>
        {t('create.step3.subtitle')}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isArabic && styles.textRTL]}>
          {t('events.form.startDate')} *
        </Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => openDatePicker('start', 'date')}
          >
            <Feather name="calendar" size={18} color={Colors.primary} />
            <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => openDatePicker('start', 'time')}
          >
            <Feather name="clock" size={18} color={Colors.primary} />
            <Text style={styles.dateButtonText}>{formatTime(startDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setHasEndDate(!hasEndDate)}
      >
        <View style={[styles.checkbox, hasEndDate && styles.checkboxActive]}>
          {hasEndDate && <Feather name="check" size={14} color="#fff" />}
        </View>
        <Text style={styles.toggleLabel}>{t('create.step3.addEndDate')}</Text>
      </TouchableOpacity>

      {hasEndDate && (
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, isArabic && styles.textRTL]}>
            {t('events.form.endDate')}
          </Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openDatePicker('end', 'date')}
            >
              <Feather name="calendar" size={18} color={Colors.primary} />
              <Text style={styles.dateButtonText}>
                {endDate ? formatDate(endDate) : t('create.step3.selectDate')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openDatePicker('end', 'time')}
            >
              <Feather name="clock" size={18} color={Colors.primary} />
              <Text style={styles.dateButtonText}>
                {endDate ? formatTime(endDate) : '--:--'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.inputGroup, { marginTop: 24 }]}>
        <View style={styles.locationHeader}>
          <Text style={[styles.inputLabel, isArabic && styles.textRTL]}>
            {t('events.form.location')}
          </Text>
          <TouchableOpacity
            style={styles.currentLocationBtn}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Feather name="navigation" size={14} color={Colors.primary} />
                <Text style={styles.currentLocationText}>
                  {isArabic ? 'موقعي' : 'My location'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.mapPreview}
          onPress={() => setShowMapModal(true)}
          activeOpacity={0.8}
        >
          <MapView
            style={styles.mapPreviewMap}
            region={selectedCoordinates ? {
              ...selectedCoordinates,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            } : defaultRegion}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {selectedCoordinates && (
              <Marker coordinate={selectedCoordinates} pinColor={Colors.primary} />
            )}
          </MapView>
          <View style={styles.mapPreviewOverlay}>
            <Feather name="maximize-2" size={16} color={Colors.white} />
            <Text style={styles.mapPreviewText}>
              {isArabic ? 'اضغط لتحديد الموقع' : 'Tap to select location'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.locationInput}>
          <Feather name="map-pin" size={18} color={Colors.gray[400]} style={styles.locationIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon, isArabic && styles.inputRTL]}
            placeholder={t('create.step3.locationPlaceholder')}
            placeholderTextColor={Colors.gray[400]}
            value={location}
            onChangeText={setLocation}
          />
        </View>
      </View>
    </View>
  );

  // Step 4: Theme Selection
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, isArabic && styles.textRTL]}>
        {t('create.step4.title')}
      </Text>
      <Text style={[styles.stepSubtitle, isArabic && styles.textRTL]}>
        {t('create.step4.subtitle')}
      </Text>

      <Text style={[styles.inputLabel, isArabic && styles.textRTL, { marginTop: 8 }]}>
        {t('create.step4.selectTemplate')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.templatesScroll}
        contentContainerStyle={styles.templatesContainer}
      >
        {availableTemplates.map((template) => {
          const currentTitle = isArabic ? (titleAr || title) : (title || titleAr);
          const currentDesc = isArabic ? (descriptionAr || description) : (description || descriptionAr);
          const displayTitle = currentTitle || (isArabic ? 'عنوان المناسبة' : 'Event Title');
          const displayDesc = currentDesc ? (currentDesc.length > 40 ? currentDesc.slice(0, 40) + '...' : currentDesc) : '';

          const isSelected = selectedTemplate?.id === template.id;
          return (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                isSelected && [
                  styles.templateCardSelected,
                  { borderColor: template.colors.primary, shadowColor: template.colors.primary },
                ],
              ]}
              onPress={() => setSelectedTemplate(template)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.templatePreview,
                  { backgroundColor: template.colors.background },
                ]}
              >
                <View
                  style={[
                    styles.templateAccent,
                    { backgroundColor: template.colors.primary },
                  ]}
                />
                {isSelected && (
                  <View style={[styles.templateSelectedBadge, { backgroundColor: template.colors.primary }]}>
                    <Feather name="check" size={14} color="#fff" />
                  </View>
                )}
                <Text
                  style={[
                    styles.templateInviteText,
                    { color: template.colors.accent },
                  ]}
                >
                  {isArabic ? 'أنتم مدعوون' : "You're Invited"}
                </Text>
                <Text
                  style={[
                    styles.templateTitleText,
                    { color: template.colors.text },
                  ]}
                  numberOfLines={2}
                >
                  {displayTitle}
                </Text>
                {displayDesc ? (
                  <Text
                    style={[
                      styles.templateDescText,
                      { color: template.colors.accent },
                    ]}
                    numberOfLines={2}
                  >
                    {displayDesc}
                  </Text>
                ) : null}
                <View style={[styles.templateDivider, { backgroundColor: template.colors.primary }]} />
              </View>
              <Text style={styles.templateName}>
                {isArabic ? template.nameAr : template.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedTemplate && (
        <>
          <Text style={[styles.inputLabel, isArabic && styles.textRTL, { marginTop: 24 }]}>
            {t('create.step4.customizeColor')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.colorsScroll}
            contentContainerStyle={styles.colorsContainer}
          >
            <TouchableOpacity
              style={[
                styles.colorOption,
                !customPrimaryColor && styles.colorOptionSelected,
                { backgroundColor: selectedTemplate.colors.primary },
              ]}
              onPress={() => setCustomPrimaryColor(null)}
            >
              {!customPrimaryColor && (
                <Feather name="check" size={16} color="#fff" />
              )}
            </TouchableOpacity>
            {colorPresets.map((preset) => (
              <TouchableOpacity
                key={preset.color}
                style={[
                  styles.colorOption,
                  customPrimaryColor === preset.color && styles.colorOptionSelected,
                  { backgroundColor: preset.color },
                ]}
                onPress={() => setCustomPrimaryColor(preset.color)}
              >
                {customPrimaryColor === preset.color && (
                  <Feather name="check" size={16} color={preset.color === '#FFFFFF' ? '#000' : '#fff'} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Preview Invitation Button */}
          <TouchableOpacity
            style={styles.previewInvitationBtn}
            onPress={() => setShowPreviewSheet(true)}
          >
            <Feather name="eye" size={18} color={Colors.primary} />
            <Text style={styles.previewInvitationText}>
              {isArabic ? 'معاينة الدعوة' : 'Preview Invitation'}
            </Text>
            <Feather name="chevron-right" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Step 5: Settings & Review
  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, isArabic && styles.textRTL]}>
        {t('create.step5.title')}
      </Text>
      <Text style={[styles.stepSubtitle, isArabic && styles.textRTL]}>
        {t('create.step5.subtitle')}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isArabic && styles.textRTL]}>
          {t('events.form.genderRestriction')}
        </Text>
        <View style={styles.genderOptions}>
          {(['MIXED', 'MALE_ONLY', 'FEMALE_ONLY'] as GenderRestriction[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.genderOption,
                genderRestriction === option && styles.genderOptionSelected,
              ]}
              onPress={() => setGenderRestriction(option)}
            >
              <Text
                style={[
                  styles.genderOptionText,
                  genderRestriction === option && styles.genderOptionTextSelected,
                ]}
              >
                {t(`events.form.${option === 'MIXED' ? 'mixedAllowed' : option === 'MALE_ONLY' ? 'maleOnly' : 'femaleOnly'}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Guest List Section */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isArabic && styles.textRTL]}>
          {isArabic ? 'قائمة الضيوف' : 'Guest List'}
        </Text>

        {/* Add Guest Buttons */}
        {genderRestriction === 'MIXED' ? (
          <>
            {/* Male Guests Section */}
            <View style={styles.guestSection}>
              <View style={styles.guestSectionHeader}>
                <View style={[styles.guestSectionIcon, { backgroundColor: `${Colors.primary}15` }]}>
                  <Feather name="user" size={16} color={Colors.primary} />
                </View>
                <Text style={styles.guestSectionTitle}>
                  {isArabic ? 'الضيوف الرجال' : 'Male Guests'}
                </Text>
                <Text style={styles.guestSectionCount}>
                  {guests.filter(g => g.gender === 'male').length}
                </Text>
              </View>
              <View style={styles.guestButtons}>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => openContactsSheet('male')}
                >
                  <Feather name="users" size={18} color={Colors.primary} />
                  <Text style={styles.guestButtonText}>
                    {isArabic ? 'من جهات الاتصال' : 'From Contacts'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => {
                    setGuestSheetGender('male');
                    setGuestSheetMode('manual');
                    setShowGuestSheet(true);
                  }}
                >
                  <Feather name="phone" size={18} color={Colors.primary} />
                  <Text style={styles.guestButtonText}>
                    {isArabic ? 'إضافة برقم' : 'Add by Number'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Female Guests Section */}
            <View style={styles.guestSection}>
              <View style={styles.guestSectionHeader}>
                <View style={[styles.guestSectionIcon, { backgroundColor: '#FCE4EC' }]}>
                  <Feather name="user" size={16} color="#E91E63" />
                </View>
                <Text style={styles.guestSectionTitle}>
                  {isArabic ? 'الضيوف النساء' : 'Female Guests'}
                </Text>
                <Text style={styles.guestSectionCount}>
                  {guests.filter(g => g.gender === 'female').length}
                </Text>
              </View>
              <View style={styles.guestButtons}>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => openContactsSheet('female')}
                >
                  <Feather name="users" size={18} color="#E91E63" />
                  <Text style={[styles.guestButtonText, { color: '#E91E63' }]}>
                    {isArabic ? 'من جهات الاتصال' : 'From Contacts'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => {
                    setGuestSheetGender('female');
                    setGuestSheetMode('manual');
                    setShowGuestSheet(true);
                  }}
                >
                  <Feather name="phone" size={18} color="#E91E63" />
                  <Text style={[styles.guestButtonText, { color: '#E91E63' }]}>
                    {isArabic ? 'إضافة برقم' : 'Add by Number'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.guestSection}>
            <View style={styles.guestSectionHeader}>
              <View style={[
                styles.guestSectionIcon,
                { backgroundColor: genderRestriction === 'MALE_ONLY' ? `${Colors.primary}15` : '#FCE4EC' }
              ]}>
                <Feather
                  name="users"
                  size={16}
                  color={genderRestriction === 'MALE_ONLY' ? Colors.primary : '#E91E63'}
                />
              </View>
              <Text style={styles.guestSectionTitle}>
                {isArabic ? 'الضيوف' : 'Guests'}
              </Text>
              <Text style={styles.guestSectionCount}>
                {guests.length}
              </Text>
            </View>
            <View style={styles.guestButtons}>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => openContactsSheet(genderRestriction === 'MALE_ONLY' ? 'male' : 'female')}
              >
                <Feather
                  name="users"
                  size={18}
                  color={genderRestriction === 'MALE_ONLY' ? Colors.primary : '#E91E63'}
                />
                <Text style={[
                  styles.guestButtonText,
                  { color: genderRestriction === 'MALE_ONLY' ? Colors.primary : '#E91E63' }
                ]}>
                  {isArabic ? 'من جهات الاتصال' : 'From Contacts'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => {
                  setGuestSheetGender(genderRestriction === 'MALE_ONLY' ? 'male' : 'female');
                  setGuestSheetMode('manual');
                  setShowGuestSheet(true);
                }}
              >
                <Feather
                  name="phone"
                  size={18}
                  color={genderRestriction === 'MALE_ONLY' ? Colors.primary : '#E91E63'}
                />
                <Text style={[
                  styles.guestButtonText,
                  { color: genderRestriction === 'MALE_ONLY' ? Colors.primary : '#E91E63' }
                ]}>
                  {isArabic ? 'إضافة برقم' : 'Add by Number'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Guest Preview List */}
        {guests.length > 0 && (
          <View style={styles.guestPreviewList}>
            {guests.slice(0, 3).map((guest) => (
              <View key={guest.id} style={styles.guestPreviewItem}>
                <View style={[
                  styles.guestPreviewAvatar,
                  { backgroundColor: guest.gender === 'male' ? `${Colors.primary}15` : '#FCE4EC' }
                ]}>
                  <Text style={[
                    styles.guestPreviewInitial,
                    { color: guest.gender === 'male' ? Colors.primary : '#E91E63' }
                  ]}>
                    {guest.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.guestPreviewInfo}>
                  <Text style={styles.guestPreviewName} numberOfLines={1}>{guest.name}</Text>
                  <Text style={styles.guestPreviewPhone}>{guest.phone}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setGuests(guests.filter(g => g.id !== guest.id))}
                  style={styles.guestRemoveBtn}
                >
                  <Feather name="x" size={16} color={Colors.gray[400]} />
                </TouchableOpacity>
              </View>
            ))}
            {guests.length > 3 && (
              <Text style={styles.guestPreviewMore}>
                {isArabic ? `+${guests.length - 3} ضيوف آخرين` : `+${guests.length - 3} more guests`}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Co-Host Section */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isArabic && styles.textRTL]}>
          {isArabic ? 'المضيفون المشاركون' : 'Co-Hosts'}
        </Text>
        <Text style={styles.coHostHint}>
          {isArabic
            ? 'يمكن للمضيفين المشاركين إضافة ضيوف لهذه المناسبة'
            : 'Co-hosts can add guests to this event'}
        </Text>

        <View style={styles.coHostSection}>
          <View style={styles.guestButtons}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={openCoHostContactsSheet}
            >
              <Feather name="users" size={18} color={Colors.primary} />
              <Text style={styles.guestButtonText}>
                {isArabic ? 'من جهات الاتصال' : 'From Contacts'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => {
                setCoHostSheetMode('manual');
                setManualCoHostName('');
                setManualCoHostPhone('');
                setShowCoHostSheet(true);
              }}
            >
              <Feather name="phone" size={18} color={Colors.primary} />
              <Text style={styles.guestButtonText}>
                {isArabic ? 'إضافة برقم' : 'Add by Number'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Co-Host Preview List */}
          {coHosts.length > 0 && (
            <View style={styles.coHostPreviewList}>
              {coHosts.map((coHost) => (
                <View key={coHost.id} style={styles.coHostPreviewItem}>
                  <View style={styles.coHostPreviewAvatar}>
                    <Feather name="star" size={14} color={Colors.primary} />
                  </View>
                  <View style={styles.guestPreviewInfo}>
                    <Text style={styles.guestPreviewName} numberOfLines={1}>{coHost.name}</Text>
                    <Text style={styles.guestPreviewPhone}>{coHost.phone}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCoHosts(coHosts.filter(c => c.id !== coHost.id))}
                    style={styles.guestRemoveBtn}
                  >
                    <Feather name="x" size={16} color={Colors.gray[400]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Review Summary */}
      <View style={styles.reviewSection}>
        <Text style={[styles.reviewTitle, isArabic && styles.textRTL]}>
          {t('create.step5.review')}
        </Text>

        <View style={styles.reviewItem}>
          <Feather name="tag" size={16} color={Colors.gray[500]} />
          <Text style={styles.reviewLabel}>{t('events.form.eventType')}:</Text>
          <Text style={styles.reviewValue}>
            {selectedType ? t(`events.types.${selectedType.toLowerCase()}`) : '-'}
          </Text>
        </View>

        <View style={styles.reviewItem}>
          <Feather name="edit-3" size={16} color={Colors.gray[500]} />
          <Text style={styles.reviewLabel}>{t('events.form.title')}:</Text>
          <Text style={styles.reviewValue} numberOfLines={1}>{title || '-'}</Text>
        </View>

        <View style={styles.reviewItem}>
          <Feather name="calendar" size={16} color={Colors.gray[500]} />
          <Text style={styles.reviewLabel}>{t('events.form.startDate')}:</Text>
          <Text style={styles.reviewValue}>{formatDate(startDate)}</Text>
        </View>

        {location && (
          <View style={styles.reviewItem}>
            <Feather name="map-pin" size={16} color={Colors.gray[500]} />
            <Text style={styles.reviewLabel}>{t('events.form.location')}:</Text>
            <Text style={styles.reviewValue} numberOfLines={1}>{location}</Text>
          </View>
        )}

        <View style={styles.reviewItem}>
          <Feather name="image" size={16} color={Colors.gray[500]} />
          <Text style={styles.reviewLabel}>{t('create.step4.template')}:</Text>
          <Text style={styles.reviewValue}>
            {selectedTemplate ? (isArabic ? selectedTemplate.nameAr : selectedTemplate.name) : '-'}
          </Text>
        </View>

        <View style={styles.reviewItem}>
          <Feather name="users" size={16} color={Colors.gray[500]} />
          <Text style={styles.reviewLabel}>{isArabic ? 'الضيوف' : 'Guests'}:</Text>
          <Text style={styles.reviewValue}>
            {(() => {
              const maleCount = guests.filter(g => g.gender === 'male').length;
              const femaleCount = guests.filter(g => g.gender === 'female').length;
              if (genderRestriction === 'MIXED') {
                return isArabic
                  ? `${maleCount} رجال، ${femaleCount} نساء`
                  : `${maleCount} male, ${femaleCount} female`;
              } else {
                return `${guests.length}`;
              }
            })()}
          </Text>
        </View>

        <View style={styles.reviewItem}>
          <Feather name="star" size={16} color={Colors.gray[500]} />
          <Text style={styles.reviewLabel}>{isArabic ? 'المضيفون المشاركون' : 'Co-Hosts'}:</Text>
          <Text style={styles.reviewValue}>{coHosts.length}</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Feather name="x" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('events.create')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <StepIndicator />

      {step === 1 && !NEEDS_SCROLL ? (
        <View style={styles.step1Container}>
          {renderCurrentStep()}
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={step === 1 ? styles.step1ScrollContent : styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={step === 1 ? () => router.back() : handleBack}
        >
          {step === 1 ? (
            <>
              <Feather name="x" size={20} color={Colors.gray[600]} />
              <Text style={styles.backBtnText}>{t('common.cancel')}</Text>
            </>
          ) : (
            <>
              <Feather name={isArabic ? 'chevron-right' : 'chevron-left'} size={20} color={Colors.gray[600]} />
              <Text style={styles.backBtnText}>{t('common.back')}</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            !canProceed() && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed() || isLoading}
        >
          <Text style={styles.nextBtnText}>
            {step === TOTAL_STEPS ? t('events.create') : t('common.next')}
          </Text>
          {step < TOTAL_STEPS && (
            <Feather name={isArabic ? 'chevron-left' : 'chevron-right'} size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <Animated.View
            style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>
                {datePickerMode === 'date' ? t('create.step3.selectDate') : t('create.step3.selectTime')}
              </Text>
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode={datePickerMode}
                  display="spinner"
                  onChange={(_, date) => date && setTempDate(date)}
                  minimumDate={activeDateField === 'end' ? startDate : new Date()}
                  locale={isArabic ? 'ar' : 'en'}
                />
              </View>
              <TouchableOpacity style={styles.confirmButton} onPress={handleDateConfirm}>
                <Text style={styles.confirmButtonText}>{t('common.confirm')}</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Fullscreen Map Modal */}
      <Modal visible={showMapModal} animationType="slide">
        <View style={styles.fullscreenMapContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              style={styles.mapModalClose}
              onPress={() => setShowMapModal(false)}
            >
              <Feather name="x" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>
              {isArabic ? 'اختر الموقع' : 'Select Location'}
            </Text>
            <TouchableOpacity
              style={styles.mapModalCurrentLocation}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Feather name="navigation" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.mapSearchContainer}>
            <View style={styles.mapSearchBar}>
              <Feather name="search" size={18} color={Colors.gray[400]} />
              <TextInput
                style={[styles.mapSearchInput, isArabic && styles.inputRTL]}
                placeholder={isArabic ? 'ابحث عن موقع...' : 'Search for a location...'}
                placeholderTextColor={Colors.gray[400]}
                value={mapSearchQuery}
                onChangeText={(text) => {
                  setMapSearchQuery(text);
                  if (text.length < 3) setMapSearchResults([]);
                }}
              />
              {isSearchingMap && (
                <ActivityIndicator size="small" color={Colors.primary} />
              )}
              {mapSearchQuery.length > 0 && !isSearchingMap && (
                <TouchableOpacity onPress={() => {
                  setMapSearchQuery('');
                  setMapSearchResults([]);
                }}>
                  <Feather name="x" size={18} color={Colors.gray[400]} />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {mapSearchResults.length > 0 && (
              <View style={styles.mapSearchResults}>
                <ScrollView
                  style={styles.mapSearchResultsList}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {mapSearchResults.map((result, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.mapSearchResultItem}
                      onPress={() => selectSearchResult(result)}
                    >
                      <View style={styles.mapSearchResultIcon}>
                        <Feather name="map-pin" size={16} color={Colors.primary} />
                      </View>
                      <View style={styles.mapSearchResultInfo}>
                        <Text style={styles.mapSearchResultName} numberOfLines={1}>
                          {result.name}
                        </Text>
                        <Text style={styles.mapSearchResultAddress} numberOfLines={1}>
                          {result.address}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <MapView
            ref={mapRef}
            style={styles.fullscreenMap}
            initialRegion={selectedCoordinates ? {
              ...selectedCoordinates,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            } : defaultRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {selectedCoordinates && (
              <Marker
                coordinate={selectedCoordinates}
                pinColor={Colors.primary}
              />
            )}
          </MapView>

          <View style={styles.mapModalFooter}>
            {location ? (
              <View style={styles.selectedLocationInfo}>
                <Feather name="map-pin" size={18} color={Colors.primary} />
                <Text style={styles.selectedLocationText} numberOfLines={2}>
                  {location}
                </Text>
              </View>
            ) : (
              <Text style={styles.mapModalHint}>
                {isArabic ? 'اضغط على الخريطة لتحديد الموقع' : 'Tap on the map to select a location'}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.mapModalConfirm, !selectedCoordinates && styles.mapModalConfirmDisabled]}
              onPress={() => setShowMapModal(false)}
              disabled={!selectedCoordinates}
            >
              <Text style={styles.mapModalConfirmText}>
                {isArabic ? 'تأكيد' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Guest Add Sheet Modal */}
      <Modal visible={showGuestSheet} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowGuestSheet(false)}>
          <Animated.View style={styles.guestSheet}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>
                {guestSheetMode === 'contacts'
                  ? (isArabic ? 'اختر من جهات الاتصال' : 'Select from Contacts')
                  : (isArabic ? 'إضافة ضيف برقم الهاتف' : 'Add Guest by Phone')}
              </Text>

              {guestSheetMode === 'manual' ? (
                <View style={styles.manualGuestForm}>
                  <View style={styles.manualGuestInputGroup}>
                    <Text style={styles.manualGuestLabel}>
                      {isArabic ? 'اسم الضيف' : 'Guest Name'}
                    </Text>
                    <TextInput
                      style={[styles.manualGuestInput, isArabic && styles.inputRTL]}
                      placeholder={isArabic ? 'أدخل الاسم' : 'Enter name'}
                      placeholderTextColor={Colors.gray[400]}
                      value={manualGuestName}
                      onChangeText={setManualGuestName}
                    />
                  </View>
                  <View style={styles.manualGuestInputGroup}>
                    <Text style={styles.manualGuestLabel}>
                      {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                    </Text>
                    <TextInput
                      style={styles.manualGuestInput}
                      placeholder="+974 XXXX XXXX"
                      placeholderTextColor={Colors.gray[400]}
                      value={manualGuestPhone}
                      onChangeText={setManualGuestPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      (!manualGuestName.trim() || !manualGuestPhone.trim()) && styles.confirmButtonDisabled
                    ]}
                    onPress={() => {
                      if (manualGuestName.trim() && manualGuestPhone.trim()) {
                        setGuests([
                          ...guests,
                          {
                            id: Date.now().toString(),
                            name: manualGuestName.trim(),
                            phone: manualGuestPhone.trim(),
                            gender: guestSheetGender,
                          }
                        ]);
                        setManualGuestName('');
                        setManualGuestPhone('');
                        setShowGuestSheet(false);
                      }
                    }}
                    disabled={!manualGuestName.trim() || !manualGuestPhone.trim()}
                  >
                    <Text style={styles.confirmButtonText}>
                      {isArabic ? 'إضافة الضيف' : 'Add Guest'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.contactsContainer}>
                  {/* Search Bar */}
                  <View style={styles.contactsSearchBar}>
                    <Feather name="search" size={18} color={Colors.gray[400]} />
                    <TextInput
                      style={[styles.contactsSearchInput, isArabic && styles.inputRTL]}
                      placeholder={isArabic ? 'ابحث عن جهة اتصال...' : 'Search contacts...'}
                      placeholderTextColor={Colors.gray[400]}
                      value={contactsSearch}
                      onChangeText={setContactsSearch}
                    />
                    {contactsSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setContactsSearch('')}>
                        <Feather name="x" size={18} color={Colors.gray[400]} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Selected Count */}
                  {selectedContacts.size > 0 && (
                    <View style={styles.selectedCountBar}>
                      <Text style={styles.selectedCountText}>
                        {isArabic
                          ? `تم اختيار ${selectedContacts.size} جهة اتصال`
                          : `${selectedContacts.size} contact${selectedContacts.size > 1 ? 's' : ''} selected`}
                      </Text>
                    </View>
                  )}

                  {/* Contacts List */}
                  {contactsLoading ? (
                    <View style={styles.contactsLoading}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.contactsLoadingText}>
                        {isArabic ? 'جاري تحميل جهات الاتصال...' : 'Loading contacts...'}
                      </Text>
                    </View>
                  ) : filteredContacts.length === 0 ? (
                    <View style={styles.contactsEmpty}>
                      <Feather name="users" size={48} color={Colors.gray[300]} />
                      <Text style={styles.contactsEmptyText}>
                        {contactsSearch
                          ? (isArabic ? 'لا توجد نتائج' : 'No results found')
                          : (isArabic ? 'لا توجد جهات اتصال' : 'No contacts found')}
                      </Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
                      {filteredContacts.map((contact) => {
                        const isSelected = selectedContacts.has(contact.id || '');
                        const phone = contact.phoneNumbers?.[0]?.number || '';
                        return (
                          <TouchableOpacity
                            key={contact.id}
                            style={[
                              styles.contactItem,
                              isSelected && styles.contactItemSelected,
                            ]}
                            onPress={() => toggleContactSelection(contact.id || '')}
                          >
                            <View style={[
                              styles.contactAvatar,
                              { backgroundColor: guestSheetGender === 'male' ? `${Colors.primary}15` : '#FCE4EC' }
                            ]}>
                              <Text style={[
                                styles.contactInitial,
                                { color: guestSheetGender === 'male' ? Colors.primary : '#E91E63' }
                              ]}>
                                {(contact.name || '?').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.contactInfo}>
                              <Text style={styles.contactName} numberOfLines={1}>
                                {contact.name || 'Unknown'}
                              </Text>
                              <Text style={styles.contactPhone}>{phone}</Text>
                            </View>
                            <View style={[
                              styles.contactCheckbox,
                              isSelected && styles.contactCheckboxSelected,
                              { borderColor: guestSheetGender === 'male' ? Colors.primary : '#E91E63' },
                              isSelected && { backgroundColor: guestSheetGender === 'male' ? Colors.primary : '#E91E63' },
                            ]}>
                              {isSelected && <Feather name="check" size={14} color="#fff" />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                      <View style={{ height: 20 }} />
                    </ScrollView>
                  )}

                  {/* Add Button */}
                  <View style={styles.contactsFooter}>
                    <TouchableOpacity
                      style={[
                        styles.contactsAddBtn,
                        { backgroundColor: guestSheetGender === 'male' ? Colors.primary : '#E91E63' },
                        selectedContacts.size === 0 && styles.contactsAddBtnDisabled,
                      ]}
                      onPress={addSelectedContacts}
                      disabled={selectedContacts.size === 0}
                    >
                      <Text style={styles.contactsAddBtnText}>
                        {isArabic
                          ? `إضافة ${selectedContacts.size > 0 ? `(${selectedContacts.size})` : ''}`
                          : `Add ${selectedContacts.size > 0 ? `(${selectedContacts.size})` : ''}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Co-Host Add Sheet Modal */}
      <Modal visible={showCoHostSheet} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCoHostSheet(false)}>
          <Animated.View style={styles.guestSheet}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>
                {coHostSheetMode === 'contacts'
                  ? (isArabic ? 'اختر مضيف مشارك' : 'Select Co-Host')
                  : (isArabic ? 'إضافة مضيف مشارك' : 'Add Co-Host')}
              </Text>

              {coHostSheetMode === 'manual' ? (
                <View style={styles.manualGuestForm}>
                  <View style={styles.manualGuestInputGroup}>
                    <Text style={styles.manualGuestLabel}>
                      {isArabic ? 'اسم المضيف المشارك' : 'Co-Host Name'}
                    </Text>
                    <TextInput
                      style={[styles.manualGuestInput, isArabic && styles.inputRTL]}
                      placeholder={isArabic ? 'أدخل الاسم' : 'Enter name'}
                      placeholderTextColor={Colors.gray[400]}
                      value={manualCoHostName}
                      onChangeText={setManualCoHostName}
                    />
                  </View>
                  <View style={styles.manualGuestInputGroup}>
                    <Text style={styles.manualGuestLabel}>
                      {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                    </Text>
                    <TextInput
                      style={styles.manualGuestInput}
                      placeholder="+974 XXXX XXXX"
                      placeholderTextColor={Colors.gray[400]}
                      value={manualCoHostPhone}
                      onChangeText={setManualCoHostPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      (!manualCoHostName.trim() || !manualCoHostPhone.trim()) && styles.confirmButtonDisabled
                    ]}
                    onPress={() => {
                      if (manualCoHostName.trim() && manualCoHostPhone.trim()) {
                        const alreadyExists = coHosts.some(c => c.phone === manualCoHostPhone.trim());
                        if (!alreadyExists) {
                          setCoHosts([
                            ...coHosts,
                            {
                              id: Date.now().toString(),
                              name: manualCoHostName.trim(),
                              phone: manualCoHostPhone.trim(),
                            }
                          ]);
                        }
                        setManualCoHostName('');
                        setManualCoHostPhone('');
                        setShowCoHostSheet(false);
                      }
                    }}
                    disabled={!manualCoHostName.trim() || !manualCoHostPhone.trim()}
                  >
                    <Text style={styles.confirmButtonText}>
                      {isArabic ? 'إضافة المضيف' : 'Add Co-Host'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.contactsContainer}>
                  {/* Search Bar */}
                  <View style={styles.contactsSearchBar}>
                    <Feather name="search" size={18} color={Colors.gray[400]} />
                    <TextInput
                      style={[styles.contactsSearchInput, isArabic && styles.inputRTL]}
                      placeholder={isArabic ? 'ابحث عن جهة اتصال...' : 'Search contacts...'}
                      placeholderTextColor={Colors.gray[400]}
                      value={contactsSearch}
                      onChangeText={setContactsSearch}
                    />
                    {contactsSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setContactsSearch('')}>
                        <Feather name="x" size={18} color={Colors.gray[400]} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Selected Count */}
                  {selectedCoHostContacts.size > 0 && (
                    <View style={styles.selectedCountBar}>
                      <Text style={styles.selectedCountText}>
                        {isArabic
                          ? `تم اختيار ${selectedCoHostContacts.size} جهة اتصال`
                          : `${selectedCoHostContacts.size} contact${selectedCoHostContacts.size > 1 ? 's' : ''} selected`}
                      </Text>
                    </View>
                  )}

                  {/* Contacts List */}
                  {contactsLoading ? (
                    <View style={styles.contactsLoading}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.contactsLoadingText}>
                        {isArabic ? 'جاري تحميل جهات الاتصال...' : 'Loading contacts...'}
                      </Text>
                    </View>
                  ) : filteredContacts.length === 0 ? (
                    <View style={styles.contactsEmpty}>
                      <Feather name="users" size={48} color={Colors.gray[300]} />
                      <Text style={styles.contactsEmptyText}>
                        {contactsSearch
                          ? (isArabic ? 'لا توجد نتائج' : 'No results found')
                          : (isArabic ? 'لا توجد جهات اتصال' : 'No contacts found')}
                      </Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
                      {filteredContacts.map((contact) => {
                        const isSelected = selectedCoHostContacts.has(contact.id || '');
                        const phone = contact.phoneNumbers?.[0]?.number || '';
                        return (
                          <TouchableOpacity
                            key={contact.id}
                            style={[
                              styles.contactItem,
                              isSelected && styles.contactItemSelected,
                            ]}
                            onPress={() => toggleCoHostContactSelection(contact.id || '')}
                          >
                            <View style={[styles.contactAvatar, { backgroundColor: `${Colors.primary}15` }]}>
                              <Feather name="star" size={16} color={Colors.primary} />
                            </View>
                            <View style={styles.contactInfo}>
                              <Text style={styles.contactName} numberOfLines={1}>
                                {contact.name || 'Unknown'}
                              </Text>
                              <Text style={styles.contactPhone}>{phone}</Text>
                            </View>
                            <View style={[
                              styles.contactCheckbox,
                              isSelected && styles.contactCheckboxSelected,
                              { borderColor: Colors.primary },
                              isSelected && { backgroundColor: Colors.primary },
                            ]}>
                              {isSelected && <Feather name="check" size={14} color="#fff" />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                      <View style={{ height: 20 }} />
                    </ScrollView>
                  )}

                  {/* Add Button */}
                  <View style={styles.contactsFooter}>
                    <TouchableOpacity
                      style={[
                        styles.contactsAddBtn,
                        { backgroundColor: Colors.primary },
                        selectedCoHostContacts.size === 0 && styles.contactsAddBtnDisabled,
                      ]}
                      onPress={addSelectedCoHosts}
                      disabled={selectedCoHostContacts.size === 0}
                    >
                      <Text style={styles.contactsAddBtnText}>
                        {isArabic
                          ? `إضافة ${selectedCoHostContacts.size > 0 ? `(${selectedCoHostContacts.size})` : ''}`
                          : `Add ${selectedCoHostContacts.size > 0 ? `(${selectedCoHostContacts.size})` : ''}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Invitation Preview Slide Sheet */}
      <InvitationSlideSheet
        visible={showPreviewSheet}
        onClose={() => setShowPreviewSheet(false)}
        isPreview={true}
        templateId={selectedTemplate?.id}
        customColor={customPrimaryColor}
        event={{
          type: selectedType || 'WEDDING',
          title: isArabic ? titleAr : title || (isArabic ? 'عنوان المناسبة' : 'Event Title'),
          titleAr: titleAr || 'عنوان المناسبة',
          description: isArabic ? descriptionAr : description,
          descriptionAr: descriptionAr,
          startDate: startDate.toISOString(),
          location: location,
          host: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
          } : {
            firstName: isArabic ? 'أحمد' : 'Ahmed',
            lastName: isArabic ? 'الثاني' : 'Al-Thani',
          },
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  headerSpacer: {
    width: 44,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  stepCircleActive: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: Colors.gray[200],
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 24,
  },
  step1Container: {
    flex: 1,
    padding: 24,
  },
  step1ScrollContent: {
    padding: 24,
    paddingBottom: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: 16,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  typeCardSelected: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  typeIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  typeLabelSelected: {
    fontWeight: '700',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.gray[500],
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[300],
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 17,
    color: Colors.black,
  },
  inputRTL: {
    textAlign: 'right',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 8,
  },
  eventTypeBadgeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  eventTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  eventTypeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickInsertContainer: {
    marginTop: 8,
  },
  quickInsertLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.gray[500],
    marginBottom: 12,
  },
  quickInsertChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickInsertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  quickInsertChipAdded: {
    backgroundColor: Colors.gray[100],
  },
  quickInsertChipText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  quickInsertChipTextAdded: {
    color: Colors.gray[400],
  },
  inputWithIcon: {
    paddingLeft: 28,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 20,
  },
  currentLocationText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  mapPreview: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 16,
    position: 'relative',
    backgroundColor: Colors.gray[100],
  },
  mapPreviewMap: {
    flex: 1,
  },
  mapPreviewPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapPreviewText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '500',
  },
  fullscreenMapContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  mapModalClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  mapModalCurrentLocation: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapSearchContainer: {
    position: 'absolute',
    top: 130,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  mapSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    padding: 0,
  },
  mapSearchResults: {
    marginTop: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  mapSearchResultsList: {
    padding: 8,
  },
  mapSearchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  mapSearchResultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapSearchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mapSearchResultName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
  },
  mapSearchResultAddress: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
  fullscreenMap: {
    flex: 1,
  },
  mapModalFooter: {
    padding: 20,
    paddingBottom: 36,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    gap: 16,
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    lineHeight: 22,
  },
  mapModalHint: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  mapModalConfirm: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  mapModalConfirmDisabled: {
    backgroundColor: Colors.gray[300],
  },
  mapModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  locationInput: {
    position: 'relative',
  },
  locationIcon: {
    position: 'absolute',
    left: 0,
    top: 14,
    zIndex: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 24,
  },
  dateButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[300],
    paddingVertical: 12,
    gap: 10,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[300],
    paddingVertical: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 17,
    color: Colors.black,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  templatesScroll: {
    marginTop: 12,
    marginHorizontal: -24,
  },
  templatesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  templateCard: {
    width: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  templateCardSelected: {
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  templateSelectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  templatePreview: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    paddingTop: 16,
  },
  templateAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  templateInviteText: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  templateTitleText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 6,
  },
  templateDescText: {
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 13,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  templateDivider: {
    width: 30,
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
  templateName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[700],
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.gray[50],
  },
  colorsScroll: {
    marginTop: 12,
    marginBottom: 24,
    marginHorizontal: -24,
  },
  colorsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: Colors.black,
  },
  previewInvitationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}10`,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
  },
  previewInvitationText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  genderOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.gray[600],
  },
  genderOptionTextSelected: {
    color: Colors.primary,
  },
  guestSection: {
    marginTop: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
  },
  guestSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
    marginLeft: 10,
    flex: 1,
  },
  guestSectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[500],
    backgroundColor: Colors.gray[200],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  guestButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  guestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 8,
  },
  guestButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  guestPreviewList: {
    marginTop: 16,
    gap: 8,
  },
  guestPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  guestPreviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestPreviewInitial: {
    fontSize: 14,
    fontWeight: '600',
  },
  guestPreviewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  guestPreviewName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
  },
  guestPreviewPhone: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
  guestRemoveBtn: {
    padding: 6,
  },
  guestPreviewMore: {
    fontSize: 13,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 4,
  },
  coHostHint: {
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 4,
    marginBottom: 12,
  },
  coHostSection: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
  },
  coHostPreviewList: {
    marginTop: 16,
    gap: 8,
  },
  coHostPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  coHostPreviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    marginTop: 'auto',
  },
  manualGuestForm: {
    padding: 20,
  },
  manualGuestInputGroup: {
    marginBottom: 16,
  },
  manualGuestLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[600],
    marginBottom: 8,
  },
  manualGuestInput: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.black,
    backgroundColor: Colors.gray[50],
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  contactsContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  contactsSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
  },
  contactsSearchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    padding: 0,
  },
  selectedCountBar: {
    backgroundColor: Colors.primary + '15',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'center',
  },
  contactsLoading: {
    padding: 60,
    alignItems: 'center',
  },
  contactsLoadingText: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 12,
  },
  contactsEmpty: {
    padding: 60,
    alignItems: 'center',
  },
  contactsEmptyText: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 12,
  },
  contactsList: {
    maxHeight: SCREEN_HEIGHT * 0.45,
    paddingHorizontal: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  contactItemSelected: {
    backgroundColor: Colors.gray[100],
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.black,
  },
  contactPhone: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  contactCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCheckboxSelected: {
    borderWidth: 0,
  },
  contactsFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  contactsAddBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactsAddBtnDisabled: {
    opacity: 0.5,
  },
  contactsAddBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  reviewSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  reviewValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.black,
  },
  bottomNav: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 36,
    backgroundColor: Colors.white,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    gap: 4,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 4,
  },
  nextBtnDisabled: {
    backgroundColor: Colors.gray[300],
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  datePickerContainer: {
    alignItems: 'center',
  },
  confirmButton: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
