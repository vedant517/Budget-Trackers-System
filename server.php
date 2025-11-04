<?php
session_start();

// Connect to the database
$db = mysqli_connect('localhost:3307', 'root', '', 'registration');

// Check database connection
if (!$db) {
    die("Database connection failed: " . mysqli_connect_error());
}

// Initialize error array
$errors = array();

// REGISTER USER
if (isset($_POST['reg_user'])) {
    $username = mysqli_real_escape_string($db, $_POST['username']);
    $email = mysqli_real_escape_string($db, $_POST['email']);
    $password_1 = mysqli_real_escape_string($db, $_POST['password_1']);
    $password_2 = mysqli_real_escape_string($db, $_POST['password_2']);

    // Validation
    if (empty($username)) { array_push($errors, "Username is required"); }
    if (empty($email)) { array_push($errors, "Email is required"); }
    if (empty($password_1)) { array_push($errors, "Password is required"); }
    if ($password_1 != $password_2) {
        array_push($errors, "The two passwords do not match");
    }

    // Check for duplicate username or email
    $user_check_query = "SELECT * FROM users WHERE username='$username' OR email='$email' LIMIT 1";
    $result = mysqli_query($db, $user_check_query);
    $user = mysqli_fetch_assoc($result);

    if ($user) {
        if ($user['username'] === $username) {
            array_push($errors, "Username already exists");
        }
        if ($user['email'] === $email) {
            array_push($errors, "Email already exists");
        }
    }

    // Register user
    if (count($errors) == 0) {
        $password = md5($password_1); // Encrypt password
        $role = 'user';
        $query = "INSERT INTO users (username, email, password, role) 
                  VALUES('$username', '$email', '$password', '$role')";
        mysqli_query($db, $query);

        $_SESSION['success'] = "Registration successful. Please log in.";
        header('location: login.php'); // Redirect to login page after registration
        exit();
    }
}

// LOGIN USER
if (isset($_POST['login_user'])) {
    $username = mysqli_real_escape_string($db, $_POST['username']);
    $password = mysqli_real_escape_string($db, $_POST['password']);

    // Validation
    if (empty($username)) { array_push($errors, "Username is required"); }
    if (empty($password)) { array_push($errors, "Password is required"); }

    // Check if user exists
    if (count($errors) == 0) {
        $password = md5($password); // Encrypt password
        $query = "SELECT * FROM users WHERE username='$username' AND password='$password'";
        $results = mysqli_query($db, $query);

        if (mysqli_num_rows($results) == 1) {
            // Login success
            $_SESSION['username'] = $username;
            $_SESSION['success'] = "You are now logged in.";
            header('location: index.php'); // Redirect to index page after successful login
            exit();
        } else {
            array_push($errors, "Incorrect username or password");
        }
    }

    // If errors, store them in session and redirect back to login page
    if (count($errors) > 0) {
        $_SESSION['errors'] = $errors;
        header('location: login.php'); // Redirect back to login page if errors
        exit();
    }
}
?>    