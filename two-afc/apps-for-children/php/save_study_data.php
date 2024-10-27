<?php
session_start();
include 'db_connection.php'; // データベース接続の設定

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  
  $username = $data['username'];
  $category = $data['category'];
  $studyTime = $data['studyTime'];
  $images = json_encode($data['images']); // 画像の配列をJSONに変換

  // SQLクエリを作成
  $sql = "INSERT INTO study_data (username, category, study_time, images) VALUES (?, ?, ?, ?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ssss", $username, $category, $studyTime, $images);

  if ($stmt->execute()) {
    echo json_encode(['success' => true]);
  } else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
  }

  $stmt->close();
  $conn->close();
}
