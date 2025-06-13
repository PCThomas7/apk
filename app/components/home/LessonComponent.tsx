// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
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


// const LessonCard = ({ lesson, onViewLesson }: { lesson: Lesson; onViewLesson: (lesson: Lesson) => void }) => (
//   <View style={styles.card}>
//     <Text style={styles.title}>{lesson.lessonTitle}</Text>
//     <View style={styles.row}>
//       <Clock size={14} color="#555" />
//       <Text style={styles.text}>{lesson.duration}</Text>
//     </View>
//     <View style={styles.row}>
//       <Calendar size={14} color="#3b82f6" />
//       <Text style={styles.text}>{formatScheduledDate(lesson.scheduledFor)}</Text>
//     </View>
//     <View style={styles.row}>
//       <BookOpen size={14} color="#888" />
//       <View style={{ marginLeft: 6 }}>
//         <Text style={styles.text}>{lesson.courseTitle}</Text>
//         <Text style={styles.subtext}>{lesson.chapterTitle}</Text>
//       </View>
//     </View>
//     <TouchableOpacity style={styles.button} onPress={() => onViewLesson(lesson)}>
//       <Eye size={16} color="#2563eb" />
//       <Text style={styles.buttonText}>View Lesson</Text>
//     </TouchableOpacity>
//   </View>
// );

// const UpcomingLessons = ({ lessons }: UpcomingLessonsProps) => {
//   const [showAll, setShowAll] = useState(false);
//   const [displayedLessons, setDisplayedLessons] = useState<Lesson[]>([]);

//   useEffect(() => {
//     setDisplayedLessons(showAll ? lessons : lessons.slice(0, LESSONS_PER_PAGE));
//   }, [lessons, showAll]);

//   const handleViewLesson = (lesson: Lesson) => {
//     console.log('Navigate to lesson:', lesson);
//   };

//   const toggleShowAll = () => {
//     setShowAll(!showAll);
//   };

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
//         <Text style={styles.badge}>{lessons.length} lesson{lessons.length > 1 ? 's' : ''}</Text>
//       </View>

//       <FlatList
//         data={displayedLessons}
//         keyExtractor={(item) => item.lessonId}
//         renderItem={({ item }) => <LessonCard lesson={item} onViewLesson={handleViewLesson} />}
//         contentContainerStyle={{ gap: 16 }}
//       />

//       {lessons.length > LESSONS_PER_PAGE && (
//         <TouchableOpacity style={styles.toggleButton} onPress={toggleShowAll}>
//           <ChevronRight size={14} color="#333" style={{ transform: [{ rotate: showAll ? '90deg' : '0deg' }] }} />
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
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#111',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 6,
//   },
//   text: {
//     fontSize: 14,
//     color: '#444',
//   },
//   subtext: {
//     fontSize: 12,
//     color: '#888',
//   },
//   button: {
//     marginTop: 12,
//     padding: 12,
//     borderRadius: 12,
//     borderColor: '#93c5fd',
//     borderWidth: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
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

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Calendar, ChevronRight, Clock, BookOpen, Eye } from 'lucide-react-native';

interface Lesson {
  lessonId: string;
  lessonTitle: string;
  scheduledFor: string;
  duration: string;
  chapterTitle: string;
  sectionTitle: string;
  courseTitle: string;
  courseId: string;
  sectionId: string;
  chapterId: string;
}

interface UpcomingLessonsProps {
  lessons: Lesson[];
}

const LESSONS_PER_PAGE = 3;

const formatScheduledDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
};

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

const getSectionColor = (sectionTitle: string) => {
  const hash = sectionTitle.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const colorIndex = Math.abs(hash) % SECTION_COLORS.length;
  return SECTION_COLORS[colorIndex];
};

const LessonCard = ({ lesson, onViewLesson }: { lesson: Lesson; onViewLesson: (lesson: Lesson) => void }) => {
  const sectionColor = getSectionColor(lesson.sectionTitle);

  return (
    <View style={styles.card}>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>{lesson.lessonTitle}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          {/* Section Badge */}
          <View style={[styles.sectionBadge, { backgroundColor: sectionColor.bg, borderColor: sectionColor.border }]}>
            <Text style={[styles.sectionText, { color: sectionColor.text }]}>{lesson.sectionTitle}</Text>
          </View>

          {/* Duration Row */}
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
          <Text style={styles.text} numberOfLines={1}>{lesson.courseTitle}</Text>
          <Text style={styles.subtext} numberOfLines={1}>{lesson.chapterTitle}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => onViewLesson(lesson)} activeOpacity={0.8}>
        <Eye size={16} color="#2563eb" />
        <Text style={styles.buttonText}>View Lesson</Text>
      </TouchableOpacity>
    </View>
  );
};

const UpcomingLessons = ({ lessons }: UpcomingLessonsProps) => {
  const [showAll, setShowAll] = useState(false);
  const [displayedLessons, setDisplayedLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    setDisplayedLessons(showAll ? lessons : lessons.slice(0, LESSONS_PER_PAGE));
  }, [lessons, showAll]);

  const handleViewLesson = (lesson: Lesson) => {
    console.log('Navigate to lesson:', lesson);
  };

  const toggleShowAll = () => setShowAll(!showAll);

  if (lessons.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Calendar size={36} color="#bbb" />
        <Text style={styles.emptyText}>No Upcoming Lessons</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Calendar size={18} color="#2563eb" />
          <Text style={styles.headerText}>Upcoming Lessons</Text>
        </View>
        <Text style={styles.badge}>
          {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        {displayedLessons.map((item) => (
          <LessonCard
            key={item.lessonId}
            lesson={item}
            onViewLesson={handleViewLesson}
          />
        ))}
      </View>

      {lessons.length > LESSONS_PER_PAGE && (
        <TouchableOpacity style={styles.toggleButton} onPress={toggleShowAll}>
          <ChevronRight
            size={14}
            color="#333"
            style={{ transform: [{ rotate: showAll ? '90deg' : '0deg' }] }}
          />
          <Text style={styles.toggleButtonText}>
            {showAll ? 'Show Less' : `View All Lessons (${lessons.length - LESSONS_PER_PAGE} more)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>

  );
};

export default UpcomingLessons;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
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
  titleContainer: {
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111',
    lineHeight: 22,
  },
  sectionBadge: {
    alignSelf: 'flex-start',
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
  buttonText: {
    fontWeight: '600',
    color: '#2563eb',
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
});
