export async function onRequestPost(context) {
  try {
    const { birthDate, birthTime, calendarType, gender, concern } = await context.request.json();
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY 환경변수가 설정되지 않았습니다." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const prompt = `
당신은 통찰력 있고 따뜻하며 재치 있는 사주명리학 도사입니다.
다음 의뢰인의 정보를 바탕으로 사주와 운세를 흥미롭고 알기 쉽게 풀이해 주세요.

[의뢰인 정보]
- 생년월일: ${birthDate} (${calendarType})
- 태어난 시간: ${birthTime || '모름/미입력'}
- 성별: ${gender}
- 주요 고민/궁금한 점: ${concern || '전반적인 총운 및 기운'}

[답변 작성 가이드]
1. 타고난 성향과 기운(오행의 분위기)을 비유를 들어 흥미롭게 설명하세요.
2. 성격의 장점과 보완하면 좋은 점을 짚어주세요.
3. 주요 고민에 대한 현실적이고 긍정적인 조언을 남겨주세요.
4. 나에게 기운을 북돋아 주는 행운의 요소(색상, 방향, 소품 등)를 1~2개 추천하세요.
5. 읽기 편하게 소제목과 마크다운 서식을 적극 활용해 주세요.
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const errMsg = data.error?.message || "Gemini API 호출에 실패했습니다.";
      return new Response(JSON.stringify({ error: errMsg }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "사주 풀이를 생성하지 못했습니다.";

    return new Response(JSON.stringify({ result: reply }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
