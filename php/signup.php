<?php
require_once './database.php';
require_once './User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die("Method not allowed");
}

try {
    // Database connection
    $database = new Database();
    $db = $database->connect();

    // Create User object
    $user = new User($db);

    // Assign form data to object properties
    $user->fullName = trim($_POST['Fullname']);
    $user->userName = trim($_POST['username']);
    $user->email = trim($_POST['email']);
    $user->password = $_POST['password'];
    $user->role = $_POST['role'];
    $user->title = $_POST['title'];
    

    // Register user
    if ($user->register()) {
        header("Location: ../html/login.html");
        exit();
    }

} catch (Exception $e) {
    echo $e->getMessage();
}
?>