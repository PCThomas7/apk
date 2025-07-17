// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
// } from 'react-native';
// import { Calendar, ChevronRight, Clock, BookOpen, Eye } from 'lucide-react-native';

// interface Lesson {
//   lessonId: string;
//   lessonTitle: string;
//   scheduledFor: string;
//   duration: string;
//   chapterTitle: string;
//   sectionTitle: string;
//   courseTitle: string;
//   courseId: string;
//   sectionId: string;
//   chapterId: string;
// }

// interface UpcomingLessonsProps {
//   lessons: Lesson[];
// }

// const LESSONS_PER_PAGE = 3;

// const formatScheduledDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   const today = new Date();
//   const tomorrow = new Date();
//   tomorrow.setDate(today.getDate() + 1);

//   if (date.toDateString() === today.toDateString()) {
//     return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
//   } else if (date.toDateString() === tomorrow.toDateString()) {
//     return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
//   } else {
//     return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
//   }
// };

// const SECTION_COLORS = [
//   { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB' },
//   { bg: '#E8F5E8', text: '#2E7D32', border: '#C8E6C9' },
//   { bg: '#F3E5F5', text: '#7B1FA2', border: '#E1BEE7' },
//   { bg: '#FFF3E0', text: '#F57C00', border: '#FFCC02' },
//   { bg: '#FCE4EC', text: '#C2185B', border: '#F8BBD9' },
//   { bg: '#E8EAF6', text: '#3F51B5', border: '#C5CAE9' },
//   { bg: '#E0F2F1', text: '#00695C', border: '#B2DFDB' },
//   { bg: '#FFEBEE', text: '#D32F2F', border: '#FFCDD2' },
//   { bg: '#FFF8E1', text: '#F9A825', border: '#FFF176' },
//   { bg: '#F1F8E9', text: '#689F38', border: '#DCEDC8' },
// ];

// const getSectionColor = (sectionTitle: string) => {
//   const hash = sectionTitle.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
//   const colorIndex = Math.abs(hash) % SECTION_COLORS.length;
//   return SECTION_COLORS[colorIndex];
// };

// const LessonCard = ({ lesson, onViewLesson }: { lesson: Lesson; onViewLesson: (lesson: Lesson) => void }) => {
//   const sectionColor = getSectionColor(lesson.sectionTitle);

//   return (
//     <View style={styles.card}>
//       <View style={styles.titleContainer}>
//         <Text style={styles.title} numberOfLines={2}>{lesson.lessonTitle}</Text>
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
//           {/* Section Badge */}
//           <View style={[styles.sectionBadge, { backgroundColor: sectionColor.bg, borderColor: sectionColor.border }]}>
//             <Text style={[styles.sectionText, { color: sectionColor.text }]}>{lesson.sectionTitle}</Text>
//           </View>

//           {/* Duration Row */}
//           <View style={styles.row}>
//             <Clock size={14} color="#555" />
//             <Text style={styles.text}>{lesson.duration}</Text>
//           </View>
//         </View>

//       </View>


//       <View style={styles.row}>
//         <Calendar size={14} color="#3b82f6" />
//         <Text style={styles.text}>{formatScheduledDate(lesson.scheduledFor)}</Text>
//       </View>

//       <View style={styles.row}>
//         <BookOpen size={14} color="#888" />
//         <View style={styles.courseInfo}>
//           <Text style={styles.text} numberOfLines={1}>{lesson.courseTitle}</Text>
//           <Text style={styles.subtext} numberOfLines={1}>{lesson.chapterTitle}</Text>
//         </View>
//       </View>

//       <TouchableOpacity style={styles.button} onPress={() => onViewLesson(lesson)} activeOpacity={0.8}>
//         <Eye size={16} color="#2563eb" />
//         <Text style={styles.buttonText}>View Lesson</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const UpcomingLessons = ({ lessons }: UpcomingLessonsProps) => {
//   const [showAll, setShowAll] = useState(false);
//   const [displayedLessons, setDisplayedLessons] = useState<Lesson[]>([]);

