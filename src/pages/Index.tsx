import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type SubscriptionPlan = {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
};

type Order = {
  id: number;
  plan_name: string;
  address: string;
  price: number;
  status: 'active' | 'completed' | 'pending';
  created_at: string;
  start_date: string;
  end_date: string;
};

const API_URL = 'https://functions.poehali.dev/f41d5d3f-73d1-407f-b542-752480b64e8e';
const DEMO_USER_ID = 1;

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: '1day',
    name: 'Пробный',
    duration: '1 день',
    price: 199,
    description: 'Попробуйте наш сервис',
    features: ['1 вывоз мусора', 'Экологичная утилизация', 'Поддержка 24/7']
  },
  {
    id: '1month',
    name: 'Месячный',
    duration: '1 месяц',
    price: 2990,
    description: 'Оптимально для начала',
    features: ['8 вывозов в месяц', 'Экологичная утилизация', 'Поддержка 24/7', 'Скидка 5%'],
    popular: true
  },
  {
    id: '6months',
    name: 'Полугодовой',
    duration: '6 месяцев',
    price: 15990,
    description: 'Выгодное предложение',
    features: ['48 вывозов', 'Экологичная утилизация', 'Приоритетная поддержка', 'Скидка 15%']
  },
  {
    id: '1year',
    name: 'Годовой',
    duration: '1 год',
    price: 29990,
    description: 'Максимальная экономия',
    features: ['96 вывозов', 'Экологичная утилизация', 'VIP поддержка', 'Скидка 25%', 'Бонусные услуги']
  }
];

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('Иван Петров');
  const [email, setEmail] = useState('ivan.petrov@example.com');
  const [phone, setPhone] = useState('+7 (999) 123-45-67');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?user_id=${DEMO_USER_ID}`);
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan && address && name && email) {
      setLoading(true);
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            address,
            plan_id: selectedPlan
          })
        });

        if (response.ok) {
          await loadOrders();
          setAddress('');
          setSelectedPlan('');
          setActiveTab('orders');
        }
      } catch (error) {
        console.error('Failed to create order:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-500 rounded-full flex items-center justify-center">
                <Icon name="Leaf" size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-800">ЭкоВывоз</h1>
            </div>
            <nav className="hidden md:flex gap-6 items-center">
              {['home', 'orders', 'history', 'profile', 'support'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-green-500 text-white'
                      : 'text-green-700 hover:bg-green-100'
                  }`}
                >
                  {tab === 'home' && 'Главная'}
                  {tab === 'orders' && 'Заказы'}
                  {tab === 'history' && 'История'}
                  {tab === 'profile' && 'Профиль'}
                  {tab === 'support' && 'Поддержка'}
                </button>
              ))}
              <a href="/admin" className="ml-2">
                <Button variant="outline" size="sm">
                  <Icon name="Shield" size={16} className="mr-2" />
                  Админ
                </Button>
              </a>
            </nav>
            <Button variant="outline" className="md:hidden">
              <Icon name="Menu" size={24} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fade-in">
            <section className="text-center py-12">
              <h2 className="text-5xl font-bold text-green-800 mb-4">
                Чистота и забота о природе
              </h2>
              <p className="text-xl text-green-600 mb-8 max-w-2xl mx-auto">
                Экологичный вывоз мусора с удобными подписками. Заботимся о вашем комфорте и будущем планеты.
              </p>
              <div className="flex justify-center gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">5000+</div>
                  <div className="text-green-700">Довольных клиентов</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">98%</div>
                  <div className="text-green-700">Переработки</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">24/7</div>
                  <div className="text-green-700">Поддержка</div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-3xl font-bold text-center text-green-800 mb-8">
                Выберите подписку
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subscriptionPlans.map((plan, index) => (
                  <Card
                    key={plan.id}
                    className={`relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-scale-in ${
                      plan.popular ? 'border-green-500 border-2' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-lime-500">
                        Популярный
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-4xl font-bold text-green-600">
                          {plan.price}₽
                        </div>
                        <div className="text-sm text-muted-foreground">{plan.duration}</div>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Icon name="Check" size={16} className="text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600"
                        onClick={() => {
                          setSelectedPlan(plan.id);
                          document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Оформить
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>

            <section id="order-form" className="max-w-2xl mx-auto">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Оформить заказ</CardTitle>
                  <CardDescription>
                    Заполните форму, и мы свяжемся с вами в ближайшее время
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="plan">Выберите тариф</Label>
                      <select
                        id="plan"
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full mt-2 p-2 border rounded-md bg-white"
                        required
                      >
                        <option value="">Выберите тариф</option>
                        {subscriptionPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - {plan.price}₽ ({plan.duration})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="name">Имя</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Адрес вывоза</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Введите ваш адрес"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600"
                    >
                      {loading ? (
                        <>
                          <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                          Оформляем...
                        </>
                      ) : (
                        <>
                          <Icon name="CheckCircle" size={20} className="mr-2" />
                          Оформить заказ
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>

            <section className="bg-green-50 rounded-2xl p-8">
              <h3 className="text-3xl font-bold text-center text-green-800 mb-8">
                Наши преимущества
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-lime-500 rounded-full flex items-center justify-center">
                    <Icon name="Leaf" size={32} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-lg">Экологично</h4>
                  <p className="text-sm text-muted-foreground">
                    98% отходов идёт на переработку
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-lime-500 rounded-full flex items-center justify-center">
                    <Icon name="Clock" size={32} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-lg">Быстро</h4>
                  <p className="text-sm text-muted-foreground">
                    Вывоз в удобное для вас время
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-lime-500 rounded-full flex items-center justify-center">
                    <Icon name="Heart" size={32} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-lg">Надёжно</h4>
                  <p className="text-sm text-muted-foreground">
                    Поддержка 24/7 и гарантия качества
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-green-800">Мои заказы</h2>
            <div className="grid gap-4">
              {orders.filter(order => order.status !== 'completed').map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{order.plan_name}</CardTitle>
                      <Badge
                        variant={order.status === 'active' ? 'default' : 'secondary'}
                        className={order.status === 'active' ? 'bg-green-500' : ''}
                      >
                        {order.status === 'active' ? 'Активна' : 'Ожидает'}
                      </Badge>
                    </div>
                    <CardDescription>Заказ от {new Date(order.created_at).toLocaleDateString('ru-RU')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="MapPin" size={16} />
                        <span>{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Calendar" size={16} />
                        <span>до {new Date(order.end_date).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {order.price}₽
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {orders.filter(order => order.status !== 'completed').length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">У вас пока нет активных заказов</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-green-500 to-lime-500"
                      onClick={() => setActiveTab('home')}
                    >
                      Оформить заказ
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-green-800">История заказов</h2>
            <div className="grid gap-4">
              {orders.filter(order => order.status === 'completed').map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{order.plan_name}</CardTitle>
                      <Badge variant="outline">Завершён</Badge>
                    </div>
                    <CardDescription>Выполнен {new Date(order.created_at).toLocaleDateString('ru-RU')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="MapPin" size={16} />
                      <span>{order.address}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-green-800">Профиль</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-lime-500 text-white text-2xl">
                      ИП
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Иван Петров</CardTitle>
                    <CardDescription>ivan.petrov@example.com</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Телефон</Label>
                  <Input value="+7 (999) 123-45-67" readOnly className="mt-2" />
                </div>
                <div>
                  <Label>Основной адрес</Label>
                  <Input value="ул. Ленина, 15" readOnly className="mt-2" />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Текущая подписка</span>
                    <Badge className="bg-green-500">Активна</Badge>
                  </div>
                  <p className="text-muted-foreground">Месячный тариф до 20.01.2025</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Редактировать профиль
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-green-800">Поддержка</h2>
            <Card>
              <CardHeader>
                <CardTitle>Свяжитесь с нами</CardTitle>
                <CardDescription>Мы всегда рады помочь вам</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Icon name="Phone" size={24} className="text-green-600" />
                  <div>
                    <div className="font-semibold">Телефон</div>
                    <div className="text-muted-foreground">8 (800) 555-35-35</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Icon name="Mail" size={24} className="text-green-600" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-muted-foreground">support@ekovyvoz.ru</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Icon name="MessageCircle" size={24} className="text-green-600" />
                  <div>
                    <div className="font-semibold">Онлайн-чат</div>
                    <div className="text-muted-foreground">Ответим в течение 5 минут</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gradient-to-r from-green-500 to-lime-500">
                  <Icon name="MessageSquare" size={20} className="mr-2" />
                  Открыть чат
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-green-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 ЭкоВывоз. Заботимся о природе вместе с вами 🌱</p>
        </div>
      </footer>
    </div>
  );
}