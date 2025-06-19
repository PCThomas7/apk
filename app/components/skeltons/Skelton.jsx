import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView, Animated, ScrollView } from 'react-native';

// Utility to get screen orientation
const getOrientation = () => {
  const { width, height } = Dimensions.get('window');
  return width > height ? 'landscape' : 'portrait';
};

const ResponsiveGridSkeleton = () => {
  const [orientation, setOrientation] = useState(getOrientation());
  const [fadeAnims] = useState(() => 
    Array.from({ length: 20 }, () => new Animated.Value(0.3))
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getOrientation());
    };

    const subscription = Dimensions.addEventListener('change', handleOrientationChange);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Staggered animation for all skeleton boxes
    const animations = fadeAnims.map((anim, index) => {
      const animateBox = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 800 + (index * 50), // Staggered timing
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => animateBox());
      };
      
      // Start each animation with a slight delay
      setTimeout(() => animateBox(), index * 100);
      
      return anim;
    });

    return () => {
      // Clean up animations
      animations.forEach(anim => anim.stopAnimation());
    };
  }, [fadeAnims]);

  const getGridColumns = () => {
    return orientation === 'landscape' ? 4 : 2;
  };

  const getItemWidth = () => {
    const columns = getGridColumns();
    const padding = 40; // Total horizontal padding
    const spacing = (columns - 1) * 12; // Spacing between items
    const screenWidth = Dimensions.get('window').width;
    return (screenWidth - padding - spacing) / columns;
  };

  const SkeletonBox = ({ animationValue, width, height, borderRadius = 8, style = {} }) => (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width,
          height,
          borderRadius,
          opacity: animationValue,
        },
        style,
      ]}
    />
  );

  const renderGridItems = () => {
    const itemWidth = getItemWidth();
    const items = [];

    // Header skeleton
    items.push(
      <View key="header" style={[styles.headerContainer, orientation === 'landscape' && styles.headerLandscape]}>
        <SkeletonBox 
          animationValue={fadeAnims[0]} 
          width={40} 
          height={40} 
          borderRadius={20} 
        />
        <View style={styles.headerContent}>
          <SkeletonBox 
            animationValue={fadeAnims[1]} 
            width="70%" 
            height={20} 
            style={{ marginBottom: 8 }} 
          />
          <SkeletonBox 
            animationValue={fadeAnims[2]} 
            width="50%" 
            height={14} 
          />
        </View>
        <SkeletonBox 
          animationValue={fadeAnims[3]} 
          width={24} 
          height={24} 
          borderRadius={12} 
        />
      </View>
    );

    // Stats cards
    const statsCount = orientation === 'landscape' ? 4 : 2;
    items.push(
      <View key="stats" style={[styles.statsContainer, orientation === 'landscape' && styles.statsLandscape]}>
        {Array.from({ length: statsCount }).map((_, index) => (
          <View key={`stat-${index}`} style={[styles.statCard, { width: `${100/statsCount - 2}%` }]}>
            <SkeletonBox 
              animationValue={fadeAnims[4 + index]} 
              width="100%" 
              height={60} 
              style={{ marginBottom: 12 }} 
            />
            <SkeletonBox 
              animationValue={fadeAnims[8 + index]} 
              width="80%" 
              height={16} 
              style={{ marginBottom: 8 }} 
            />
            <SkeletonBox 
              animationValue={fadeAnims[12 + index]} 
              width="60%" 
              height={12} 
            />
          </View>
        ))}
      </View>
    );

    // Main grid items
    const gridItemsCount = orientation === 'landscape' ? 12 : 8;
    const gridItems = Array.from({ length: gridItemsCount }).map((_, index) => (
      <View 
        key={`grid-${index}`} 
        style={[
          styles.gridItem,
          {
            width: itemWidth,
            marginBottom: 16,
          }
        ]}
      >
        <SkeletonBox 
          animationValue={fadeAnims[(index + 4) % fadeAnims.length]} 
          width="100%" 
          height={itemWidth * 0.7} 
          style={{ marginBottom: 12 }} 
        />
        <SkeletonBox 
          animationValue={fadeAnims[(index + 8) % fadeAnims.length]} 
          width="100%" 
          height={16} 
          style={{ marginBottom: 8 }} 
        />
        <SkeletonBox 
          animationValue={fadeAnims[(index + 12) % fadeAnims.length]} 
          width="70%" 
          height={12} 
          style={{ marginBottom: 8 }} 
        />
        <SkeletonBox 
          animationValue={fadeAnims[(index + 16) % fadeAnims.length]} 
          width="100%" 
          height={32} 
          borderRadius={6} 
        />
      </View>
    ));

    items.push(
      <View key="grid" style={[styles.gridContainer, orientation === 'landscape' && styles.gridLandscape]}>
        {gridItems}
      </View>
    );

    return items;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container, 
          orientation === 'landscape' && styles.landscapeContainer
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderGridItems()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResponsiveGridSkeleton;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    paddingTop:30,
  },
  landscapeContainer: {
    paddingHorizontal: 30,
  },
  skeletonBox: {
    backgroundColor: '#E2E8F0',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerLandscape: {
    borderRadius: 20,
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsLandscape: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridLandscape: {
    justifyContent: 'space-around',
  },
  gridItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});