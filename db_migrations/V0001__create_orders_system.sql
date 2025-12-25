-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы тарифных планов
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    features JSONB
);

-- Создание таблицы заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE,
    end_date DATE
);

-- Вставка начальных тарифов
INSERT INTO subscription_plans (id, name, duration, price, description, features) VALUES
('1day', 'Пробный', '1 день', 199, 'Попробуйте наш сервис', '["1 вывоз мусора", "Экологичная утилизация", "Поддержка 24/7"]'),
('1month', 'Месячный', '1 месяц', 2990, 'Оптимально для начала', '["8 вывозов в месяц", "Экологичная утилизация", "Поддержка 24/7", "Скидка 5%"]'),
('6months', 'Полугодовой', '6 месяцев', 15990, 'Выгодное предложение', '["48 вывозов", "Экологичная утилизация", "Приоритетная поддержка", "Скидка 15%"]'),
('1year', 'Годовой', '1 год', 29990, 'Максимальная экономия', '["96 вывозов", "Экологичная утилизация", "VIP поддержка", "Скидка 25%", "Бонусные услуги"]')
ON CONFLICT (id) DO NOTHING;

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);