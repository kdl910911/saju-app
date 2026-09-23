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

function renderMangaStrip(data) {
  document.getElementById('comic-title').textContent = `〈${data.comicTitle || "운명의 사주"}〉`;
  document.getElementById('lucky-advice').textContent = `🍀 ${data.luckyAdvice || "행운을 빕니다!"}`;

  const stripContainer = document.getElementById('manga-strip');
  stripContainer.innerHTML = '';

  const charEmoji = data.characterEmoji || "✨";

  data.cuts.forEach((cut) => {
    // 정상 동작하는 pollinations.ai/p/ 공식 주소
    const cleanPrompt = encodeURIComponent((cut.imagePrompt || "cute anime chibi comic scene").replace(/[^a-zA-Z0-9 ,]/g, ""));
    const imageUrl = `https://pollinations.ai/p/${cleanPrompt}?width=600&height=360`;

    const panel = document.createElement('div');
    panel.className = 'comic-panel';

    panel.innerHTML = `
      <!-- 기본 만화 톤 캔버스 (그림 로딩 중에도 깨지지 않고 만화 느낌 유지) -->
      <div class="panel-canvas panel-canvas-${cut.cut}">
        <div class="canvas-emoji">${charEmoji}</div>
        <div class="canvas-text">CUT ${cut.cut}</div>
      </div>

      <!-- AI 실시간 생성 이미지 (완료 시 페이드인, 실패 시 자동 숨김) -->
      <img 
        src="${imageUrl}" 
        alt="만화 컷" 
        class="panel-bg-img" 
        onload="this.style.opacity='1';" 
        onerror="this.style.display='none';" 
        style="opacity: 0;" 
      />

      <!-- 컷 내부 오버레이: 효과음 및 티키타카 말풍선 -->
      <div class="panel-overlay">
        <div class="manga-bubble bubble-pos-1">
          <span class="bubble-speaker">${cut.bubble1.speaker}</span>
          <span>${cut.bubble1.text}</span>
        </div>

        <div class="manga-sfx">${cut.sfx}</div>

        <div class="manga-bubble bubble-pos-2">
          <span class="bubble-speaker">${cut.bubble2.speaker}</span>
          <span>${cut.bubble2.text}</span>
        </div>
      </div>
    `;

    stripContainer.appendChild(panel);
  });
}
