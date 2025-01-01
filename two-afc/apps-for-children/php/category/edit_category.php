<?php
session_start();
require_once '../db_connection.php'; // データベース接続ファイルをインクルード

// エラーを表示する
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    if(!isset($_SESSION['username'])) {
        throw new Exception("User not logged in");
    }

    $old_category_name = $_POST['old_category_name'] ?? '';
    $new_category_name = $_POST['new_category_name'] ?? '';
    $username = $_SESSION['username'] ?? null;

    if (empty($old_category_name) || empty($new_category_name)) {
        echo json_encode(["status" => "error", "message" => "両方のカテゴリー名が必要です。"]);
        exit();
    }
    if ($username === null) {
        throw new Exception("ユーザー名が不明です");
    }

    $pdo = getDatabaseConnection();

    // トランザクションを開始
    $pdo->beginTransaction();

    // categories テーブルのカテゴリー名を更新
    $stmt_categories = $pdo->prepare("
        UPDATE categories
        SET category_name = :new_category_name
        WHERE category_name = :old_category_name AND username = :username
    ");
    $stmt_categories->execute([
        ':new_category_name' => $new_category_name,
        ':old_category_name' => $old_category_name,
        ':username' => $username
    ]);

    // study_data テーブルのカテゴリー名を更新
    $stmt_studydata = $pdo->prepare("
        UPDATE study_data
        SET category = :new_category_name
        WHERE category = :old_category_name
    ");
    $stmt_studydata->execute([
        ':new_category_name' => $new_category_name,
        ':old_category_name' => $old_category_name
    ]);

    // トランザクションをコミット
    $pdo->commit();

    // 変更が成功した場合
    if ($stmt_categories->rowCount() > 0 || $stmt_studydata->rowCount() > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "カテゴリーの更新に失敗しました。"]);
    }
} catch (PDOException $e) {
    // トランザクションのロールバック
    $pdo->rollBack();

    // エラーログを表示
    echo json_encode([
        "status" => "error",
        "message" => "データベースエラー: " . $e->getMessage(),
        "error_info" => $stmt->errorInfo()  // SQLエラー情報を表示
    ]);
} catch (Exception $e) {
    // トランザクションのロールバック
    $pdo->rollBack();

    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}