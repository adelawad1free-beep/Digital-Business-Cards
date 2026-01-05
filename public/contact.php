<?php
/**
 * NEXTID - Contact Form Processor
 * Target: public/contact.php
 */

// إعدادات الرأس للسماح بالطلبات البرمجية والرد بصيغة JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// معالجة طلبات التحقق المسبق (OPTIONS) لمتصفحات الويب
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// التأكد من أن الطلب مرسل عبر بروتوكول POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

// قراءة البيانات المرسلة من الواجهة الأمامية (JSON Body)
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON data"]);
    exit;
}

// استخراج البيانات وتنظيفها
$name     = strip_tags(trim($data['name']));
$company  = strip_tags(trim($data['company']));
$email    = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$phone    = strip_tags(trim($data['phone']));
$count    = strip_tags(trim($data['count']));
$message  = strip_tags(trim($data['message']));

// إعدادات البريد الإلكتروني
$to       = "info@nextid.my"; // إيميل المستقبل
$from     = "no-reply@nextid.my"; // إيميل المرسل (يجب أن يكون من نفس النطاق في هوستينجر)
$subject  = "طلب بطاقات خاص: " . $company;

// تنسيق محتوى الرسالة (HTML)
$email_content = "
<html>
<head>
    <title>طلب تصميم بطاقات لجهة/شركة</title>
</head>
<body dir='rtl' style='font-family: Arial, sans-serif;'>
    <h2 style='color: #2563eb;'>وصلك طلب جديد من الموقع</h2>
    <table border='1' cellpadding='10' style='border-collapse: collapse; width: 100%; border-color: #eee;'>
        <tr style='background-color: #f9fafb;'>
            <td><strong>الاسم الكامل:</strong></td>
            <td>{$name}</td>
        </tr>
        <tr>
            <td><strong>الشركة / الجهة:</strong></td>
            <td>{$company}</td>
        </tr>
        <tr style='background-color: #f9fafb;'>
            <td><strong>البريد الإلكتروني:</strong></td>
            <td>{$email}</td>
        </tr>
        <tr>
            <td><strong>رقم الهاتف:</strong></td>
            <td>{$phone}</td>
        </tr>
        <tr style='background-color: #f9fafb;'>
            <td><strong>عدد الموظفين:</strong></td>
            <td>{$count}</td>
        </tr>
        <tr>
            <td><strong>التفاصيل الإضافية:</strong></td>
            <td>" . nl2br($message) . "</td>
        </tr>
    </table>
    <p style='color: #999; font-size: 11px; margin-top: 20px;'>هذه الرسالة أرسلت آلياً من نظام طلبات NextID.</p>
</body>
</html>
";

// إعدادات رأس البريد (Headers)
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: NextID Portal <$from>" . "\r\n";
$headers .= "Reply-To: $email" . "\r\n"; // لكي تتمكن من الرد مباشرة على العميل
$headers .= "X-Mailer: PHP/" . phpversion();

// تنفيذ الإرسال
if (mail($to, $subject, $email_content, $headers)) {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Request sent successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Internal Server Error - Mail function failed"]);
}