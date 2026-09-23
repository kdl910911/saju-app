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
당신은 유명 공식 4컷 만화(블루아카이브 4컷 만화 스타일) 작가이자 사주명리학 도사입니다.
의뢰인의 사주를 바탕으로 '도사'와 주인공 '${name}'이 티키타카 대화를 나누는 코믹한 4컷 만화 스토리를 작성하세요.
반드시 순수 JSON 규격으로만 응답하세요.

[의뢰인 정보]
- 이름: ${name}
- 생년월일: ${birthDate} (${calendarType})
- 태어난 시간: ${birthTime || '모름/미입력'}
- 성별: ${gender}
- 주요 고민: ${concern || '올해의 총운 및 재물운'}

[출력 JSON 규격]
{
  "comicTitle": "에피소드 제목 (예: 불꽃의 후예, 냉혹한 프로처럼 2~6글자)",
  "cuts": [
    {
      "cut": 1,
      "imagePrompt": "Cute chibi anime characters in 4koma manga style, warm glowing scene, digital comic art",
      "sfx": "번쩍!",
      "bubble1": { "speaker": "도사", "text": "오호! ${name}님에게서 섬세한 불꽃의 기운이 피어오르는군요!" },
      "bubble2": { "speaker": "${name}", "text": "네? 제 손에 불이 붙은 건가요?!" }
    },
    {
      "cut": 2,
      "imagePrompt": "Cute chibi anime character discovering special talent, sparkling triumphant comic scene",
      "sfx": "짜-안!",
      "bubble1": { "speaker": "도사", "text": "손만 대면 척척 해결되는 천부적인 재능이지요." },
      "bubble2": { "speaker": "${name}", "text": "오... 생각보다 대단한 사주였잖아?!" }
    },
    {
      "cut": 3,
      "imagePrompt": "Cute chibi anime character facing funny sudden crisis, comical shocked expression, manga style",
      "sfx": "쿵...!!",
      "bubble1": { "speaker": "도사", "text": "하지만 조급해지면 불길이 꺼지니 주의하세요!" },
      "bubble2": { "speaker": "${name}", "text": "으악! 잔고가 바닥나는 환각이 보여요!" }
    },
    {
      "cut": 4,
      "imagePrompt": "Happy cheerful cute chibi anime ending scene with lucky charms and bright smiles",
      "sfx": "반짝✨",
      "bubble1": { "speaker": "도사", "text": "초록색 아이템을 지니고 차분히 전진하면 대성합니다!" },
      "bubble2": { "speaker": "${name}", "text": "좋아, 오늘부터 초록색 옷만 입는다!" }
    }
  ],
  "luckyAdvice": "행운의 아이템: 초록색 소품, 호숫가 산책 | 조언: 성급한 판단보다 한 템포 쉬어가기"
}
*대사는 말풍선에 쏙 들어가도록 20자 내외로 재치 있고 짧게 쓰세요.*
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
          lastError = data.error?.message || "응답 실패";
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!replyText) {
      return new Response(JSON.stringify({ error: lastError || "사주 웹툰 생성 실패" }), {
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
