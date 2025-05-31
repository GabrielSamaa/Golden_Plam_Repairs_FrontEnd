<template>
  <div class="persian-date-picker">
    <div class="date-input" @click="toggleCalendar($event)">
      <input
        type="text"
        :value="displayValue"
        readonly
        :placeholder="placeholder"
        class="form-control"
      >
      <i class="fas fa-calendar-alt"></i>
    </div>
    
    <div v-if="isOpen" class="calendar-dropdown">
      <div class="calendar-header">
        <button @click="prevMonth($event)" class="btn-nav">
          <i class="fas fa-chevron-right"></i>
        </button>
        <span>{{ currentMonthName }} {{ currentYear }}</span>
        <button @click="nextMonth($event)" class="btn-nav">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
      
      <div class="calendar-grid">
        <div class="weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="['day', {
            'empty': !day.date,
            'selected': isSelected(day.date),
            'today': day.isToday,
            'disabled': isDisabled(day.date)
          }]"
          @click="selectDate(day.date, $event)"
        >
          {{ day.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import moment from 'moment-jalaali'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'تاریخ را انتخاب کنید'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const currentDate = ref(moment())
const selectedDate = ref(props.modelValue)

const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
]

const displayValue = computed(() => {
  return selectedDate.value || ''
})

const currentMonthName = computed(() => {
  return persianMonths[currentDate.value.jMonth()]
})

const currentYear = computed(() => {
  return currentDate.value.jYear()
})

const calendarDays = computed(() => {
  const year = currentDate.value.jYear()
  const month = currentDate.value.jMonth()
  const daysInMonth = moment.jDaysInMonth(year, month)
  const firstDayOfMonth = moment(`${year}/${month + 1}/1`, 'jYYYY/jM/jD')
  const firstDayOfWeek = firstDayOfMonth.day()
  
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: '', date: null })
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = moment(`${year}/${month + 1}/${i}`, 'jYYYY/jM/jD')
    days.push({
      day: i,
      date: date.format('jYYYY/jMM/jDD'),
      isToday: date.isSame(moment(), 'day')
    })
  }
  
  return days
})

const toggleCalendar = (event) => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    event?.preventDefault()
    event?.stopPropagation()
  }
}

const prevMonth = (event) => {
  currentDate.value = moment(currentDate.value).subtract(1, 'jMonth')
  event?.preventDefault()
  event?.stopPropagation()
}

const nextMonth = (event) => {
  currentDate.value = moment(currentDate.value).add(1, 'jMonth')
  event?.preventDefault()
  event?.stopPropagation()
}

const isSelected = (date) => {
  return date === selectedDate.value
}

const isDisabled = (date) => {
  if (!date) return true
  const today = moment().startOf('day')
  const selectedDate = moment(date, 'jYYYY/jMM/jDD')
  return selectedDate.isBefore(today)
}

const selectDate = (date, event) => {
  if (date && !isDisabled(date)) {
    selectedDate.value = date
    emit('update:modelValue', date)
    isOpen.value = false
    event?.preventDefault()
    event?.stopPropagation()
  }
}

// Close calendar when clicking outside
const handleClickOutside = (event) => {
  const calendar = event.target.closest('.persian-date-picker')
  if (!calendar) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for external model value changes
watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue
  if (newValue) {
    currentDate.value = moment(newValue, 'jYYYY/jMM/jDD')
  }
})
</script>

<style scoped>
.persian-date-picker {
  position: relative;
  width: 100%;
}

.date-input {
  position: relative;
}

.date-input i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  pointer-events: none;
}

.date-input input {
  padding-right: 35px;
  cursor: pointer;
}

.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
  margin-top: 5px;
  padding: 10px;
  direction: rtl;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.btn-nav {
  background: none;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  color: #3498db;
}

.btn-nav:hover {
  color: #2980b9;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.weekday {
  text-align: center;
  font-weight: 500;
  color: #2c3e50;
  padding: 5px;
  font-size: 0.9em;
}

.day {
  text-align: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.day:hover:not(.empty):not(.disabled) {
  background: #e3f2fd;
  color: #1976d2;
}

.day.selected {
  background: #1976d2;
  color: white;
}

.day.disabled {
  color: #bdc3c7;
  cursor: not-allowed;
}

.day.empty {
  cursor: default;
}

.day.today {
  border: 2px solid #1976d2;
  font-weight: bold;
}
</style> 