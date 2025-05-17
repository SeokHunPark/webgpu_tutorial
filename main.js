import { tutorial1 } from './tutorials/tutorial1.js';

// 오류 메시지 표시 함수
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
    console.error('Error:', message);
}

// WebGPU 지원 확인
async function checkWebGPUSupport() {
    console.log('WebGPU 지원 확인 중...');
    if (!navigator.gpu) {
        throw new Error('WebGPU를 지원하지 않는 브라우저입니다. Chrome Canary 또는 Firefox Nightly를 사용해주세요.');
    }
    console.log('navigator.gpu 확인됨');

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error('WebGPU 어댑터를 찾을 수 없습니다.');
    }
    console.log('WebGPU 어댑터 확인됨');

    return adapter;
}

// 메뉴 클릭 이벤트 처리
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM 로드됨, 초기화 시작...');
    try {
        // WebGPU 지원 확인
        await checkWebGPUSupport();
        console.log('WebGPU 지원 확인 완료');

        const menuLinks = document.querySelectorAll('.menu a');
        console.log('메뉴 링크 찾음:', menuLinks.length);
        
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('메뉴 클릭:', link.getAttribute('data-tutorial'));
                
                // 활성 메뉴 업데이트
                menuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // 튜토리얼 번호 가져오기
                const tutorialNumber = link.getAttribute('data-tutorial');
                
                // 현재는 튜토리얼 1만 구현되어 있음
                if (tutorialNumber === '1') {
                    console.log('튜토리얼 1 실행 시작');
                    tutorial1.render().catch(error => {
                        showError(`렌더링 중 오류 발생: ${error.message}`);
                    });
                } else {
                    showError('아직 구현되지 않은 튜토리얼입니다.');
                }
            });
        });

        // 초기 로드 시 튜토리얼 1 실행
        console.log('초기 튜토리얼 1 실행 시작');
        await tutorial1.render();
        console.log('초기 튜토리얼 1 실행 완료');
    } catch (error) {
        showError(`초기화 중 오류 발생: ${error.message}`);
    }
}); 