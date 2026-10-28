USE `projekt`;

-- ============================================================================
-- CZĘŚĆ A: ZAAWANSOWANE ZAPYTANIA BIZNESOWE (9 ZAPYTAŃ)
-- ============================================================================

-- Zapytanie 1: Ranking najlepszych klientów (VIP) pod względem wydanej kwoty
-- Wykorzystuje: JOIN, GROUP BY, HAVING, funkcje agregujące (COUNT, SUM, AVG)
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
    u.email,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_spent,
    ROUND(AVG(o.total_amount), 2) AS avg_order_value
FROM `users` u
INNER JOIN `orders` o ON u.user_id = o.user_id
WHERE o.order_status != 'cancelled'
  AND EXISTS (SELECT 1 FROM `payments` p WHERE p.order_id = o.order_id AND p.payment_status = 'completed')
GROUP BY u.user_id, u.first_name, u.last_name, u.email
HAVING SUM(o.total_amount) > 500.00
ORDER BY total_spent DESC;

-- Zapytanie 2: Analiza sprzedaży i przychodów według kategorii produktów kuchennych
-- Wykorzystuje: wielokrotny JOIN, GROUP BY, funkcje agregujące (SUM, COUNT)
SELECT 
    c.name AS category_name,
    COUNT(DISTINCT oi.order_id) AS orders_with_category,
    SUM(oi.quantity) AS units_sold,
    SUM(oi.quantity * oi.unit_price) AS category_revenue
FROM `categories` c
INNER JOIN `product_categories` pc ON c.category_id = pc.category_id
INNER JOIN `products` p ON pc.product_id = p.product_id
INNER JOIN `order_items` oi ON p.product_id = oi.product_id
INNER JOIN `orders` o ON oi.order_id = o.order_id
WHERE o.order_status IN ('paid', 'processing', 'shipped', 'delivered')
GROUP BY c.category_id, c.name
ORDER BY category_revenue DESC;

-- Zapytanie 3: Produkty premium (droższe niż średnia cena w sklepie) wraz z ich łącznym stanem magazynowym
-- Wykorzystuje: Podzapytanie skalarne (SUBQUERY), LEFT JOIN, GROUP BY, COALESCE
SELECT 
    p.sku,
    p.name AS product_name,
    p.brand,
    p.base_price,
    ROUND((SELECT AVG(base_price) FROM `products`), 2) AS store_avg_price,
    COALESCE(SUM(i.quantity), 0) AS total_available_stock
FROM `products` p
LEFT JOIN `inventory` i ON p.product_id = i.product_id
WHERE p.base_price > (SELECT AVG(base_price) FROM `products`)
GROUP BY p.product_id, p.sku, p.name, p.brand, p.base_price
ORDER BY p.base_price DESC;

-- Zapytanie 4: Stan i wartość zapasów produktów w porównaniu ze zrealizowaną sprzedażą
-- Wykorzystuje: Podzapytanie w klauzuli FROM (Derived Table), LEFT JOIN
SELECT 
    p.product_id,
    p.name AS product_name,
    COALESCE(i.quantity, 0) AS units_in_stock,
    COALESCE(i.quantity * p.base_price, 0.00) AS inventory_value_pln,
    COALESCE(sales_stat.units_sold, 0) AS units_sold,
    COALESCE(sales_stat.sales_value, 0.00) AS sales_value_pln
FROM `products` p
LEFT JOIN `inventory` i ON p.product_id = i.product_id
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.quantity * oi.unit_price) AS sales_value
    FROM `order_items` oi
    INNER JOIN `orders` o ON oi.order_id = o.order_id
    WHERE o.order_status IN ('paid', 'processing', 'shipped', 'delivered')
    GROUP BY oi.product_id
) AS sales_stat ON p.product_id = sales_stat.product_id
ORDER BY sales_value_pln DESC;

