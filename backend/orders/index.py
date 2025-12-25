import json
import os
import psycopg2
from datetime import datetime, timedelta

def get_db_connection():
    """Подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """API для управления заказами на вывоз мусора"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'POST':
            return create_order(event)
        elif method == 'GET':
            return get_orders(event)
        elif method == 'PUT':
            return update_order(event)
        else:
            return error_response(405, 'Method not allowed')
    
    except Exception as e:
        return error_response(500, f'Server error: {str(e)}')

def create_order(event: dict) -> dict:
    """Создание нового заказа"""
    
    body = json.loads(event.get('body', '{}'))
    
    name = body.get('name')
    email = body.get('email')
    phone = body.get('phone')
    address = body.get('address')
    plan_id = body.get('plan_id')
    
    if not all([name, email, address, plan_id]):
        return error_response(400, 'Missing required fields')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO users (name, email, phone, address) VALUES (%s, %s, %s, %s) "
        "ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, address = EXCLUDED.address "
        "RETURNING id",
        (name, email, phone, address)
    )
    user_id = cur.fetchone()[0]
    
    cur.execute(
        "SELECT duration FROM subscription_plans WHERE id = %s",
        (plan_id,)
    )
    plan = cur.fetchone()
    
    if not plan:
        cur.close()
        conn.close()
        return error_response(404, 'Plan not found')
    
    start_date = datetime.now().date()
    duration_str = plan[0]
    
    if '1 день' in duration_str:
        end_date = start_date + timedelta(days=1)
    elif '1 месяц' in duration_str:
        end_date = start_date + timedelta(days=30)
    elif '6 месяцев' in duration_str:
        end_date = start_date + timedelta(days=180)
    elif '1 год' in duration_str:
        end_date = start_date + timedelta(days=365)
    else:
        end_date = start_date + timedelta(days=30)
    
    cur.execute(
        "INSERT INTO orders (user_id, plan_id, address, status, start_date, end_date) "
        "VALUES (%s, %s, %s, 'pending', %s, %s) RETURNING id, created_at",
        (user_id, plan_id, address, start_date, end_date)
    )
    
    order_id, created_at = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'order_id': order_id,
            'user_id': user_id,
            'message': 'Order created successfully'
        }),
        'isBase64Encoded': False
    }

def get_orders(event: dict) -> dict:
    """Получение списка заказов"""
    
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id')
    status = params.get('status')
    admin = params.get('admin') == 'true'
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if admin:
        query = """
            SELECT o.id, u.name, u.email, u.phone, o.address, sp.name as plan_name, 
                   sp.price, o.status, o.created_at, o.start_date, o.end_date
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN subscription_plans sp ON o.plan_id = sp.id
            ORDER BY o.created_at DESC
        """
        cur.execute(query)
    else:
        if user_id:
            query = """
                SELECT o.id, o.address, sp.name as plan_name, sp.price, 
                       o.status, o.created_at, o.start_date, o.end_date
                FROM orders o
                JOIN subscription_plans sp ON o.plan_id = sp.id
                WHERE o.user_id = %s
            """
            if status:
                query += " AND o.status = %s"
                cur.execute(query, (user_id, status))
            else:
                cur.execute(query, (user_id,))
        else:
            return error_response(400, 'user_id required for non-admin requests')
    
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    if admin:
        orders = [
            {
                'id': row[0],
                'user_name': row[1],
                'user_email': row[2],
                'user_phone': row[3],
                'address': row[4],
                'plan_name': row[5],
                'price': row[6],
                'status': row[7],
                'created_at': row[8].isoformat() if row[8] else None,
                'start_date': row[9].isoformat() if row[9] else None,
                'end_date': row[10].isoformat() if row[10] else None
            }
            for row in rows
        ]
    else:
        orders = [
            {
                'id': row[0],
                'address': row[1],
                'plan_name': row[2],
                'price': row[3],
                'status': row[4],
                'created_at': row[5].isoformat() if row[5] else None,
                'start_date': row[6].isoformat() if row[6] else None,
                'end_date': row[7].isoformat() if row[7] else None
            }
            for row in rows
        ]
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'orders': orders}),
        'isBase64Encoded': False
    }

def update_order(event: dict) -> dict:
    """Обновление статуса заказа"""
    
    body = json.loads(event.get('body', '{}'))
    order_id = body.get('order_id')
    status = body.get('status')
    
    if not order_id or not status:
        return error_response(400, 'order_id and status required')
    
    if status not in ['pending', 'active', 'completed', 'cancelled']:
        return error_response(400, 'Invalid status')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id",
        (status, order_id)
    )
    
    result = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    if not result:
        return error_response(404, 'Order not found')
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'message': 'Order updated successfully'
        }),
        'isBase64Encoded': False
    }

def error_response(status_code: int, message: str) -> dict:
    """Формирование ответа с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }
