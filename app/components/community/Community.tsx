import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput,
    ActivityIndicator, RefreshControl, Dimensions, Platform, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommunityService from '../../../services/communityService';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/header';

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    author?: {
        name: string;
        _id?: string;
        email?: string;
    };
    likes?: number;
    likedBy?: string[]; // ✅ Add this
    comments?: { id: string }[];
}


const { width } = Dimensions.get('window');

const Community = () => {
    const router = useRouter();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'recent' | 'popular'>('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [userId, setUserId] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);


    const fetchPosts = useCallback(
        async (reset: boolean = false, customPage: number | null = null) => {
            const currentPage = customPage !== null ? customPage : (reset ? 1 : page);

            try {
                setLoading(true);
                setError(null);

                let result;
                if (selectedTab === 'popular') {
                    result = await CommunityService.getPopularPosts();
                    setPosts(result || []);
                    setTotalPages(1);
                } else {
                    result = await CommunityService.getPosts(currentPage, 5);
                    setPosts(result.posts);
                    setTotalPages(result.pagination.totalPages);
                    const userDetails = await SecureStore.getItemAsync('userDetails');
                    if (userDetails) {
                        const parsed = JSON.parse(userDetails);
                        setUserId(parsed.id);
                    }
                }
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to fetch posts. Please try again.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [page, selectedTab]
    );


    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        fetchPosts(true);
    }, [fetchPosts]);

    useEffect(() => {
        fetchPosts(true);
    }, [selectedTab]);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            fetchPosts(true);
            return;
        }

        const filtered = posts.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setPosts(filtered);
    };

    const clearSearch = () => {
        setSearchQuery('');
        fetchPosts(true);
    };

    const handleLikePost = async (postId: string) => {
        if (!userId) return;

        try {
            const checkPost = posts.find((item) => item._id === postId);
            const alreadyLiked = checkPost?.likedBy?.includes(userId);

            if (alreadyLiked) {
                alert("You already liked this post");
                return;
            }
            await CommunityService.likePost(postId);
            setPosts(posts.map(post =>
                post._id === postId
                    ? {
                        ...post,
                        likes: (post.likes || 0) + 1,
                        likedBy: [...(post.likedBy || []), userId],
                    }
                    : post
            ));
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const renderContentWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            const isUrl = urlRegex.test(part);
            if (isUrl) {
                return (
                    <Text
                        key={index}
                        style={styles.linkText}
                        onPress={() => Linking.openURL(part)}
                    >
                        {part}
                    </Text>
                );
            } else {
                return (
                    <Text key={index} style={styles.postContent}>
                        {part}
                    </Text>
                );
            }
        });
    };

    const renderPostItem = ({ item }: { item: Post }) => (
        <View style={styles.postCard}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    router.push(`/components/community/singleCommunity?postId=${item._id}`);
                }}
            >

                <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
                <TouchableOpacity activeOpacity={0.8}>
                    <Text style={styles.postContent} numberOfLines={3}>
                        {renderContentWithLinks(item.content)}
                    </Text>
                </TouchableOpacity>


                <View style={styles.postMeta}>
                    <TouchableOpacity
                        style={styles.interactionItem}
                        onPress={() => handleLikePost(item._id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="thumbs-up" size={18} color="#4F46E5" />
                        <Text style={styles.interactionText}>{item.likes || 0}</Text>
                    </TouchableOpacity>
                    <Ionicons name="time" size={14} color="#6B7280" />
                    <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
            </TouchableOpacity>


        </View>
    );

    const renderFooter = () => {
        if (loading && page > 1) {
            return <ActivityIndicator size="small" color="#3B82F6" style={styles.footer} />;
        }

        if (selectedTab === 'recent' && !searchQuery && posts.length > 0) {
            return (
                <View style={styles.paginationContainer}>
                    <TouchableOpacity
                        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
                        onPress={() => {
                            setPage(prev => Math.max(prev - 1, 1));
                            fetchPosts(false, Math.max(page - 1, 1));
                        }}
                        disabled={page === 1}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={20} color={page === 1 ? "#9CA3AF" : "#3B82F6"} />
                        <Text style={[styles.paginationText, page === 1 && styles.disabledText]}>Previous</Text>
                    </TouchableOpacity>

                    <View style={styles.pageIndicator}>
                        <Text style={styles.pageText}>
                            {page} / {totalPages}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.paginationButton, page >= totalPages && styles.disabledButton]}
                        onPress={() => {
                            setPage(prev => Math.min(prev + 1, totalPages));
                            fetchPosts(false, Math.min(page + 1, totalPages));
                        }}
                        disabled={page >= totalPages}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.paginationText, page >= totalPages && styles.disabledText]}>Next</Text>
                        <Ionicons name="chevron-forward" size={20} color={page >= totalPages ? "#9CA3AF" : "#3B82F6"} />
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    const renderEmptyComponent = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyState}>
                <Ionicons name="chatbubble-ellipses-outline" size={60} color="#E5E7EB" />
                <Text style={styles.emptyText}>
                    {error || 'No posts found. Be the first to start a discussion!'}
                </Text>
                {error && (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchPosts(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                <AppHeader screenTitle="Community" onBackPress={() => router.back()} />

                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search posts..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchQuery ? (
                            <TouchableOpacity
                                onPress={clearSearch}
                                style={styles.clearButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <TouchableOpacity
                        onPress={handleSearch}
                        style={styles.searchButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, selectedTab === 'recent' && styles.activeTab]}
                        onPress={() => {
                            setSelectedTab('recent');
                            setPage(1);
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, selectedTab === 'recent' && styles.activeTabText]}>Recent</Text>
                        {selectedTab === 'recent' && <View style={styles.activeTabIndicator} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, selectedTab === 'popular' && styles.activeTab]}
                        onPress={() => {
                            setSelectedTab('popular');
                            setPage(1);
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, selectedTab === 'popular' && styles.activeTabText]}>Popular</Text>
                        {selectedTab === 'popular' && <View style={styles.activeTabIndicator} />}
                    </TouchableOpacity>
                </View>

                {/* Posts List */}
                <FlatList
                    data={posts}
                    keyExtractor={(item, index) => item._id?.toString() || index.toString()}
                    renderItem={renderPostItem}
                    contentContainerStyle={styles.postList}
                    ListEmptyComponent={renderEmptyComponent}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#3B82F6']}
                            tintColor="#3B82F6"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />

                {loading && page === 1 && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Community;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    searchBarContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#111827',
        fontSize: 15,
    },
    clearButton: {
        padding: 4,
    },
    searchButton: {
        marginLeft: 10,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
    },
    searchButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 15,
    },

    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    tabButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
        position: 'relative',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#6B7280',
    },
    activeTab: {},
    activeTabText: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: 3,
        backgroundColor: '#3B82F6',
        borderRadius: 3,
    },

    postList: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        flexGrow: 1,
    },
    postCard: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    postHeader: {
        marginBottom: 8,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkText: {
        color: '#3B82F6',
        textDecorationLine: 'underline',
    },
    postDate: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    postContent: {
        fontSize: 14,
        color: '#3B82F6',
        lineHeight: 20,
        marginBottom: 12,
    },
    postFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    interactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    interactionText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 6,
    },

    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 24,
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '500',
    },

    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        backgroundColor: '#F9FAFB',
    },
    paginationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
    },
    disabledButton: {
        backgroundColor: '#F3F4F6',
    },
    paginationText: {
        color: '#3B82F6',
        fontWeight: '500',
        fontSize: 14,
        marginHorizontal: 4,
    },
    disabledText: {
        color: '#9CA3AF',
    },
    pageIndicator: {
        backgroundColor: '#E5E7EB',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    pageText: {
        color: '#4B5563',
        fontWeight: '500',
        fontSize: 14,
    },

    footer: {
        paddingVertical: 16,
        alignItems: 'center',
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});