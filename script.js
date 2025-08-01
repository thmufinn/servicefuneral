// DOM 요소들
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imageGallery = document.getElementById('imageGallery');
const funeralPrepBtn = document.getElementById('funeralPrepBtn');
const metalDoor = document.getElementById('metalDoor');
const mainContent = document.getElementById('mainContent');
const musicToggle = document.getElementById('musicToggle');

// 이미지 업로드 관련 변수
let uploadedImages = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    
    // 새로고침 시 이전 이미지 삭제 및 업로드 영역 초기화
    clearAllImages();
    
    // 업로드 영역이 확실히 표시되도록 강제 업데이트
    setTimeout(() => {
        updateUploadArea();
        // 추가로 업로드 영역 강제 표시
        uploadArea.style.display = 'block';
        uploadArea.style.visibility = 'visible';
        uploadArea.style.opacity = '1';
    }, 100);
});

// 페이지를 떠날 때 이미지 정리
window.addEventListener('beforeunload', function() {
    clearAllImages();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 파일 선택 시
    imageInput.addEventListener('change', handleImageUpload);

    // 드래그 앤 드롭 이벤트
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // 장례준비 버튼 클릭
    funeralPrepBtn.addEventListener('click', handleFuneralPrep);

    // 철문 클릭 시 원래 상태로 복원
    metalDoor.addEventListener('click', resetDoor);
    
    // 음악 컨트롤
    musicToggle.addEventListener('click', toggleMusic);
    
    // 사용자 상호작용 감지 (모바일 오디오 활성화용)
    const userInteractionHandler = function() {
        if (window.funeralMusic) {
            window.funeralMusic.markUserInteraction();
        }
        // 한 번만 실행되도록 이벤트 리스너 제거
        document.removeEventListener('click', userInteractionHandler);
        document.removeEventListener('touchstart', userInteractionHandler);
    };
    
    document.addEventListener('click', userInteractionHandler);
    document.addEventListener('touchstart', userInteractionHandler);
}

// 이미지 업로드 처리
function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                // 파일 크기 체크 (5MB 제한으로 더 보수적으로 설정)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`파일이 너무 큽니다: ${file.name}\n5MB 이하의 이미지를 선택해주세요.`);
                    return;
                }
                compressAndAddImage(file);
            }
        });
        // 파일 입력 초기화
        event.target.value = '';
    }
}

// 드래그 오버 처리
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// 드래그 리브 처리
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// 드롭 처리
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                // 파일 크기 체크 (5MB 제한으로 더 보수적으로 설정)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`파일이 너무 큽니다: ${file.name}\n5MB 이하의 이미지를 선택해주세요.`);
                    return;
                }
                compressAndAddImage(file);
            }
        });
    }
}

// 이미지를 갤러리에 추가
function addImageToGallery(file) {
    // 이미지 압축 및 최적화
    compressAndAddImage(file);
}

// 이미지 압축 및 추가
function compressAndAddImage(file) {
    // 먼저 원본 이미지를 안전하게 로드
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const originalDataUrl = e.target.result;
        
        // 원본 이미지로 테스트
        const testImg = new Image();
        testImg.onload = function() {
            // 원본이 정상적으로 로드되면 압축 시도
            tryCompressImage(file, originalDataUrl, testImg);
        };
        testImg.onerror = function() {
            console.error('원본 이미지 로드 실패:', file.name);
            alert('이미지 파일이 손상되었습니다: ' + file.name);
        };
        testImg.src = originalDataUrl;
    };
    
    reader.onerror = function() {
        console.error('파일 읽기 실패:', file.name);
        alert('파일을 읽을 수 없습니다: ' + file.name);
    };
    
    reader.readAsDataURL(file);
}

