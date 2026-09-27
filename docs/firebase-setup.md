# ตั้งค่า Firebase (ทำครั้งเดียว ~10 นาที)

ทุกอย่างอยู่ใน free tier (Spark plan) ไม่ต้องใส่บัตรเครดิต

1. เข้า <https://console.firebase.google.com> → **Create a project** ตั้งชื่ออะไรก็ได้ (ปิด Google Analytics ได้)
2. **Build › Authentication** → Get started → แท็บ **Sign-in method** → เลือก **Google** → Enable → Save
3. ยังอยู่ใน Authentication → แท็บ **Settings › Authorized domains** → **Add domain** ใส่โดเมน Vercel ของแอป (เช่น `gtd-xxx.vercel.app`)
4. **Build › Firestore Database** → Create database → location `asia-southeast1 (Singapore)` → **Start in production mode**
5. Firestore → แท็บ **Rules** → วางเนื้อหาไฟล์ [`firestore.rules`](../firestore.rules) ทับทั้งหมด → **Publish**
6. ไอคอนเฟือง **Project settings** → หัวข้อ *Your apps* → กดไอคอนเว็บ `</>` → ตั้งชื่อ → Register
   จะเห็น `firebaseConfig` ให้คัดลอก 4 ค่า `apiKey`, `authDomain`, `projectId`, `appId` ไปใส่ใน [`src/sync/firebase.ts`](../src/sync/firebase.ts)
   (ค่าพวกนี้ไม่ใช่ความลับ — สิทธิ์จริงคุมด้วย Rules ในข้อ 5)

## หลัง deploy

- **ล็อกอินบนเครื่องที่มีข้อมูลจริงก่อน** (เครื่องที่ export backup มา) — Device แรกที่เจอ Cloud copy ว่างจะอัปโหลดข้อมูลในเครื่องขึ้นไปเอง
  หรือจะล็อกอินเครื่องไหนก่อนก็ได้ แล้วกด **Import** ไฟล์ backup
- เครื่องถัดไปล็อกอินแล้วจะได้ข้อมูลจาก cloud แทนของเดิมในเครื่อง
- มือถือ: เปิดเว็บ → เมนูเบราว์เซอร์ → **Add to Home Screen** ได้ไอคอนเปิดแบบแอป ใช้ offline ได้
