// Windows 11 動作テスト用スクリプト
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Windows 11 動作テストを開始します ===');
console.log('');

// テスト項目
const tests = [
  {
    name: 'Node.js バージョン確認',
    command: 'node --version',
    required: true
  },
  {
    name: 'NPM バージョン確認', 
    command: 'npm --version',
    required: true
  },
  {
    name: 'Ollama 接続確認',
    command: 'curl -s http://localhost:11434/api/tags',
    required: false
  }
];

// ファイル存在確認
const requiredFiles = [
  'package.json',
  'server/index.local.js', 
  'start-local.bat',
  'dist/public/index.html'
];

console.log('📁 必要ファイルの確認...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} が見つかりません`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('');
  console.log('❌ 必要なファイルが不足しています。');
  console.log('   npm run build を実行してください。');
  process.exit(1);
}

// システム環境テスト
console.log('');
console.log('🔧 システム環境テスト...');

let testIndex = 0;

function runNextTest() {
  if (testIndex >= tests.length) {
    console.log('');
    console.log('🎉 すべてのテストが完了しました！');
    console.log('');
    console.log('起動方法:');
    console.log('  Windows: start-local.bat をダブルクリック');
    console.log('  手動:    node server/index.local.js');
    console.log('');
    console.log('アクセス: http://localhost:5000');
    return;
  }

  const test = tests[testIndex];
  testIndex++;

  exec(test.command, { timeout: 5000 }, (error, stdout, stderr) => {
    if (error) {
      if (test.required) {
        console.log(`❌ ${test.name}: ${error.message}`);
        if (test.name.includes('Node.js')) {
          console.log('   → https://nodejs.org/ からNode.jsをインストールしてください');
        }
        process.exit(1);
      } else {
        console.log(`⚠️  ${test.name}: 利用できません（オプション機能）`);
      }
    } else {
      console.log(`✅ ${test.name}: ${stdout.trim()}`);
    }
    
    runNextTest();
  });
}

// プラットフォーム情報表示
console.log('');
console.log('💻 システム情報:');
console.log(`   OS: ${process.platform} ${process.arch}`);
console.log(`   Node.js: ${process.version}`);
console.log(`   作業ディレクトリ: ${process.cwd()}`);
console.log('');

runNextTest();