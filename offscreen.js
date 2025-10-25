// オフスクリーンドキュメント - 音声再生用

// 10種類の通知音
const SOUND_TYPES = {
  'bell': {
    name: 'ベル',
    fn: playBell
  },
  'ping': {
    name: 'ピンポン',
    fn: playPing
  },
  'coin': {
    name: 'コイン',
    fn: playCoin
  },
  'alert': {
    name: 'アラート',
    fn: playAlert
  },
  'beep': {
    name: 'ビープ',
    fn: playBeep3Times
  },
  'soft': {
    name: 'ソフト',
    fn: playSoft
  },
  'high': {
    name: 'ハイトーン',
    fn: playHigh
  },
  'low': {
    name: 'ロートーン',
    fn: playLow
  },
  'trill': {
    name: 'トリル',
    fn: playTrill
  },
  'chime': {
    name: 'チャイム',
    fn: playChime
  }
};

// 1. ベル（柔らかい上昇音）
function playBell(audioContext, volume) {
  playTone(audioContext, 800, 0.1, 0, volume, 'sine');
  playTone(audioContext, 1000, 0.15, 0.12, volume, 'sine');
}

// 2. ピンポン（高い2音）
function playPing(audioContext, volume) {
  playTone(audioContext, 1200, 0.1, 0, volume, 'sine');
  playTone(audioContext, 1000, 0.1, 0.12, volume, 'sine');
}

// 3. コイン（短い高音）
function playCoin(audioContext, volume) {
  playTone(audioContext, 1500, 0.05, 0, volume, 'square');
  playTone(audioContext, 2000, 0.05, 0.06, volume, 'square');
  playTone(audioContext, 2500, 0.1, 0.12, volume, 'square');
}

// 4. アラート（警告的な音）
function playAlert(audioContext, volume) {
  playTone(audioContext, 600, 0.1, 0, volume, 'square');
  playTone(audioContext, 600, 0.1, 0.12, volume, 'square');
  playTone(audioContext, 600, 0.15, 0.24, volume, 'square');
}

// 5. ビープ3回（短い連続音）
function playBeep3Times(audioContext, volume) {
  playTone(audioContext, 1000, 0.08, 0, volume, 'sine');
  playTone(audioContext, 1000, 0.08, 0.1, volume, 'sine');
  playTone(audioContext, 1000, 0.08, 0.2, volume, 'sine');
}

// 6. ソフト（柔らかい低音）
function playSoft(audioContext, volume) {
  playTone(audioContext, 500, 0.15, 0, volume * 0.8, 'sine');
  playTone(audioContext, 700, 0.2, 0.1, volume * 0.8, 'sine');
}

// 7. ハイトーン（高い持続音）
function playHigh(audioContext, volume) {
  playTone(audioContext, 1800, 0.25, 0, volume, 'sine');
}

// 8. ロートーン（低い2音）
function playLow(audioContext, volume) {
  playTone(audioContext, 400, 0.15, 0, volume, 'sine');
  playTone(audioContext, 300, 0.2, 0.15, volume, 'sine');
}

// 9. トリル（上昇する音階）
function playTrill(audioContext, volume) {
  playTone(audioContext, 800, 0.08, 0, volume, 'sine');
  playTone(audioContext, 1000, 0.08, 0.08, volume, 'sine');
  playTone(audioContext, 1200, 0.08, 0.16, volume, 'sine');
  playTone(audioContext, 1400, 0.1, 0.24, volume, 'sine');
}

// 10. チャイム（3音の和音的な音）
function playChime(audioContext, volume) {
  playTone(audioContext, 800, 0.3, 0, volume * 0.7, 'sine');
  playTone(audioContext, 1000, 0.3, 0, volume * 0.7, 'sine');
  playTone(audioContext, 1200, 0.3, 0, volume * 0.7, 'sine');
}

// 基本的な音を再生する関数
function playTone(audioContext, frequency, duration, startTime, volume, waveType = 'sine') {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = waveType; // 'sine', 'square', 'sawtooth', 'triangle'

  // 音量のフェードイン・フェードアウト
  const now = audioContext.currentTime + startTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
  gainNode.gain.linearRampToValueAtTime(volume, now + duration - 0.05);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

// 指定された種類の音を再生
function playSound(soundType = 'bell', volume = 0.5) {
  const audioContext = new AudioContext();

  const sound = SOUND_TYPES[soundType];
  if (sound && sound.fn) {
    sound.fn(audioContext, volume);
  } else {
    // デフォルトはベル
    playBell(audioContext, volume);
  }

  // コンテキストを閉じる
  setTimeout(() => {
    audioContext.close();
  }, 1000);
}

// メッセージリスナー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAY_SOUND') {
    const volume = message.volume !== undefined ? message.volume : 0.5;
    const soundType = message.soundType || 'bell';

    playSound(soundType, volume);
    console.log('音声を再生しました（種類:', soundType, ', 音量:', volume, ')');
  }
});

console.log('オフスクリーンドキュメントが起動しました');
