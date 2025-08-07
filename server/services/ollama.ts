// Windows互換のOllama統合
let ollama: any = null;

// 動的にOllamaをインポート
const initializeOllama = async () => {
  try {
    const { Ollama } = await import('ollama');
    ollama = new Ollama({ host: 'http://localhost:11434' });
    return true;
  } catch (error) {
    console.warn('Ollama モジュールの読み込みに失敗しました:', error);
    return false;
  }
};

// 初期化を実行
initializeOllama();

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    if (!ollama) {
      const initialized = await initializeOllama();
      if (!initialized) return false;
    }
    
    await ollama.list();
    return true;
  } catch (error) {
    console.error("Ollama接続エラー:", error);
    return false;
  }
}

export async function getAvailableModels(): Promise<string[]> {
  try {
    if (!ollama) {
      const initialized = await initializeOllama();
      if (!initialized) return [];
    }
    
    const models = await ollama.list();
    return models.models.map((model: any) => model.name);
  } catch (error) {
    console.error("モデル取得エラー:", error);
    return [];
  }
}

export async function generateWithOllama(
  prompt: string,
  model: string = 'llama3.2:3b'
): Promise<string> {
  try {
    if (!ollama) {
      const initialized = await initializeOllama();
      if (!initialized) {
        throw new Error('Ollama が利用できません。Ollamaがインストールされ、起動していることを確認してください。');
      }
    }
    
    const response = await ollama.generate({
      model,
      prompt,
      stream: false
    });
    
    return response.response;
  } catch (error) {
    console.error("Ollama生成エラー:", error);
    throw new Error(`AI生成に失敗しました: ${error}`);
  }
}

// キャラクター補完機能
export async function completeCharacterWithOllama(
  character: any,
  project: any,
  model: string = 'llama3.2:3b'
): Promise<any> {
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

既存の内容がある項目は変更せず、空欄の部分のみ魅力的に補完してください。日本語で回答してください。
`;

  try {
    const response = await generateWithOllama(prompt, model);
    
    // JSONレスポンスを抽出
    const jsonMatch = response.match(/\{[\s\S]*\}/);
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
  } catch (error) {
    console.error("キャラクター補完エラー:", error);
    throw new Error(`キャラクター補完に失敗しました: ${error}`);
  }
}

// プロット生成機能
export async function generatePlotWithOllama(
  projectTitle: string,
  genre: string,
  characters: any[],
  model: string = 'llama3.2:3b'
): Promise<any> {
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

魅力的で読者の興味を引く構成を提案してください。日本語で回答してください。
`;

  try {
    const response = await generateWithOllama(prompt, model);
    
    // JSONレスポンスを抽出
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // JSONが見つからない場合のフォールバック
    return {
      theme: "人間の成長と絆",
      setting: "現代日本",
      hook: "謎めいた出会い",
      opening: "平凡な日常から始まる物語",
      development: "困難な試練と成長",
      climax: "最大の危機と決断",
      conclusion: "新たな始まりへ"
    };
  } catch (error) {
    console.error("プロット生成エラー:", error);
    throw new Error(`プロット生成に失敗しました: ${error}`);
  }
}

// あらすじ生成機能
export async function generateSynopsisWithOllama(
  projectTitle: string,
  plot: any,
  characters: any[],
  model: string = 'llama3.2:3b'
): Promise<string> {
  const characterNames = characters.map(c => c.name).join(", ");
  
  const prompt = `
あなたは創作支援AIです。以下の情報を基に魅力的なあらすじを作成してください。

【作品情報】
- タイトル: ${projectTitle}
- 主要キャラクター: ${characterNames}
- テーマ: ${plot?.theme || "未設定"}
- 構成: ${plot?.opening || "未設定"} → ${plot?.development || "未設定"} → ${plot?.climax || "未設定"} → ${plot?.conclusion || "未設定"}

【要求】
- 読者の興味を引く魅力的なあらすじを作成
- 300-500文字程度
- ネタバレを避けつつ、物語の魅力を伝える
- 日本語で作成

あらすじのみを出力してください。
`;

  try {
    const response = await generateWithOllama(prompt, model);
    return response.trim();
  } catch (error) {
    console.error("あらすじ生成エラー:", error);
    throw new Error(`あらすじ生成に失敗しました: ${error}`);
  }
}