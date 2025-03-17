<?php
// delete_test_user.php
require_once './db_connection.php';

// データベース接続を取得
$pdo = getDatabaseConnection();

try {
    // トランザクション開始
    $pdo->beginTransaction();

    // comment_data テーブルの関連レコードを削除
    $deleteCommentDataSql = "DELETE FROM comment_data WHERE username IN (SELECT username FROM users WHERE delete_at <= NOW())";
    $deleteCommentDataStmt = $pdo->prepare($deleteCommentDataSql);
    $deleteCommentDataStmt->execute();

    // categories テーブルの関連レコードを削除
    $deleteCategoriesSql = "DELETE FROM categories WHERE username IN (SELECT username FROM users WHERE delete_at <= NOW())";
    $deleteCategoriesStmt = $pdo->prepare($deleteCategoriesSql);
    $deleteCategoriesStmt->execute();

    // study_data テーブルの関連レコードを削除
    $deleteStudyDataSql = "DELETE FROM study_data WHERE username IN (SELECT username FROM users WHERE delete_at <= NOW())";
    $deleteStudyDataStmt = $pdo->prepare($deleteStudyDataSql);
    $deleteStudyDataStmt->execute();

    // users テーブルの削除
    $deleteUsersSql = "DELETE FROM users WHERE delete_at <= NOW()";
    $deleteUsersStmt = $pdo->prepare($deleteUsersSql);
    $deleteUsersStmt->execute();

    // 削除結果確認
    if ($deleteUsersStmt->rowCount() > 0) {
        echo "削除処理が完了しました。\n";
    } else {
        echo "削除対象のユーザーはありません。\n";
    }

    // トランザクション確定
    $pdo->commit();

} catch (Exception $e) {
    // エラー発生時はロールバック
    $pdo->rollBack();
    echo "エラー: " . $e->getMessage() . "\n";
}

// 終了
$pdo = null;  // PDOオブジェクトのクローズはnullにすることで解放