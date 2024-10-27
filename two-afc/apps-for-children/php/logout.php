<?php
session_start();

// セッション変数を全て解除
$_SESSION = [];

// セッションを破棄
session_destroy();

// ログインページへリダイレクト
header("Location: ../index.php");
exit();
