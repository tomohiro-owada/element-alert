// DOM要素
const addRuleBtn = document.getElementById('addRuleBtn');
const selectElementBtn = document.getElementById('selectElementBtn');
const ruleList = document.getElementById('ruleList');
const soundEnabledCheckbox = document.getElementById('soundEnabled');
const soundTypeSelect = document.getElementById('soundType');
const volumeInput = document.getElementById('volume');
const volumeValue = document.getElementById('volumeValue');
const testSoundBtn = document.getElementById('testSoundBtn');
const statusDiv = document.getElementById('status');

// モーダル
const ruleModal = document.getElementById('ruleModal');
const modalTitle = document.getElementById('modalTitle');
const cancelBtn = document.getElementById('cancelBtn');
const saveRuleBtn = document.getElementById('saveRuleBtn');

// フォーム
const ruleNameInput = document.getElementById('ruleName');
const ruleUrlInput = document.getElementById('ruleUrl');
const ruleSelectorInput = document.getElementById('ruleSelector');
const ruleIntervalInput = document.getElementById('ruleInterval');
const ruleEnabledCheckbox = document.getElementById('ruleEnabled');

let watchRules = [];
let editingRuleId = null;

// 初期化
async function init() {
  await loadSettings();
  await loadRules();
  setupEventListeners();

  // 選択された要素があるかチェック
  checkSelectedElement();
}

// 設定を読み込む
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['soundEnabled', 'soundVolume', 'soundType']);

    soundEnabledCheckbox.checked = result.soundEnabled !== false;
    const volume = result.soundVolume !== undefined ? result.soundVolume : 0.5;
    volumeInput.value = Math.round(volume * 100);
    volumeValue.textContent = volumeInput.value;

    soundTypeSelect.value = result.soundType || 'bell';
  } catch (error) {
    console.error('設定の読み込みに失敗:', error);
  }
}

// ルールを読み込む
async function loadRules() {
  try {
    const result = await chrome.storage.local.get(['watchRules']);
    watchRules = result.watchRules || [];

    renderRuleList();
  } catch (error) {
    console.error('ルールの読み込みに失敗:', error);
  }
}

// ルールリストを表示
function renderRuleList() {
  if (watchRules.length === 0) {
    ruleList.innerHTML = '<div class="empty-state">監視ルールがありません</div>';
    return;
  }

  ruleList.innerHTML = watchRules.map(rule => `
    <div class="rule-item ${rule.enabled ? '' : 'disabled'}">
      <div class="rule-header">
        <div class="rule-name">${escapeHtml(rule.name || rule.selector)}</div>
        <div class="rule-actions">
          <button onclick="toggleRule('${rule.id}')">${rule.enabled ? '無効化' : '有効化'}</button>
          <button onclick="editRule('${rule.id}')">編集</button>
          <button class="danger" onclick="deleteRule('${rule.id}')">削除</button>
        </div>
      </div>
      <div class="rule-details">
        <div><strong>URL:</strong> ${escapeHtml(rule.urlPattern)}</div>
        <div><strong>セレクタ:</strong> ${escapeHtml(rule.selector)}</div>
        <div><strong>間隔:</strong> ${rule.checkInterval}ms</div>
      </div>
    </div>
  `).join('');
}

// ルールを追加/編集モーダルを開く
function openRuleModal(ruleId = null) {
  editingRuleId = ruleId;

  if (ruleId) {
    // 編集モード
    const rule = watchRules.find(r => r.id === ruleId);
    if (!rule) return;

    modalTitle.textContent = 'ルールを編集';
    ruleNameInput.value = rule.name || '';
    ruleUrlInput.value = rule.urlPattern || '';
    ruleSelectorInput.value = rule.selector || '';
    ruleIntervalInput.value = rule.checkInterval || 1000;
    ruleEnabledCheckbox.checked = rule.enabled !== false;
  } else {
    // 新規追加モード
    modalTitle.textContent = 'ルールを追加';
    ruleNameInput.value = '';
    ruleUrlInput.value = '*';
    ruleSelectorInput.value = '';
    ruleIntervalInput.value = 1000;
    ruleEnabledCheckbox.checked = true;
  }

  ruleModal.classList.add('active');
}

