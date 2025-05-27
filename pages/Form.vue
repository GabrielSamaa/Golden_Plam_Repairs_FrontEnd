<template>
  <Header />
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container" style="max-width: 600px;">
      <div class="card shadow">
        <div class="card-header bg-primary text-white text-center">
          <h1 class="h4 mb-0">فرم ثبت اطلاعات</h1>
          <p class="mb-0 small">لطفا اطلاعات خود را با دقت وارد کنید</p>
        </div>
        <form @submit.prevent="submitForm" class="card-body">
          <div class="mb-3">
            <label for="fullName" class="form-label">نام و نام خانوادگی</label>
            <input v-model="form.fullName" type="text" class="form-control" id="fullName" required placeholder="نام و نام خانوادگی خود را وارد کنید" />
          </div>
          <div class="mb-3">
            <label for="phone" class="form-label">شماره همراه</label>
            <input v-model="form.phone" type="tel" class="form-control" id="phone" required placeholder="09xxxxxxxxx" pattern="09[0-9]{9}" maxlength="11" />
          </div>
          <div class="mb-3">
            <label for="deviceName" class="form-label">نام دستگاه</label>
            <input v-model="form.deviceName" type="text" class="form-control" id="deviceName" required placeholder="نام دستگاه را وارد کنید" />
          </div>
          <div class="mb-3">
            <label for="category" class="form-label">دسته بندی</label>
            <select v-model="form.category" class="form-select" id="category" required>
              <option value="" disabled selected>لطفا انتخاب کنید</option>
              <option value="الکترونیکی">الکترونیکی</option>
              <option value="مکانیکی">مکانیکی</option>
              <option value="نرم‌افزاری">نرم‌افزاری</option>
              <option value="سخت‌افزاری">سخت‌افزاری</option>
              <option value="سایر">سایر</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="statement" class="form-label">بیانه</label>
            <div class="input-group mb-2">
              <button class="btn btn-outline-secondary" type="button" @click="decreaseStatement">-</button>
              <input
                :value="formattedStatement"
                @input="onStatementInput($event.target.value)"
                type="text"
                inputmode="numeric"
                class="form-control text-end"
                id="statement"
                required
                placeholder="مبلغ بیانه را وارد کنید"
              />
              <button class="btn btn-outline-secondary" type="button" @click="increaseStatement">+</button>
              <span class="input-group-text">تومان</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="form.statement = amount"
              >
                {{ amount.toLocaleString() }} تومان
              </button>
            </div>
          </div>
          <div class="mb-3">
            <label for="description" class="form-label">توضیحات ظاهری</label>
            <textarea v-model="form.description" class="form-control" id="description" rows="4" placeholder="توضیحات ظاهری را وارد کنید"></textarea>
          </div>
          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-primary">ثبت اطلاعات</button>
            <button type="button" class="btn btn-secondary" @click="resetForm">پاک کردن فرم</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
  <Footer />
</template>

<script setup>
import Footer from '~/components/ّFooter.vue'
import { ref, computed } from "vue";

const quickAmounts = [100000, 200000, 300000, 400000];

const form = ref({
  fullName: "",
  phone: "",
  deviceName: "",
  category: "",
  statement: 0,
  description: "",
});

const increaseStatement = () => {
  form.value.statement = Math.min((parseInt(form.value.statement) || 0) + 50000, 1000000000);
};
const decreaseStatement = () => {
  form.value.statement = Math.max((parseInt(form.value.statement) || 0) - 50000, 0);
};
const formattedStatement = computed(() => {
  const val = parseInt(form.value.statement) || 0;
  return val.toLocaleString();
});
const onStatementInput = (val) => {
  // حذف کاما و تبدیل به عدد
  const num = parseInt(val.replace(/,/g, "")) || 0;
  form.value.statement = num;
};

const submitForm = () => {
  alert("فرم با موفقیت ثبت شد!");
};

const resetForm = () => {
  form.value = {
    fullName: "",
    phone: "",
    deviceName: "",
    category: "",
    statement: 0,
    description: "",
  };
};
</script>