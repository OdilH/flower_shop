<?php
/**
 * ВЫХОД ИЗ АДМИН-ПАНЕЛИ
 */

session_start();
session_destroy();
header('Location: login.php');
exit;


