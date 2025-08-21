<template>
  <div class="golden-palm-page">
    <Header />

    <main>
      <div class="main-content px-0"> <!-- px-0 برای حذف padding جانبی -->
        <div class="background-design z-2">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>

        <div class="hero-container position-relative w-100">
          <!-- تصویر با کلاس‌های رسپانسیو Bootstrap -->
          <img class="img-fluid w-100 hero-image" src="/assets/images/repair_golden_moser.webp" alt="خدمات تعمیر ماشین مورز نخل طلایی" style="object-position: center;">

          <!-- Overlay متن روی تصویر -->
          <div class="hero-overlay d-flex align-items-center justify-content-center z-3">
            <div class="container hero-text text-white text-center py-5">
              <div class="row justify-content-center">
                <div class="col-lg-8">
                  <h1 class="fw-bold display-4 mb-3">تعمیرات تخصصی لوازم شخصی و آرایشگاهی نخل طلایی</h1>
                  <p class="lead d-none d-md-block mb-4">نخل طلایی، مرکز تخصصی تعمیرات لوازم برقی آرایشی و آرایشگاهی در فردیس، با سال‌ها تجربه و تیمی حرفه‌ای آماده ارائه خدماتی بی‌نظیر به شماست. از تعمیر ماشین اصلاح و سشوار گرفته تا پیگیری آنلاین وضعیت دستگاه شما، ما کیفیت و رضایت شما را تضمین می‌کنیم!</p>
                  <p class="d-md-none mb-4">تعمیرات تخصصی لوازم آرایشگاهی با گارانتی و پیگیری آنلاین</p>
                  <NuxtLink to="/customer/login" class="golden-btn">
                    <span class="btn-text">پیگیری درخواست تعمیر</span>
                    <svg class="btn-icon" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="features-section py-5">
        <div class="container">
          <h2 class="text-center fw-bold mb-5">چرا نخل طلایی بهترین انتخاب شماست؟</h2>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="feature-card bg-warning text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-gear-fill feature-icon"  viewBox="0 0 16 16">
                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
                <h3 class="mt-3 fw-bold">خدمات تعمیرات تخصصی</h3>
                <p>ما در نخل طلایی انواع دستگاه‌های برقی آرایشی مانند ماشین اصلاح، سشوار، اتوی مو، اپی‌لیدی و دیگر لوازم آرایشگاهی را با دقت و حرفه‌ای تعمیر می‌کنیم. از برندهای معتبر مانند فیلیپس، پاناسونیک، موزر و غیره پشتیبانی می‌کنیم.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-card bg-warning text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-tablet feature-icon" viewBox="0 0 16 16">
                  <path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                  <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                </svg>
                <h3 class="mt-3 fw-bold">پیگیری آنلاین تعمیرات</h3>
                <p>با سیستم پیشرفته پیگیری آنلاین نخل طلایی، در هر زمان و مکان می‌توانید از وضعیت دستگاه خود مطلع شوید. کافی است وارد پنل کاربری خود شوید و مراحل تعمیر را به‌صورت لحظه‌ای دنبال کنید.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-card bg-warning text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-cash feature-icon" viewBox="0 0 16 16">
                  <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                  <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2z"/>
                </svg>
                <h3 class="mt-3 fw-bold">شفافیت و صداقت</h3>
                <p>ما در نخل طلایی به صداقت و مشتری‌مداری متعهدیم. اگر تعمیر دستگاه شما به‌صرفه نباشد، صادقانه به شما اطلاع می‌دهیم و بهترین راه‌حل را پیشنهاد می‌کنیم.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="container mt-5">
          <h2 class="fw-bold mb-4">داستان نخل طلایی</h2>
          <p>نخل طلایی از سال‌ها پیش با یک هدف ساده شروع به کار کرد: ارائه خدمات تعمیراتی باکیفیت و قابل اعتماد برای لوازم شخصی و آرایشگاهی. ما در این سال‌ها با تکیه بر تخصص، تجربه و تعهد به مشتری‌مداری، به بزرگ‌ترین مرکز تعمیرات تخصصی در منطقه فردیس تبدیل شده‌ایم. تیم حرفه‌ای ما با استفاده از ابزارهای پیشرفته و قطعات اورجینال، دستگاه‌های شما را به بهترین شکل ممکن تعمیر می‌کند. هدف ما این است که دستگاه‌های شما نه تنها تعمیر شوند، بلکه مانند روز اول کار کنند!</p>
          <p>ما در نخل طلایی معتقدیم که اعتماد شما بزرگ‌ترین سرمایه ماست. به همین دلیل، تمام تلاش خود را به کار می‌گیریم تا تجربه‌ای متفاوت و رضایت‌بخش برای شما فراهم کنیم.</p>

          <h2 class="fw-bold mt-5 mb-4">مزایای رقابتی نخل طلایی</h2>
          <ul class="me-3">
            <li class="fw-bold">تخصص و تجربه بی‌نظیر:</li>
            <p class="me-2">با بیش از یک دهه تجربه، ما هزاران دستگاه را با موفقیت تعمیر کرده‌ایم و به برندهای معتبر جهانی مسلط هستیم.</p>
            <li class="fw-bold">شفافیت در هزینه‌ها:</li>
            <p class="me-2">هزینه‌های تعمیر را به‌صورت کاملاً منصفانه و شفاف اعلام می‌کنیم. هیچ هزینه پنهانی در کار ما وجود ندارد.</p>
            <li class="fw-bold">پیگیری آنلاین پیشرفته:</li>
            <p class="me-2">سیستم پیگیری آنلاین ما به شما امکان می‌دهد در هر لحظه از وضعیت دستگاه خود مطلع شوید، از ثبت درخواست تا تحویل نهایی.</p>
            <li class="fw-bold">پشتیبانی از انواع دستگاه‌ها:</li>
            <p class="me-2">از ماشین‌های اصلاح مو (موزر، فیلیپس، پاناسونیک) گرفته تا سشوار، اتوی مو، اپی‌لیدی و سایر لوازم آرایشگاهی، همه را با دقت و حرفه‌ای تعمیر می‌کنیم.</p>
            <li class="fw-bold">مرکز تخصصی در فردیس:</li>
            <p class="me-2">ما افتخار می‌کنیم که بزرگ‌ترین مرکز تخصصی تعمیرات لوازم آرایشگاهی در منطقه فردیس هستیم.</p>
            <li class="fw-bold">کیفیت تضمین‌شده:</li>
            <p class="me-2">استفاده از قطعات اورجینال و باکیفیت، تضمین می‌کند که دستگاه شما پس از تعمیر عملکردی بی‌نقص خواهد داشت.</p>
            <li class="fw-bold">خدمات سریع و مطمئن:</li>
            <p class="me-2">ما می‌دانیم که زمان شما ارزشمند است. به همین دلیل، تعمیرات را در کوتاه‌ترین زمان ممکن و با بالاترین کیفیت انجام می‌دهیم.</p>
          </ul>

          <h2 class="fw-bold mt-5 mb-4">خدمات تعمیراتی نخل طلایی</h2>
          <p>ما در نخل طلایی طیف گسترده‌ای از خدمات تعمیراتی را برای انواع دستگاه‌های برقی آرایشی و آرایشگاهی ارائه می‌دهیم. خدمات ما شامل موارد زیر است:</p>
          <ul class="me-2">
            <li class="fw-bold">تعمیر ماشین‌های اصلاح مو:</li>
            <p class="me-2">پشتیبانی از برندهای معتبر مانند موزر، فیلیپس، پاناسونیک، وال و غیره.</p>
            <li class="fw-bold">تعمیر سشوار و دستگاه‌های حالت‌دهنده مو:</li>
            <p class="me-2">رفع مشکلات برقی، موتور و قطعات داخلی سشوارها و اتوهای مو.</p>
            <li class="fw-bold">تعمیر دستگاه‌های اپی‌لیدی:</li>
            <p class="me-2">بازسازی و تعمیر دستگاه‌های اپیلاسیون برای عملکرد بهینه.</p>
            <li class="fw-bold">تعمیر ریش‌تراش‌های برقی:</li>
            <p class="me-2">رفع مشکلات تیغه‌ها، باتری و قطعات الکترونیکی ریش‌تراش‌ها.</p>
            <li class="fw-bold">تعمیر سایر لوازم آرایشگاهی:</li>
            <p class="me-2">از دستگاه‌های خانگی تا ابزارهای حرفه‌ای آرایشگاهی.</p>
          </ul>
          <p>ما همچنین خدمات مشاوره‌ای ارائه می‌دهیم تا در صورت نیاز به تعویض دستگاه، بهترین گزینه را به شما پیشنهاد کنیم.</p>

          <h2 class="fw-bold mt-5 mb-4">نحوه ثبت درخواست تعمیر در نخل طلایی</h2>
          <p>فرایند ثبت و پیگیری تعمیرات در نخل طلایی ساده، شفاف و کاربرپسند است. مراحل کار به این صورت است:</p>
          <ol class="me-3">
            <li class="fw-bold">ثبت درخواست:</li>
            <p class="me-2">به‌صورت حضوری ، دستگاه خود را برای تعمیر ثبت کنید.</p>
            <li class="fw-bold">تشخیص اولیه مشکل:</li>
            <p class="me-2">متخصصان ما دستگاه شما را بررسی کرده و مشکلات ظاهری را شناسایی می‌کنند.</p>
            <li class="fw-bold">برآورد هزینه:</li>
            <p class="me-2">محدوده هزینه تعمیر به شما اعلام می‌شود و پس از تأیید شما، فرآیند تعمیر آغاز می‌شود.</p>
            <li class="fw-bold">پیگیری آنلاین:</li>
            <p class="me-2">از طریق پنل کاربری در سایت نخل طلایی، می‌توانید مراحل تعمیر دستگاه خود را به‌صورت لحظه‌ای دنبال کنید.</p>
            <li class="fw-bold">تحویل دستگاه:</li>
            <p class="me-2">پس از تعمیر و تست نهایی، دستگاه شما آماده تحویل خواهد بود. می‌توانید به‌صورت حضوری دستگاه را دریافت کنید.</p>
          </ol>

          <h2 class="fw-bold mt-5 mb-4">تعهدات نخل طلایی به شما</h2>
          <p>ما در نخل طلایی به چیزی بیش از تعمیر دستگاه‌ها فکر می‌کنیم. ما به دنبال ایجاد اعتماد و رضایت پایدار هستیم. تعهدات ما شامل موارد زیر است:</p>
          <ul class="me-3">
            <li class="fw-bold">کیفیت بی‌نظیر:</li>
            <p class="me-2">هر دستگاه با دقت تعمیر می‌شود.</p>
            <li class="fw-bold">شفافیت کامل:</li>
            <p class="me-2">تمام مراحل تعمیر و هزینه‌ها به‌صورت شفاف به شما اطلاع داده می‌شود.</p>
            <li class="fw-bold">رضایت مشتری:</li>
            <p class="me-2">هدف ما رضایت 100٪ شماست. صدها مشتری راضی گواه این ادعاست.</p>
          </ul>

          <h2 class="fw-bold mt-5 mb-4">سوالات متداول</h2>
          <div class="accordion" id="faqAccordion">
            <div class="accordion-item">
              <h3 class="accordion-header" id="faq1">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                  چه دستگاه‌هایی در نخل طلایی تعمیر می‌شوند؟
                </button>
              </h3>
              <div id="collapse1" class="accordion-collapse collapse show" aria-labelledby="faq1" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  ما انواع دستگاه‌های برقی آرایشی و آرایشگاهی مانند ماشین اصلاح، سشوار، اتوی مو، اپی‌لیدی و ریش‌تراش را تعمیر می‌کنیم. برندهای معتبر مانند فیلیپس، پاناسونیک، موزر و غیره پشتیبانی می‌شوند.
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h3 class="accordion-header" id="faq2">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                  چگونه می‌توانم وضعیت دستگاه خود را پیگیری کنم؟
                </button>
              </h3>
              <div id="collapse2" class="accordion-collapse collapse" aria-labelledby="faq2" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  با ورود به پنل کاربری در سایت نخل طلایی و استفاده از سیستم پیگیری آنلاین، می‌توانید در هر لحظه از وضعیت دستگاه خود مطلع شوید.
                </div>
              </div>
            </div>
          </div>

          <h2 class="fw-bold mt-5 mb-4">نخل طلایی؛ جایی که دستگاه‌های شما دوباره جان می‌گیرند!</h2>
          <p>ما در نخل طلایی به کیفیت کارمان ایمان داریم. صدها مشتری راضی گواهی می‌دهند که خدمات ما نه تنها حرفه‌ای، بلکه متفاوت است. از تعمیر دستگاه‌های کوچک شخصی تا تجهیزات حرفه‌ای آرایشگاهی، ما با دقت و تعهد در کنار شما هستیم.</p>
          <p><b>فرصت را از دست ندهید!</b> همین حالا با ما تماس بگیرید یا از طریق پنل کاربری وضعیت دستگاه خود را پیگیری کنید. نخل طلایی آماده خدمت‌رسانی به شماست.</p>
          <div class="text-center mt-4">
            <h4 class="content-center bg-warning-subtle p-2 rounded-5">نخل طلایی؛ اعتماد شما، مسئولیت ما!</h4>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