// モーダルを閉じる
function closeRuleModal() {
  ruleModal.classList.remove('active');
  editingRuleId = null;
}

// ルールを保存
async function saveRule() {
  const name = ruleNameInput.value.trim();
  const urlPattern = ruleUrlInput.value.trim();
  const selector = ruleSelectorInput.value.trim();
  const checkInterval = parseInt(ruleIntervalInput.value, 10);
  const enabled = ruleEnabledCheckbox.checked;

  // バリデーション
  if (!selector) {
    showStatus('セレクタを入力してください', 'error');
    return;
  }

  if (!urlPattern) {
    showStatus('URLパターンを入力してください', 'error');
    return;
  }

  if (checkInterval < 500 || checkInterval > 60000) {
    showStatus('チェック間隔は500〜60000msの範囲で指定してください', 'error');
    return;
  }

  try {
    if (editingRuleId) {
      // 編集
      const index = watchRules.findIndex(r => r.id === editingRuleId);
      if (index !== -1) {
        watchRules[index] = {
          ...watchRules[index],
          name: name,
          urlPattern: urlPattern,
          selector: selector,
          checkInterval: checkInterval,
          enabled: enabled
        };
      }
    } else {
      // 新規追加
      const newRule = {
        id: generateId(),
        name: name,
        urlPattern: urlPattern,
        selector: selector,
        checkInterval: checkInterval,
        enabled: enabled,
        createdAt: Date.now()
      };
      watchRules.push(newRule);
    }

    // 保存
    await chrome.storage.local.set({ watchRules: watchRules });

    // 音声設定も保存
    await saveSettings();

    // すべてのタブに再読み込みを通知
    await notifyAllTabs();

    renderRuleList();
    closeRuleModal();
    showStatus(editingRuleId ? 'ルールを更新しました' : 'ルールを追加しました', 'success');
  } catch (error) {
    console.error('ルールの保存に失敗:', error);
    showStatus('ルールの保存に失敗しました', 'error');
  }
}

// ルールを有効/無効化
async function toggleRule(ruleId) {
  try {
    const rule = watchRules.find(r => r.id === ruleId);
    if (!rule) return;

    rule.enabled = !rule.enabled;

    await chrome.storage.local.set({ watchRules: watchRules });
    await notifyAllTabs();

    renderRuleList();
    showStatus(`ルールを${rule.enabled ? '有効' : '無効'}化しました`, 'success');
  } catch (error) {
    console.error('ルールの更新に失敗:', error);
    showStatus('ルールの更新に失敗しました', 'error');
  }
}

// ルールを編集
function editRule(ruleId) {
  openRuleModal(ruleId);
}

// ルールを削除
async function deleteRule(ruleId) {
  if (!confirm('このルールを削除しますか？')) {
    return;
  }

  try {
    watchRules = watchRules.filter(r => r.id !== ruleId);

    await chrome.storage.local.set({ watchRules: watchRules });
    await notifyAllTabs();

    renderRuleList();
    showStatus('ルールを削除しました', 'success');
  } catch (error) {
    console.error('ルールの削除に失敗:', error);
    showStatus('ルールの削除に失敗しました', 'error');
  }
}

// 音声設定を保存
async function saveSettings() {
  const soundEnabled = soundEnabledCheckbox.checked;
  const soundVolume = parseInt(volumeInput.value, 10) / 100;
  const soundType = soundTypeSelect.value;

  await chrome.storage.local.set({
    soundEnabled: soundEnabled,
    soundVolume: soundVolume,
    soundType: soundType
  });
}

