<?php
// delete_test_user.php
require_once './db_connection.php';

// データベース接続を取得
$pdo = getDatabaseConnection();


// 削除対象ユーザーを削除
$deleteSql = "DELETE FROM users WHERE delete_at <= NOW()";
$deleteStmt = $pdo->prepare($deleteSql);

// 実行
$deleteStmt->execute();

// 削除結果確認
if ($deleteStmt->rowCount() > 0) {
    echo "削除処理が完了しました。\n";
} else {
    echo "削除対象のユーザーはありません。\n";
}

// 終了
$pdo = null;  // PDOオブジェクトのクローズはnullにすることで解放