useHead({
  link: [
    { rel: 'canonical', href: 'https://nakhltalaei_service.ir' },
  ]
})
useSeoMeta({
  title: 'تعمیرات نخل طلایی | تعمیر تخصصی لوازم برقی آرایشی و آرایشگاهی در فردیس',
  ogTitle: 'نخل طلایی | تعمیرات تخصصی لوازم شخصی و آرایشگاهی با پیگیری آنلاین',
  description: 'نخل طلایی با سال‌ها تجربه در تعمیرات تخصصی ماشین اصلاح، سشوار، اتوی مو و اپی‌لیدی، خدمات باکیفیت و شفاف ارائه می‌دهد. با سیستم پیگیری آنلاین ما، در هر لحظه از وضعیت دستگاه خود مطلع شوید.',
  ogDescription: 'نخل طلایی، مرکز تخصصی تعمیرات لوازم برقی آرایشی در فردیس. خدمات حرفه‌ای، قطعات اورجینال و سیستم پیگیری آنلاین. اعتماد شما، مسئولیت ماست!',
  ogImage: 'https://nakhltalaei-servic.ir/nakhltalaei.webp',
  twitterCard: 'nakhltalaei_service',
})
import Footer from '~/components/Footer.vue'
</script>

<style scoped>
.feature-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  color: var(--primary-color);
}

