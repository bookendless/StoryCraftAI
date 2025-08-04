import OpenAI from "openai";

// API設定の動的取得
function getApiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "your-api-key",
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o'
  };
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: getApiConfig().apiKey,
  baseURL: getApiConfig().baseURL,
});

export interface CharacterSuggestion {
  name: string;
  description: string;
  personality: string;
  background: string;
  role: string;
}

export interface PlotSuggestion {
  theme: string;
  setting: string;
  hook: string;
  opening: string;
  development: string;
  climax: string;
  conclusion: string;
}

export interface ChapterSuggestion {
  title: string;
  summary: string;
  structure: string;
  estimatedWords: number;
  estimatedReadingTime: number;
  characterIds: string[];
}

export async function generateCharacterSuggestions(
  projectTitle: string,
  genre: string,
  existingCharacters: string[]
): Promise<CharacterSuggestion[]> {
  try {
    const prompt = `プロジェクト「${projectTitle}」（ジャンル: ${genre}）の新しいキャラクターを3つ提案してください。
既存のキャラクター: ${existingCharacters.join(", ") || "なし"}

以下のJSON形式で回答してください:
{
  "characters": [
    {
      "name": "キャラクター名",
      "description": "外見・特徴の説明",
      "personality": "性格の詳細",
      "background": "背景・過去の説明",
      "role": "物語での役割"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは創作支援のプロフェッショナルです。魅力的で一貫性のあるキャラクターを提案してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.characters || [];
  } catch (error) {
    console.error("Character generation error:", error);
    throw new Error("キャラクター生成に失敗しました");
  }
}

export async function generatePlotSuggestion(
  projectTitle: string,
  genre: string,
  characters: string[]
): Promise<PlotSuggestion> {
  try {
    const prompt = `プロジェクト「${projectTitle}」（ジャンル: ${genre}）のプロット構成を提案してください。
登場キャラクター: ${characters.join(", ")}

起承転結の構造で、以下のJSON形式で回答してください:
{
  "plot": {
    "theme": "メインテーマ",
    "setting": "舞台設定",
    "hook": "読者を引き込む要素",
    "opening": "起: 物語の始まり",
    "development": "承: 展開と発展",
    "climax": "転: クライマックス",
    "conclusion": "結: 結末"
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは物語構成の専門家です。魅力的で一貫性のあるプロットを作成してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.plot || {};
  } catch (error) {
    console.error("Plot generation error:", error);
    throw new Error("プロット生成に失敗しました");
  }
}

export async function generateSynopsis(
  projectTitle: string,
  genre: string,
  plot: string,
  characters: string[]
): Promise<string> {
  try {
    const prompt = `以下の情報を基に、魅力的なあらすじを作成してください。

プロジェクト: ${projectTitle}
ジャンル: ${genre}
プロット概要: ${plot}
主要キャラクター: ${characters.join(", ")}

読者が興味を持つような、簡潔で魅力的なあらすじを日本語で書いてください。`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは読者の興味を引く魅力的なあらすじを書く専門家です。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Synopsis generation error:", error);
    throw new Error("あらすじ生成に失敗しました");
  }
}

export async function generateChapterSuggestions(
  projectTitle: string,
  plot: string,
  existingChapters: string[]
): Promise<ChapterSuggestion[]> {
  try {
    const prompt = `プロジェクト「${projectTitle}」の章立てを提案してください。

プロット概要: ${plot}
既存の章: ${existingChapters.join(", ") || "なし"}

次の章を3つ提案してください。各章について以下のJSON形式で回答してください:
{
  "chapters": [
    {
      "title": "章タイトル",
      "summary": "章の要約（200文字程度）",
      "structure": "ki/sho/ten/ketsu のいずれか",
      "estimatedWords": 推定文字数（数値）,
      "estimatedReadingTime": 推定読書時間（分、数値）,
      "characterIds": ["登場キャラクター名の配列"]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは物語構成の専門家です。バランスの取れた章構成を提案してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.chapters || [];
  } catch (error) {
    console.error("Chapter generation error:", error);
    throw new Error("章立て生成に失敗しました");
  }
}

export async function generateEpisodeSuggestion(
  chapterTitle: string,
  chapterSummary: string,
  characters: string[]
): Promise<any> {
  try {
    const prompt = `章「${chapterTitle}」のエピソード構成を提案してください。

章の概要: ${chapterSummary}
登場キャラクター: ${characters.join(", ")}

この章内の具体的なエピソードを3-4個提案してください。以下のJSON形式で回答してください:
{
  "episodes": [
    {
      "title": "エピソードタイトル",
      "description": "エピソードの詳細説明",
      "perspective": "視点キャラクター",
      "mood": "雰囲気・トーン",
      "events": ["起こる出来事のリスト"],
      "dialogue": "重要な会話の例",
      "setting": "場面設定"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは具体的で魅力的なエピソードを設計する専門家です。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.episodes || [];
  } catch (error) {
    console.error("Episode generation error:", error);
    throw new Error("エピソード生成に失敗しました");
  }
}

export async function generateDraft(
  episodeTitle: string,
  episodeDescription: string,
  tone: string
): Promise<string> {
  try {
    const prompt = `以下のエピソードの草案を執筆してください。

エピソードタイトル: ${episodeTitle}
エピソード概要: ${episodeDescription}
希望するトーン: ${tone}

読みやすく魅力的な文章で、約1000文字程度の草案を書いてください。会話文や描写を含めて、実際の小説の一部として自然な仕上がりにしてください。`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは優秀な小説家です。読者を引き込む魅力的な文章を書いてください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Draft generation error:", error);
    throw new Error("草案生成に失敗しました");
  }
}
