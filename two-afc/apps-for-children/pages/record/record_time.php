<?php
$TimeNonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $TimeNonce . "' 'https://cdn.jsdelivr.net/npm/chart.js' 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns' 'https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.28.0/date-fns.min.js';");
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width , initial-scale=1.0" />
    <link rel="stylesheet" href="../../css/main.css" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <!-- Chart.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script> <!-- Date-fns adapter -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.28.0/date-fns.min.js"></script> <!-- date-fns CDN -->
    <link rel="stylesheet" href="../../css/scss/load.css" />
    <link rel="stylesheet" href="../../css/record/record_time.css" />
    <script src="../../js/load.js" defer></script>
    <script src="../../js/record.js" defer></script>
    <script src="../../js/calender.js" defer></script>
    <script nonce="<?= htmlspecialchars($TimeNonce, ENT_QUOTES, 'UTF-8') ?>" src="../../js/record_DOM.js" defer></script>
    <title>記録を振り返る</title>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">loading</p>
    </div>
    <main>
        <div class="tab">
            <a href="../../home.php"><img src="../../ui_image/return.png" alt="Return"></a>
            <a href="./record_time.php" id="timeButton" type="button"><img src="../../ui_image/clock.png" alt="Time Record"></a>
            <a href="./record_note.php" id="noteButton" type="button"><img src="../../ui_image/book.png" alt="Note Record"></a>
            <a href="./record_comment.php" id="commentButton" type="button"><img src="../../ui_image/parent.png" alt="Comment Record"></a>
        </div>
        <div id="timerSection" class="section">
            <div class="side_unit">
                <p class="side_unit_text">横軸の単位を選択してください</p>
                <div class="side_unit_button">
                    <button class="side_unit_week">週</button>
                    <button class="side_unit_mounth">月</button>
                    <button class="side_unit_year">年</button>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="studyChart"></canvas>
            </div>
            <p id="displayCategory"></p>
        </div>
        <div class="chart-container">
            <canvas id="studyChart"></canvas>
        </div>
        <p id="displayCategory"></p>
        <button class="year-mouth-daybutton" onclick="showPopup11()">y/m/dの記録</button>
        <div class="overlay" id="overlay" onclick="hidePopup()"></div>
        <div class="popup" id="popup">
            <div class="calendar">
                <div class="calendar-header">
                    <button id="prev-month">◀</button>
                    <h2 id="month-year"></h2>
                    <button id="next-month">▶</button>
                </div>
                <div class="calendar-days">
                    <div class="day-name sunday">SUN</div>
                    <div class="day-name">MON</div>
                    <div class="day-name">TUE</div>
                    <div class="day-name">WED</div>
                    <div class="day-name">THU</div>
                    <div class="day-name">FRI</div>
                    <div class="day-name saturday">SAT</div>
                </div>
            </div>
            <div class="calendar-days">
                <div class="day-name sunday">SUN</div>
                <div class="day-name">MON</div>
                <div class="day-name">TUE</div>
                <div class="day-name">WED</div>
                <div class="day-name">THU</div>
                <div class="day-name">FRI</div>
                <div class="day-name saturday">SAT</div>
            </div>
            <div id="calendar-body" class="calendar-body"></div>
        </div>
    </main>
</body>
</html>