let timer;
let elapsedSeconds = 0;
let isRunning = false;
let startTime; // 開始時刻
let endTime; // 終了時刻
let totalElapsedSeconds = 0; // 累計経過時間
let elapsedTime = [];

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
    if(localStorage.getItem('isRunning') === 'true') {
        startTime = new Date(localStorage.getItem('startTime')); // 開始時刻を復元
        totalElapsedSeconds = savedElapsedSeconds; // 累計経過時間を復元
        startTimer(); // 以前動いていた場合は再スタート
    }
}

// タイマーを開始する関数
function startTimer() {
    if (!isRunning) {
        isRunning = true;  // タイマーが動作中であることを記録
        document.getElementById('start-btn').style.display = 'none';  // スタートボタンを隠す
        document.getElementById('stop-btn').style.display = 'inline';  // ストップボタンを表示する

        // 現在の時刻を開始時刻として保存
        const start = new Date();
        startTime = start.getHours().toString().padStart(2, '0') + ':' + start.getMinutes().toString().padStart(2, '0');
        localStorage.setItem('startTime', startTime);

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

        // 終了時刻を記録
        const end = new Date();
        endTime = end.getHours().toString().padStart(2, '0') + ':' + end.getMinutes().toString().padStart(2, '0');

        const elapsedPeriod = startTime + '-' + endTime;  // "xx:xx-yy:yy" 形式
        elapsedTime.push(elapsedPeriod);
        localStorage.setItem('elapsedTime', JSON.stringify(elapsedTime));
        console.log('経過時間リスト:', elapsedTime);

        // 累計経過時間を更新
        localStorage.setItem('stopwatchTime', elapsedSeconds);

        // 終了時刻を記録
        localStorage.setItem('endTime', endTime.toString());

        // 停止したことを保存
        localStorage.setItem('isRunning', 'false');
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