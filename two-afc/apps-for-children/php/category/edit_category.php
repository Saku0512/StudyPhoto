<?php
session_start();
require_once '../db_connection.php'; // データベース接続ファイルをインクルード

// エラーを表示する
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

/**
 * カテゴリー名のバリデーション
 * 
 * @param string $category_name
 * @return string クリーンなカテゴリー名
 * @throws Exception バリデーションエラー時に例外をスロー
 */
function validateCategoryName($category_name) {
    $category_name = trim($category_name);

    if (empty($category_name)) {
        throw new Exception("カテゴリー名が必要です");
    }
    
    if (mb_strlen($category_name) > 255) {
        throw new Exception("カテゴリー名は255文字以内で入力してください");
    }

    if (!preg_match('/^[a-zA-Z0-9ぁ-んァ-ヶ一-龥ー\s\-]+$/u', $category_name)) {
        throw new Exception("カテゴリー名に使用できるのは、英数字・日本語・スペース・ハイフンのみです");
    }

    return $category_name;
}

/**
 * 新しいカテゴリー名がすでに存在するか確認
 * 
 * @param PDO $pdo
 * @param string $category_name
 * @return bool 存在する場合はtrue、存在しない場合はfalse
 */
function isCategoryExists($pdo, $category_name, $username) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE category_name = :category_name AND username = :username");
    $stmt->execute([
        ':category_name' => $category_name,
        ':username' => $username
    ]);
    return $stmt->fetchColumn() > 0; // 既に存在する場合はtrue
}

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

     // バリデーションを適用
     $new_category_name = validateCategoryName($new_category_name);

    $pdo = getDatabaseConnection();

    // 新しいカテゴリー名がすでに存在するか確認
    if (isCategoryExists($pdo, $new_category_name, $username)) {
        echo json_encode(["status" => "error", "message" => "このカテゴリー名はすでに存在します。"]);
        exit();
    }

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