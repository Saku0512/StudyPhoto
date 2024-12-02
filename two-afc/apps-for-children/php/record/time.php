<?php
// DB接続
require_once 'db_connection.php';
$pdo = getDatabaseConnection();

// クエリパラメータから単位（week, month, year）を取得
$unit = $_GET['unit'] ?? 'week'; // デフォルトは 'week'
echo "Unit: $unit\n";  // 追加：デバッグ用出力

// SQLを実行してデータを取得
$sql = "SELECT study_time, created_at FROM study_data ORDER BY created_at DESC";
$stmt = $pdo->prepare($sql);

// SQL実行前にエラーチェック
if (!$stmt) {
    echo "Error preparing SQL statement.";
    exit;
}

$stmt->execute();

// データを配列に格納
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// エラーチェック
if ($stmt->errorCode() != '00000') {
    echo "Error executing query: " . implode(", ", $stmt->errorInfo());
    exit;
}

// 時間データを適切にキャストして返す
$labels = [];
$values = [];
foreach ($data as $row) {
  $createdAt = new DateTime($row['created_at']);
  $studyTime = floatval($row['study_time']); // 時間を数値にキャスト

  // ラベル（日時）と値（学習時間）を配列に格納
  $labels[] = $createdAt->format('Y-m-d H:i:s');
  $values[] = $studyTime;
}

// 日時に基づいてラベルを適切な形式に変換
if ($unit == 'week') {
  // 1週間分のデータを表示
  $labels = array_slice($labels, 0, 7);
  $values = array_slice($values, 0, 7);
} elseif ($unit == 'month') {
  // 1ヶ月分のデータを表示
  $labels = array_slice($labels, 0, 30);
  $values = array_slice($values, 0, 30);
} elseif ($unit == 'year') {
  // 1年間分のデータを表示
  $labels = array_slice($labels, 0, 12);
  $values = array_slice($values, 0, 12);
}

// JSONとして返す
echo json_encode([
  'labels' => $labels,
  'values' => $values
]);