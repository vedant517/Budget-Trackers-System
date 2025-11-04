<?php
header("Content-Type: application/json");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

try {
    // Check if the request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Method not allowed. Please use POST.");
    }

    // Capture raw POST data for debugging
    $rawData = file_get_contents("php://input");
    file_put_contents('debug.log', $rawData, FILE_APPEND);

    // Decode JSON payload
    $data = json_decode($rawData, true);

    // Validate JSON data
    if (empty($data) || !isset($data['expenses']) || !is_array($data['expenses'])) {
        throw new Exception("Invalid or missing data. Ensure 'expenses' is an array.");
    }

    if (empty($data['expenses'])) {
        throw new Exception("No expenses provided in the report.");
    }

    // Create the email body
    $emailBody = "<h2>Monthly Budget Report</h2>";
    foreach ($data['expenses'] as $expense) {
        if (!isset($expense['title'], $expense['amount'], $expense['date'])) {
            throw new Exception("Expense items must include 'title', 'amount', and 'date'.");
        }
        $emailBody .= "<p><b>" . htmlspecialchars($expense['title']) . ":</b> Rs. " . 
                      htmlspecialchars($expense['amount']) . " (" . 
                      htmlspecialchars($expense['date']) . ")</p>";
    }

    // Configure PHPMailer
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'aimers886@gmail.com'; // Your Gmail username
    $mail->Password = 'ndyhkgbcswhhjcyo';   // Your Gmail app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Set email details
    $mail->setFrom('aimers886@gmail.com', 'aimers');
    $mail->addAddress('jeetomotya@gmail.com', 'jeetomotya');
    $mail->Subject = 'Monthly Budget Report';
    $mail->isHTML(true);
    $mail->Body = $emailBody;

    // Send email
    $mail->send();
    echo json_encode(["status" => "success", "message" => "Monthly Report Sent Successfully"]);
} catch (Exception $e) {
    // Log error details
    $errorLog = "[" . date("Y-m-d H:i:s") . "] Error: " . $e->getMessage() . "\n";
    file_put_contents('error.log', $errorLog, FILE_APPEND);

    // Mask sensitive data in error response
    $errorMessage = $e->getMessage();
    if (strpos($errorMessage, 'SMTP') !== false) {
        $errorMessage = "Failed to send email. Check your SMTP configuration.";
    }

    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => $errorMessage]);
}
?>
