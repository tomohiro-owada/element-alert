// DOM監視の設定を保持（複数監視対応）
let watchRules = []; // 監視ルールのリスト
let observers = new Map(); // セレクタごとのObserver: Map<ruleId, {observer, intervalId, previousContent}>
let isSelectingElement = false;
let highlightedElement = null;
let overlayDiv = null;

// ストレージから監視ルールを読み込む
async function loadWatchRules() {
  try {
    if (!chrome.runtime?.id) {
      console.warn('拡張機能のコンテキストが無効化されています');
      return;
    }

    const result = await chrome.storage.local.get(['watchRules']);
    if (result.watchRules && Array.isArray(result.watchRules)) {
      watchRules = result.watchRules;

      // 現在のURLに適用されるルールを開始
      startApplicableRules();
    }
  } catch (error) {
    console.warn('監視ルールの読み込みに失敗しました:', error);
  }
}

// 現在のURLに適用される監視ルールを開始
function startApplicableRules() {
  const currentUrl = window.location.href;

  // 既存の監視をすべて停止
  stopAllWatching();

  // 現在のURLに一致するルールを抽出
  const applicableRules = watchRules.filter(rule => {
    if (!rule.enabled) return false;
    return matchesUrlPattern(currentUrl, rule.urlPattern);
  });

  console.log(`現在のURLに適用される監視ルール: ${applicableRules.length}件`);

  // 各ルールの監視を開始
  applicableRules.forEach(rule => {
    startWatchingRule(rule);
  });
}

// URLパターンマッチング
function matchesUrlPattern(url, pattern) {
  if (!pattern || pattern === '*') return true;

  // シンプルなワイルドカードマッチング
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 特殊文字をエスケープ
    .replace(/\*/g, '.*'); // * を .* に変換

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

// 特定のルールの監視を開始
function startWatchingRule(rule) {
  const targetElement = document.querySelector(rule.selector);

  if (!targetElement) {
    console.log(`[${rule.name || rule.selector}] 要素が見つかりません:`, rule.selector);
    return;
  }

  console.log(`[${rule.name || rule.selector}] 監視を開始:`, rule.selector);

  const previousContent = targetElement.textContent;

  // MutationObserver を作成
  const observer = new MutationObserver((mutations) => {
    const currentContent = targetElement.textContent;
    const watchData = observers.get(rule.id);

    if (watchData && currentContent !== watchData.previousContent) {
      console.log(`[${rule.name || rule.selector}] DOM変更を検出:`, currentContent);

      // 通知を送信
      sendMessageSafely({
        type: 'DOM_CHANGED',
        rule: rule,
        selector: rule.selector,
        ruleName: rule.name || rule.selector,
        oldContent: watchData.previousContent,
        newContent: currentContent,
        url: window.location.href,
        pageTitle: document.title
      });

      watchData.previousContent = currentContent;
    }
  });

  // 監視設定
  observer.observe(targetElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });

  // 定期的なチェックも併用
  const intervalId = setInterval(() => {
    const element = document.querySelector(rule.selector);
    if (element) {
      const currentContent = element.textContent;
      const watchData = observers.get(rule.id);

      if (watchData && currentContent !== watchData.previousContent) {
        console.log(`[${rule.name || rule.selector}] 定期チェックでDOM変更を検出:`, currentContent);

        sendMessageSafely({
          type: 'DOM_CHANGED',
          rule: rule,
          selector: rule.selector,
          ruleName: rule.name || rule.selector,
          oldContent: watchData.previousContent,
          newContent: currentContent,
          url: window.location.href,
          pageTitle: document.title
        });

        watchData.previousContent = currentContent;
      }
    }
  }, rule.checkInterval || 1000);

  // Observerを保存
  observers.set(rule.id, {
    observer: observer,
    intervalId: intervalId,
    previousContent: previousContent
  });
}

// すべての監視を停止
function stopAllWatching() {
  observers.forEach((watchData, ruleId) => {
    if (watchData.observer) {
      watchData.observer.disconnect();
    }
    if (watchData.intervalId) {
      clearInterval(watchData.intervalId);
    }
  });

  observers.clear();
  console.log('すべての監視を停止しました');
}

