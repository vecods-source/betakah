import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ViewToken,
  FlatList,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  Extrapolation,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../src/hooks';
import { Colors } from '../../src/constants/colors';

const { width } = Dimensions.get('window');

const Dot = ({ index, scrollX }: { index: number; scrollX: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
    return { width: dotWidth, opacity };
  });

  return <Animated.View style={[paginatorStyles.dot, animatedStyle]} />;
};

const Paginator = ({ data, scrollX }: { data: any[]; scrollX: Animated.SharedValue<number> }) => (
  <View style={paginatorStyles.container}>
    {data.map((_, index) => (
      <Dot key={index} index={index} scrollX={scrollX} />
    ))}
  </View>
);

const paginatorStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
});

const FloatingCircle = ({ style, delay = 0 }: { style: any; delay?: number }) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withDelay(1000, withTiming(1, { duration: 0 }))
        ),
        -1
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[illustrationStyles.floatingCircle, style, animatedStyle]} />;
};

const EventIllustration = () => (
  <View style={illustrationStyles.container}>
    <View style={illustrationStyles.calendar}>
      <View style={illustrationStyles.calendarHeader} />
      <View style={illustrationStyles.calendarBody}>
        {[...Array(9)].map((_, i) => (
          <View key={i} style={[illustrationStyles.calendarDot, i === 4 && illustrationStyles.calendarDotActive]} />
        ))}
      </View>
    </View>
    <FloatingCircle style={{ top: 20, right: 15 }} delay={0} />
    <FloatingCircle style={[illustrationStyles.floatingCircleSmall, { bottom: 30, left: 20 }]} delay={400} />
  </View>
);

const InvitationIllustration = () => (
  <View style={illustrationStyles.container}>
    <View style={illustrationStyles.envelope}>
      <View style={illustrationStyles.envelopeFlap} />
      <View style={illustrationStyles.envelopeBody} />
      <View style={illustrationStyles.letter}>
        <View style={[illustrationStyles.cardLine, { backgroundColor: Colors.primary }]} />
        <View style={[illustrationStyles.cardLine, { width: 40, backgroundColor: Colors.gray[300] }]} />
      </View>
    </View>
    <FloatingCircle style={{ top: 25, left: 25 }} delay={0} />
  </View>
);

const GuestIllustration = () => (
  <View style={illustrationStyles.container}>
    <View style={illustrationStyles.peopleContainer}>
      <View style={[illustrationStyles.person, { left: 20 }]}>
        <View style={illustrationStyles.personHead} />
        <View style={illustrationStyles.personBody} />
      </View>
      <View style={[illustrationStyles.person, { zIndex: 2 }]}>
        <View style={[illustrationStyles.personHead, { backgroundColor: Colors.primary }]} />
        <View style={[illustrationStyles.personBody, { backgroundColor: Colors.primary }]} />
      </View>
      <View style={[illustrationStyles.person, { right: 20 }]}>
        <View style={illustrationStyles.personHead} />
        <View style={illustrationStyles.personBody} />
      </View>
    </View>
    <View style={illustrationStyles.checkBadge}>
      <Text style={illustrationStyles.checkText}>✓</Text>
    </View>
  </View>
);

const PrivacyIllustration = () => (
  <View style={illustrationStyles.container}>
    <View style={illustrationStyles.shield}>
      <View style={illustrationStyles.shieldInner}>
        <View style={illustrationStyles.lock}>
          <View style={illustrationStyles.lockTop} />
          <View style={illustrationStyles.lockBody}>
            <View style={illustrationStyles.lockHole} />
          </View>
        </View>
      </View>
    </View>
  </View>
);

const slides = [
  { id: 'slide1', illustration: <EventIllustration /> },
  { id: 'slide2', illustration: <InvitationIllustration /> },
  { id: 'slide3', illustration: <GuestIllustration /> },
  { id: 'slide4', illustration: <PrivacyIllustration /> },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, isRTL } = useLocalization();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setCurrentIndex(Number(viewableItems[0].index));
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(auth)/phone-input');
    }
  };

  const handleSkip = () => router.push('/(auth)/phone-input');

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>{item.illustration}</View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>{t(`auth.onboarding.${item.id}.title`)}</Text>
        <Text style={[styles.description, isRTL && styles.textRTL]}>{t(`auth.onboarding.${item.id}.description`)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>{t('auth.skip')}</Text>
      </TouchableOpacity>

      <AnimatedFlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      <View style={styles.bottomContainer}>
        <Paginator data={slides} scrollX={scrollX} />
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? t('auth.onboarding.getStarted') : t('auth.onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const illustrationStyles = StyleSheet.create({
  container: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  calendar: { width: 120, height: 100, backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: Colors.gray[200] },
  calendarHeader: { height: 28, backgroundColor: Colors.primary },
  calendarBody: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8, justifyContent: 'center', alignItems: 'center' },
  calendarDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.gray[200] },
  calendarDotActive: { backgroundColor: Colors.primary },
  floatingCircle: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.primary, opacity: 0.6 },
  floatingCircleSmall: { width: 10, height: 10, borderRadius: 5, opacity: 0.4 },
  cardLine: { width: 40, height: 6, backgroundColor: Colors.gray[300], borderRadius: 3 },
  envelope: { width: 140, height: 100, position: 'relative' },
  envelopeFlap: { position: 'absolute', top: 0, left: 0, right: 0, height: 50, backgroundColor: Colors.gray[100], borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 2, borderColor: Colors.gray[300] },
  envelopeBody: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: Colors.gray[200], borderRadius: 8, borderWidth: 2, borderColor: Colors.gray[300] },
  letter: { position: 'absolute', top: -20, left: 20, right: 20, height: 80, backgroundColor: Colors.white, borderRadius: 8, padding: 12, gap: 8, elevation: 4 },
  peopleContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
  person: { alignItems: 'center', marginHorizontal: -10 },
  personHead: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[400], marginBottom: -8, zIndex: 1 },
  personBody: { width: 60, height: 50, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: Colors.gray[400] },
  checkBadge: { position: 'absolute', bottom: 20, right: 40, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  checkText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  shield: { width: 100, height: 120, backgroundColor: Colors.primary, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  shieldInner: { width: 80, height: 100, backgroundColor: Colors.white, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  lock: { alignItems: 'center' },
  lockTop: { width: 24, height: 20, borderWidth: 4, borderColor: Colors.primary, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomWidth: 0 },
  lockBody: { width: 36, height: 28, backgroundColor: Colors.primary, borderRadius: 6, marginTop: -2, justifyContent: 'center', alignItems: 'center' },
  lockHole: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  skipButton: { position: 'absolute', top: 60, right: 24, zIndex: 10, paddingVertical: 8, paddingHorizontal: 16 },
  skipText: { fontSize: 16, color: Colors.gray[500], fontWeight: '500' },
  slide: { width, flex: 1, alignItems: 'center', paddingTop: 120 },
  illustrationContainer: { width: 240, height: 240, backgroundColor: Colors.gray[50], borderRadius: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  textContainer: { paddingHorizontal: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black, textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, color: Colors.gray[600], textAlign: 'center', lineHeight: 24 },
  textRTL: { writingDirection: 'rtl' },
  bottomContainer: { paddingHorizontal: 24, paddingBottom: 50 },
  nextButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18 },
  nextButtonText: { fontSize: 18, fontWeight: '600', color: Colors.white },
});
