# Privacy Policy for Element Alert

**Last Updated:** January 2025

## Overview

Element Alert is a Chrome extension that monitors DOM elements on web pages and sends notifications when they change. This privacy policy explains how the extension handles user data.

## Data Collection and Storage

### What Data We Collect

Element Alert stores the following data **locally on your device only**:

1. **Monitoring Rules**
   - Rule names you create
   - URL patterns you specify
   - CSS selectors for elements you want to monitor
   - Check intervals
   - Rule enabled/disabled status

2. **Settings**
   - Sound notification preferences
   - Volume settings
   - Sound type selection

3. **Notification History**
   - Last 50 notifications (page title, element content, timestamp)

### How Data is Stored

- All data is stored locally using Chrome's `storage.local` API
- **No data is sent to external servers**
- **No data is collected by the developer**
- Data remains on your device and is never transmitted anywhere

### Data Usage

The extension uses stored data solely to:
- Monitor specified DOM elements on matching web pages
- Display notifications when changes are detected
- Play notification sounds based on your preferences
- Show notification history in the extension popup

## Permissions

The extension requires the following permissions:

- **notifications**: To display desktop notifications when DOM elements change
- **activeTab**: To access the current tab for visual element selection
- **storage**: To save your monitoring rules and preferences locally
- **scripting**: To inject content scripts for DOM monitoring
- **offscreen**: To play notification sounds using Web Audio API

All permissions are used **only** for the core functionality of monitoring DOM elements and notifying you of changes.

## Third-Party Services

Element Alert does not use any third-party services, analytics, or tracking tools.

## Data Sharing

We do not share, sell, or transmit any user data to third parties because:
- No data leaves your device
- No data is collected by us
- Everything is stored locally in your browser

## Data Deletion

You can delete all extension data at any time by:
1. Removing the extension from Chrome
2. Clearing the extension's storage in Chrome settings

## Open Source

Element Alert is open source software. You can review the complete source code at:
https://github.com/tomohiro-owada/element-alert

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be posted in this document with an updated "Last Updated" date.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository:
https://github.com/tomohiro-owada/element-alert/issues

## Consent

By using Element Alert, you consent to this privacy policy.

---

# プライバシーポリシー（日本語）

**最終更新日:** 2025年1月

## 概要

Element Alertは、Webページ上のDOM要素を監視し、変更があった際に通知を送信するChrome拡張機能です。このプライバシーポリシーは、拡張機能がユーザーデータをどのように扱うかを説明します。

## データの収集と保存

### 収集するデータ

Element Alertは以下のデータを**お使いのデバイス上にのみローカル保存**します：

1. **監視ルール**
   - 作成したルール名
   - 指定したURLパターン
   - 監視する要素のCSSセレクタ
   - チェック間隔
   - ルールの有効/無効状態

2. **設定**
   - 通知音の設定
   - 音量設定
   - 音の種類の選択

3. **通知履歴**
   - 最新50件の通知（ページタイトル、要素の内容、タイムスタンプ）

### データの保存方法

- すべてのデータはChromeの`storage.local` APIを使用してローカルに保存されます
- **外部サーバーにデータは送信されません**
- **開発者によるデータ収集は一切ありません**
- データはお使いのデバイス上に留まり、外部に送信されることはありません

### データの使用目的

拡張機能は保存されたデータを以下の目的でのみ使用します：
- 一致するWebページ上で指定されたDOM要素を監視
- 変更が検出された際に通知を表示
- 設定に基づいて通知音を再生
- 拡張機能のポップアップで通知履歴を表示

## 権限

拡張機能は以下の権限を必要とします：

- **notifications**: DOM要素の変更時にデスクトップ通知を表示するため
- **activeTab**: 視覚的な要素選択のために現在のタブにアクセスするため
- **storage**: 監視ルールと設定をローカルに保存するため
- **scripting**: DOM監視のためにコンテンツスクリプトを注入するため
- **offscreen**: Web Audio APIを使用して通知音を再生するため

すべての権限は、DOM要素の監視と変更通知というコア機能の**ためにのみ**使用されます。

## サードパーティサービス

Element Alertは、サードパーティのサービス、アナリティクス、トラッキングツールを一切使用していません。

## データの共有

以下の理由により、ユーザーデータを第三者と共有、販売、送信することはありません：
- データはお使いのデバイスから外部に出ません
- 開発者によるデータ収集はありません
- すべてブラウザ内にローカル保存されます

## データの削除

以下の方法で、いつでも拡張機能のすべてのデータを削除できます：
1. Chromeから拡張機能を削除する
2. Chrome設定で拡張機能のストレージをクリアする

## オープンソース

Element Alertはオープンソースソフトウェアです。完全なソースコードは以下で確認できます：
https://github.com/tomohiro-owada/element-alert

## ポリシーの変更

このプライバシーポリシーは随時更新される可能性があります。変更があった場合は、このドキュメントに「最終更新日」とともに掲載されます。

## お問い合わせ

このプライバシーポリシーに関する質問がある場合は、GitHubリポジトリでissueを作成してください：
https://github.com/tomohiro-owada/element-alert/issues

## 同意

Element Alertを使用することで、このプライバシーポリシーに同意したものとみなされます。
