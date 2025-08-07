import { GoogleGenAI } from "@google/genai";

// ローカル環境では API キーなしでも動作するように変更
const hasApiKey = !!process.env.GEMINI_API_KEY;
const genAI = hasApiKey ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }) : null;

// API キー無しの場合のフォールバック関数
function createFallbackResponse(type: string): any {
  console.log(`ローカル環境: GEMINI_API_KEY未設定のため${type}にフォールバック応答を使用`);
  
  switch (type) {
    case 'character':
      return [{
        name: "主人公",
        age: 20,
        occupation: "学生",
        personality: ["勇敢", "優しい", "好奇心旺盛"],
        background: "ごく普通の学生だったが、ある日不思議な力に目覚める",
        motivation: "仲間を守り、世界の謎を解き明かすこと",
        relationships: "信頼できる仲間たちと協力",
        notes: "ローカル環境での基本キャラクター"
      }];
    
    case 'character_completion':
      return {
        description: "魅力的で個性豊かなキャラクター",
        personality: "誠実で行動力があり、困っている人を放っておけない性格",
        background: "平凡な日常を送っていたが、運命的な出会いをきっかけに特別な世界に足を踏み入れる",
        role: "物語の中心となる重要な人物",
        affiliation: "正義の組織または仲間グループ"
      };
    
    case 'plot':
      return {
        theme: "成長と冒険",
        setting: "現代の日本を舞台とした異世界もの",
        hook: "平凡な日常に突如現れる非日常的な出来事",
        opening: "主人公の日常描写と運命を変える出会い",
        development: "新たな世界での試練と仲間との出会い",
        climax: "最大の敵との対決と真実の発覚",
        conclusion: "成長した主人公と平和になった世界"
      };
    
    case 'synopsis':
      return "平凡な学生だった主人公が、ある日不思議な力を持つ者たちの世界に巻き込まれる。初めは戸惑いながらも、持ち前の正義感と勇気で仲間たちと共に困難に立ち向かう。様々な試練を乗り越えながら成長していく主人公は、やがて世界を脅かす大きな謎と対峙することになる。友情、成長、そして希望を描いた心温まる物語。";
    
    case 'chapters':
      return Array.from({length: 10}, (_, i) => ({
        title: `第${i + 1}章`,
        summary: `第${i + 1}章では物語が${i === 0 ? '始まり' : i < 5 ? '展開し' : i < 8 ? '盛り上がり' : '結末に向かい'}ます`,
        keyEvents: [`第${i + 1}章の重要な出来事`],
        structure: i === 0 ? "introduction" : i === 9 ? "resolution" : "rising_action",
        estimatedWords: 3000,
        estimatedReadingTime: 10,
        notes: "ローカル環境での基本構成"
      }));
    
    case 'episodes':
      return [{
        title: "新たな出会い",
        description: "主人公が重要な人物と出会い、物語が動き出す",
        setting: "学校の屋上、夕暮れ時",
        events: ["偶然の出会い", "重要な情報の開示", "新たな決意"],
        mood: "神秘的",
        perspective: "主人公",
        dialogue: "「君にしかできないことがある」",
        notes: "物語の転換点となる重要なエピソード"
      }];
    
    case 'draft':
      return `夕日が校舎に長い影を落とす頃、私は屋上にいた。

いつもの静かな放課後のはずだった。それなのに、今日は何かが違っていた。空気が重く、まるで嵐の前のような緊張感が漂っている。

「やっと見つけた」

背後からの声に振り返ると、見慣れない制服を着た少女が立っていた。銀色の髪が風になびき、青い瞳が私をじっと見つめている。

「君が、選ばれた人ね」

選ばれた？何のことだろう。私は首を振った。

「人違いじゃないでしょうか。私はただの—」

「ただの学生じゃない。君には特別な力がある」

少女はゆっくりと近づいてくる。その時、私の胸の奥で何かが熱くなった。まるで眠っていた何かが目を覚ましたみたいに。

「この力...何ですか？」

「それが君の運命よ。世界を救う力」

夕日が二人を包み込む中、私の新しい人生が始まろうとしていた。`;
    
    default:
      return null;
  }
}

