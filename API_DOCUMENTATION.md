# مستندات API سیستم تعمیرات نخل طلایی

## اطلاعات پایه
- **Base URL**: `http://localhost:3000/api`
- **نوع پاسخ‌ها**: JSON
- **احراز هویت**: JWT Token در هدر `Authorization`

## مدل‌های داده

### کاربر (User)
```json
{
  "id": "string",
  "username": "string",
  "password": "string (hashed)",
  "role": "admin | user",
  "fullName": "string",
  "phone": "string",
  "email": "string",
  "createdAt": "date",
  "lastLogin": "date"
}
```

### درخواست تعمیر (RepairRequest)
```json
{
  "id": "string",
  "userId": "string",
  "status": "pending | accepted | in_progress | completed | rejected",
  "deviceType": "string",
  "deviceModel": "string",
  "problemDescription": "string",
  "estimatedCost": "number",
  "finalCost": "number",
  "deliveryCode": "string",
  "createdAt": "date",
  "updatedAt": "date",
  "completedAt": "date",
  "adminNotes": "string"
}
```

### پیام (Message)
```json
{
  "id": "string",
  "userId": "string",
  "adminId": "string",
  "content": "string",
  "read": "boolean",
  "createdAt": "date",
  "direction": "user_to_admin | admin_to_user"
}
```

## API Endpoints

### احراز هویت

#### ثبت‌نام کاربر جدید
- **Method**: POST
- **Endpoint**: `/auth/register`
- **ورودی**:
```json
{
  "username": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string",
  "email": "string"
}
```
- **خروجی**:
```json
{
  "success": "boolean",
  "message": "string",
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "role": "user"
  }
}
```

#### ورود کاربر
- **Method**: POST
- **Endpoint**: `/auth/login`
- **ورودی**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **خروجی**:
```json
{
  "success": "boolean",
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "role": "string",
    "fullName": "string"
  }
}
```

### مدیریت درخواست‌ها

#### ایجاد درخواست جدید
- **Method**: POST
- **Endpoint**: `/repair-requests`
- **ورودی**:
```json
{
  "deviceType": "string",
  "deviceModel": "string",
  "problemDescription": "string"
}
```
- **خروجی**:
```json
{
  "success": "boolean",
  "request": {
    "id": "string",
    "status": "pending",
    "deliveryCode": "string",
    "createdAt": "date"
  }
}
```

#### دریافت لیست درخواست‌ها
- **Method**: GET
- **Endpoint**: `/repair-requests`
- **Query Parameters**:
  - `status`: وضعیت درخواست (اختیاری)
  - `page`: شماره صفحه (پیش‌فرض: 1)
  - `limit`: تعداد در هر صفحه (پیش‌فرض: 10)
- **خروجی**:
```json
{
  "success": "boolean",
  "requests": [
    {
      "id": "string",
      "status": "string",
      "deviceType": "string",
      "createdAt": "date",
      "estimatedCost": "number"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "pages": "number"
  }
}
```

#### بروزرسانی وضعیت درخواست
- **Method**: PATCH
- **Endpoint**: `/repair-requests/:id/status`
- **ورودی**:
```json
{
  "status": "string",
  "estimatedCost": "number",
  "adminNotes": "string"
}
```
- **خروجی**:
```json
{
  "success": "boolean",
  "request": {
    "id": "string",
    "status": "string",
    "updatedAt": "date"
  }
}
```

#### تایید کد تحویل
- **Method**: POST
- **Endpoint**: `/repair-requests/verify-delivery`
- **ورودی**:
```json
{
  "deliveryCode": "string"
}
```
- **خروجی**:
```json
{
  "success": "boolean",
  "request": {
    "id": "string",
    "status": "string",
    "deviceType": "string"
  }
}
```

### مدیریت پیام‌ها

#### ارسال پیام جدید
- **Method**: POST
- **Endpoint**: `/messages`
- **ورودی**:
```json
{
  "content": "string",
  "recipientId": "string"
}
```
- **خروجی**:
```json
{
  "success": "boolean",
  "message": {
    "id": "string",
    "content": "string",
    "createdAt": "date",
    "direction": "string"
  }
}
```

#### دریافت پیام‌ها
- **Method**: GET
- **Endpoint**: `/messages`
- **Query Parameters**:
  - `userId`: شناسه کاربر (اختیاری)
  - `page`: شماره صفحه
  - `limit`: تعداد در هر صفحه
- **خروجی**:
```json
{
  "success": "boolean",
  "messages": [
    {
      "id": "string",
      "content": "string",
      "createdAt": "date",
      "read": "boolean",
      "direction": "string"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "pages": "number"
  }
}
```

#### بروزرسانی وضعیت خوانده شدن پیام
- **Method**: PATCH
- **Endpoint**: `/messages/:id/read`
- **خروجی**:
```json
{
  "success": "boolean",
  "message": {
    "id": "string",
    "read": "boolean"
  }
}
```

### مدیریت مالی

#### ثبت هزینه نهایی
- **Method**: PATCH
- **Endpoint**: `/repair-requests/:id/final-cost`
- **ورودی**:
```json
{
  "finalCost": "number"
}
```
- **خروجی**:
```json
{
  "success": "boolean",
  "request": {
    "id": "string",
    "finalCost": "number",
    "status": "completed"
  }
}
```

#### دریافت گزارش مالی
- **Method**: GET
- **Endpoint**: `/financial/report`
- **Query Parameters**:
  - `startDate`: تاریخ شروع
  - `endDate`: تاریخ پایان
- **خروجی**:
```json
{
  "success": "boolean",
  "report": {
    "totalRequests": "number",
    "completedRequests": "number",
    "totalIncome": "number",
    "averageCost": "number",
    "requestsByStatus": {
      "pending": "number",
      "in_progress": "number",
      "completed": "number",
      "rejected": "number"
    }
  }
}
```

## نیازمندی‌های سرور

### تکنولوژی‌ها
- Node.js
- Express.js
- MongoDB
- JWT برای احراز هویت
- bcrypt برای رمزنگاری پسوردها

### پکیج‌های مورد نیاز
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express-validator": "^7.0.0",
    "helmet": "^6.0.0",
    "morgan": "^1.10.0"
  }
}
```

### متغیرهای محیطی
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/golden_palm
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### امنیت
- استفاده از HTTPS
- محدودیت نرخ درخواست (Rate Limiting)
- اعتبارسنجی ورودی‌ها
- رمزنگاری داده‌های حساس
- محافظت در برابر حملات XSS و CSRF

### نکات پیاده‌سازی
1. تمام درخواست‌ها باید با توکن JWT معتبر باشند (به جز ثبت‌نام و ورود)
2. دسترسی به API‌های مدیریتی فقط برای کاربران با نقش admin مجاز است
3. تمام تاریخ‌ها در فرمت ISO 8601 ذخیره می‌شوند
4. خطاها با کد HTTP مناسب و پیام خطای فارسی برگردانده می‌شوند
5. پاگینیشن برای تمام لیست‌ها پیاده‌سازی شود
6. لاگ تمام عملیات‌های مهم
7. پشتیبان‌گیری منظم از دیتابیس 