// 이미지 압축 시도
function tryCompressImage(file, originalDataUrl, originalImg) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 더 보수적인 크기 제한 (500px)
    const maxSize = 500;
    let { width, height } = originalImg;
    
    // 비율 유지하면서 크기 조정
    if (width > height) {
        if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
        }
    } else {
        if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
        }
    }
    
    // 최소 크기 보장
    if (width < 100) width = 100;
    if (height < 100) height = 100;
    
    // 캔버스 설정
    canvas.width = width;
    canvas.height = height;
    
    // 고품질 렌더링 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    try {
        // 이미지 그리기
        ctx.drawImage(originalImg, 0, 0, width, height);
        
        // 압축 시도 (더 높은 품질로)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        // 압축된 데이터 유효성 검사
        if (compressedDataUrl && compressedDataUrl.length > 100) {
            // 압축된 이미지 테스트
            const testCompressed = new Image();
            testCompressed.onload = function() {
                addImageData({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    src: compressedDataUrl,
                    originalSize: file.size,
                    compressedSize: compressedDataUrl.length,
                    type: 'image/jpeg',
                    width: width,
                    height: height
                });
            };
            testCompressed.onerror = function() {
                console.warn('압축된 이미지 로드 실패, 원본 사용:', file.name);
                // 압축 실패 시 원본 사용
                addImageData({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    src: originalDataUrl,
                    originalSize: file.size,
                    compressedSize: originalDataUrl.length,
                    type: file.type || 'image/jpeg',
                    width: originalImg.width,
                    height: originalImg.height
                });
            };
            testCompressed.src = compressedDataUrl;
        } else {
            throw new Error('압축된 데이터가 유효하지 않음');
        }
        
    } catch (error) {
        console.warn('이미지 압축 실패, 원본 사용:', error);
        // 압축 실패 시 원본 사용
        addImageData({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            src: originalDataUrl,
            originalSize: file.size,
            compressedSize: originalDataUrl.length,
            type: file.type || 'image/jpeg',
            width: originalImg.width,
            height: originalImg.height
        });
    } finally {
        // 메모리 정리
        canvas.width = 0;
        canvas.height = 0;
    }
}

// 이미지 데이터 추가 (공통 함수)
function addImageData(imageData) {
    // 데이터 유효성 검사
    if (!imageData || !imageData.src || !imageData.id || !imageData.name) {
        console.error('이미지 데이터가 유효하지 않습니다:', imageData);
        return;
    }
    
    // Base64 데이터 URL 형식 검사
    if (!imageData.src.startsWith('data:image/')) {
        console.error('잘못된 이미지 형식:', imageData.name);
        return;
    }
    
    // 데이터 크기 체크 (1.5MB 제한으로 더 보수적으로 설정)
    if (imageData.src.length > 1.5 * 1024 * 1024) {
        alert('이미지가 너무 큽니다. 더 작은 이미지를 선택해주세요.');
        return;
    }
    
    // 중복 ID 체크
    const existingIndex = uploadedImages.findIndex(img => img.id === imageData.id);
    if (existingIndex !== -1) {
        console.warn('중복된 이미지 ID:', imageData.id);
        imageData.id = Date.now() + Math.random().toString(36).substr(2, 9);
    }
    
    uploadedImages.push(imageData);
    createImageElement(imageData);
    saveImagesToStorage();
    updateUploadArea();
}

// 이미지 요소 생성
function createImageElement(imageData) {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.dataset.id = imageData.id;
    
    imageItem.innerHTML = `
        <img src="${imageData.src}" alt="${imageData.name}" loading="lazy">
        <button class="remove-btn" onclick="removeImage('${imageData.id}')">×</button>
    `;
    
    // 이미지 로드 에러 처리
    const imgElement = imageItem.querySelector('img');
    imgElement.addEventListener('error', function() {
        console.error('이미지 로드 실패:', imageData.name);
        this.style.display = 'none';
        imageItem.innerHTML += '<div class="image-error">이미지를 불러올 수 없습니다</div>';
    });
    
    imageGallery.appendChild(imageItem);
    
    // 이미지 로드 애니메이션
    setTimeout(() => {
        imageItem.style.opacity = '1';
        imageItem.style.transform = 'scale(1)';
    }, 100);
}

// 이미지 제거
function removeImage(imageId) {
    uploadedImages = uploadedImages.filter(img => img.id !== imageId);
    const imageElement = document.querySelector(`[data-id="${imageId}"]`);
    
    if (imageElement) {
        // 이미지 삭제 애니메이션
        imageElement.style.transition = 'all 0.4s ease';
        imageElement.style.transform = 'scale(0.8) translateY(-20px)';
        imageElement.style.opacity = '0';
        
        setTimeout(() => {
            imageElement.remove();
            saveImagesToStorage();
            updateUploadArea();
        }, 400);
    }
}

