<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50"
  >
    <div class="w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sm:p-8">
          <h1
            class="text-3xl sm:text-4xl font-bold text-white text-center mb-2"
          >
            فرم ثبت اطلاعات
          </h1>
          <p class="text-blue-100 text-center text-sm sm:text-base">
            لطفا اطلاعات خود را با دقت وارد کنید
          </p>
        </div>

        <form @submit.prevent="submitForm" class="p-6 sm:p-8">
          <!-- نام -->
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="firstName"
            >
              نام
            </label>
            <input
              v-model="form.firstName"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="firstName"
              type="text"
              placeholder="نام خود را وارد کنید"
              required
            />
          </div>

          <!-- نام خانوادگی -->
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="lastName"
            >
              نام خانوادگی
            </label>
            <input
              v-model="form.lastName"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="lastName"
              type="text"
              placeholder="نام خانوادگی خود را وارد کنید"
              required
            />
          </div>

          <!-- شماره همراه -->
          <div class="mb-4">
            <input
              v-model="form.phone"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phone"
              type="tel"
              placeholder="09xxxxxxxxx"
              pattern="09[0-9]{9}"
              maxlength="11"
              required
            />
          </div>

          <!-- نام دستگاه -->
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="deviceName"
            >
              نام دستگاه
            </label>
            <input
              v-model="form.deviceName"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="deviceName"
              type="text"
              placeholder="نام دستگاه را وارد کنید"
              required
            />
          </div>

          <!-- دسته بندی -->
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="category"
            >
              دسته بندی
            </label>
            <select
              v-model="form.category"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="category"
              required
            >
              <option value="" disabled selected>لطفا انتخاب کنید</option>
              <option value="الکترونیکی">الکترونیکی</option>
              <option value="مکانیکی">مکانیکی</option>
              <option value="نرم‌افزاری">نرم‌افزاری</option>
              <option value="سخت‌افزاری">سخت‌افزاری</option>
              <option value="سایر">سایر</option>
            </select>
          </div>

          <!-- بیانه -->
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="statement"
            >
              بیانه
            </label>
            <textarea
              v-model="form.statement"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="statement"
              rows="3"
              placeholder="بیانه خود را وارد کنید"
              required
            ></textarea>
          </div>

          <!-- تاریخ امروز -->
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="date"
            >
              تاریخ امروز
            </label>
            <input
              v-model="form.date"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="date"
              type="text"
              readonly
              required
            />
          </div>

          <!-- توضیحات ظاهری -->
          <div class="mb-6">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="description"
            >
              توضیحات ظاهری
            </label>
            <textarea
              v-model="form.description"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              rows="4"
              placeholder="توضیحات ظاهری را وارد کنید"
            ></textarea>
          </div>

          <div class="flex items-center justify-between">
            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              ثبت اطلاعات
            </button>
            <button
              @click="resetForm"
              class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              پاک کردن فرم
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const gregorianToJalali = (date) => {
  const gDate = new Date(date);
  const gYear = gDate.getFullYear();
  const gMonth = gDate.getMonth() + 1;
  const gDay = gDate.getDate();

  const gy = gYear - 1600;
  const gm = gMonth - 1;
  const gd = gDay - 1;

  let g_day_no =
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400);

  for (let i = 0; i < gm; ++i) {
    g_day_no += [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i];
  }

  if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) {
    g_day_no++;
  }

  g_day_no += gd;

  let j_day_no = g_day_no - 79;

  const j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;

  let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);

  j_day_no %= 1461;

  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }

  let jm = 1;
  for (let i = 0; i < 12; ++i) {
    const v = i < 6 ? 31 : 30;
    if (j_day_no >= v) {
      j_day_no -= v;
      jm++;
    } else {
      break;
    }
  }

  const jd = j_day_no + 1;

  return {
    year: jy,
    month: jm.toString().padStart(2, "0"),
    day: jd.toString().padStart(2, "0"),
  };
};

const getCurrentJalaliDate = () => {
  const today = new Date();
  const jalali = gregorianToJalali(today);
  return `${jalali.year}-${jalali.month}-${jalali.day}`;
};

const form = ref({
  firstName: "",
  lastName: "",
  phone: "",
  deviceName: "",
  category: "",
  statement: "",
  date: getCurrentJalaliDate(),
  description: "",
});

const submitForm = () => {
  console.log("فرم ارسال شد:", form.value);
  alert("فرم با موفقیت ثبت شد!");
};

const resetForm = () => {
  form.value = {
    firstName: "",
    lastName: "",
    phone: "",
    deviceName: "",
    category: "",
    statement: "",
    date: getCurrentJalaliDate(),
    description: "",
  };
};
</script>

<style scoped>
.container {
  font-family: "Vazir", "Segoe UI", Tahoma, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%);
}

h1 {
  color: #1a365d;
  position: relative;
  padding-bottom: 15px;
  font-size: 2.5rem;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

h1::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100px;
  height: 4px;
  background: linear-gradient(to right, #4299e1, #667eea);
  border-radius: 2px;
}

form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

form:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

label {
  color: #2d3748;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  display: block;
}

input:not([type="submit"]),
select,
textarea {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  width: 100%;
  color: #2d3748;
}

input:not([type="submit"]):focus,
select:focus,
textarea:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.15);
  outline: none;
  background: #ffffff;
}

input:not([type="submit"]):hover,
select:hover,
textarea:hover {
  border-color: #cbd5e0;
  background: #ffffff;
}

button[type="submit"] {
  background: linear-gradient(135deg, #4299e1 0%, #667eea 100%);
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(66, 153, 225, 0.3);
  background: linear-gradient(135deg, #3182ce 0%, #5a67d8 100%);
}

button[type="button"] {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

button[type="button"]:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}

/* انیمیشن برای فیلدها */
.input-group {
  position: relative;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  transform: translateY(-2px);
}

/* واکنش‌گرا برای موبایل */
@media (max-width: 640px) {
  .container {
    padding: 0.5rem;
  }

  form {
    padding: 1rem;
  }

  h1 {
    font-size: 1.75rem;
  }

  .bg-gradient-to-r {
    padding: 1rem;
  }

  button {
    width: 100%;
    margin-bottom: 0.75rem;
  }

  .flex.justify-between {
    flex-direction: column;
    gap: 0.75rem;
  }

  input:not([type="submit"]),
  select,
  textarea {
    font-size: 0.95rem;
    padding: 0.6rem 0.75rem;
  }
}

/* استایل‌های دسکتاپ */
@media (min-width: 1024px) {
  .container {
    max-width: 48rem;
  }

  form {
    padding: 2rem;
  }

  input:not([type="submit"]),
  select,
  textarea {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }

  .mb-4 {
    margin-bottom: 1.5rem;
  }
}

/* استایل مخصوص تاریخ */
input[type="date"] {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3e%3c/rect%3e%3cline x1='16' y1='2' x2='16' y2='6'%3e%3c/line%3e%3cline x1='8' y1='2' x2='8' y2='6'%3e%3c/line%3e%3cline x1='3' y1='10' x2='21' y2='10'%3e%3c/line%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.2em;
  padding-right: 2.5rem;
}

/* استایل مخصوص select */
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
  padding-right: 2.5rem;
}

/* اضافه کردن انیمیشن برای فیلدهای ورودی */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mb-4 {
  animation: fadeIn 0.5s ease-out forwards;
}

/* استایل برای پیام خطا */
.text-gray-600.text-xs.italic {
  color: #718096;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
</style>
