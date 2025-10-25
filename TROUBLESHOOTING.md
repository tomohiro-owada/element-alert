# トラブルシューティングガイド

「何も起きない」場合の確認手順です。

## ステップ1: 拡張機能が正しく読み込まれているか確認

1. `chrome://extensions/` を開く
2. 「DOM Update Notifier」が表示されているか確認
3. エラーが表示されていないか確認
4. **エラーがある場合**:
   - 「再読み込み」ボタンをクリック
   - エラーメッセージをメモして確認

## ステップ2: テストページで動作確認

1. プロジェクトフォルダの `test.html` をブラウザで開く
   ```
   file:///Users/oowadatomohiro/projects/notify-dom-update/test.html
   ```

2. 拡張機能のアイコンをクリック

3. 「要素を選択」ボタンをクリック

4. ページ上で「価格」（赤い大きな数字）にマウスを当てる
   - 青い枠線が表示されるはず

5. クリックする
   - 通知が表示されるはず
   - 「要素を選択しました」という通知

6. 再度拡張機能のアイコンをクリック
   - セレクタ欄に `#price` が入力されているはず

7. 「監視を有効にする」にチェックを入れて「設定を保存」

8. テストページの「価格を変更」ボタンをクリック
   - **通知が表示されるはず！**

## ステップ3: コンソールログを確認

### ページのコンソール

1. テストページで F12 を押す
2. Console タブを開く
3. 以下のログが出ているか確認:
   ```
   DOM監視を開始しました: #price
   ```

### バックグラウンドスクリプトのコンソール

1. `chrome://extensions/` を開く
2. 「DOM Update Notifier」の「Service Worker」をクリック
3. Console タブで以下を確認:
   ```
   選択されたセレクタを保存しました: #price
   通知を作成しました: ...
   ```

### ポップアップのコンソール

1. 拡張機能のアイコンをクリック
2. ポップアップ上で右クリック → 「検証」
3. エラーがないか確認

## ステップ4: 通知権限を確認

1. `chrome://settings/content/notifications` を開く
2. Chrome の通知が許可されているか確認
3. ブロックリストに localhost や file:// が入っていないか確認

## よくある問題と解決策

### 1. 「要素を選択」を押しても何も起きない

**原因**: コンテンツスクリプトが注入されていない

**解決策**:
- ページをリロード（F5）
- 拡張機能を再読み込み
- 特定のページ（chrome:// など）では動作しません

### 2. 要素は選択できるが監視が動作しない

**確認事項**:
- ページのコンソールで以下を実行:
  ```javascript
  chrome.storage.local.get(['watchConfig'], (result) => {
    console.log('設定:', result.watchConfig);
  });
  ```
- `enabled: true` になっているか確認
- `selector` が正しいか確認

**手動で監視を開始**:
ページのコンソールで以下を実行:
```javascript
const element = document.querySelector('#price');
console.log('要素:', element);
console.log('内容:', element ? element.textContent : 'なし');
```

### 3. 通知が表示されない

**確認事項**:
- macOS の場合: システム環境設定 → 通知 → Google Chrome → 通知を許可
- Windows の場合: 設定 → システム → 通知とアクション → Google Chrome

**テスト**:
バックグラウンドスクリプトのコンソールで以下を実行:
```javascript
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icons/icon48.png',
  title: 'テスト通知',
  message: 'これが表示されれば通知は動作しています'
});
```

### 4. DOM変更が検出されない

**デバッグ**:
ページのコンソールで以下を実行:
```javascript
// MutationObserverが動作しているか確認
const target = document.querySelector('#price');
const observer = new MutationObserver((mutations) => {
  console.log('変更検出:', mutations);
});
observer.observe(target, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true
});

// テスト: 要素を変更
target.textContent = '新しい値: ' + Date.now();
```

## デバッグ用のコマンド

### 現在の設定を表示
ページのコンソールで:
```javascript
chrome.storage.local.get(null, (result) => {
  console.log('全設定:', result);
});
```

### 設定をリセット
ページのコンソールで:
```javascript
chrome.storage.local.clear(() => {
  console.log('設定をクリアしました');
});
```

### 監視を強制的に開始
ページのコンソールで:
```javascript
chrome.runtime.sendMessage({
  type: 'UPDATE_CONFIG',
  config: {
    enabled: true,
    selector: '#price',
    checkInterval: 1000
  }
}, (response) => {
  console.log('応答:', response);
});
```

## まだ解決しない場合

1. 拡張機能を完全に削除して再インストール
2. Chrome を再起動
3. 以下の情報を確認:
   - Chrome のバージョン
   - OS のバージョン
   - コンソールのエラーメッセージ全文
   - 上記の手順でどこまで動作したか