//   useEffect(() => {
//     setDisplayedLessons(showAll ? lessons : lessons.slice(0, LESSONS_PER_PAGE));
//   }, [lessons, showAll]);

//   const handleViewLesson = (lesson: Lesson) => {
//     console.log('Navigate to lesson:', lesson);
//   };

//   const toggleShowAll = () => setShowAll(!showAll);

//   if (lessons.length === 0) {
//     return (
//       <View style={styles.emptyCard}>
//         <Calendar size={36} color="#bbb" />
//         <Text style={styles.emptyText}>No Upcoming Lessons</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.headerRow}>
//           <Calendar size={18} color="#2563eb" />
//           <Text style={styles.headerText}>Upcoming Lessons</Text>
//         </View>
//         <Text style={styles.badge}>
//           {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
//         </Text>
//       </View>

//       <View style={{ gap: 16 }}>
//         {displayedLessons.map((item) => (
//           <LessonCard
//             key={item.lessonId}
//             lesson={item}
//             onViewLesson={handleViewLesson}
//           />
//         ))}
//       </View>

//       {lessons.length > LESSONS_PER_PAGE && (
//         <TouchableOpacity style={styles.toggleButton} onPress={toggleShowAll}>
//           <ChevronRight
//             size={14}
//             color="#333"
//             style={{ transform: [{ rotate: showAll ? '90deg' : '0deg' }] }}
//           />
//           <Text style={styles.toggleButtonText}>
//             {showAll ? 'Show Less' : `View All Lessons (${lessons.length - LESSONS_PER_PAGE} more)`}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>

//   );
// };

// export default UpcomingLessons;

// const styles = StyleSheet.create({
//   container: {
//     gap: 16,
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//     gap: 8,
//   },
//   titleContainer: {
//     marginBottom: 4,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#111',
//     lineHeight: 22,
//   },
//   sectionBadge: {
//     alignSelf: 'flex-start',
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//   },
//   sectionText: {
//     fontSize: 12,
//     fontWeight: '600',
//     letterSpacing: 0.5,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   text: {
//     fontSize: 14,
//     color: '#444',
//     flex: 1,
//   },
//   subtext: {
//     fontSize: 12,
//     color: '#888',
//     marginTop: 2,
//   },
//   courseInfo: {
//     marginLeft: 6,
//     flex: 1,
//   },
//   button: {
//     marginTop: 8,
//     padding: 12,
//     borderRadius: 12,
//     borderColor: '#93c5fd',
//     borderWidth: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#ffffff',
//   },
//   buttonText: {
//     fontWeight: '600',
//     color: '#2563eb',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111',
//   },
//   badge: {
//     backgroundColor: '#f3f4f6',
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 12,
//     fontSize: 12,
//     color: '#555',
//   },
//   toggleButton: {
//     marginTop: 12,
//     padding: 14,
//     backgroundColor: '#f9fafb',
//     borderRadius: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   toggleButtonText: {
//     color: '#333',
//     fontWeight: '500',
//   },
//   emptyCard: {
//     backgroundColor: '#fff',
//     padding: 24,
//     borderRadius: 16,
//     alignItems: 'center',
//     borderColor: '#f0f0f0',
//     borderWidth: 1,
//     gap: 12,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#555',
//   },
// });


import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Calendar, ChevronRight, Clock, BookOpen, Eye, Play, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type LessonStatus = 'live' | 'available' | 'upcoming';

interface Lesson {
  lessonId: string;
  title: string;
  content:string;
  scheduledFor: string;
  duration: string;
  chapterName: string;
  sectionName: string;
  courseName: string;
  courseId: string;
  sectionId: string;
  chapterId: string;
  status: LessonStatus;
}

interface UpcomingLessonsProps {
  lessons: Lesson[];
}

const LESSONS_PER_PAGE = 3;

