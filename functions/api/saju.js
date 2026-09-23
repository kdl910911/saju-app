export async function onRequestPost(context) {
  try {
    const { userName, birthDate, birthTime, calendarType, gender, concern } = await context.request.json();
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY 환경변수가 설정되지 않았습니다." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const name = userName ? userName.trim() : "주인공";

    const prompt = `
당신은 픽사(Pixar) 애니메이션 스튜디오의 스토리보드 작가이자 사주명리학 도사입니다.
의뢰인의 사주를 픽사 3D 애니메이션 풍의 4컷 만화 스토리로 각색하여 반드시 순수 JSON 규격으로만 응답하세요.

[의뢰인 정보]
- 이름: ${name}
- 생년월일: ${birthDate} (${calendarType})
- 태어난 시간: ${birthTime || '모름/미입력'}
- 성별: ${gender}
- 주요 고민: ${concern || '올해의 총운 및 재물운'}

[응답 JSON 규격]
{
  "episodeTitle": "${name}의 4컷 사주 어드벤처: 에피소드 제목",
  "character": {
    "name": "사주 캐릭터 명칭 (예: 활활 타오르는 태양룡)",
    "element": "오행 기운 요약 (예: 丙火 - 양(陽)의 불꽃)",
    "emoji": "어울리는 이모지 (예: ☀️🐉)"
  },
  "cuts": [
    {
      "cut": 1,
      "title": "제1화: 운명의 탄생",
      "imagePrompt": "A cute 3D Pixar animation style scene featuring a friendly character embodying the element in a magical village, bright warm sunlight, Disney Pixar style, highly detailed 3D render, cinematic lighting",
      "soundEffect": "번쩍!",
      "dialogue": "${name}(이)가 세상에 태어났을 때 전설의 불꽃이 타올랐지!"
    },
    {
      "cut": 2,
      "title": "제2화: 필살기와 재능",
      "imagePrompt": "A cute 3D Pixar animation style scene showing the heroic character discovering their superpower, dynamic pose, sparkling magic effects, cheerful expression, 3D animated movie still",
      "soundEffect": "콰과광!",
      "dialogue": "이것이 바로 ${name}만의 타고난 재능이야!"
    },
    {
      "cut": 3,
      "title": "제3화: 닥쳐온 시련",
      "imagePrompt": "A cute 3D Pixar animation style scene showing a comical crisis or obstacle, funny surprised expression, stormy cute atmosphere, Disney Pixar cartoon render",
      "soundEffect": "쿵...!",
      "dialogue": "앗! 이런 약점과 함정을 조심해야 해!"
    },
    {
      "cut": 4,
      "title": "제4화: 행운의 엔딩",
      "imagePrompt": "A happy triumphant ending scene in 3D Pixar animation style, joyful cute characters celebrating with glowing treasure and lucky charms, colorful confetti, heartwarming Disney Pixar render",
      "soundEffect": "반짝반짝 ✨",
      "dialogue": "이 비법과 행운의 아이템만 챙기면 모든 게 해결될 거야!"
    }
  ],
  "luckyItems": "행운의 색상, 행운의 장소 및 행동 조언"
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