.golden-palm-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7ff;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.background-design {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(13, 110, 253, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -50px;
  left: -50px;
}

.circle-2 {
  width: 500px;
  height: 500px;
  bottom: -100px;
  right: -100px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 30%;
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

.golden-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      to bottom right,
      rgba(255,255,255,0.3) 0%,
      rgba(255,255,255,0) 60%
  );
  transform: rotate(30deg);
}

.golden-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(212, 175, 55, 0.6);
  background: linear-gradient(135deg, #f9d423 0%, #d4af37 50%, #b38f2a 100%);
}

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

@media (max-width: 768px) {
  .golden-btn {
    padding: 14px 28px;
    font-size: 1rem;
  }

  .circle-1, .circle-2, .circle-3 {
    display: none;
  }
}
.hero-container {
  position: relative;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 80vh; /* ارتفاع بر اساس viewport */
  min-height: 500px; /* حداقل ارتفاع */
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* استایل‌های رسپانسیو */
@media (max-width: 992px) {
  .hero-image {
    height: 70vh;
    min-height: 400px;
  }

  .hero-text h1 {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .hero-image {
    height: 60vh;
    min-height: 350px;
  }

  .hero-text h1 {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .hero-image {
    height: 50vh;
    min-height: 300px;
  }

  .hero-text h1 {
    font-size: 1.75rem;
  }

  .hero-text p {
    font-size: 1rem;
  }
}
</style>