-- Zapytanie 5: Wyszukiwanie produktów, które nigdy nie zostały jeszcze zamówione lub mają niski stan (< 15 szt.)
-- Wykorzystuje: Podzapytanie z NOT EXISTS, HAVING, funkcje agregujące
SELECT 
    p.product_id,
    p.sku,
    p.name,
    p.brand,
    COALESCE(SUM(i.quantity), 0) AS total_stock,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM `order_items` oi WHERE oi.product_id = p.product_id) THEN 'Brak sprzedaży'
        ELSE 'Niski stan magazynowy'
    END AS alert_reason
FROM `products` p
LEFT JOIN `inventory` i ON p.product_id = i.product_id
GROUP BY p.product_id, p.sku, p.name, p.brand
HAVING COALESCE(SUM(i.quantity), 0) < 15
    OR NOT EXISTS (SELECT 1 FROM `order_items` oi WHERE oi.product_id = p.product_id);

-- Zapytanie 6: Miesięczny raport przychodów oraz dynamika sprzedaży (Trend miesięczny)
-- Pokazuje, jak sklep rozwijał się od maja do października 2026 r.
SELECT 
    DATE_FORMAT(o.created_at, '%Y-%m') AS sale_month,
    COUNT(DISTINCT o.order_id) AS orders_count,
    SUM(items.items_count) AS total_items_sold,
    SUM(items.items_value) AS monthly_revenue_pln,
    ROUND(AVG(o.total_amount), 2) AS avg_basket_value
FROM `orders` o
INNER JOIN (
    SELECT order_id, SUM(quantity) AS items_count, SUM(quantity * unit_price) AS items_value
    FROM `order_items`
    GROUP BY order_id
) items ON o.order_id = items.order_id
WHERE o.order_status NOT IN ('cancelled', 'pending')
GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
ORDER BY sale_month ASC;

-- Zapytanie 7: Zamówienia podzielone na więcej niż jedną przesyłkę
-- Wykorzystuje: JOIN, GROUP BY, HAVING, COUNT i GROUP_CONCAT
SELECT 
    o.order_id,
    CONCAT(u.first_name, ' ', u.last_name) AS customer,
    o.total_amount,
    COUNT(s.shipment_id) AS packages_sent,
    GROUP_CONCAT(DISTINCT s.carrier ORDER BY s.carrier SEPARATOR ' + ') AS carriers
FROM `orders` o
INNER JOIN `users` u ON o.user_id = u.user_id
INNER JOIN `shipments` s ON o.order_id = s.order_id
GROUP BY o.order_id, u.first_name, u.last_name, o.total_amount
HAVING COUNT(s.shipment_id) > 1
ORDER BY packages_sent DESC, o.total_amount DESC;

-- Zapytanie 8: Skuteczność metod płatności (Conversion & Failure Rate)
-- Wykorzystuje agregację warunkową (SUM + CASE WHEN) do policzenia odsetka odrzuconych płatności
SELECT 
    p.payment_method,
    COUNT(*) AS total_attempts,
    SUM(CASE WHEN p.payment_status = 'completed' THEN 1 ELSE 0 END) AS successful_payments,
    SUM(CASE WHEN p.payment_status = 'failed' THEN 1 ELSE 0 END) AS failed_payments,
    SUM(CASE WHEN p.payment_status = 'refunded' THEN 1 ELSE 0 END) AS refunded_payments,
    ROUND(SUM(CASE WHEN p.payment_status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS success_rate_pct,
    SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount ELSE 0.00 END) AS collected_revenue
FROM `payments` p
GROUP BY p.payment_method
ORDER BY collected_revenue DESC;

-- Zapytanie 9: Pełne drzewo kategorii (Relacja rekurencyjna / Self-Join) wraz z liczbą produktów i średnią ceną
SELECT 
    COALESCE(parent.name, '--- Kategoria Główna ---') AS parent_category,
    child.name AS category_name,
    COUNT(DISTINCT pc.product_id) AS products_count,
    COALESCE(ROUND(AVG(pr.base_price), 2), 0.00) AS avg_product_price
FROM `categories` child
LEFT JOIN `categories` parent ON child.parent_id = parent.category_id
LEFT JOIN `product_categories` pc ON child.category_id = pc.category_id
LEFT JOIN `products` pr ON pc.product_id = pr.product_id
GROUP BY parent.name, child.category_id, child.name
ORDER BY parent_category, child.name;
