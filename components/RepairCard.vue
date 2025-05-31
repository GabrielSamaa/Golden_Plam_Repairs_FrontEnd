<template>
  <div class="repair-card">
    <div class="card-header">
      <span class="tracking-number">{{ repair.trackingNumber }}</span>
      <span :class="['status-badge', repair.status]">{{ getStatusText(repair.status) }}</span>
    </div>
    <div class="card-body">
      <div class="info-row">
        <i class="fas fa-mobile-alt"></i>
        <span>{{ repair.deviceType }}</span>
      </div>
      <div class="info-row">
        <i class="fas fa-tag"></i>
        <span>{{ repair.category }}</span>
      </div>
      <div class="info-row">
        <i class="fas fa-money-bill-wave"></i>
        <span>{{ repair.statement.toLocaleString() }} تومان</span>
      </div>
    </div>
    <div class="card-footer">
      <div class="date-info">
        <div class="date-item">
          <i class="fas fa-calendar-plus"></i>
          <span>تاریخ پذیرش: {{ repair.receptionDate || repair.date }}</span>
        </div>
        <div class="date-item" v-if="repair.deliveryDate">
          <i class="fas fa-calendar-check"></i>
          <span>تاریخ تحویل: {{ repair.deliveryDate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  repair: {
    type: Object,
    required: true
  }
})

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در انتظار بررسی',
    'in-progress': 'در حال انجام',
    'completed': 'تکمیل شده'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.repair-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 20px;
}

.card-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tracking-number {
  font-weight: 500;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.in-progress { background: #cce5ff; color: #004085; }
.status-badge.completed { background: #d4edda; color: #155724; }

.card-body {
  padding: 15px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.info-row i {
  width: 20px;
  color: #7f8c8d;
}

.card-footer {
  padding: 10px 15px;
  border-top: 1px solid #eee;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.date-item i {
  width: 16px;
  color: #3498db;
}

@media (max-width: 768px) {
  .repair-card {
    margin: 10px;
  }
  
  .date-info {
    font-size: 0.8rem;
  }
}
</style> 