// すべてのタブに再読み込みを通知
async function notifyAllTabs() {
  const tabs = await chrome.tabs.query({});

  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'RELOAD_RULES' }, (response) => {
        // エラーは無視（コンテンツスクリプトが注入されていないタブもある）
        if (chrome.runtime.lastError) {
          // 無視
        }
      });
    }
  }
}

// 要素選択モードを開始
async function startElementSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      showStatus('アクティブなタブが見つかりません', 'error');
      return;
    }

    if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
      showStatus('このページでは動作しません', 'error');
      return;
    }

    // コンテンツスクリプトが注入されているか確認
    sendMessageToTab(tab.id);
  } catch (error) {
    console.error('要素選択の開始に失敗:', error);
    showStatus('要素選択を開始できませんでした', 'error');
  }
}

// タブにメッセージを送信
function sendMessageToTab(tabId) {
  chrome.tabs.sendMessage(tabId, { type: 'GET_STATUS' }, (response) => {
    if (chrome.runtime.lastError) {
      injectContentScript(tabId);
    } else {
      startSelectionMode(tabId);
    }
  });
}

// コンテンツスクリプトを注入
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-v2.js']
    });

    setTimeout(() => {
      startSelectionMode(tabId);
    }, 100);
  } catch (error) {
    console.error('スクリプト注入エラー:', error);
    showStatus('スクリプトの注入に失敗しました', 'error');
  }
}

// 要素選択モードを開始
function startSelectionMode(tabId) {
  chrome.tabs.sendMessage(tabId, { type: 'START_ELEMENT_SELECTION' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('メッセージ送信エラー:', chrome.runtime.lastError);
      showStatus('要素選択を開始できませんでした', 'error');
    } else {
      showStatus('ページ上で監視したい要素をクリックしてください（ESCでキャンセル）', 'info');
      setTimeout(() => {
        window.close();
      }, 1500);
    }
  });
}

// 選択された要素をチェック
async function checkSelectedElement() {
  try {
    const result = await chrome.storage.local.get(['selectedElement']);

    if (result.selectedElement) {
      const { selector, url } = result.selectedElement;

      // モーダルを開いて自動入力
      openRuleModal();
      ruleSelectorInput.value = selector;
      ruleUrlInput.value = url;

      // 選択情報をクリア
      await chrome.storage.local.remove(['selectedElement']);

      showStatus('選択した要素が入力されました', 'info');
    }
  } catch (error) {
    console.error('選択要素の確認に失敗:', error);
  }
}

// 音をテスト
function testSound() {
  const volume = parseInt(volumeInput.value, 10) / 100;
  const soundType = soundTypeSelect.value;

  chrome.runtime.sendMessage({
    type: 'TEST_SOUND',
    volume: volume,
    soundType: soundType
  });

  const soundName = soundTypeSelect.options[soundTypeSelect.selectedIndex].text;
  showStatus(`テスト音を再生: ${soundName}（音量: ${volumeInput.value}%）`, 'info');
}

// ステータスメッセージを表示
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';

  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

// ユニークIDを生成
function generateId() {
  return 'rule_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// イベントリスナーを設定
function setupEventListeners() {
  addRuleBtn.addEventListener('click', () => openRuleModal());
  selectElementBtn.addEventListener('click', startElementSelection);
  cancelBtn.addEventListener('click', closeRuleModal);
  saveRuleBtn.addEventListener('click', saveRule);
  testSoundBtn.addEventListener('click', testSound);

  volumeInput.addEventListener('input', () => {
    volumeValue.textContent = volumeInput.value;
  });

  // モーダルの外側をクリックで閉じる
  ruleModal.addEventListener('click', (e) => {
    if (e.target === ruleModal) {
      closeRuleModal();
    }
  });
}

// グローバル関数（HTMLから呼び出すため）
window.toggleRule = toggleRule;
window.editRule = editRule;
window.deleteRule = deleteRule;

// 初期化実行
init();
