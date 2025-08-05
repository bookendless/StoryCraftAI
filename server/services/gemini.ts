import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCharacterSuggestionsWithGemini(
  projectTitle: string,
  genre: string,
  targetAudience: string,
  numberOfCharacters: number = 3
): Promise<any[]> {
  try {
    const prompt = `
あなたは創作支援AIです。以下の条件に基づいて魅力的なキャラクターを${numberOfCharacters}人提案してください。

【作品情報】
- タイトル: ${projectTitle}
- ジャンル: ${genre}
- 対象読者: ${targetAudience}

【出力形式】
各キャラクターについて以下の要素を含むJSON配列で回答してください：
- name: キャラクターの名前
- age: 年齢
- occupation: 職業・立場
- personality: 性格（3-4つの特徴）
- background: 背景・設定
- motivation: 動機・目標
- relationships: 他キャラクターとの関係
- notes: 追加メモ

日本語で、そのジャンルに適した魅力的で個性的なキャラクターを作成してください。
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
    try {
      // JSONレスポンスをパース
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // JSONが見つからない場合は、テキストから情報を抽出
      return [{
        name: "主人公",
        age: 20,
        occupation: "学生",
        personality: ["勇敢", "優しい", "好奇心旺盛"],
        background: text.substring(0, 200),
        motivation: "世界を救うこと",
        relationships: "仲間たちと協力",
        notes: "AI生成されたキャラクター"
      }];
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`キャラクター生成に失敗しました: ${error}`);
  }
}

export async function generatePlotSuggestionWithGemini(
  projectTitle: string,
  genre: string,
  characters: any[]
): Promise<any> {
  try {
    const characterNames = characters.map(c => c.name).join(", ");
    
    const prompt = `
あなたは創作支援AIです。以下の条件に基づいて魅力的なプロット構成を提案してください。

【作品情報】
- タイトル: ${projectTitle}
- ジャンル: ${genre}
- 主要キャラクター: ${characterNames}

【出力形式】
以下の要素を含むJSON形式で回答してください：
{
  "mainConflict": "主要な対立・問題",
  "incitingIncident": "発端となる出来事",
  "plotTwists": ["展開の転機1", "展開の転機2"],
  "climax": "クライマックス",
  "resolution": "解決",
  "themes": ["テーマ1", "テーマ2"],
  "tone": "作品の雰囲気",
  "notes": "追加の構成メモ"
}

日本語で、そのジャンルに適した魅力的で読者を引き込むプロットを作成してください。
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        mainConflict: "キャラクターたちが直面する主要な課題",
        incitingIncident: "物語の始まりとなる重要な出来事",
        plotTwists: ["予想外の展開", "新たな発見"],
        climax: "物語の頂点となる場面",
        resolution: "問題の解決と物語の結末",
        themes: ["成長", "友情"],
        tone: genre,
        notes: text.substring(0, 300)
      };
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError);
      throw parseError;
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`プロット生成に失敗しました: ${error}`);
  }
}

