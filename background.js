// バックグラウンドスクリプト - 通知管理

// コンテンツスクリプトからのメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOM_CHANGED') {
    // 通知を作成
    createNotification(message);
  } else if (message.type === 'ELEMENT_SELECTED') {
    // 選択された要素のセレクタを保存
    saveSelectedSelector(message);
  } else if (message.type === 'TEST_SOUND') {
    // テスト音を再生
    testNotificationSound(message.volume, message.soundType);
  }
});

// テスト音を再生
async function testNotificationSound(volume = 0.5, soundType = 'bell') {
  try {
    await ensureOffscreenDocument();

    chrome.runtime.sendMessage({
      type: 'PLAY_SOUND',
      volume: volume,
      soundType: soundType
    });

    console.log('テスト音を再生しました（種類:', soundType, ', 音量:', volume, ')');
  } catch (error) {
    console.error('テスト音再生エラー:', error);
  }
}

// 選択されたセレクタを一時保存
async function saveSelectedSelector(data) {
  try {
    // 一時的に選択情報を保存（ポップアップで使用）
    await chrome.storage.local.set({
      selectedElement: {
        selector: data.selector,
        url: data.url,
        timestamp: Date.now()
      }
    });
    console.log('選択されたセレクタを保存しました:', data.selector);

    // 通知を表示
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '要素を選択しました',
      message: `セレクタ: ${data.selector}\n\n拡張機能のポップアップから監視ルールを追加してください。`,
      priority: 1
    });
  } catch (error) {
    console.error('セレクタの保存に失敗しました:', error);
  }
}

// 通知を作成する関数
async function createNotification(data) {
  const notificationId = `dom-change-${Date.now()}`;

  // タイトル: ページ名 + ルール名
  const pageTitle = data.pageTitle || '不明なページ';
  const ruleName = data.ruleName || data.selector;
  const title = `${pageTitle} - ${ruleName}`;

  // メッセージ: 更新内容（innerText）
  const newContent = data.newContent || '';
  const message = newContent ? truncateText(newContent, 150) : '(内容なし)';

  const notificationOptions = {
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: truncateText(title, 50),
    message: message,
    contextMessage: data.url,
    priority: 2,
    requireInteraction: false
  };

  chrome.notifications.create(notificationId, notificationOptions, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('通知の作成に失敗しました:', chrome.runtime.lastError);
    } else {
      console.log('通知を作成しました:', notificationId);

      // 通知履歴を保存
      saveNotificationHistory({
        id: notificationId,
        timestamp: new Date().toISOString(),
        ...data
      });

      // 音声を再生
      playNotificationSound();
    }
  });
}

// 通知音を再生
async function playNotificationSound() {
  try {
    // 音声設定を取得
    const result = await chrome.storage.local.get(['soundEnabled', 'soundVolume', 'soundType']);
    const soundEnabled = result.soundEnabled !== false; // デフォルトはtrue
    const soundVolume = result.soundVolume !== undefined ? result.soundVolume : 0.5; // デフォルトは0.5
    const soundType = result.soundType || 'bell'; // デフォルトはbell

    if (!soundEnabled) {
      console.log('音声通知は無効です');
      return;
    }

    // オフスクリーンドキュメントを使って音声を再生
    await ensureOffscreenDocument();

    // オフスクリーンドキュメントに音声再生を指示
    chrome.runtime.sendMessage({
      type: 'PLAY_SOUND',
      volume: soundVolume,
      soundType: soundType
    });

    console.log('通知音を再生しました（種類:', soundType, ', 音量:', soundVolume, ')');
  } catch (error) {
    console.error('音声再生エラー:', error);
  }
}

// オフスクリーンドキュメントを確保
async function ensureOffscreenDocument() {
  // 既に存在するか確認
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) {
    return;
  }

  // オフスクリーンドキュメントを作成
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'DOM変更通知時に音声を再生するため'
  });
}

// テキストを指定文字数で切り詰める
function truncateText(text, maxLength) {
  if (!text) return '';
  text = text.trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 通知履歴を保存
async function saveNotificationHistory(notification) {
  try {
    const result = await chrome.storage.local.get(['notificationHistory']);
    let history = result.notificationHistory || [];

    // 最新の通知を追加
    history.unshift(notification);

    // 履歴は最大50件まで保持
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    await chrome.storage.local.set({ notificationHistory: history });
  } catch (error) {
    console.error('通知履歴の保存に失敗しました:', error);
  }
}

// 通知がクリックされた時の処理
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('通知がクリックされました:', notificationId);
  chrome.notifications.clear(notificationId);
});

// 通知が閉じられた時の処理
chrome.notifications.onClosed.addListener((notificationId, byUser) => {
  console.log('通知が閉じられました:', notificationId, 'ユーザー操作:', byUser);
});

// 拡張機能のインストール時の処理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('拡張機能がインストールされました');

    // 初期設定
    chrome.storage.local.set({
      watchConfig: {
        enabled: false,
        selector: '',
        checkInterval: 1000
      },
      notificationHistory: []
    });
  } else if (details.reason === 'update') {
    console.log('拡張機能が更新されました');
  }
});
