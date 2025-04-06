<?php
session_start();
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $nonce . "'; style-src 'self' 'nonce-" . $nonce . "' ;");
?> 

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="../../css/main.css" />
    <link rel="stylesheet" href="../../css/scss/load.css" />
    <link rel="stylesheet" href="../../css/study/study.css" />
    <script src="../../js/load.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="../../js/stopwatch.js"  nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <title>勉強する</title>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">loading</p>
    </div>
    <main>
        <div class="return">
            <a href="../../home.php"><img src="../../ui_image/return.png"></a>
        </div>
        <div class="mode-switch">
    <button id="switch-to-timer">タイマー</button>
    <button id="switch-to-stopwatch">ストップウォッチ</button>
</div>

<!-- タイマー用の入力フィールド -->
<!-- タイマー表示部分 -->
<div id="timer-mode" class="timer-container" style="display:none;">
    <h1 id="timer-timer-display">00:00:00</h1>
    <div class="input-container">
        <!-- ユーザーが時間を入力できるフィールド -->
        <input id="input-hours" type="number" placeholder="時" min="0">
        <input id="input-minutes" type="number" placeholder="分" min="0" max="59">
        <input id="input-seconds" type="number" placeholder="秒" min="0" max="59">
    </div>
    <div class="button-container">
        <button id="start-timer-btn">タイマー開始</button>
        <button id="stop-timer-btn">タイマー停止</button>
        <button id="reset-timer-btn">タイマーリセット</button>
    </div>
</div>

<!-- ストップウォッチ表示部分 -->
<div id="stopwatch-mode" class="timer-container">
        <div class="timer-container">
            <h1 id="timer-display">00:00:00</h1>
        </div>
        <div class="start-container">
            <button id="start-btn"><img src="../../ui_image/start.png"></button>
        </div>
        <div class="stop-container">
            <button id="stop-btn"><img src="../../ui_image/stop.png"></button>
        </div>
        <div class="next">
            <a href="./study-next.php"><button id="finish-btn">終了する</button></a>
        </div>
    </main>
</body>
</html>