export async function generateCharacterSuggestionsWithGemini(
  projectTitle: string,
  genre: string,
  targetAudience: string,
  numberOfCharacters: number = 3
): Promise<any[]> {
  // API キーなしの場合はフォールバック応答を返す
  if (!hasApiKey || !genAI) {
    return createFallbackResponse('character');
  }

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

export async function completeCharacterWithGemini(
  character: any,
  project: any
): Promise<any> {
  // API キーなしの場合はフォールバック応答を返す
  if (!hasApiKey || !genAI) {
    return createFallbackResponse('character_completion');
  }

  try {
    const prompt = `
あなたは創作支援AIです。以下のキャラクターの空欄部分を補完してください。

【作品情報】
- タイトル: ${project.title}
- ジャンル: ${project.genre}

【既存キャラクター情報】
- 名前: ${character.name}
- 説明: ${character.description || "（空欄）"}
- 性格: ${character.personality || "（空欄）"}
- 背景: ${character.background || "（空欄）"}
- 役割: ${character.role || "（空欄）"}
- 所属: ${character.affiliation || "（空欄）"}

【要求】
空欄部分のみを補完し、以下のJSON形式で回答してください：
{
  "description": "キャラクターの詳細説明",
  "personality": "性格的特徴",
  "background": "背景・設定",
  "role": "物語での役割",
  "affiliation": "所属・立場"
}

既存の内容がある項目は変更せず、空欄の部分のみ魅力的に補完してください。
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const completion = JSON.parse(jsonMatch[0]);
        // 空欄の項目のみ補完
        const result: any = {};
        if (!character.description && completion.description) result.description = completion.description;
        if (!character.personality && completion.personality) result.personality = completion.personality;
        if (!character.background && completion.background) result.background = completion.background;
        if (!character.role && completion.role) result.role = completion.role;
        if (!character.affiliation && completion.affiliation) result.affiliation = completion.affiliation;
        
        return result;
      }
      
      return {};
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError);
      return {};
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`キャラクター補完に失敗しました: ${error}`);
  }
}

export async function generatePlotSuggestionWithGemini(
  projectTitle: string,
  genre: string,
  characters: any[]
): Promise<any> {
  // API キーなしの場合はフォールバック応答を返す
  if (!hasApiKey || !genAI) {
    return createFallbackResponse('plot');
  }

  try {
    const characterNames = characters.map(c => c.name).join(", ");
    
    const prompt = `
あなたは創作支援AIです。以下の条件に基づいて起承転結の全構成を提案してください。

【作品情報】
- タイトル: ${projectTitle}
- ジャンル: ${genre}
- 主要キャラクター: ${characterNames}

【出力形式】
以下の要素を含むJSON形式で回答してください：
{
  "theme": "メインテーマ",
  "setting": "舞台設定",
  "hook": "読者を引きつける要素",
  "opening": "起：物語の始まり、状況設定",
  "development": "承：展開、発展部分",
  "climax": "転：転換点、クライマックス",
  "conclusion": "結：結末、解決"
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
  // API キーなしの場合はフォールバック応答を返す
  if (!hasApiKey || !genAI) {
    return createFallbackResponse('synopsis');
  }

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
  // API キーなしの場合はフォールバック応答を返す
  if (!hasApiKey || !genAI) {
    return createFallbackResponse('chapters');
  }

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
  // API キーなしの場合はフォールバック応答を返す
  if (!hasApiKey || !genAI) {
    return createFallbackResponse('episodes');
  }

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
  // API キーなしの場合はフォールバック応答を返す
  if (!hasApiKey || !genAI) {
    return createFallbackResponse('draft');
  }

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