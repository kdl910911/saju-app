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

  // 화면 전환: 입력창 숨기고 픽사 렌더링 로딩창 띄우기
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
      throw new Error(data.error || "웹툰 생성 실패");
    }

    renderPixarWebtoon(data.result);

    screenLoading.classList.add('hidden');
    screenResult.classList.remove('hidden');
  } catch (err) {
    alert("오류 발생: " + err.message);
    screenLoading.classList.add('hidden');
    screenInput.classList.remove('hidden');
  }
});

// 뒤로가기 버튼
backBtn.addEventListener('click', () => {
  screenResult.classList.add('hidden');
  screenInput.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 픽사 4컷 만화 렌더링 함수
function renderPixarWebtoon(data) {
  document.getElementById('character-emoji').textContent = data.character.emoji || "🎬";
  document.getElementById('episode-title').textContent = data.episodeTitle || "나의 사주 어드벤처";
  document.getElementById('character-info').textContent = `${data.character.name} | ${data.character.element}`;
  document.getElementById('lucky-text').textContent = data.luckyItems || "행운을 빕니다!";

  const cutsContainer = document.getElementById('webtoon-cuts');
  cutsContainer.innerHTML = '';

  data.cuts.forEach((cut) => {
    // 픽사 3D 스타일 이미지 생성 무료 URL (Pollinations AI)
    const prompt = encodeURIComponent(`${cut.imagePrompt}, cute 3D Pixar Disney style animation, vibrant colorful lighting, 3D render`);
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=600&height=400&nologo=true`;

    const panel = document.createElement('div');
    panel.className = 'cut-panel';
    panel.innerHTML = `
      <span class="cut-badge">CUT ${cut.cut}</span>
      <h2 class="cut-title">${cut.title}</h2>
      
      <!-- 픽사 3D 만화 컷 이미지 -->
      <div class="cut-img-box">
        <img src="${imageUrl}" alt="${cut.title}" class="cut-img" loading="lazy" />
      </div>

      <div class="sound-effect">${cut.soundEffect}</div>
      <div class="speech-bubble">💬 ${cut.dialogue}</div>
    `;
    cutsContainer.appendChild(panel);
  });
}
