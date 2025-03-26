import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // Import React and hooks for state, effects, memoization and refs
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  ActivityIndicator, 
  RefreshControl, 
  StatusBar, 
  TextInput, 
  Share,
  Animated,
  Easing,
  Platform,
  Alert
} from 'react-native'; // Import core React Native components for UI building
import { collection, arrayRemove, doc, getDoc, updateDoc, arrayUnion, increment, deleteDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore'; // Import Firestore functions for database operations
import Icon from 'react-native-vector-icons/FontAwesome5'; // Import icon set for UI elements
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import for safe area padding
import { db, auth } from '../../../config/firebaseConfig'; // Import Firebase configuration
import LottieView from 'lottie-react-native';  // Import LottieView for animations
import { FadeIn, SlideInRight, SlideInDown, SlideOutDown } from 'react-native-reanimated'; // Import animations
import LoadingScreen from '../../../screens/loading/LoadingScreen'; // Import loading screen component
import OrbitLoader from '../../../components/ui/OrbitLoader'; // Import custom loader component
// Import useTextStyle hook
import { useTextStyle } from '../../../hooks/useTextStyle'; // Import custom hook for text styling

/**
 * CommunityPage Component
 * Displays a social feed of community posts with interactive features
 * Includes post listing, commenting, liking, and post creation
 * 
 * @param {Object} navigation - Navigation object for screen transitions
 * @returns {JSX.Element} Rendered CommunityPage component
 */
const CommunityPage = ({ navigation }) => {
    // State variables for managing posts and UI
    const [posts, setPosts] = useState([]); // Store fetched posts
    const [loading, setLoading] = useState(true); // Track initial loading state
    const [refreshing, setRefreshing] = useState(false); // Track pull-to-refresh state
    const [searchQuery, setSearchQuery] = useState(''); // Store search input
    const [commentTexts, setCommentTexts] = useState({}); // Store draft comments by post ID
    const [expandedPostId, setExpandedPostId] = useState(null); // Track which post is expanded
    const [replyToCommentId, setReplyToCommentId] = useState(null); // Track which comment is being replied to
    const [visibleOptions, setVisibleOptions] = useState(null); // Track which post has options menu open
    const [searchVisible, setSearchVisible] = useState(false); // Toggle search bar visibility
    const [scrollY] = useState(new Animated.Value(0)); // Track scroll position for animations
    
    const insets = useSafeAreaInsets(); // Get safe area insets for layout
    
    // Get text style settings and extract just the font family
    const textStyleSettings = useTextStyle();
    const fontStyle = useMemo(() => {
        const { fontFamily } = textStyleSettings;
        return { fontFamily };
    }, [textStyleSettings]);
    
    // Animation for the floating action button
    const fabAnim = useRef(new Animated.Value(0)).current; // Animation value for FAB
    const lastScrollY = useRef(0); // Reference to track last scroll position
    
    // Pagination and loading more content
    const [postsLimit, setPostsLimit] = useState(10); // Number of posts to fetch initially
    const [hasMorePosts, setHasMorePosts] = useState(true); // Track if more posts can be loaded
    const [loadingMore, setLoadingMore] = useState(false); // Track pagination loading state

    /**
     * Fetch posts from Firestore
     * Sets up a real-time listener for post updates
     * Handles pagination and loading states
     */
    const fetchPosts = useCallback(() => {
        setLoading(true);
        // Create query to fetch posts sorted by timestamp with pagination
        const postsQuery = query(
            collection(db, 'communityPosts'),
            orderBy('timestamp', 'desc'),
            limit(postsLimit)
        );
        
        // Set up real-time listener for post updates
        onSnapshot(postsQuery, (querySnapshot) => {
            const postsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                likes: doc.data().likes || 0,
                comments: doc.data().comments || []
            }));
            
            // Update state with fetched posts
            setPosts(postsList);
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
            
            // Check if we have more posts to load
            setHasMorePosts(querySnapshot.docs.length === postsLimit);
        });
    }, [postsLimit]);

    // Initial fetch on component mount
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    /**
     * Handle pull-to-refresh action
     * Resets pagination and fetches latest posts
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Reset to initial posts count when refreshing
        setPostsLimit(10);
        fetchPosts();
    }, [fetchPosts]);
    
    /**
     * Load more posts for infinite scrolling
     * Increases post limit to fetch next batch
     */
    const loadMorePosts = () => {
        if (hasMorePosts && !loadingMore) {
            setLoadingMore(true);
            setPostsLimit(prevLimit => prevLimit + 10);
        }
    };

    /**
     * Handle scroll events for hiding/showing the FAB
     * Uses Animated.event for performance and native driver
     */
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { 
            useNativeDriver: false,
            listener: event => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                if (currentScrollY > lastScrollY.current + 10) {
                    // Scrolling down - hide FAB
                    Animated.timing(fabAnim, {
                        toValue: 100,
                        duration: 300,
                        useNativeDriver: true,
                        easing: Easing.ease
                    }).start();
                } else if (currentScrollY < lastScrollY.current - 10) {
                    // Scrolling up - show FAB
                    Animated.timing(fabAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                        easing: Easing.ease
                    }).start();
                }
                lastScrollY.current = currentScrollY;
            }
        }
    );

    /**
     * Handle post liking with optimistic UI updates
     * Updates both local state and Firebase database
     * 
     * @param {string} postId - ID of the post to like/unlike
     */
    const handleLike = useCallback(async (postId) => {
        // Get current user email
        const userEmail = auth.currentUser?.email;
        if (!userEmail) return;
        
        // Find the post to update
        const postToUpdate = posts.find(post => post.id === postId);
        if (!postToUpdate) return;
        
        // Check if already liked
        const alreadyLiked = postToUpdate.likedUsers?.includes(userEmail);
        
        // Create animation for immediate feedback
        const scaleAnim = new Animated.Value(1);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
        
        // Update local state first with optimistic update
        setPosts(currentPosts => 
            currentPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
                        likedUsers: alreadyLiked 
                            ? post.likedUsers.filter(email => email !== userEmail)
                            : [...(post.likedUsers || []), userEmail],
                        likeAnimation: scaleAnim
                    };
                }
                return post;
            })
        );
        
        // Update in Firebase
        const postRef = doc(db, 'communityPosts', postId);
      
        try {
            // Use atomic update operations to avoid race conditions
            await updateDoc(postRef, {
                likes: alreadyLiked ? increment(-1) : increment(1),
                likedUsers: alreadyLiked ? arrayRemove(userEmail) : arrayUnion(userEmail)
            });
        } catch (error) {
            console.error('Error updating like:', error);
            // Revert changes if failed
            fetchPosts();
            Alert.alert("Error", "Failed to update like. Please try again.");
        }
    }, [posts]);

    /**
     * Handle adding comments to posts
     * Supports both top-level comments and replies
     * 
     * @param {string} postId - ID of the post to comment on
     * @param {string} commentText - Text content of the comment
     * @param {string|null} replyTo - ID of parent comment if this is a reply
     */
    const handleComment = async (postId, commentText, replyTo = null) => {
        if (!commentText.trim()) {
            // Don't submit empty comments
            return;
        }
        
        // Add loading indicator or disable button while submitting
        const postRef = doc(db, 'communityPosts', postId);
        try {
            await updateDoc(postRef, {
                comments: arrayUnion({ 
                    id: Math.random().toString(36).substr(2, 9), // Generate a unique ID
                    text: commentText, 
                    author: auth.currentUser.email, 
                    timestamp: new Date(), 
                    likes: 0, 
                    likedUsers: [],
                    replies: [], 
                    replyTo: replyTo 
                })
            });
            
            // Clear input
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
            setReplyToCommentId(null);
            
            // Show success feedback (toast or highlight)
        } catch (error) {
            console.error('Error adding comment:', error);
            // Show error feedback to user
        }
    };

    /**
     * Handle liking/unliking comments
     * Updates the comment's like count and liked users array
     * 
     * @param {string} postId - ID of the post containing the comment
     * @param {string} commentId - ID of the comment to like/unlike
     */
    const handleCommentLike = async (postId, commentId) => {
        const postRef = doc(db, 'communityPosts', postId);
        const userEmail = auth.currentUser?.email;
    
        try {
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
                const updatedComments = [...postDoc.data().comments];
                const commentIndex = updatedComments.findIndex(comment => comment.id === commentId);
                
                if (commentIndex === -1) return;
                
                const comment = updatedComments[commentIndex];
                const likedUsers = comment.likedUsers || [];
    
                if (likedUsers.includes(userEmail)) {
                    updatedComments[commentIndex] = {
                        ...comment,
                        likes: comment.likes - 1,
                        likedUsers: likedUsers.filter(email => email !== userEmail)
                    };
                } else {
                    updatedComments[commentIndex] = {
                        ...comment,
                        likes: (comment.likes || 0) + 1,
                        likedUsers: [...likedUsers, userEmail]
                    };
                }
    
                await updateDoc(postRef, { comments: updatedComments });
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    /**
     * Handle post deletion with confirmation
     * Displays alert dialog before deleting from Firebase
     * 
     * @param {string} postId - ID of the post to delete
     */
    const deletePost = async (postId) => {
        try {
            // Show confirmation dialog
            Alert.alert(
                "Delete Post",
                "Are you sure you want to delete this post? This action cannot be undone.",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    { 
                        text: "Delete", 
                        onPress: async () => {
                            // Add loading state
                            await deleteDoc(doc(db, 'communityPosts', postId));
                            // Show success message
                        },
                        style: "destructive"
                    }
                ]
            );
        } catch (error) {
            console.error('Error deleting post:', error);
            // Show error message
        }
    };

    /**
     * Handle sharing post content
     * Uses React Native Share API to open native share dialog
     * 
     * @param {Object} post - Post object to share
     */
    const handleShare = async (post) => {
        try {
            const postTitle = post.title || 'Check out this community post!';
            const postLink = `https://your-app.com/posts/${post.id}`;
            await Share.share({
                title: postTitle,
                message: `${postTitle}: ${postLink}`
            });
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    /**
     * Filter posts based on search query
     * Searches through title, content, and author fields
     * Memoized to prevent unnecessary recalculations
     */
    const filteredPosts = useMemo(() => {
        if (!searchQuery) return posts;
        
        return posts.filter(post =>
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [posts, searchQuery]);

    /**
     * Format timestamp into relative time (e.g., "2h ago")
     * Adapts display based on how long ago the event occurred
     * 
     * @param {Date|Object} timestamp - Firebase timestamp or Date object
     * @returns {string} Formatted relative time string
     */
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    };

    /**
     * Handle comment deletion with confirmation
     * Removes comment from the post's comments array
     * 
     * @param {string} postId - ID of the post containing the comment
     * @param {string} commentId - ID of the comment to delete
     */
    const deleteComment = async (postId, commentId) => {
        // Show confirmation dialog
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { 
                    text: "Delete", 
                    onPress: async () => {
                        try {
                            // Get current post data
                            const postRef = doc(db, 'communityPosts', postId);
                            const postDoc = await getDoc(postRef);
                            
                            if (postDoc.exists()) {
                                // Filter out the comment to delete
                                const updatedComments = postDoc.data().comments.filter(
                                    comment => comment.id !== commentId
                                );
                                
                                // Update the post with new comments array
                                await updateDoc(postRef, { comments: updatedComments });
                                
                                // Show success feedback
                                // Visual feedback handled by Firebase listener
                            }
                        } catch (error) {
                            console.error('Error deleting comment:', error);
                            Alert.alert("Error", "Failed to delete comment. Please try again.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    /**
     * Safely execute a callback after a delay, checking if component is still mounted
     * Prevents memory leaks and updates to unmounted components
     * 
     * @param {Function} callback - Function to execute after delay
     * @param {number} delay - Time to wait in milliseconds
     * @returns {number|null} Timeout ID or null if component unmounted
     */
    const safeTimeout = useCallback((callback, delay) => {
        if (!isMountedRef.current) return null;
        
        const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
                callback();
            }
        }, delay);
        
        return timeoutId;
    }, []);
    
    // Add a mounted ref to track component lifecycle
    const isMountedRef = useRef(true);
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Render a single comment with replies and actions
     * Supports replying, liking, and deleting comments
     * 
     * @param {Object} comment - Comment object to render
     * @param {string} postId - ID of the post containing the comment
     * @returns {JSX.Element} Rendered comment component
     */
    const renderComment = (comment, postId) => (
        <Animated.View 
            style={[styles.commentItem, { opacity: new Animated.Value(1) }]} 
            key={comment.id}
            entering={SlideInRight.duration(300)}
        >
            <View style={styles.commentHeader}>
                <Image 
                    source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=random` }} 
                    style={styles.commentAvatar} 
                />
                <View style={styles.commentMeta}>
                    <Text style={[styles.commentAuthor, fontStyle]}>{comment.author}</Text>
                    <Text style={[styles.commentTimestamp, fontStyle]}>{formatTimestamp(comment.timestamp)}</Text>
                </View>
            </View>
            
            <Text style={[styles.commentText, fontStyle]}>{comment.text}</Text>
            
            <View style={styles.commentActions}>
                <TouchableOpacity 
                    style={[
                        styles.commentAction,
                        comment.likedUsers?.includes(auth.currentUser?.email) && styles.commentActionActive
                    ]} 
                    onPress={() => handleCommentLike(postId, comment.id)}
                >
                    <Icon 
                        name="thumbs-up" 
                        size={14} 
                        color={comment.likedUsers?.includes(auth.currentUser?.email) ? "#0066FF" : "#666"} 
                    />
                    <Text 
                        style={[
                            styles.commentActionText,
                            comment.likedUsers?.includes(auth.currentUser?.email) && styles.commentActionTextActive,
                            fontStyle
                        ]}
                    >
                        {comment.likes || 0}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.commentAction} 
                    onPress={() => setReplyToCommentId(replyToCommentId === comment.id ? null : comment.id)}
                >
                    <Icon name="reply" size={14} color="#666" />
                    <Text style={[styles.commentActionText, fontStyle]}>Reply</Text>
                </TouchableOpacity>
                
                {comment.author === auth.currentUser?.email && (
                    <TouchableOpacity 
                        style={styles.commentAction}
                        onPress={() => deleteComment(postId, comment.id)}
                    >
                        <Icon name="trash-alt" size={14} color="#FF3B30" />
                        <Text style={[styles.commentActionText, {color: '#FF3B30'}, fontStyle]}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {replyToCommentId === comment.id && (
                <Animated.View 
                    style={styles.replyInputContainer}
                    entering={SlideInDown.duration(200)}
                    exiting={SlideOutDown.duration(200)}
                >
                    <Image 
                        source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.currentUser?.email)}&background=random` }} 
                        style={styles.replyAvatar} 
                    />
                    <TextInput
                        style={[styles.replyInput, fontStyle]}
                        placeholder="Reply to comment..."
                        value={commentTexts[postId] || ''}
                        onChangeText={(text) => setCommentTexts(prev => ({ ...prev, [postId]: text }))}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[
                            styles.replyButton,
                            !commentTexts[postId]?.trim() && styles.replyButtonDisabled
                        ]} 
                        onPress={() => handleComment(postId, commentTexts[postId], comment.id)}
                        disabled={!commentTexts[postId]?.trim()}
                    >
                        <Icon name="paper-plane" size={16} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
            )}
            
            {comment.replies && comment.replies.map(reply => renderComment(reply, postId))}
        </Animated.View>
    );

    /**
     * Render an individual post item for the FlatList
     * Includes post content, author info, and interaction buttons
     * 
     * @param {Object} item - Post object to render
     * @param {number} index - Index of the post in the list
     * @returns {JSX.Element} Rendered post item component
     */
    const renderItem = ({ item, index }) => {
        const userEmail = auth.currentUser?.email;
        const isPostOwner = userEmail === item.author;
        const isExpanded = expandedPostId === item.id;
        const isLiked = item.likedUsers?.includes(userEmail);

        return (
            <Animated.View 
                style={[styles.postCard, { 
                    transform: [{ scale: new Animated.Value(1) }]
                }]}
                entering={FadeIn.duration(300).delay(index * 50)}
            >
                <View style={styles.cardHeader}>
                    <Image
                        source={{ 
                            uri: item.avatar || 
                                 `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author)}&background=random` 
                        }}
                        style={styles.avatar}
                    />
                    <View style={styles.authorInfo}>
                        <Text style={[styles.postAuthor, fontStyle]}>{item.author}</Text>
                        <Text style={[styles.postTimestamp, fontStyle]}>{formatTimestamp(item.timestamp)}</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.moreButton} 
                        onPress={() => setVisibleOptions(visibleOptions === item.id ? null : item.id)}
                    >
                        <Icon name="ellipsis-h" size={18} color="#666" />
                    </TouchableOpacity>
                    
                    {visibleOptions === item.id && (
                        <Animated.View 
                            style={styles.optionsMenu}
                            entering={FadeIn.duration(200)}
                        >
                            {isPostOwner && (
                                <TouchableOpacity 
                                    style={styles.optionItem} 
                                    onPress={() => {
                                        setVisibleOptions(null);
                                        deletePost(item.id);
                                    }}
                                >
                                    <Icon name="trash-alt" size={16} color="#FF3B30" />
                                    <Text style={[styles.optionText, { color: '#FF3B30' }, fontStyle]}>Delete</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity 
                                style={styles.optionItem}
                                onPress={() => {
                                    setVisibleOptions(null);
                                    handleShare(item);
                                }}
                            >
                                <Icon name="share" size={16} color="#007AFF" />
                                <Text style={[styles.optionText, fontStyle]}>Share</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.optionItem}
                                onPress={() => {
                                    setVisibleOptions(null);
                                }}
                            >
                                <Icon name="flag" size={16} color="#FF9500" />
                                <Text style={[styles.optionText, fontStyle]}>Report</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>

                <Text style={[styles.postTitle, fontStyle]}>{item.title}</Text>
                
                <TouchableOpacity 
                    onPress={() => setExpandedPostId(isExpanded ? null : item.id)}
                    activeOpacity={0.8}
                >
                    <Text 
                        style={[styles.postContent, fontStyle]} 
                        numberOfLines={isExpanded ? undefined : 3}
                    >
                        {item.content}
                    </Text>
                    
                    {!isExpanded && item.content.length > 120 && (
                        <Text style={[styles.readMore, fontStyle]}>Read more</Text>
                    )}
                </TouchableOpacity>

                {item.imageUrl && (
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('FullScreenImage', { uri: item.imageUrl })}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}

                <View style={styles.interactionStats}>
                    <View style={styles.statItem}>
                        <Icon name="thumbs-up" size={14} color="#666" />
                        <Text style={[styles.statsText, fontStyle]}>{item.likes}</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                        <Icon name="comment" size={14} color="#666" />
                        <Text style={[styles.statsText, fontStyle]}>{item.comments?.length || 0}</Text>
                    </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.postFooter}>
                    <TouchableOpacity
                        style={[styles.interactionButton, isLiked && styles.interactionButtonActive]}
                        onPress={() => handleLike(item.id)}
                    >
                        <Icon 
                            name="thumbs-up" 
                            size={16} 
                            color={isLiked ? "#0066FF" : "#666"} 
                            solid={isLiked}
                        />
                        <Text style={[
                            styles.interactionText, 
                            isLiked && styles.interactionTextActive,
                            fontStyle
                        ]}>
                            {isLiked ? 'Liked' : 'Like'}
                        </Text>
                    </TouchableOpacity>

                    {/* Fix broken TouchableOpacity structure */}
                    <TouchableOpacity
                        style={styles.interactionButton}
                        onPress={() => setExpandedPostId(isExpanded ? null : item.id)}
                    >
                        <Icon name="comment" size={16} color="#666" />
                        <Text style={[styles.interactionText, fontStyle]}>Comment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.interactionButton}
                        onPress={() => handleShare(item)}
                    >
                        <Icon name="share" size={16} color="#666" />
                        <Text style={[styles.interactionText, fontStyle]}>Share</Text>
                    </TouchableOpacity>
                </View>

                {isExpanded && (
                    <Animated.View 
                        style={styles.expandedContent}
                        entering={SlideInDown.duration(300)}
                    >
                        <View style={styles.commentSection}>
                            <Image 
                                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.currentUser?.email)}&background=random` }} 
                                style={styles.commentInputAvatar} 
                            />
                            <View style={styles.commentInputContainer}>
                                <TextInput
                                    style={[styles.commentInput, fontStyle]}
                                    placeholder="Add a comment..."
                                    value={commentTexts[item.id] || ''}
                                    onChangeText={(text) => setCommentTexts(prev => ({ ...prev, [item.id]: text }))}
                                    multiline
                                />
                                <TouchableOpacity 
                                    style={[
                                        styles.sendButton,
                                        !commentTexts[item.id]?.trim() && styles.sendButtonDisabled
                                    ]} 
                                    onPress={() => handleComment(item.id, commentTexts[item.id])}
                                    disabled={!commentTexts[item.id]?.trim()}
                                >
                                    <Icon name="paper-plane" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={styles.commentsContainer}>
                            {item.comments && item.comments.length > 0 ? (
                                item.comments.map(comment => renderComment(comment, item.id))
                            ) : (
                                <View style={styles.noCommentsContainer}>
                                    <Icon name="comments" size={40} color="#ddd" />
                                    <Text style={[styles.noCommentsText, fontStyle]}>No comments yet</Text>
                                    <Text style={[styles.noCommentsSubtext, fontStyle]}>Be the first to comment</Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                )}
            </Animated.View>
        );
    };

    // Main component render
    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            {/* Status bar configuration */}
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header with back button, title and search toggle */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, fontStyle]}>Community</Text>
                <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
                    <Icon name="search" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Animated search bar that slides in/out */}
            <Animated.View 
                style={[
                    styles.searchContainer,
                    {
                        maxHeight: searchVisible ? 60 : 0,
                        opacity: searchVisible ? 1 : 0,
                        overflow: 'hidden'
                    }
                ]}
            >
                <Icon name="search" size={16} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, fontStyle]}
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                    autoFocus={searchVisible}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="times" size={16} color="#999" />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* Show loading screen or post list */}
            {loading ? (
                <LoadingScreen message="Loading community posts..." />
            ) : (
                <FlatList
                    data={filteredPosts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="transparent"
                            colors={["transparent"]}
                            style={{ backgroundColor: 'transparent' }}
                            progressViewOffset={20}
                            progressBackgroundColor="transparent"
                            renderToHardwareTextureAndroid
                            title=""
                        />
                    }
                    ListHeaderComponent={refreshing ? (
                        <View style={styles.pullToRefresh}>
                            <OrbitLoader size={30} color="#0066FF" />
                        </View>
                    ) : null}
                    onEndReached={loadMorePosts}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.loadingMoreContainer}>
                                <OrbitLoader size={30} color="#666" />
                                <Text style={[styles.loadingMoreText, fontStyle]}>Loading more posts...</Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <LottieView
                                source={{ uri: 'https://assets2.lottiefiles.com/packages/lf20_jyav9bkw.json' }}  // Example of an online Lottie file
                                autoPlay
                                loop
                                style={{ width: 150, height: 150 }}
                            />
                            <Text style={[styles.emptyText, fontStyle]}>
                                {searchQuery ? 'No posts match your search' : 'No posts yet'}
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => (searchQuery ? setSearchQuery('') : navigation.navigate('CreatePost'))}
                            >
                                <Text style={[styles.emptyButtonText, fontStyle]}>
                                    {searchQuery ? 'Clear Search' : 'Create the first post'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Floating action button for creating new posts */}
            <Animated.View
                style={[
                    styles.fab,
                    {
                        transform: [
                            { translateY: fabAnim }
                        ]
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.fabButton}
                    onPress={() => navigation.navigate('CreatePost')}
                    activeOpacity={0.8}
                >
                    <Icon name="pen" size={20} color="#fff" />
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

export default CommunityPage;

// StyleSheet for component styling - keeping intact
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  // Modern post card styling
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  
  // Enhanced comment section
  commentItem: {
    marginBottom: 16,
    paddingBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  
  // Better visual hierarchy for comments
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  // Enhanced buttons & interactions
  interactionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginHorizontal: 4,
  },
  interactionButtonActive: {
    backgroundColor: 'rgba(0,102,255,0.1)',
  },
  interactionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  interactionTextActive: {
    color: '#0066FF',
  },
  
  // Improved FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  // Better form inputs
  commentInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  
  // The rest of your styles...
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 9,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 80,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  postTimestamp: {
    fontSize: 13,
    color: '#777',
    marginTop: 1,
  },
  optionsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066FF',
    marginTop: -5,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 8,
  },
  interactionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statsText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 10,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeInteractionText: {
    color: '#0066FF',
  },
  expandedContent: {
    marginTop: 16,
  },
  commentsHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    color: '#333',
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(0,102,255,0.5)',
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  commentAuthorContainer: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#777',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
  },
  commentActionText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 4,
  },
  activeActionText: {
    color: '#0066FF',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 8,
    marginTop: 10,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
    color: '#333',
  },
  replyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  menuContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  deleteMenuItem: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: '#ff3b30',
  },
  menuCancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 8,
  },
  menuCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066FF',
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    color: '#666',
  },
});