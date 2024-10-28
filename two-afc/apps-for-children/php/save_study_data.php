<?php
session_start();
include 'db_connection.php';

// Content-Typeを設定
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($data === null) {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
        exit;
    }

    // Retrieve the logged-in username from the session
    $username = $_SESSION['username'] ?? null;

    if ($username === null) {
        echo json_encode(['success' => false, 'error' => 'User is not logged in']);
        exit;
    }

    $category = $data['category'];
    $studyTime = $data['study_time'];
    $images = json_encode($data['images']);

    $sql = "INSERT INTO study_data (username, category, study_time, images) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        echo json_encode(['success' => false, 'error' => 'Statement preparation failed: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param("ssss", $username, $category, $studyTime, $images);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}