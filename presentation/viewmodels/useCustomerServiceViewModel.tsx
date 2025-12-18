import { useState, useCallback } from 'react';
import { CreateInquiryUseCase } from '../../domain/usecases/CreateInquiryUseCase';
import { GetInquiriesUseCase } from '../../domain/usecases/GetInquiriesUseCase';
import { DeleteInquiryUseCase } from '../../domain/usecases/DeleteInquiryUseCase';
import { InquiryRepositoryImpl } from '../../data/repositoriesImpl/InquiryRepositoryImpl';
import { Inquiry, InquiryCategory, InquiryCreatePayload } from '../../domain/entities/Inquiry';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAlert } from '../../context/AlertContext';

export const useCustomerServiceViewModel = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 문의 작성 관련 상태
    const [category, setCategory] = useState<InquiryCategory>('OTHER');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedImages, setSelectedImages] = useState<any[]>([]);

    const createUseCase = new CreateInquiryUseCase(InquiryRepositoryImpl);
    const getUseCase = new GetInquiriesUseCase(InquiryRepositoryImpl);
    const deleteUseCase = new DeleteInquiryUseCase(InquiryRepositoryImpl);

    const { showAlert } = useAlert();

    // 문의 목록 조회
    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUseCase.execute();
            // 최신순 정렬 (ID 내림차순 or createdAt 내림차순)
            const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInquiries(sortedData);
        } catch (error) {
            console.error("fetchInquiries error:", error);
            showAlert({ title: "오류", message: "문의 내역을 불러오는데 실패했습니다." });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // 문의 작성
    const submitInquiry = async (onSuccess: () => void) => {
        if (!title.trim() || !content.trim()) {
            showAlert({ title: "알림", message: "제목과 내용을 입력해주세요." });
            return;
        }

        setLoading(true);
        try {
            const payload: InquiryCreatePayload = {
                category,
                title,
                content,
                files: selectedImages,
            };

            await createUseCase.execute(payload);
            showAlert({ title: "성공", message: "문의가 등록되었습니다." });
            
            // 입력 필드 초기화
            setTitle('');
            setContent('');
            setSelectedImages([]);
            setCategory('OTHER');
            
            onSuccess(); // 탭 이동 등 후처리
            fetchInquiries(); // 목록 갱신

        } catch (error) {
            console.error("submitInquiry error:", error);
            showAlert({ title: "오류", message: "문의 등록에 실패했습니다." });
        } finally {
            setLoading(false);
        }
    };

    // 문의 삭제
    const deleteInquiry = async (id: number) => {
        showAlert({
            title: "삭제 확인",
            message: "정말로 이 문의를 삭제하시겠습니까?",
            confirmText: "삭제",
            cancelText: "취소",
            showCancel: true,
            onConfirm: async () => {
                try {
                    await deleteUseCase.execute(id);
                    // 로컬 상태에서 즉시 제거 (UX 향상)
                    setInquiries(prev => prev.filter(i => i.id !== id));
                    showAlert({ title: "알림", message: "삭제되었습니다." });
                } catch (error) {
                    showAlert({ title: "오류", message: "삭제에 실패했습니다." });
                }
            }
        });
    };

    // 이미지 선택
    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 3, // 최대 3장
        });

        if (result.assets) {
            setSelectedImages([...selectedImages, ...result.assets]);
        }
    };

    // 이미지 삭제 (작성 중)
    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchInquiries();
    };

    return {
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
    };
};
