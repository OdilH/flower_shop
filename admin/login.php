<?php
/**
 * СТРАНИЦА ВХОДА В АДМИН-ПАНЕЛЬ
 */

session_start();
require_once '../api/config.php';
require_once '../api/db.php';

// Если уже авторизован, перенаправляем
if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'Заполните все поля';
    } else {
        $db = Database::getInstance();
        $conn = $db->getConnection();
        
        $stmt = $conn->prepare("SELECT id, username, password_hash, full_name, role, active FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param('ss', $username, $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            if ($user['active'] && password_verify($password, $user['password_hash'])) {
                // Успешная авторизация
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['full_name'] ?: $user['username'];
                $_SESSION['user_role'] = $user['role'];
                
                // Обновляем время последнего входа
                $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
                $updateStmt->bind_param('i', $user['id']);
                $updateStmt->execute();
                $updateStmt->close();
                
                header('Location: index.php');
                exit;
            } else {
                $error = 'Неверный логин или пароль';
            }
        } else {
            $error = 'Неверный логин или пароль';
        }
        
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход в панель администратора - <?php echo SITE_NAME; ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            padding: 40px;
            width: 100%;
            max-width: 400px;
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .login-header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .login-header p {
            color: #666;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .error {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .info {
            margin-top: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
            font-size: 14px;
            color: #666;
        }
        
        .info strong {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h1>🌹 <?php echo SITE_NAME; ?></h1>
            <p>Панель администратора</p>
        </div>
        
        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <form method="POST" action="">
            <div class="form-group">
                <label for="username">Логин или Email</label>
                <input type="text" id="username" name="username" required autofocus>
            </div>
            
            <div class="form-group">
                <label for="password">Пароль</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="btn">Войти</button>
        </form>
        
        <div class="info">
            <strong>Данные по умолчанию:</strong><br>
            Логин: <code>admin</code><br>
            Пароль: <code>admin123</code><br>
            <small style="color: #c33;">⚠️ Обязательно измените пароль в продакшене!</small>
        </div>
    </div>
</body>
</html>


