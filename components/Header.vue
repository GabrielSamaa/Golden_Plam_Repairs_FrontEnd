<template>
    <header class="sticky-top">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div class="container-fluid px-4">
          <!-- لوگو یا نام سایت -->
          <NuxtLink to="/" class="navbar-brand">
            <img src="C:\Users\Gabriel\Pictures\Adobe photoshop\2.png" alt="لوگو" height="40" class="d-inline-block align-top ms-2">
            نخل طلایی
          </NuxtLink>
  
          <!-- دکمه همبرگر برای موبایل -->
          <button 
            class="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <!-- منوی اصلی -->
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mx-auto position-absolute start-50 translate-middle-x">
              <li class="nav-item">
                <NuxtLink to="/" class="nav-link" active-class="active">خانه</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/about" class="nav-link" active-class="active">درباره ما</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/contact" class="nav-link" active-class="active">ارتباط با ما</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/customer/login" class="nav-link" active-class="active">پیگیری درخواست تعمیر</NuxtLink>
              </li>
              <!-- دکمه ورود ادمین در حالت موبایل -->
              <!-- <li class="nav-item d-lg-none">
                <NuxtLink to="/Follow_up"><button  class="btn btn-light w-100">پیگیری درخواست تعمیر</button></NuxtLink>
              </li> -->
            </ul>
          </div>

          <!-- دکمه ورود ادمین در حالت دسکتاپ -->
          <div class="d-none d-lg-block">
            <NuxtLink to="/customer/login"><button class="btn btn-light btn-lg">پیگیری درخواست تعمیر</button></NuxtLink>
          </div>
        </div>
      </nav>
    </header>
  </template>
  
  <script setup>
  // نیازی به import نیست (Nuxt 3 به صورت خودکار مدیریت می‌کند)
  </script>
  
  <style scoped>
  .navbar {
    padding: 0.8rem 0;
  }
  
  .navbar-brand {
    font-weight: 700;
    font-size: 1.5rem;
  }
  
  .nav-link {
    font-weight: 500;
    margin: 0 0.5rem;
    position: relative;
  }
  
  .nav-link.active {
    color: #fff !important;
  }
  
  .nav-link:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    right: 0;
    background-color: #fff;
    transition: width 0.3s ease;
  }
  
  .nav-link:hover:after,
  .nav-link.active:after {
    width: 100%;
  }

  .btn-light {
    margin-right: 0;
    padding: 0.5rem 1.5rem;
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  @media (max-width: 991.98px) {
    .navbar-collapse {
      padding: 1rem 0;
      text-align: center;
    }
    
    .nav-item {
      margin: 0.5rem 0;
      width: 100%;
      display: flex;
      justify-content: center;
    }
    
    .navbar-nav {
      position: static !important;
      transform: none !important;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      text-align: center;
      padding: 0.5rem 1rem;
      width: 100%;
    }

    .nav-item .btn-light {
      margin-top: 1rem;
      width: 80%;
      max-width: 200px;
    }
  }
  </style>