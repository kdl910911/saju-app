const screenInput = document.getElementById('screen-input');
const screenLoading = document.getElementById('screen-loading');
const screenResult = document.getElementById('screen-result');

const form = document.getElementById('saju-form');
const backBtn = document.getElementById('back-btn');

// 사주 보기 제출 이벤트
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const birthDate = document.getElementById('birthDate').value;
  const birthTime = document.getElementById('birthTime').value;
  const calendarType = document.getElementById('calendarType').value;
  const gender = document.getElementById('gender').value;
  const concern = document.getElementById('concern').value;

  // 화면 전환: 입력 화면 숨기고 로딩 화면 띄우기
  screenInput.classList.add('hidden');
  screenLoading.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    const res = await fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, birthTime, calendarType, gender, concern })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "웹툰 생성 실패");
    }

    // 결과 렌더링
    renderWebtoon(data.result);

    // 화면 전환: 로딩 숨기고 결과 화면 띄우기
    screenLoading.classList.add('hidden');
    screenResult.classList.remove('hidden');
  } catch (err) {
    alert("오류가 발생했습니다: " + err.message);
    screenLoading.classList.add('hidden');
    screenInput.classList.remove('hidden');
  }
});

// 다시 입력하기 버튼
backBtn.addEventListener('click', () => {
  screenResult.classList.add('hidden');
  screenInput.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 웹툰 4컷 동적 HTML 생성 함수
function renderWebtoon(data) {
  document.getElementById('character-emoji').textContent = data.character.emoji || "🔮";
  document.getElementById('episode-title').textContent = data.episodeTitle || "나의 사주 이야기";
  document.getElementById('character-info').textContent = `${data.character.name} | ${data.character.element}`;
  document.getElementById('lucky-text').textContent = data.luckyItems || "긍정적인 마음가짐!";

  const cutsContainer = document.getElementById('webtoon-cuts');
  cutsContainer.innerHTML = '';

  data.cuts.forEach((cut) => {
    const panel = document.createElement('div');
    panel.className = 'cut-panel';
    panel.innerHTML = `
      <span class="cut-badge">CUT ${cut.cut}</span>
      <h2 class="cut-title">${cut.title}</h2>
      <div class="cut-scene">${cut.scene}</div>
      <div class="sound-effect">${cut.soundEffect}</div>
      <div class="speech-bubble">💬 "${cut.dialogue}"</div>
    `;
    cutsContainer.appendChild(panel);
  });
}
