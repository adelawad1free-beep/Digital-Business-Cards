<?php
/**
 * NEXTID - Optimized PHP Upload Handler
 * تم تعديله ليتوافق مع مجلد upload الخاص بك
 */

// 1. إعدادات الوصول (CORS) - ضرورية للسماح للمتصفح بالرفع للسيرفر
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// التعامل مع طلبات الاختبار Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    
    // اسم المجلد كما يظهر في صورتك تماماً
    $uploadDir = 'upload/'; 
    
    // التأكد من وجود المجلد أو محاولة إنشائه
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // التحقق من أن السيرفر لديه صلاحية الكتابة في المجلد
    if (!is_writable($uploadDir)) {
        http_response_code(500);
        echo json_encode(["error" => "المجلد غير قابل للكتابة. يرجى تغيير تصريح مجلد upload إلى 777"]);
        exit;
    }

    // تجهيز الملف
    $fileTmpPath = $_FILES['file']['tmp_name'];
    $fileName = $_FILES['file']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // أنواع الملفات المسموحة
    $allowedExtensions = array('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg');

    if (in_array($fileExtension, $allowedExtensions)) {
        // توليد اسم عشوائي لمنع تداخل الصور
        $newFileName = time() . '_' . md5(uniqid()) . '.' . $fileExtension;
        $dest_path = $uploadDir . $newFileName;

        if(move_uploaded_file($fileTmpPath, $dest_path)) {
            // بناء الرابط النهائي للصورة
            $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https://" : "http://";
            $actualPath = $protocol . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/' . $dest_path;
            
            // تنظيف المسار من أي سلاش زائد
            $actualPath = str_replace(['//upload', '\/upload'], '/upload', $actualPath);

            echo json_encode([
                "status" => "success",
                "url" => $actualPath
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "حدث خطأ أثناء نقل الملف في السيرفر"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "نوع الملف غير مدعوم. المسموح: JPG, PNG, GIF, WEBP, SVG"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "طلب غير مكتمل. لم يتم العثور على ملف."]);
}
?>