<template>
  <div class="counter-page">
    <div class="page-header">
      <h2>پیشخوان</h2>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon bg-primary">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="stat-info">
          <h3>120</h3>
          <p>درخواست جدید</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-success">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="stat-info">
          <h3>12,450,000 تومان</h3>
          <p>درآمد امروز</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>42</h3>
          <p>کاربران جدید</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-danger">
          <i class="fas fa-envelope"></i>
        </div>
        <div class="stat-info">
          <h3>8</h3>
          <p>پیام‌های خوانده نشده</p>
        </div>
      </div>
    </div>

    <div class="recent-orders">
      <h3>آخرین درخواست‌ها</h3>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>شماره پیگیری</th>
              <th>مشتری</th>
              <th>دستگاه</th>
              <th>مبلغ</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td>{{ order.trackingNumber }}</td>
              <td>{{ order.customer }}</td>
              <td>{{ order.device }}</td>
              <td>{{ order.amount.toLocaleString() }} تومان</td>
              <td>
                <span :class="'status-' + order.status">{{ getStatusText(order.status) }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary" @click="viewOrder(order.id)">
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const recentOrders = ref([
  { id: 1, trackingNumber: 'GP-123456', customer: 'محمد احمدی', device: 'آیفون 13', amount: 1200000, status: 'pending' },
  { id: 2, trackingNumber: 'GP-123457', customer: 'فاطمه محمدی', device: 'لپ‌تاپ دل', amount: 2500000, status: 'in-progress' },
  { id: 3, trackingNumber: 'GP-123458', customer: 'علی رضایی', device: 'تلویزیون سامسونگ', amount: 3500000, status: 'completed' },
  { id: 4, trackingNumber: 'GP-123459', customer: 'زهرا حسینی', device: 'یخچال دوو', amount: 1800000, status: 'pending' },
  { id: 5, trackingNumber: 'GP-123460', customer: 'رضا کریمی', device: 'ماشین لباسشویی', amount: 2200000, status: 'canceled' }
])

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در انتظار',
    'in-progress': 'در حال انجام',
    'completed': 'تکمیل شده',
    'canceled': 'لغو شده'
  }
  return statusMap[status] || status
}

const viewOrder = (id) => {
  console.log('مشاهده درخواست:', id)
}
</script>

<style scoped>
.counter-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  margin-left: 15px;
}

.stat-icon.bg-primary { background: #3498db; }
.stat-icon.bg-success { background: #2ecc71; }
.stat-icon.bg-warning { background: #f39c12; }
.stat-icon.bg-danger { background: #e74c3c; }

.stat-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.stat-info p {
  margin: 5px 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.recent-orders {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.recent-orders h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #eee;
}

.table th {
  background: #f8f9fa;
  font-weight: 500;
  color: #2c3e50;
}

.status-pending { color: #f39c12; }
.status-in-progress { color: #3498db; }
.status-completed { color: #2ecc71; }
.status-canceled { color: #e74c3c; }

.btn {
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-outline-primary {
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
}

.btn-outline-primary:hover {
  background: #3498db;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .counter-page {
    padding: 10px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 15px;
  }

  .recent-orders {
    padding: 15px;
  }

  .table th,
  .table td {
    padding: 8px;
  }

  .btn-sm {
    padding: 4px 8px;
  }
}
</style>
