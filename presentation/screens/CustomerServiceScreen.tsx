import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { useCustomerServiceViewModel } from '../viewmodels/useCustomerServiceViewModel';
import { Inquiry, InquiryCategory } from '../../domain/entities/Inquiry';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const MAIN_COLOR = '#FFA847';

const CATEGORY_DATA = [
    { label: '계정 관련', value: 'ACCOUNT' },
    { label: '버그 신고', value: 'BUG' },
    { label: '부적절한 콘텐츠', value: 'INAPPROPRIATE' },
    { label: '기타', value: 'OTHER' },
];

const CustomerServiceScreen = () => {
    const navigation = useNavigation();
    const {
        inquiries,
        loading,
        refreshing,
        category,
        title,
        content,
        selectedImages,
        setCategory,
        setTitle,
        setContent,
        fetchInquiries,
        submitInquiry,
        deleteInquiry,
        pickImage,
        removeImage,
        onRefresh,
    } = useCustomerServiceViewModel();

    const [activeTab, setActiveTab] = useState<'LIST' | 'WRITE'>('LIST');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleSubmit = () => {
        submitInquiry(() => setActiveTab('LIST'));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>고객센터</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'LIST' && styles.activeTabItem]}
                    onPress={() => setActiveTab('LIST')}
                >
                    <Text style={[styles.tabText, activeTab === 'LIST' && styles.activeTabText]}>
                        내 문의 내역
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'WRITE' && styles.activeTabItem]}
                    onPress={() => setActiveTab('WRITE')}
                >
                    <Text style={[styles.tabText, activeTab === 'WRITE' && styles.activeTabText]}>
                        1:1 문의하기
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {activeTab === 'LIST' ? (
                    <InquiryList
                        inquiries={inquiries}
                        loading={loading}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        onDelete={deleteInquiry}
                    />
                ) : (
                    <InquiryWrite
                        category={category}
                        title={title}
                        content={content}
                        selectedImages={selectedImages}
                        setCategory={setCategory}
                        setTitle={setTitle}
                        setContent={setContent}
                        pickImage={pickImage}
                        removeImage={removeImage}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

// --- Sub Components ---

const InquiryList = ({ inquiries, loading, refreshing, onRefresh, onDelete }: any) => {
    if (loading && inquiries.length === 0) {
        return <ActivityIndicator size="large" color={MAIN_COLOR} style={{ marginTop: 50 }} />;
    }

    if (inquiries.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="document-text-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>문의 내역이 없습니다.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={inquiries}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <InquiryItem item={item} onDelete={onDelete} />}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
    );
};

const InquiryItem = ({ item, onDelete }: { item: Inquiry; onDelete: (id: number) => void }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const getCategoryLabel = (cat: string) => {
        const found = CATEGORY_DATA.find(c => c.value === cat);
        return found ? found.label : cat;
    };

    return (
        <View style={styles.itemCard}>
            <TouchableOpacity onPress={toggleExpand} style={styles.itemHeader}>
                <View style={styles.itemHeaderTop}>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.statusBadge, item.status === 'ANSWERED' ? styles.statusAnswered : styles.statusPending]}>
                            <Text style={[styles.statusText, item.status === 'ANSWERED' ? styles.statusTextAnswered : styles.statusTextPending]}>
                                {item.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                            </Text>
                        </View>
                        <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
                    </View>
                    <Text style={styles.dateText}>{item.createdAt.split('T')[0]}</Text>
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Icon 
                    name={expanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#999" 
                    style={{ position: 'absolute', right: 0, bottom: 10 }}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.itemBody}>
                    <Text style={styles.questionLabel}>Q. 질문 내용</Text>
                    <Text style={styles.contentText}>{item.userContent}</Text>
                    
                    {item.images && item.images.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                            {item.images.map((img, idx) => (
                                <Image key={idx} source={{ uri: img }} style={styles.detailImage} />
                            ))}
                        </ScrollView>
                    )}

                    <View style={styles.divider} />

                    {item.adminContent ? (
                        <View style={styles.adminResponse}>
                            <Text style={styles.adminLabel}>A. 답변 내용</Text>
                            <Text style={styles.contentText}>{item.adminContent}</Text>
                        </View>
                    ) : (
                        <Text style={styles.waitingText}>관리자의 답변을 기다리고 있습니다.</Text>
                    )}

                    <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>삭제하기</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const InquiryWrite = ({
    category, title, content, selectedImages,
    setCategory, setTitle, setContent, pickImage, removeImage, onSubmit, loading
}: any) => {
    return (
        <ScrollView contentContainerStyle={styles.writeContainer}>
            <Text style={styles.label}>카테고리</Text>
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={CATEGORY_DATA}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="문의 유형을 선택해주세요"
                value={category}
                onChange={item => setCategory(item.value)}
            />

            <Text style={styles.label}>제목</Text>
            <TextInput
                style={styles.input}
                placeholder="제목을 입력해주세요"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>내용</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="문의하실 내용을 자세히 적어주세요."
                multiline
                numberOfLines={6}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
            />

            <Text style={styles.label}>사진 첨부 (선택)</Text>
            <View style={styles.imageAttachContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.addImageButton}>
                    <Icon name="camera-outline" size={24} color="#666" />
                    <Text style={styles.addImageText}>{selectedImages.length}/3</Text>
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedImages.map((img: any, index: number) => (
                        <View key={index} style={styles.previewImageContainer}>
                            <Image source={{ uri: img.uri }} style={styles.previewImage} />
                            <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeImageButton}>
                                <Icon name="close-circle" size={20} color="#ff4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={onSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>문의하기</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    
    // Tabs
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabItem: {
        borderBottomColor: MAIN_COLOR,
    },
    tabText: {
        fontSize: 15,
        color: '#999',
        fontWeight: '600',
    },
    activeTabText: {
        color: MAIN_COLOR,
        fontWeight: '700',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },

    // List
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
        fontSize: 15,
    },
    itemCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        padding: 16,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemHeader: {
        // clickable area
    },
    itemHeaderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginRight: 8,
    },
    statusPending: { backgroundColor: '#f0f0f0' },
    statusAnswered: { backgroundColor: '#E8F5E9' },
    statusText: { fontSize: 11, fontWeight: '700' },
    statusTextPending: { color: '#666' },
    statusTextAnswered: { color: '#4CAF50' },
    categoryText: { fontSize: 12, color: '#888' },
    dateText: { fontSize: 12, color: '#aaa' },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#333', paddingRight: 20 },
    
    itemBody: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 16,
    },
    questionLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 6 },
    contentText: { fontSize: 14, color: '#444', lineHeight: 20 },
    imageScroll: { marginTop: 10 },
    detailImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 16 },
    adminResponse: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8 },
    adminLabel: { fontSize: 14, fontWeight: '700', color: MAIN_COLOR, marginBottom: 6 },
    waitingText: { fontSize: 13, color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    deleteButton: { alignSelf: 'flex-end', marginTop: 12 },
    deleteButtonText: { color: '#ff4444', fontSize: 12, textDecorationLine: 'underline' },

    // Write Form
    writeContainer: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#ddd',
        color: '#000',
    },
    textArea: { height: 120 },
    dropdown: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    placeholderStyle: { fontSize: 14, color: '#999' },
    selectedTextStyle: { fontSize: 14, color: '#333' },
    
    imageAttachContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    addImageButton: {
        width: 70, height: 70,
        backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10,
    },
    addImageText: { fontSize: 10, color: '#666', marginTop: 2 },
    previewImageContainer: { marginRight: 10, position: 'relative' },
    previewImage: { width: 70, height: 70, borderRadius: 8 },
    removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 10 },
    
    submitButton: {
        backgroundColor: MAIN_COLOR,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    submitButtonDisabled: { backgroundColor: '#ccc' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default CustomerServiceScreen;