// 업로드 영역 업데이트
function updateUploadArea() {
    if (uploadedImages.length > 0) {
        uploadArea.style.display = 'none';
        uploadArea.style.visibility = 'hidden';
    } else {
        uploadArea.style.display = 'block';
        uploadArea.style.visibility = 'visible';
        uploadArea.style.opacity = '1';
        uploadArea.style.transform = 'translateY(0)';
        uploadArea.style.transition = 'all 0.3s ease';
    }
}

// 로컬 스토리지에 이미지 저장
function saveImagesToStorage() {
    try {
        // 이미지 데이터 검증 및 정리 (더 엄격한 검증)
        const cleanedImages = uploadedImages.filter(img => {
            return img && 
                   img.src && 
                   img.src.startsWith('data:image/') && 
                   img.src.length > 100 &&
                   img.id && 
                   img.name;
        }).map(img => ({
            id: img.id,
            name: img.name,
            src: img.src,
            type: img.type || 'image/jpeg',
            width: img.width || 0,
            height: img.height || 0
        }));
        
        if (cleanedImages.length === 0) {
            console.warn('저장할 유효한 이미지가 없습니다.');
            return;
        }
        
        const dataToSave = JSON.stringify(cleanedImages);
        
        // LocalStorage 용량 체크 (2MB 제한으로 더 보수적으로 설정)
        if (dataToSave.length > 2 * 1024 * 1024) {
            console.warn('이미지 데이터가 너무 큽니다. 일부 이미지를 제거하세요.');
            alert('이미지가 너무 많습니다. 일부 이미지를 제거해주세요.');
            return;
        }
        
        localStorage.setItem('funeralServiceImages', dataToSave);
        console.log('이미지 저장 완료:', cleanedImages.length, '개');
    } catch (error) {
        console.warn('이미지 저장 중 오류가 발생했습니다:', error);
        
        // LocalStorage 용량 부족 시 오래된 데이터 정리
        if (error.name === 'QuotaExceededError') {
            alert('저장 공간이 부족합니다. 일부 이미지를 제거해주세요.');
            cleanupOldStorageData();
        }
    }
}

// 오래된 저장 데이터 정리
function cleanupOldStorageData() {
    try {
        // tempSharedImages로 시작하는 키들 찾기
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tempSharedImages_')) {
                keysToRemove.push(key);
            }
        }
        
        // 오래된 임시 데이터 삭제
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('오래된 임시 데이터 정리 완료:', keysToRemove.length, '개');
    } catch (error) {
        console.warn('데이터 정리 중 오류:', error);
    }
}

// 음악 토글
async function toggleMusic() {
    try {
        // 사용자 상호작용 감지
        if (window.funeralMusic) {
            window.funeralMusic.markUserInteraction();
        }
        
        const isPlaying = await window.funeralMusic.toggle();
        if (isPlaying) {
            musicToggle.textContent = '🔊';
            musicToggle.classList.add('playing');
        } else {
            musicToggle.textContent = '🔇';
            musicToggle.classList.remove('playing');
        }
    } catch (error) {
        console.error('음악 토글 실패:', error);
        alert('음악 재생에 실패했습니다. 다시 시도해주세요.');
    }
}





// 모든 이미지 지우기
function clearAllImages() {
    uploadedImages = [];
    imageGallery.innerHTML = '';
    localStorage.removeItem('funeralServiceImages');
    
    // 업로드 영역 강제 표시
    uploadArea.style.display = 'block';
    uploadArea.style.opacity = '1';
    uploadArea.style.transform = 'translateY(0)';
    uploadArea.style.transition = 'all 0.3s ease';
    
    updateUploadArea();
}

// 로컬 스토리지에서 이미지 로드
function loadSavedImages() {
    try {
        const savedImages = localStorage.getItem('funeralServiceImages');
        if (savedImages) {
            uploadedImages = JSON.parse(savedImages);
            uploadedImages.forEach(imageData => {
                createImageElement(imageData);
            });
            updateUploadArea();
        }
    } catch (error) {
        console.warn('저장된 이미지 로드 중 오류가 발생했습니다:', error);
    }
}





