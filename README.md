# Element Alert

<div align="center">

**特定のDOM要素の変更を監視して、変化があったときに通知を表示するChrome拡張機能**

[English](#english) | [日本語](#japanese)

</div>

---

## 🌟 Features

- 🎯 **Multiple Monitoring Rules** - Monitor multiple elements across different pages
- 🖱️ **Visual Element Selection** - Click on any element to start monitoring it
- 🔔 **Desktop Notifications** - Get notified when elements change
- 🎵 **10 Sound Types** - Choose from 10 different notification sounds
- 🌐 **URL Pattern Matching** - Monitor elements on specific pages using wildcards
- 📊 **Real-time Detection** - Uses MutationObserver for instant change detection
- 💾 **Notification History** - Keep track of all changes

## 🚀 Use Cases

- **Price Monitoring** - Track product prices on e-commerce sites
- **Stock Availability** - Get notified when items are back in stock
- **Status Updates** - Monitor order status, shipping tracking, etc.
- **Content Changes** - Watch for updates on news sites, forums, etc.
- **Social Media** - Monitor follower counts, likes, etc.

## 📦 Installation

### From Source

1. Clone this repository:
```bash
git clone https://github.com/yourusername/element-alert.git
cd element-alert
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (top right)

4. Click "Load unpacked" and select the project folder

5. The extension icon should appear in your toolbar

## 🎨 Icon Files

You need to provide icon files for the extension to work properly:

- `icons/icon16.png` (16x16px)
- `icons/icon48.png` (48x48px)
- `icons/icon128.png` (128x128px)

These are already included in the repository with a DOM-themed design.

## 📖 How to Use

### 1. Add a Monitoring Rule

**Method A: Visual Selection**
1. Click the extension icon
2. Click "要素を選択" (Select Element)
3. Hover over elements on the page (they'll be highlighted in blue)
4. Click on the element you want to monitor
5. A rule creation form will open automatically
6. Give it a name and click "保存" (Save)

**Method B: Manual Entry**
1. Click the extension icon
2. Click "ルールを追加" (Add Rule)
3. Enter the CSS selector manually
4. Configure URL pattern and check interval
5. Click "保存" (Save)

### 2. Configure Sound Settings

1. Click the extension icon
2. Scroll to "音声設定" (Sound Settings)
3. Choose from 10 sound types:
   - Bell (soft ascending)
   - Ping Pong (high 2-tone)
   - Coin (short high tone)
   - Alert (warning)
   - Beep (3 consecutive)
   - Soft (gentle low tone)
   - High Tone (sustained)
   - Low Tone (low 2-tone)
   - Trill (ascending scale)
   - Chime (chord)
4. Adjust volume
5. Click "選択した音をテスト" to test the sound

### 3. Monitor Elements

Once configured, the extension will:
- Automatically monitor elements when you visit matching pages
- Send desktop notifications when changes are detected
- Play your selected sound
- Save notification history

## 🛠️ Technical Details

### Architecture

- **manifest.json** - Extension configuration (Manifest V3)
- **content-v2.js** - Content script for DOM monitoring
- **background.js** - Service worker for notifications
- **popup-v2.html/js** - User interface
- **offscreen.js** - Audio playback using Web Audio API

### Monitoring Methods

1. **MutationObserver** - Real-time detection of:
   - Element additions/removals
   - Text content changes
   - Attribute modifications
   - Subtree changes

2. **Periodic Checking** - Fallback polling at configurable intervals

### Storage

Uses Chrome's `storage.local` API to save:
- Monitoring rules
- Sound preferences
- Notification history (last 50)

## 🐛 Troubleshooting

### Extension not detecting changes

1. Check if the CSS selector is correct
   - Open DevTools (F12)
   - Run `document.querySelector('your-selector')` in console
   - Should return the element

2. Verify the URL pattern matches the current page

3. Check if the monitoring rule is enabled

4. Try reloading the page (F5)

### Notifications not showing

1. Check Chrome notification permissions:
   - `chrome://settings/content/notifications`

2. Check system notification settings:
   - **macOS**: System Preferences → Notifications → Google Chrome
   - **Windows**: Settings → System → Notifications & actions

### "Extension context invalidated" error

This happens when you reload the extension while a page is open. Simply reload the page (F5).

## 📝 Example Selectors

| Selector | Description |
|----------|-------------|
| `#price` | Element with id="price" |
| `.stock-status` | Elements with class="stock-status" |
| `div.product > span.price` | Span with class "price" inside div with class "product" |
| `[data-status]` | Elements with data-status attribute |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🔒 Privacy Policy

Element Alert does not collect, store, or transmit any personal data to external servers. All data is stored locally on your device using Chrome's storage API.

For full details, see our [Privacy Policy](PRIVACY_POLICY.md).

## 👤 Author

Created by [Your Name](https://github.com/yourusername)

---

<div id="japanese"></div>

# Element Alert (日本語)

## 概要

特定のDOM要素の変更を監視して、変化があったときに通知を表示するChrome拡張機能です。

## 主な機能

- 複数のタブ・複数のDOM要素を同時監視
- マウスで直接要素を選択
- デスクトップ通知
- 10種類の通知音から選択可能
- URLパターンマッチング（ワイルドカード対応）
- リアルタイム検出（MutationObserver使用）
- 通知履歴の保存

## インストール方法

### ソースからインストール

1. リポジトリをクローン：
```bash
git clone https://github.com/yourusername/element-alert.git
cd element-alert
```

2. Chromeで `chrome://extensions/` を開く

3. 右上の「デベロッパーモード」をON

4. 「パッケージ化されていない拡張機能を読み込む」をクリック

5. プロジェクトフォルダを選択

## 使い方

### 1. 監視ルールを追加

**方法A: マウスで選択**
1. 拡張機能アイコンをクリック
2. 「要素を選択」ボタンをクリック
3. ページ上で監視したい要素をクリック
4. 自動的にルール作成画面が開く
5. ルール名を入力して「保存」

**方法B: 手動入力**
1. 拡張機能アイコンをクリック
2. 「ルールを追加」ボタンをクリック
3. CSSセレクタを手動入力
4. URLパターンとチェック間隔を設定
5. 「保存」をクリック

### 2. 音声設定

1. ポップアップを開く
2. 「音声設定」セクションで通知音を選択
3. 音量を調整
4. 「選択した音をテスト」で試聴

### 3. 監視開始

設定後、該当ページを開くと自動的に監視が開始されます。
変更が検出されると通知と音で知らせます。

## トラブルシューティング

詳しくは `TROUBLESHOOTING.md` を参照してください。

## ライセンス

MIT License

## プライバシーポリシー

Element Alertは個人データを外部サーバーに収集、保存、送信しません。すべてのデータはChromeのストレージAPIを使用してお使いのデバイス上にローカル保存されます。

詳細は[プライバシーポリシー](PRIVACY_POLICY.md)をご覧ください。

## 作者

[Your Name](https://github.com/yourusername)
