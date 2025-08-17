<template>
    <Header />
    <main>
        <div class="container mb-5">
          <h1 class="fw-bold content-center m-5">فروشگاه بزرگ نخل طلایی</h1>
          <p>نخل طلایی، پیشرو در صنعت لوازم آرایشی بهداشتی مردانه و خدمات تخصصی آرایشگاهی از سال 1375 با شعار «کیفیت بالا، قیمت مناسب و صداقت در خدمت رسانی» فعالیت می‌کند. ما با بیش از سه دهه تجربه، به عنوان یکی از معتبرترین مراکز فروش و تعمیرات تخصصی لوازم آرایشگاهی در فردیس شناخته می‌شویم.</p>
          <h1 class="fw-bold content-center m-5">خدمات و محصولات ما</h1>
          <h3>فروش تخصصی لوازم آرایشی بهداشتی:</h3>
          <ul>
            <li>سشوارهای حرفه‌ای و سالنی</li>
            <li>ماشین‌های اصلاح مو و ریش</li>
            <li>دستگاه‌های اپیلیدی</li>
            <li>دستگاه‌های اتومو و بندانداز</li>
            <li>خط‌زن‌های حرفه‌ای</li>
            <li>محصولات آرایشگاهی</li>
            <li>انواع حالت دهنده های مو</li>
          </ul>
          <h3>خدمات تخصصی تعمیرات:</h3>
          <ul>
            <li>تعمیر ماشین‌های اصلاح</li>
            <li>تعمیر سشوارهای حرفه‌ای</li>
            <li>تعمیر انواع دستگاه‌های آرایشگاهی</li>
            <li>تعمیرات تخصصی اپیلیدی</li>
            <li>و دها دستگاه دیگر</li>
          </ul>
          <h3>چرا نخل طلایی را انتخاب کنید؟</h3>
          <ul>
            <li>تخصص و تجربه:</li>
            <p>با بیش از 25 سال سابقه درخشان</p>
            <li>کیفیت تضمینی:</li>
            <p>استفاده از بهترین قطعات و مواد اولیه</p>
            <li>قیمت‌های رقابتی:</li>
            <p>مناسب‌ترین قیمت‌ها در بازار</p>
            <li>مشتری مداری:</li>
            <p>صداقت و شفافیت در تمام مراحل</p>
          </ul>
          <h3>مخاطبان ما</h3>
          <p>خدمات و محصولات نخل طلایی مناسب سالن‌های آرایش مردانه و زنانه، آرایشگاه‌های تخصصی و عموم مردم است. ما با ارائه مشاوره رایگان، به شما کمک می‌کنیم بهترین انتخاب را داشته باشید.</p>
          <h3>سیستم پیگیری تعمیرات</h3>
          <p>برای پیگیری درخواست تعمیرات خود می‌توانید از لینک زیر استفاده کنید:</p>
          <div class="content-center">
          <NuxtLink to="/customer/login" class="golden-btn">
            <span class="btn-text">پیگیری درخواست تعمیر</span>
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </NuxtLink>
          </div>
          <h3>چشم‌انداز ما</h3>
          <p>فروشگاه نخل طلایی با تکیه بر ارزش‌های اصیل کسب‌وکار و تعهد به مشتریان، در تلاش است تا با ارائه بهترین خدمات و محصولات، به برندی معتبر و مورد اعتماد در صنعت لوازم آرایشی بهداشتی تبدیل شود. ما هر روز برای بهبود کیفیت خدمات خود تلاش می‌کنیم و افتخار داریم که بخشی از زیبایی و آراستگی مشتریانمان هستیم.</p>
        </div>
    </main>
    <Footer />
</template>
<script setup>
import Footer from '~/components/Footer.vue'
</script>
<style>
.btn-text {
  position: relative;
  z-index: 2;
}

.btn-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #5c3a00;
  position: relative;
  z-index: 2;
}
.content-center {
  position: relative;
  z-index: 1;
  text-align: center;
}
.golden-btn {
  display: inline-flex;
  align-items: center;
  padding: 18px 36px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #5c3a00;
  background: linear-gradient(135deg, #f9d423 0%, #e6b422 50%, #d4af37 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}
</style>


