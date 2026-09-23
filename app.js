const screenInput = document.getElementById('screen-input');
const screenLoading = document.getElementById('screen-loading');
const screenResult = document.getElementById('screen-result');

const form = document.getElementById('saju-form');
const backBtn = document.getElementById('back-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userName = document.getElementById('userName').value;
  const birthDate = document.getElementById('birthDate').value;
  const birthTime = document.getElementById('birthTime').value;
  const calendarType = document.getElementById('calendarType').value;
  const gender = document.getElementById('gender').value;
  const concern = document.getElementById('concern').value;

  screenInput.classList.add('hidden');
  screenLoading.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    const res = await fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, birthDate, birthTime, calendarType, gender, concern })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "만화 제작 실패");
    }

    renderMangaStrip(data.result);

    screenLoading.classList.add('hidden');
    screenResult.classList.remove('hidden');
  } catch (err) {
    alert("오류 발생: " + err.message);
    screenLoading.classList.add('hidden');
    screenInput.classList.remove('hidden');
  }
});

backBtn.addEventListener('click', () => {
  screenResult.classList.add('hidden');
  screenInput.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 정통 4컷 만화 렌더링 함수
function renderMangaStrip(data) {
  // 상단 <제목> 설정
  document.getElementById('comic-title').textContent = `〈${data.comicTitle || "운명의 사주"}〉`;
  document.getElementById('lucky-advice').textContent = `🍀 ${data.luckyAdvice || "행운을 빕니다!"}`;

  const stripContainer = document.getElementById('manga-strip');
  stripContainer.innerHTML = '';

  data.cuts.forEach((cut) => {
    // 4컷 애니메이션 스타일 이미지 URL
    const cleanPrompt = encodeURIComponent((cut.imagePrompt || "cute anime comic background").replace(/[^a-zA-Z0-9 ,]/g, ""));
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=500&height=300&nologo=true`;

    const panel = document.createElement('div');
    panel.className = 'comic-panel';

    panel.innerHTML = `
      <!-- 만화 컷 배경 일러스트 -->
      <img src="${imageUrl}" alt="컷 배경" class="panel-bg-img" onerror="this.style.opacity='0.2';" />

      <!-- 컷 내부 오버레이: 효과음 및 티키타카 말풍선 -->
      <div class="panel-overlay">
        <!-- 첫 번째 대사 말풍선 (도사) -->
        <div class="manga-bubble bubble-pos-1">
          <span class="bubble-speaker">${cut.bubble1.speaker}</span>
          <span>${cut.bubble1.text}</span>
        </div>

        <!-- 만화 효과음 텍스트 -->
        <div class="manga-sfx">${cut.sfx}</div>

        <!-- 두 번째 대사 말풍선 (주인공) -->
        <div class="manga-bubble bubble-pos-2">
          <span class="bubble-speaker">${cut.bubble2.speaker}</span>
          <span>${cut.bubble2.text}</span>
        </div>
      </div>
    `;

    stripContainer.appendChild(panel);
  });
}