// 장례준비 버튼 처리
async function handleFuneralPrep() {
    // 이미지가 없으면 알림
    if (uploadedImages.length === 0) {
        alert('먼저 이미지를 업로드해주세요.');
        return;
    }
    
    // 버튼 비활성화
    funeralPrepBtn.disabled = true;
    funeralPrepBtn.textContent = '준비 중...';
    
    try {
        // 사용자 상호작용 감지
        if (window.funeralMusic) {
            window.funeralMusic.markUserInteraction();
        }
        
        // 음악 재생
        const musicSuccess = await window.funeralMusic.createFuneralMusic();
        if (musicSuccess) {
            musicToggle.textContent = '🔊';
            musicToggle.classList.add('playing');
        }
    } catch (error) {
        console.error('음악 재생 실패:', error);
        // 음악 재생에 실패해도 계속 진행
    }
    
    // 1초 후 철문 애니메이션 시작
    setTimeout(() => {
        startDoorAnimation();
    }, 1000);
}

// 철문 애니메이션 시작
function startDoorAnimation() {
    // 이미지 갤러리 영역으로 스크롤
    const imageGallery = document.getElementById('imageGallery');
    if (imageGallery && imageGallery.children.length > 0) {
        imageGallery.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    // 1초 후 철문 내리기
    setTimeout(() => {
        metalDoor.classList.add('door-down');
        
        // 철문이 완전히 내려온 후 텍스트 변경
        setTimeout(() => {
            const doorText = metalDoor.querySelector('.door-text');
            doorText.innerHTML = '<div class="text-line">장례 준비를</div><div class="text-line">시작합니다</div>';
            doorText.style.fontSize = '1.2rem';
        }, 25000);
        
    }, 1000);
}

// 철문 리셋
function resetDoor() {
    metalDoor.classList.remove('door-down');
    
    setTimeout(() => {
        funeralPrepBtn.disabled = false;
        funeralPrepBtn.textContent = '장례준비';
        
        const doorText = metalDoor.querySelector('.door-text');
        doorText.innerHTML = '<div class="text-line">그동안 감사했습니다.</div>';
        doorText.style.fontSize = '2.5rem';
    }, 25000);
}

// 키보드 단축키
document.addEventListener('keydown', function(event) {
    // ESC 키로 철문 리셋
    if (event.key === 'Escape') {
        if (metalDoor.classList.contains('door-down')) {
            resetDoor();
        }
    }
    
    // Enter 키로 장례준비 버튼 활성화
    if (event.key === 'Enter' && !funeralPrepBtn.disabled) {
        handleFuneralPrep();
    }
});

// 터치 이벤트 지원 (모바일)
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartY = event.touches[0].clientY;
    
    // 사용자 상호작용 감지
    if (window.funeralMusic) {
        window.funeralMusic.markUserInteraction();
    }
});

document.addEventListener('touchend', function(event) {
    touchEndY = event.changedTouches[0].clientY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartY - touchEndY;
    
    // 위로 스와이프 (철문 리셋)
    if (swipeDistance > swipeThreshold && metalDoor.classList.contains('door-down')) {
        resetDoor();
    }
    
    // 아래로 스와이프 (장례준비 버튼 활성화)
    if (swipeDistance < -swipeThreshold && !funeralPrepBtn.disabled) {
        handleFuneralPrep();
    }
}

// 페이지 가시성 변경 시 처리
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 페이지가 숨겨질 때 애니메이션 일시정지 및 이미지 정리
        document.body.style.animationPlayState = 'paused';
        clearAllImages();
    } else {
        // 페이지가 다시 보일 때 애니메이션 재개
        document.body.style.animationPlayState = 'running';
    }
});

// 성능 최적화를 위한 이미지 지연 로딩
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 페이지 로드 완료 후 지연 로딩 초기화
window.addEventListener('load', function() {
    lazyLoadImages();
    
    // 페이지 로드 완료 후 업로드 영역 최종 확인
    if (uploadedImages.length === 0) {
        uploadArea.style.display = 'block';
        uploadArea.style.visibility = 'visible';
        uploadArea.style.opacity = '1';
    }
}); 