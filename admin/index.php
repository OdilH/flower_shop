<?php
/**
 * ПАНЕЛЬ АДМИНИСТРАТОРА
 * Базовый файл входа
 */

session_start();
require_once '../api/config.php';
require_once '../api/db.php';

// Проверка авторизации
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance();
$conn = $db->getConnection();

// Получаем статистику
$stats = [];

// Количество заказов
$result = $conn->query("SELECT COUNT(*) as total FROM orders");
$stats['orders_total'] = $result->fetch_assoc()['total'];

// Новые заказы
$result = $conn->query("SELECT COUNT(*) as total FROM orders WHERE status = 'new'");
$stats['orders_new'] = $result->fetch_assoc()['total'];

// Количество товаров
$result = $conn->query("SELECT COUNT(*) as total FROM products WHERE active = 1");
$stats['products_total'] = $result->fetch_assoc()['total'];

// Количество отзывов на модерации
$result = $conn->query("SELECT COUNT(*) as total FROM reviews WHERE approved = 0");
$stats['reviews_pending'] = $result->fetch_assoc()['total'];

// Последние заказы
$result = $conn->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 10");
$recent_orders = [];
while ($row = $result->fetch_assoc()) {
    $recent_orders[] = $row;
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Панель администратора - <?php echo SITE_NAME; ?></title>
    <link rel="stylesheet" href="assets/css/admin.css">
</head>
<body>
    <div class="admin-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2><?php echo SITE_NAME; ?></h2>
                <p>Панель администратора</p>
            </div>
            <nav class="sidebar-nav">
                <a href="index.php" class="nav-item active">
                    <span>📊</span> Главная
                </a>
                <a href="orders.php" class="nav-item">
                    <span>📦</span> Заказы
                    <?php if ($stats['orders_new'] > 0): ?>
                        <span class="badge"><?php echo $stats['orders_new']; ?></span>
                    <?php endif; ?>
                </a>
                <a href="products.php" class="nav-item">
                    <span>🌹</span> Товары
                </a>
                <a href="categories.php" class="nav-item">
                    <span>📁</span> Категории
                </a>
                <a href="reviews.php" class="nav-item">
                    <span>⭐</span> Отзывы
                    <?php if ($stats['reviews_pending'] > 0): ?>
                        <span class="badge"><?php echo $stats['reviews_pending']; ?></span>
                    <?php endif; ?>
                </a>
                <a href="contacts.php" class="nav-item">
                    <span>✉️</span> Сообщения
                </a>
                <a href="settings.php" class="nav-item">
                    <span>⚙️</span> Настройки
                </a>
            </nav>
            <div class="sidebar-footer">
                <a href="logout.php" class="nav-item">
                    <span>🚪</span> Выход
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="content-header">
                <h1>Главная</h1>
                <div class="user-info">
                    <span>Добро пожаловать, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Администратор'); ?></span>
                </div>
            </header>

            <!-- Statistics -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-info">
                        <h3><?php echo $stats['orders_total']; ?></h3>
                        <p>Всего заказов</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🆕</div>
                    <div class="stat-info">
                        <h3><?php echo $stats['orders_new']; ?></h3>
                        <p>Новых заказов</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🌹</div>
                    <div class="stat-info">
                        <h3><?php echo $stats['products_total']; ?></h3>
                        <p>Товаров</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <h3><?php echo $stats['reviews_pending']; ?></h3>
                        <p>Отзывов на модерации</p>
                    </div>
                </div>
            </div>

            <!-- Recent Orders -->
            <div class="content-section">
                <h2>Последние заказы</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Клиент</th>
                            <th>Телефон</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($recent_orders)): ?>
                            <tr>
                                <td colspan="7" class="text-center">Заказов пока нет</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($recent_orders as $order): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($order['order_number']); ?></td>
                                    <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
                                    <td><?php echo htmlspecialchars($order['customer_phone']); ?></td>
                                    <td><?php echo number_format($order['total_amount'], 2, '.', ' '); ?> ₽</td>
                                    <td>
                                        <span class="status-badge status-<?php echo $order['status']; ?>">
                                            <?php
                                            $statuses = [
                                                'new' => 'Новый',
                                                'processing' => 'В обработке',
                                                'confirmed' => 'Подтвержден',
                                                'delivering' => 'Доставляется',
                                                'completed' => 'Завершен',
                                                'cancelled' => 'Отменен'
                                            ];
                                            echo $statuses[$order['status']] ?? $order['status'];
                                            ?>
                                        </span>
                                    </td>
                                    <td><?php echo date('d.m.Y H:i', strtotime($order['created_at'])); ?></td>
                                    <td>
                                        <a href="order.php?id=<?php echo $order['id']; ?>" class="btn btn-sm">Просмотр</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</body>
</html>


