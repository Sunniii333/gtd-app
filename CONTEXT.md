# GTD

ระบบ Getting Things Done ส่วนตัวของผู้ใช้คนเดียว ที่ใช้ได้จากหลายเครื่องโดยเห็นข้อมูลชุดเดียวกัน

## Language

### Sync

**Device**:
เครื่องหนึ่งเครื่องที่ผู้ใช้เปิดแอป (คอม มือถือ) แต่ละเครื่องมีสำเนาข้อมูลของตัวเองและใช้ได้แม้ไม่มีเน็ต
_Avoid_: platform, client

**Cloud copy**:
ข้อมูลชุดกลางที่ทุก Device ส่งการเปลี่ยนแปลงขึ้นไปและดึงลงมา — เป็นความจริงหนึ่งเดียวของระบบ
_Avoid_: server data, backup

**Sync**:
การทำให้สำเนาบน Device กับ Cloud copy ตรงกัน ทั้งขาขึ้นและขาลง
_Avoid_: backup, upload

**Last write wins**:
เมื่อ Item หรือ Project เดียวกันถูกแก้บนสอง Device การแก้ที่ไปถึง Cloud copy ทีหลังชนะทั้งก้อน (ไม่ใช่ตามนาฬิกาเครื่อง และไม่รวมทีละช่อง)

**Seed backup**:
ไฟล์ Export ที่ใช้เป็นข้อมูลตั้งต้นของ Cloud copy ตอนเปิด Sync ครั้งแรก
_Avoid_: migration file
