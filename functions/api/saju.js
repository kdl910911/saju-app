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
당신은 통찰력 넘치는 사주명리학 도사이자 재치 있는 웹툰 작가입니다.
의뢰인의 사주를 4컷 만화(웹툰) 형식의 스토리로 각색하여 반드시 순수 JSON 규격으로만 응답하세요.

[의뢰인 정보]
- 생년월일: ${birthDate} (${calendarType})
- 태어난 시간: ${birthTime || '모름/미입력'}
- 성별: ${gender}
- 주요 고민: ${concern || '올해의 총운 및 재물운'}

[응답 JSON 규격]
{
  "episodeTitle": "웹툰 에피소드 제목 (예: 태양을 품은 붉은 호랑이의 모험)",
  "character": {
    "name": "사주 캐릭터 명칭 (예: 타오르는 불꽃의 검사)",
    "element": "오행 및 기운 요약 (예: 丙火(병화) - 양의 기운)",
    "emoji": "어울리는 캐릭터 이모지 (예: 🐯🔥)"
  },
  "cuts": [
    {
      "cut": 1,
      "title": "제1화: 운명의 각성 (타고난 본성)",
      "scene": "배경 및 상황 묘사 (1~2문장)",
      "soundEffect": "만화 효과음 (예: 콰과광!)",
      "dialogue": "캐릭터 대사 (말풍선에 들어갈 말)"
    },
    {
      "cut": 2,
      "title": "제2화: 필살기와 재능 (나의 장점)",
      "scene": "재능을 발휘하는 멋진 상황 묘사",
      "soundEffect": "효과음 (예: 파지지직!)",
      "dialogue": "자신감 넘치는 대사"
    },
    {
      "cut": 3,
      "title": "제3화: 닥쳐온 시련 (주의할 점과 함정)",
      "scene": "방심하거나 주의해야 할 위기 상황 묘사",
      "soundEffect": "효과음 (예: 쿵...!)",
      "dialogue": "위기 경고 또는 속마음 대사"
    },
    {
      "cut": 4,
      "title": "제4화: 행운의 치트키 (고민 해결 & 엔딩)",
      "scene": "고민에 대한 명쾌한 해법과 결말",
      "soundEffect": "효과음 (예: 반짝반짝 ✨)",
      "dialogue": "도사의 최종 조언 및 행운 아이템"
    }
  ],
  "luckyItems": "행운의 색상, 행운의 방향 및 팁 (예: 푸른색 옷, 호숫가 산책)"
}
`;

    const candidateModels = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    let lastError = null;
    let replyText = null;

    for (const model of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          replyText = data.candidates[0].content.parts[0].text;
          break;
        } else {
          lastError = data.error?.message || "응답 생성 실패";
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!replyText) {
      return new Response(JSON.stringify({ error: lastError || "사주 웹툰을 생성하지 못했습니다." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const cleaned = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
