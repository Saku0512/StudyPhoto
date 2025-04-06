// ストップウォッチ部分
let stopwatchTimer;
let stopwatchElapsedSeconds = 0;
let stopwatchIsRunning = false;
let stopwatchStartTime;
let stopwatchEndTime;
let stopwatchElapsedTime = [];

// タイマー部分
let timer;
let remainingSeconds = 0; // 残り秒数
let isTimerRunning = false;

// タイマーを開始する関数
function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        document.getElementById('start-timer-btn').style.display = 'none';  // スタートボタンを隠す
        document.getElementById('stop-timer-btn').style.display = 'inline';  // ストップボタンを表示

        // ユーザーが入力した時間を取得
        const inputHours = parseInt(document.getElementById('input-hours').value) || 0;
        const inputMinutes = parseInt(document.getElementById('input-minutes').value) || 0;
        const inputSeconds = parseInt(document.getElementById('input-seconds').value) || 0;

        // 残り秒数を計算
        remainingSeconds = inputHours * 3600 + inputMinutes * 60 + inputSeconds;

        // タイマーを1秒ごとに更新
        timer = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateTimerDisplay();
            } else {
                // タイマーが終了したらアラートを表示
                clearInterval(timer);
                alert("タイマーが終了しました!");
                isTimerRunning = false;
                document.getElementById('start-timer-btn').style.display = 'inline';  // スタートボタンを表示
                document.getElementById('stop-timer-btn').style.display = 'none';  // ストップボタンを隠す
            }
        }, 1000);
    }
}

// タイマーを停止する関数
function stopTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timer);  // タイマーを停止
        document.getElementById('start-timer-btn').style.display = 'inline';  // スタートボタンを表示
        document.getElementById('stop-timer-btn').style.display = 'none';  // ストップボタンを隠す
    }
}

// 時間表示を更新する関数（タイマー）
function updateTimerDisplay() {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    // 2桁表示のためにゼロ埋めする
    document.getElementById('timer-timer-display').textContent = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
}

// タイマーの経過時間を保存する関数
function saveTimerElapsedTime(inputHours, inputMinutes, inputSeconds) {
    const totalSeconds = inputHours * 3600 + inputMinutes * 60 + inputSeconds;
    const elapsedTime = formatTime(totalSeconds);
    // localStorageに保存
    localStorage.setItem('timerElapsedTime', elapsedTime);
    console.log("タイマー経過時間:", elapsedTime);
}

// タイマー経過時間をフォーマットする関数
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return String(hours).padStart(2, '0') + ':' +
           String(minutes).padStart(2, '0') + ':' +
           String(seconds).padStart(2, '0');
}


// ストップウォッチの開始関数
function startStopwatch() {
    if (!stopwatchIsRunning) {
        stopwatchIsRunning = true;
        document.getElementById('start-btn').style.display = 'none'; // スタートボタンを隠す
        document.getElementById('stop-btn').style.display = 'inline'; // ストップボタンを表示

        // 現在の時刻を開始時刻として保存
        const start = new Date();
        stopwatchStartTime = start;

        // ストップウォッチを1秒ごとに更新
        stopwatchTimer = setInterval(() => {
            stopwatchElapsedSeconds++;
            updateStopwatchDisplay();  // 表示を更新
        }, 1000);
    }
}

// ストップウォッチの停止関数
function stopStopwatch() {
    if (stopwatchIsRunning) {
        stopwatchIsRunning = false;
        clearInterval(stopwatchTimer); // ストップウォッチを停止
        document.getElementById('start-btn').style.display = 'inline'; // スタートボタンを表示
        document.getElementById('stop-btn').style.display = 'none'; // ストップボタンを隠す

        // 終了時刻を記録
        const end = new Date();
        stopwatchEndTime = end;

        const elapsedPeriod = stopwatchStartTime + '-' + stopwatchEndTime; // "xx:xx-yy:yy" 形式
        stopwatchElapsedTime.push(elapsedPeriod);
        localStorage.setItem('elapsedTime', JSON.stringify(stopwatchElapsedTime));

        // 累計経過時間を更新
        localStorage.setItem('stopwatchTime', stopwatchElapsedSeconds);
    }
}

// ストップウォッチ表示を更新する関数
function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchElapsedSeconds / 3600);
    const minutes = Math.floor((stopwatchElapsedSeconds % 3600) / 60);
    const seconds = stopwatchElapsedSeconds % 60;

    // 2桁表示のためにゼロ埋めする
    document.getElementById('timer-display').textContent = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
}

// タイマーとストップウォッチのモード切り替え
document.getElementById('switch-to-timer').addEventListener('click', () => {
    document.getElementById('timer-mode').style.display = 'block';  // タイマーを表示
    document.getElementById('timer-timer-display').style.display = 'block';  // タイマーの表示部分を表示
    document.getElementById('timer-display').style.display = 'none'; // ストップウォッチを隠す
    //タイマー画面に表示するボタンの制御
    document.getElementById('start-btn').style.display = 'none';  // ストップウォッチ用のスタートボタンを非表示
    document.getElementById('stop-btn').style.display = 'none';   // ストップウォッチ用のストップボタンを非表示
    document.getElementById('start-timer-btn').style.display = 'inline';  // タイマー用のスタートボタンを表示
    document.getElementById('stop-timer-btn').style.display = 'inline';   // タイマー用のストップボタンを表示
    document.getElementById('reset-timer-btn').style.display = 'inline';  // リセットボタンを表示
});

document.getElementById('switch-to-stopwatch').addEventListener('click', () => {
    // タイマー表示部分を非表示
    document.getElementById('timer-mode').style.display = 'none'; 
    document.getElementById('timer-timer-display').style.display = 'none';  // タイマーの表示部分を非表示
    // ストップウォッチ表示部分を表示
    document.getElementById('stopwatch-mode').style.display = 'block'; // ストップウォッチを表示
    document.getElementById('timer-display').style.display = 'block'; // ストップウォッチの表示部分を表示
    // ストップウォッチのボタン表示を制御
    document.getElementById('start-btn').style.display = 'inline'; // ストップウォッチ用のスタートボタンを表示
    document.getElementById('stop-btn').style.display = 'none';   // ストップウォッチ用のストップボタンを隠す
});


// タイマーとストップウォッチのボタンイベントリスナー
document.getElementById('start-timer-btn').addEventListener('click', () => {
    startTimer();
});

document.getElementById('stop-timer-btn').addEventListener('click', () => {
    stopTimer();
});

document.getElementById('reset-timer-btn').addEventListener('click', () => {
    // タイマーをリセット
    clearInterval(timer);
    isTimerRunning = false;
    remainingSeconds = 0;
    document.getElementById('input-hours').value = '';
    document.getElementById('input-minutes').value = '';
    document.getElementById('input-seconds').value = '';
    updateTimerDisplay();
});

document.getElementById('start-btn').addEventListener('click', () => {
    startStopwatch();
});

document.getElementById('stop-btn').addEventListener('click', () => {
    stopStopwatch();
});