export async function generateSynopsisWithGemini(
  projectTitle: string,
  plot: any,
  characters: any[]
): Promise<string> {
  try {
    const characterNames = characters.map(c => c.name).join(", ");
    
    const prompt = `
あなたは創作支援AIです。以下の情報に基づいて魅力的なあらすじを作成してください。

【作品情報】
- タイトル: ${projectTitle}
- 主要キャラクター: ${characterNames}
- メインプロット: ${plot.mainConflict}
- 発端: ${plot.incitingIncident}
- クライマックス: ${plot.climax}
- テーマ: ${plot.themes?.join(", ")}

【要求】
- 読者の興味を引く魅力的なあらすじを作成
- ネタバレを避けつつ、物語の魅力を伝える
- 400-600文字程度の日本語
- 感情的な訴求力のある文章

あらすじのみを出力してください。
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    return response.text || "あらすじの生成に失敗しました。";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`あらすじ生成に失敗しました: ${error}`);
  }
}

export async function generateChapterSuggestionsWithGemini(
  projectTitle: string,
  plot: any,
  synopsis: string,
  targetChapters: number = 10
): Promise<any[]> {
  try {
    const prompt = `
あなたは創作支援AIです。以下の情報に基づいて章構成を${targetChapters}章分提案してください。

【作品情報】
- タイトル: ${projectTitle}
- あらすじ: ${synopsis}
- メインプロット: ${plot.mainConflict}
- クライマックス: ${plot.climax}

【出力形式】
各章について以下の要素を含むJSON配列で回答してください：
[
  {
    "title": "章タイトル",
    "summary": "章の概要（200字程度）",
    "keyEvents": ["重要な出来事1", "重要な出来事2"],
    "structure": "introduction|rising_action|climax|falling_action|resolution",
    "estimatedWords": 推定文字数,
    "estimatedReadingTime": 推定読書時間（分）,
    "notes": "構成メモ"
  }
]

物語の流れが自然で、各章が適切な長さと内容を持つように構成してください。
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    const text = response.text || "";
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // JSONが見つからない場合は基本的な章構成を生成
      const chapters = [];
      for (let i = 1; i <= targetChapters; i++) {
        chapters.push({
          title: `第${i}章`,
          summary: `第${i}章の内容概要`,
          keyEvents: [`第${i}章の重要な出来事`],
          structure: i === 1 ? "introduction" : i === targetChapters ? "resolution" : "rising_action",
          estimatedWords: 3000,
          estimatedReadingTime: 10,
          notes: "AI生成された章"
        });
      }
      return chapters;
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`章構成生成に失敗しました: ${error}`);
  }
}

export async function generateEpisodeSuggestionWithGemini(
  chapterTitle: string,
  chapterSummary: string,
  characters: any[]
): Promise<any[]> {
  try {
    const characterNames = characters.map(c => c.name).join(", ");
    
    const prompt = `
あなたは創作支援AIです。以下の章情報に基づいて3-5個のエピソードを提案してください。

【章情報】
- 章タイトル: ${chapterTitle}
- 章の概要: ${chapterSummary}
- 登場キャラクター: ${characterNames}

【出力形式】
各エピソードについて以下の要素を含むJSON配列で回答してください：
[
  {
    "title": "エピソードタイトル",
    "description": "エピソードの概要",
    "setting": "場面設定（場所、時間等）",
    "events": ["出来事1", "出来事2", "出来事3"],
    "mood": "明るい|緊張感|神秘的|感動的|コミカル|シリアス|ロマンチック|アクション",
    "perspective": "視点キャラクター",
    "dialogue": "重要な会話やセリフ",
    "notes": "追加メモ"
  }
]

章の流れに沿って、読者を引き込む魅力的なエピソードを作成してください。
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [{
        title: "新しいエピソード",
        description: "章の内容に基づいたエピソード",
        setting: "適切な場面設定",
        events: ["重要な出来事"],
        mood: "シリアス",
        perspective: characterNames.split(", ")[0] || "主人公",
        dialogue: "重要な会話",
        notes: text.substring(0, 200)
      }];
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`エピソード生成に失敗しました: ${error}`);
  }
}

export async function generateDraftWithGemini(
  chapterTitle: string,
  episodes: any[],
  characters: any[],
  style: string = "小説"
): Promise<string> {
  try {
    const characterNames = characters.map(c => c.name).join(", ");
    const episodeSummaries = episodes.map(ep => `- ${ep.title}: ${ep.description}`).join("\n");
    
    const prompt = `
あなたは創作支援AIです。以下の情報に基づいて小説の草案を作成してください。

【章情報】
- 章タイトル: ${chapterTitle}
- 登場キャラクター: ${characterNames}

【エピソード構成】
${episodeSummaries}

【要求】
- 文体: ${style}
- 長さ: 2000-3000文字程度
- 読みやすく魅力的な文章
- キャラクターの個性を活かした描写
- 場面の臨場感のある表現

草案のみを出力してください。前書きや説明は不要です。
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    return response.text || "草案の生成に失敗しました。";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`草案生成に失敗しました: ${error}`);
  }
}