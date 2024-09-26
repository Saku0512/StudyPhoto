let timer;
let elapsedSeconds = 0;
let isRunning = false;

// 時間表示を更新する関数
function updateTimeDisplay() {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    // 2桁表示のためにゼロ埋めする
    document.getElementById('timer-display').textContent = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
}

// ページ読み込み時にタイマーを復元する関数
function restoreTimer() {
    const savedElapsedSeconds = parseInt(localStorage.getItem('stopwatchTime'), 10) || 0;
    elapsedSeconds = savedElapsedSeconds; // 保存された秒数を復元
    updateTimeDisplay();

    // タイマーがスタートしていたかどうかも確認する
    if(localStorage.getItem('isRunning') === 'turue') {
       startTimer(); // 以前動いていた場合は再スタート
    }
}

// タイマーを開始する関数
function startTimer() {
    if (!isRunning) {
        isRunning = true;  // タイマーが動作中であることを記録
        document.getElementById('start-btn').style.display = 'none';  // スタートボタンを隠す
        document.getElementById('stop-btn').style.display = 'inline';  // ストップボタンを表示する

        // タイマーを1秒ごとに更新
        timer = setInterval(() => {
            elapsedSeconds++;
            updateTimeDisplay();  // 表示を更新
        }, 1000);

        // タイマーが動作中であることを保存
        localStorage.setItem('isRunning', 'true');
    }
}

// タイマーを停止する関数
function stopTimer() {
    if (isRunning) {
        isRunning = false;  // タイマーが停止したことを記録
        clearInterval(timer);  // タイマーを停止
        document.getElementById('start-btn').style.display = 'inline';  // スタートボタンを表示する
        document.getElementById('stop-btn').style.display = 'none';  // ストップボタンを隠す

        // 経過時間を記録
        localStorage.setItem('stopwatchTime', elapsedSeconds);
        localStorage.setItem('isRunning', 'false'); // 停止したことを保存
    }
}

// イベントリスナーを追加
document.getElementById('start-btn').addEventListener('click', () => {
    startTimer();
});
document.getElementById('stop-btn').addEventListener('click', () => {
    stopTimer();
});
document.getElementById('finish-btn').addEventListener('click', () => {
    stopTimer();
});

// ページロード時にタイマーを復元する
window.onload = restoreTimer;