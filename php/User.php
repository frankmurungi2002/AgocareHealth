<?php

class User {
    private $conn;
    private $table = "users";

    public $userID;
    public $fullName;
    public $userName;
    public $email;
    public $password;
    public $role;
    public $title = "";
    public $facilityID;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login($userName, $password) {
        $query = "SELECT UserID, Email, Password FROM " . $this->table . " WHERE Username = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $userName);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            if (password_verify($password, $user['Password'])) {
                $this->userID = $user['UserID'];
                $this->email = $user['Email'];
                $this->password = $user['Password'];
                return true;
            }
        }
        return false;
    }

    // ----------------------------
    // Validate Email
    // ----------------------------
    private function validateEmail() {
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }
    }

    // ----------------------------
    // Validate Password Strength
    // ----------------------------
    private function validatePassword() {
        if (strlen($this->password) < 6 || 
            !preg_match("/[0-9]/", $this->password) || 
            !preg_match("/[A-Z]/", $this->password)) {
            throw new Exception("Password must be at least 6 characters, include a number and an uppercase letter.");
        }
    }

    // ----------------------------
    // Check if Email Already Exists
    // ----------------------------
    private function emailExists() {
        $stmt = $this->conn->prepare("SELECT Email FROM {$this->table} WHERE Email = ?");
        $stmt->bind_param("s", $this->email);
        $stmt->execute();
        $stmt->store_result();
        $exists = $stmt->num_rows > 0;
        $stmt->close();
        return $exists;
    }

    // ----------------------------
    // Generate Custom User ID
    // ----------------------------
    private function generateUserID() {
        $prefix = ($this->role === 'Community') ? 'CM' : 'HW';
        $likePattern = $prefix . '%';

        $stmt = $this->conn->prepare("SELECT UserID FROM {$this->table} WHERE UserID LIKE ? ORDER BY UserID DESC LIMIT 1");
        $stmt->bind_param("s", $likePattern);
        $stmt->execute();
        $stmt->bind_result($lastID);
        $stmt->fetch();
        $stmt->close();

        $number = ($lastID) ? intval(substr($lastID, 2)) + 1 : 1;
        return $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    // ----------------------------
    // Register User
    // ----------------------------
    public function register() {
        // Run validations
        if (empty($this->fullName)) {
            throw new Exception("Full name is required");
        }

        $this->validateEmail();
        // $this->validatePassword();

        if ($this->emailExists()) {
            throw new Exception("Email already registered!");
        }

        $userID = $this->generateUserID();
        $hashedPassword = password_hash($this->password, PASSWORD_DEFAULT);

        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (UserID, Name, Username, Email, Password, Role, Title)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("sssssss", $userID, $this->fullName, $this->userName, $this->email, $hashedPassword, $this->role, $this->title);

        if (!$stmt->execute()) {
            throw new Exception("Error: " . $stmt->error);
        }

        $stmt->close();
        return true;
    }

}
?>