const SECTION_COLORS = [
  { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB' },
  { bg: '#E8F5E8', text: '#2E7D32', border: '#C8E6C9' },
  { bg: '#F3E5F5', text: '#7B1FA2', border: '#E1BEE7' },
  { bg: '#FFF3E0', text: '#F57C00', border: '#FFCC02' },
  { bg: '#FCE4EC', text: '#C2185B', border: '#F8BBD9' },
  { bg: '#E8EAF6', text: '#3F51B5', border: '#C5CAE9' },
  { bg: '#E0F2F1', text: '#00695C', border: '#B2DFDB' },
  { bg: '#FFEBEE', text: '#D32F2F', border: '#FFCDD2' },
  { bg: '#FFF8E1', text: '#F9A825', border: '#FFF176' },
  { bg: '#F1F8E9', text: '#689F38', border: '#DCEDC8' },
];

const formatScheduledDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getSectionColor = (sectionTitle: string = '') => {
  const hash = sectionTitle.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return SECTION_COLORS[Math.abs(hash) % SECTION_COLORS.length];
};

const StatusBadge = React.memo(({ status }: { status: LessonStatus }) => {
  const statusConfig = {
    live: { color: '#EF4444', Icon: Play, text: 'Live Now' },
    available: { color: '#10B981', Icon: CheckCircle, text: 'Available' },
    upcoming: { color: '#3B82F6', Icon: Calendar, text: 'Upcoming' },
  };

  const { color, Icon, text } = statusConfig[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}20`, borderColor: color }]}>
      <Icon size={12} color={color} />
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
});

const LessonCard = React.memo(({ lesson, onViewLesson }: { lesson: Lesson; onViewLesson: (lesson: Lesson) => void }) => {
  const sectionColor = useMemo(() => getSectionColor(lesson.sectionName), [lesson.sectionName]);

  const buttonStyle = useMemo(() => [
    styles.button,
    lesson.status === 'live' && styles.liveButton
  ], [lesson.status]);

  const buttonTextStyle = useMemo(() => ({
    color: lesson.status === 'live' ? '#2563eb' : '#2563eb'
  }), [lesson.status]);

  return (
    <View style={styles.card}>
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>{lesson.title}</Text>
          <StatusBadge status={lesson.status} />
        </View>

        <View style={styles.detailsRow}>
          <View style={[styles.sectionBadge, {
            backgroundColor: sectionColor.bg,
            borderColor: sectionColor.border
          }]}>
            <Text style={[styles.sectionText, { color: sectionColor.text }]}>
              {lesson.sectionName}
            </Text>
          </View>

          <View style={styles.row}>
            <Clock size={14} color="#555" />
            <Text style={styles.text}>{lesson.duration}</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <Calendar size={14} color="#3b82f6" />
        <Text style={styles.text}>{formatScheduledDate(lesson.scheduledFor)}</Text>
      </View>

      <View style={styles.row}>
        <BookOpen size={14} color="#888" />
        <View style={styles.courseInfo}>
          <Text style={styles.text} numberOfLines={1}>{lesson.courseName}</Text>
          <Text style={styles.subtext} numberOfLines={1}>{lesson.chapterName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={buttonStyle}
        onPress={() => onViewLesson(lesson)}
        activeOpacity={0.8}
      >
        <Eye size={16} color={buttonTextStyle.color} />
        <Text style={[styles.buttonText, buttonTextStyle]}>
          {lesson.status === 'live' ? 'Join Now' : 'View Lesson'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const PulseDot = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.pulseContainer}>
      <Animated.View style={[
        styles.pulseDot,
        {
          transform: [{ scale: pulseAnim }],
          opacity: pulseOpacity,
        }
      ]} />
      <View style={[styles.pulseDot, styles.pulseDotInner]} />
    </View>
  );
};




const UpcomingLessons = ({ lessons }: UpcomingLessonsProps) => {
  
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<LessonStatus>('upcoming');
  const [showAll, setShowAll] = useState({
    live: false,
    available: false,
    upcoming: false
  });

  const filteredLessons = useMemo(() =>
    lessons.filter(lesson => lesson.status === activeTab),
    [lessons, activeTab]
  );

  const displayedLessons = useMemo(() =>
    showAll[activeTab] ? filteredLessons : filteredLessons.slice(0, LESSONS_PER_PAGE),
    [filteredLessons, showAll, activeTab]
  );

  const liveCount = useMemo(() =>
    lessons.filter(l => l.status === 'live').length,
    [lessons]
  );

  const handleViewLesson = useCallback((lesson: Lesson) => {
    if(lesson.status === 'upcoming'){
      router.push(`/components/quizzes/QuizLessonScreen?lessonId=${lesson?._id}`)
    }else{
    router.push(`/components/courses/courseRoom?video=${encodeURIComponent(lesson?.content)}&status=${'in_progress'}&vediotitle=${encodeURIComponent(lesson?.title)}&watchTimeSeconds=${'0'}&totalTImeSeconds=${'0'}&viewCount=${'0'}&bookmarked=${'false'}&lessonId=${lesson?._id}&chapterId=${lesson?.chapterId}&sectionId=${lesson?.sectionId}&courseId=${lesson?.courseId }`)
    }

  }, []);

  const toggleShowAll = useCallback(() => {
    setShowAll(prev => ({
      ...prev,
      [activeTab]: !prev[activeTab]
    }));
  }, [activeTab]);

  const changeTab = useCallback((tab: LessonStatus) => {
    setActiveTab(tab);
  }, []);

  if (lessons.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Calendar size={36} color="#bbb" />
        <Text style={styles.emptyText}>No Lessons Available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Calendar size={18} color="#2563eb" />
          <Text style={styles.headerText}>Lesson Schedule</Text>
        </View>
        <Text style={styles.badge}>
          {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        {(['live', 'available', 'upcoming'] as LessonStatus[]).map((tab) => (
          <TouchableOpacity
            key={`tab-${tab}`}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => changeTab(tab)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {tab === 'live' && liveCount > 0 && <PulseDot />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {filteredLessons.length === 0 ? (
        <View style={styles.emptyTab}>
          <Text style={styles.emptyTabText}>
            No {activeTab} lessons found
          </Text>
        </View>
      ) : (
        <>
          <View style={{ gap: 16 }}>
            {displayedLessons.map((item, index) => (
              <LessonCard
                key={`${item.lessonId}-${index}`}
                lesson={item}
                onViewLesson={handleViewLesson}
              />
            ))}
          </View>

          {filteredLessons.length > LESSONS_PER_PAGE && (
            <TouchableOpacity style={styles.toggleButton} onPress={toggleShowAll}>
              <ChevronRight
                size={14}
                color="#333"
                style={{ transform: [{ rotate: showAll[activeTab] ? '90deg' : '0deg' }] }}
              />
              <Text style={styles.toggleButtonText}>
                {showAll[activeTab] ? 'Show Less' : `View All (${filteredLessons.length - LESSONS_PER_PAGE} more)`}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 8,
  },
  titleContainer: { marginBottom: 4 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: 10
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    lineHeight: 22,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  subtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  courseInfo: {
    marginLeft: 6,
    flex: 1,
  },
  button: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderColor: '#93c5fd',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
  },
  liveButton: {
    backgroundColor: '#ffffff',
    borderColor: '#93c5fd',
  },
  buttonText: {
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
    color: '#555',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  pulseContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    position: 'absolute',
  },
  pulseDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  toggleButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderColor: '#f0f0f0',
    borderWidth: 1,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
  emptyTab: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderColor: '#f0f0f0',
    borderWidth: 1,
    gap: 8,
  },
  emptyTabText: {
    fontSize: 14,
    color: '#888',
  },
});

export default React.memo(UpcomingLessons);
