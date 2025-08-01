// 장례 음악 생성기
class FuneralMusicGenerator {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.oscillator = null;
        this.gainNode = null;
    }

    // 오디오 컨텍스트 초기화
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return true;
        } catch (e) {
            console.log('오디오 컨텍스트 초기화 실패:', e);
            return false;
        }
    }

    // 평화로운 장례 음악 생성
    createFuneralMusic() {
        if (!this.audioContext) {
            if (!this.init()) return;
        }

        // 기존 음악 정지
        this.stop();

        // 오실레이터 생성 (평화로운 음)
        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();

        // 새로운 음악 설정 - 더 평화로운 멜로디
        this.oscillator.type = 'triangle'; // 더 부드러운 음색
        
        // C major 스케일 기반의 평화로운 멜로디
        const currentTime = this.audioContext.currentTime;
        this.oscillator.frequency.setValueAtTime(261.63, currentTime); // C4
        this.oscillator.frequency.setValueAtTime(293.66, currentTime + 3); // D4
        this.oscillator.frequency.setValueAtTime(329.63, currentTime + 6); // E4
        this.oscillator.frequency.setValueAtTime(349.23, currentTime + 9); // F4
        this.oscillator.frequency.setValueAtTime(392.00, currentTime + 12); // G4
        this.oscillator.frequency.setValueAtTime(349.23, currentTime + 15); // F4
        this.oscillator.frequency.setValueAtTime(329.63, currentTime + 18); // E4
        this.oscillator.frequency.setValueAtTime(293.66, currentTime + 21); // D4
        this.oscillator.frequency.setValueAtTime(261.63, currentTime + 24); // C4

        // 볼륨 설정 (매우 낮게, 페이드 인/아웃 효과)
        this.gainNode.gain.setValueAtTime(0.05, currentTime);
        this.gainNode.gain.setValueAtTime(0.08, currentTime + 2);
        this.gainNode.gain.setValueAtTime(0.06, currentTime + 4);
        this.gainNode.gain.setValueAtTime(0.09, currentTime + 6);
        this.gainNode.gain.setValueAtTime(0.07, currentTime + 8);
        this.gainNode.gain.setValueAtTime(0.05, currentTime + 10);

        // 연결
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        // 반복 재생 (24초 후)
        this.oscillator.onended = () => {
            if (this.isPlaying) {
                setTimeout(() => {
                    if (this.isPlaying) {
                        this.createFuneralMusic();
                    }
                }, 1000); // 1초 간격 후 재시작
            }
        };

        // 재생 (24초 동안)
        this.oscillator.start();
        this.oscillator.stop(currentTime + 24);
        this.isPlaying = true;
    }

    // 음악 정지
    stop() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.gainNode) {
            this.gainNode = null;
        }
        this.isPlaying = false;
    }

    // 음악 토글
    toggle() {
        if (this.isPlaying) {
            this.stop();
            return false;
        } else {
            this.createFuneralMusic();
            return true;
        }
    }
}

// 전역 변수로 생성
window.funeralMusic = new FuneralMusicGenerator(); 