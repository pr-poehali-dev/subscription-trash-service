import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_URL = 'https://functions.poehali.dev/f41d5d3f-73d1-407f-b542-752480b64e8e';

type AdminOrder = {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  address: string;
  plan_name: string;
  price: number;
  status: string;
  created_at: string;
  start_date: string;
  end_date: string;
};

export default function Admin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    revenue: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?admin=true`);
      const data = await response.json();
      
      if (data.orders) {
        setOrders(data.orders);
        calculateStats(data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: AdminOrder[]) => {
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter(o => o.status === 'pending').length,
      active: ordersData.filter(o => o.status === 'active').length,
      completed: ordersData.filter(o => o.status === 'completed').length,
      revenue: ordersData
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.price, 0)
    };
    setStats(stats);
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus
        })
      });

      if (response.ok) {
        await loadOrders();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', className: string }> = {
      pending: { variant: 'secondary', className: '' },
      active: { variant: 'default', className: 'bg-green-500' },
      completed: { variant: 'outline', className: '' },
      cancelled: { variant: 'destructive', className: '' }
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status === 'pending' && 'Ожидает'}
        {status === 'active' && 'Активна'}
        {status === 'completed' && 'Завершён'}
        {status === 'cancelled' && 'Отменён'}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-green-700">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-500 rounded-full flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-800">Админ-панель</h1>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Всего заказов</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ожидают</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Активные</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.active}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Выручка</CardDescription>
              <CardTitle className="text-3xl">{stats.revenue.toLocaleString()}₽</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Все заказы</CardTitle>
              <Button onClick={loadOrders} variant="outline" size="sm">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Адрес</TableHead>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.user_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{order.user_email}</div>
                        <div className="text-muted-foreground">{order.user_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{order.address}</TableCell>
                    <TableCell>{order.plan_name}</TableCell>
                    <TableCell className="font-semibold">{order.price}₽</TableCell>
                    <TableCell className="text-sm">
                      <div>{formatDate(order.start_date)}</div>
                      <div className="text-muted-foreground">до {formatDate(order.end_date)}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Ожидает</SelectItem>
                          <SelectItem value="active">Активна</SelectItem>
                          <SelectItem value="completed">Завершён</SelectItem>
                          <SelectItem value="cancelled">Отменён</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Заказов пока нет</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
