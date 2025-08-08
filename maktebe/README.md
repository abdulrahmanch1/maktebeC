# دار القرَاء

دار القرَاء هي مكتبة عربية مبنية بـ React (واجهة أمامية) و Node.js + Express + MongoDB (واجهة خلفية).

## ️ المتطلبات
- Node.js
- MongoDB
- npm

---

## التشغيل

### ✅ Backend
```bash
cd backend
npm install
npm run dev
```

 ملف `.env` في مجلد backend:

```
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/maktebe
```

---

### ✅ Frontend

```bash
npm install
npm start
```

 ملف `.env` في **جذر المشروع** (بجانب `package.json` الرئيسي):

```
REACT_APP_API_URL=http://localhost:5000
```

---

## ✨ الميزات

* واجهة عربية
* تسجيل دخول JWT
* عرض وإضافة كتب للمفضلة
* CRUD للكتب

---

## نشر على Vercel

عند نشر المشروع على Vercel، يجب عليك تعيين متغيرات البيئة التالية في إعدادات المشروع على Vercel:

- `MONGO_URI`: رابط قاعدة بيانات MongoDB الخاصة بك.
- `JWT_SECRET`: مفتاح سري لتوقيع JWT.
- `FRONTEND_URL`: رابط الواجهة الأمامية للمشروع على Vercel.
- `EMAIL_USER`: عنوان البريد الإلكتروني الذي سيتم استخدامه لإرسال رسائل التحقق.
- `EMAIL_PASS`: كلمة مرور البريد الإلكتروني.
