document.getElementById('saju-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const birthDate = document.getElementById('birthDate').value;
  const birthTime = document.getElementById('birthTime').value;
  const calendarType = document.getElementById('calendarType').value;
  const gender = document.getElementById('gender').value;
  const concern = document.getElementById('concern').value;

  const loading = document.getElementById('loading');
  const resultCard = document.getElementById('result-card');
  const resultContent = document.getElementById('result-content');
  const submitBtn = document.getElementById('submit-btn');

  // 로딩 표시 및 버튼 비활성화
  loading.classList.remove('hidden');
  resultCard.classList.add('hidden');
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, birthTime, calendarType, gender, concern })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "풀이 도중 오류가 발생했습니다.");
    }

    // 마크다운 형태의 결과를 HTML로 변환하여 출력
    resultContent.innerHTML = marked.parse(data.result);
    resultCard.classList.remove('hidden');
  } catch (err) {
    alert("오류: " + err.message);
  } finally {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
  }
});
