// DOM 요소들
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imageGallery = document.getElementById('imageGallery');
const funeralPrepBtn = document.getElementById('funeralPrepBtn');
const shareBtn = document.getElementById('shareBtn');
const metalDoor = document.getElementById('metalDoor');
const mainContent = document.getElementById('mainContent');
const musicToggle = document.getElementById('musicToggle');

// 이미지 업로드 관련 변수
let uploadedImages = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('shared');
    
    if (shared === 'true') {
        // 공유된 링크로 접근한 경우 바로 철문 애니메이션 시작
        setTimeout(() => {
            startDoorAnimation();
        }, 1000);
    } else {
        // 일반 접근인 경우 이전 이미지 지우기
        clearAllImages();
    }
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

    // 공유하기 버튼 클릭
    shareBtn.addEventListener('click', handleShare);

    // 철문 클릭 시 원래 상태로 복원
    metalDoor.addEventListener('click', resetDoor);
    
    // 음악 컨트롤
    musicToggle.addEventListener('click', toggleMusic);
}

// 이미지 업로드 처리
function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                addImageToGallery(file);
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
                addImageToGallery(file);
            }
        });
    }
}

// 이미지를 갤러리에 추가
function addImageToGallery(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageData = {
            id: Date.now() + Math.random(),
            src: e.target.result,
            name: file.name
        };
        
        uploadedImages.push(imageData);
        createImageElement(imageData);
        saveImagesToStorage();
        updateUploadArea();
    };
    
    reader.readAsDataURL(file);
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
    } else {
        uploadArea.style.display = 'block';
        // 업로드 영역이 다시 나타날 때 애니메이션 효과
        uploadArea.style.opacity = '0';
        uploadArea.style.transform = 'translateY(20px)';
        setTimeout(() => {
            uploadArea.style.transition = 'all 0.5s ease';
            uploadArea.style.opacity = '1';
            uploadArea.style.transform = 'translateY(0)';
        }, 100);
    }
}

// 로컬 스토리지에 이미지 저장
function saveImagesToStorage() {
    try {
        localStorage.setItem('funeralServiceImages', JSON.stringify(uploadedImages));
    } catch (error) {
        console.warn('이미지 저장 중 오류가 발생했습니다:', error);
    }
}

// 음악 토글
function toggleMusic() {
    const isPlaying = window.funeralMusic.toggle();
    if (isPlaying) {
        musicToggle.textContent = '🔊';
        musicToggle.classList.add('playing');
    } else {
        musicToggle.textContent = '🔇';
        musicToggle.classList.remove('playing');
    }
}

// 공유하기 기능
function handleShare() {
    // 현재 이미지들을 로컬 스토리지에 저장
    saveImagesToStorage();
    
    // 공유 URL 생성
    const shareUrl = window.location.origin + window.location.pathname + '?shared=true';
    
    // Web Share API 사용 (모바일에서 네이티브 공유)
    if (navigator.share) {
        navigator.share({
            title: '서비스 장례준비',
            text: '마지막 여정을 위한 준비',
            url: shareUrl
        }).catch(err => {
            console.log('공유 실패:', err);
            copyToClipboard(shareUrl);
        });
    } else {
        // Web Share API가 지원되지 않는 경우 클립보드에 복사
        copyToClipboard(shareUrl);
    }
}

// 클립보드에 복사
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('링크가 클립보드에 복사되었습니다.');
        }).catch(err => {
            console.log('클립보드 복사 실패:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// 폴백 클립보드 복사
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('링크가 클립보드에 복사되었습니다.');
    } catch (err) {
        console.log('폴백 복사 실패:', err);
        alert('링크: ' + text);
    }
    document.body.removeChild(textArea);
}

// 모든 이미지 지우기
function clearAllImages() {
    uploadedImages = [];
    imageGallery.innerHTML = '';
    localStorage.removeItem('funeralServiceImages');
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
function handleFuneralPrep() {
    // 이미지가 없으면 알림
    if (uploadedImages.length === 0) {
        alert('먼저 이미지를 업로드해주세요.');
        return;
    }
    
    // 버튼 비활성화
    funeralPrepBtn.disabled = true;
    funeralPrepBtn.textContent = '준비 중...';
    
    // 음악 재생
    window.funeralMusic.createFuneralMusic();
    musicToggle.textContent = '🔊';
    musicToggle.classList.add('playing');
    
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
        // 페이지가 숨겨질 때 애니메이션 일시정지
        document.body.style.animationPlayState = 'paused';
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
window.addEventListener('load', lazyLoadImages); 