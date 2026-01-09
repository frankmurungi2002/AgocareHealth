<?php
session_start();
require_once './database.php';
require_once './User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die("Method not allowed");
}

// Get data
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Validation
if (empty($username) || empty($password)) {
    die("username and password are required");
}

// if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
//     die("Invalid email format");
// }

// Create database and user objects
$database = new Database();
$db = $database->connect();

$user = new User($db);

if ($user->login($username, $password)) {
    header("Location: ../html/index.html");
    exit();
} else {
    die("Invalid username or password");
}
?>
