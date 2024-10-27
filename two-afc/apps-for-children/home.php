<?php
session_start();

$username = $_SESSION['username'];
$userId = $_SESSION['user_id'];
$email = $_SESSION['email'];
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewpot" content="width=device-width , initial-scale=1.0" />
    <link rel="stylesheet" href="css/main.css" />
    <link rel="stylesheet" href="css/scss/load.css" />
    <script src="./js/load.js" defer></script>
    <title>ホーム</title>
    <style>
      main {
        border-color: black;
        border: 5px;
      }
      .logo, .contents, .footer {
        text-align: center;
        border-color: black;
      }
      .logo{
        display: flex;
        justify-content: center;
        margin: 0 auto 0;
        height: 600px;
        width: 600px;
      }
      .logo img{
        width: 100%;
        height: 100%;
      }
      .contents {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-content: center;
      }
      .contents a {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 10vh;
        width: 50vw;
        border-radius: 15px;
        text-align: center;
        font-size: 60px;
        text-decoration: none;
      }

      .study {
        margin-top: 5vh;
        margin-bottom: 10px;
        background-color: #4870BD;
        color: white;
      }
      .space-h {
        height: 5vh;
        width: 5vw;
      }
      .note {
        margin-top: 10px;
        margin-bottom: 5vh;
        background-color: #4870BD;
        color: white;
      }
      .footer {
        margin-top: auto;
        padding: 0;
        display: flex;
        justify-content: center;
        gap: 10vw;
      }
      .footer a , .footer button{
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 60px;
        border-radius: 15px;
        background-color: #4870BD;
        color: white;
      }
      .setting {
        height: 7vh;
        width: 37vw;
      }
      .settingPanel {
        display: none; /* 初期状態は非表示 */
        position: fixed; /* 固定位置 */
        top: 30%; /* 上からの位置 */
        left: 50%; /* 左からの位置 */
        transform: translate(-50%, -50%); /* 中央に配置 */
        width: 80vw; /* 幅 */
        height: auto; /* 高さは自動 */
        background-color: white; /* 背景色 */
        border: 1px solid black; /* ボーダー */
        padding: 20px; /* 内側の余白 */
        z-index: 100; /* z-indexを設定して上に表示 */
      }
      
      .contact {
        height: 7vh;
        width: 37vw;
      }
      .popup {
        display: none;
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        width: 84vw;
        height: 35vh;
        background-color: white;
        border: 1px solid black;
        padding: 20px;
        z-index: 100;
      }
      .popup.active {
        display: block;
      }
      .popup .tab a {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 10vh;
        width: 50vw;
        border-radius: 15px;
        text-decoration: none;
        text-align: center;
        font-size: 60px;
        text-decoration: none;
      }
      .me{
        margin-top: 2vh;
        margin-bottom: 10px;
        background-color: #4870BD;
        color: white;
      }
      .note {
        margin-top: 10px;
        margin-bottom: 5vh;
        background-color: #4870BD;
        color: white;
      }
      .popup .tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 8vh;
        justify-content: center;
        margin-top: 1vh;
      }
      
      .close-button {
        margin-top: 10px;
        background-color: white;
        color: black;
        cursor: pointer;
        width: 20vw;
        height: 20vh;
        border: none;
      }
      .overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 99;
      }
    </style>
  </head>
  <body>
    <div class="loading active">
      <div class="loading__icon"></div>
      <p class="loading__text">loading</p>
    </div>
    <main class="main">
      <div class="logo">
        <img src="./ui_image/logo.png" alt="logo" title="logo">
      </div>
      <div class="contents">
        <a href="./html/study/study.html" class="study">勉強する</a>
        <div class="space-h"></div>
        <a href="#" class="note" onclick="showPopup()">記録する</a>
      </div>
      <div class="footer" type="button">
        <button class="setting" onclick="showSPopup()">設定</button>
        <div class="settingPanel" id="settingPanel">
          <p>設定</p>
          <p>ユーザー名: <?php echo htmlspecialchars($username); ?></p>
          <p>ユーザーID: <?php echo htmlspecialchars($userId); ?></p>
          <p>メールアドレス: <?php echo htmlspecialchars($email); ?></p>
          <button onclick="hideSPopup()">閉じる</button>
        </div>
        <a href="./php/contact.php" class="contact">問い合わせ</a>
      </div>
      <div class="overlay" id="overlay" onclick="hidePopup()"></div>
      <div class="popup" id="popup">
        <div class="tab">
          <a href="html/record/record_time.html" class="me">自分の記録</a>
          <a href="html/record/record_time.html" class="parent">保護者</a>
        </div>
      </div>
    </main>
    <script type="text/javascript" defer>
      // タイマーをリセット
      document.querySelector('a[href="./html/study/study.html"]').addEventListener('click', () => {
        localStorage.removeItem('stopwatchTime');
        localStorage.removeItem('isRunning');
      });

      function showSPopup() {
        document.getElementById("settingPanel").style.display = "block";
      }
      function hideSPopup() {
        document.getElementById("settingPanel").style.display = "none";
      }

      function showPopup() {
        document.getElementById("overlay").style.display = "block";
        document.getElementById("popup").classList.add("active");
      }

      function hidePopup() {
        document.getElementById("overlay").style.display = "none";
        document.getElementById("popup").classList.remove("active");
      }

      function saveRecord() {
        alert("記録が保存されました。");
        hidePopup();
      }
    </script>
  </body>
</html>