// 特定のルールの監視を停止
function stopWatchingRule(ruleId) {
  const watchData = observers.get(ruleId);
  if (watchData) {
    if (watchData.observer) {
      watchData.observer.disconnect();
    }
    if (watchData.intervalId) {
      clearInterval(watchData.intervalId);
    }
    observers.delete(ruleId);
    console.log('監視を停止しました:', ruleId);
  }
}

// 要素選択モードを開始
function startElementSelection() {
  if (isSelectingElement) return;

  isSelectingElement = true;

  overlayDiv = document.createElement('div');
  overlayDiv.style.cssText = `
    position: absolute;
    border: 2px solid #1a73e8;
    background-color: rgba(26, 115, 232, 0.1);
    pointer-events: none;
    z-index: 999999;
    transition: all 0.1s ease;
  `;
  document.body.appendChild(overlayDiv);

  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown, true);

  console.log('要素選択モードを開始しました');
}

// 要素選択モードを停止
function stopElementSelection() {
  if (!isSelectingElement) return;

  isSelectingElement = false;
  highlightedElement = null;

  if (overlayDiv && overlayDiv.parentNode) {
    overlayDiv.parentNode.removeChild(overlayDiv);
    overlayDiv = null;
  }

  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleKeyDown, true);

  console.log('要素選択モードを停止しました');
}

// マウス移動時のハンドラー
function handleMouseMove(event) {
  if (!isSelectingElement) return;

  event.stopPropagation();
  highlightedElement = event.target;

  const rect = highlightedElement.getBoundingClientRect();

  overlayDiv.style.left = `${rect.left + window.scrollX}px`;
  overlayDiv.style.top = `${rect.top + window.scrollY}px`;
  overlayDiv.style.width = `${rect.width}px`;
  overlayDiv.style.height = `${rect.height}px`;
}

// クリック時のハンドラー
function handleClick(event) {
  if (!isSelectingElement) return;

  event.preventDefault();
  event.stopPropagation();

  const element = highlightedElement;
  const selector = generateSelector(element);

  console.log('選択された要素のセレクタ:', selector);

  sendMessageSafely({
    type: 'ELEMENT_SELECTED',
    selector: selector,
    url: window.location.href
  });

  stopElementSelection();
}

// キーボード入力のハンドラー（ESCで中止）
function handleKeyDown(event) {
  if (!isSelectingElement) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    stopElementSelection();
  }
}

// 要素からユニークなCSSセレクタを生成
function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(c => c);
    if (classes.length > 0) {
      const classSelector = element.tagName.toLowerCase() + '.' + classes.join('.');
      if (document.querySelectorAll(classSelector).length === 1) {
        return classSelector;
      }
    }
  }

  const path = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children).filter(
        e => e.tagName === current.tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

// メッセージリスナー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RELOAD_RULES') {
    // 監視ルールを再読み込み
    loadWatchRules();
    sendResponse({ success: true });
  } else if (message.type === 'GET_STATUS') {
    // 現在の監視状態を返す
    sendResponse({
      activeRules: Array.from(observers.keys()).length,
      isWatching: observers.size > 0
    });
  } else if (message.type === 'START_ELEMENT_SELECTION') {
    startElementSelection();
    sendResponse({ success: true });
  }

  return true;
});

// 安全にメッセージを送信
function sendMessageSafely(message, callback) {
  try {
    if (!chrome.runtime?.id) {
      console.warn('拡張機能のコンテキストが無効化されています。ページをリロードしてください。');
      return;
    }

    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('メッセージ送信エラー（無視されます）:', chrome.runtime.lastError.message || chrome.runtime.lastError);
        return;
      }

      if (callback) {
        callback(response);
      }
    });
  } catch (error) {
    console.warn('メッセージ送信中にエラーが発生しました（無視されます）:', error);
  }
}

// 初期化
try {
  loadWatchRules();
} catch (error) {
  console.warn('初期化エラー:', error);
}
