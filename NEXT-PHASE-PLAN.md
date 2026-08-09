# แผนเฟสถัดไป — GTD Task Manager

> เอกสารนี้สรุปจากการ grill แผนร่วมกัน ใช้เป็น spec ให้ Claude Code ทำต่อ
> ท้ายไฟล์มี **prompt สำเร็จรูป** สำหรับวางให้ Claude Code

## 1. บริบท (MVP ที่มีอยู่ตอนนี้)

แอป GTD แบบ local-first: React + TypeScript + Vite + Zustand (persist ลง `localStorage`) + Tailwind ไม่มี backend

มีแล้ว:
- **Capture** — Inbox / QuickAddInput
- **Clarify** — ClarifyDialog แยกเป็น Next / Waiting / Someday / Project
- **Organize** — contexts, projects, หน้า Next Actions / Waiting For / Someday/Maybe / Projects

ยังขาด (เทียบกับตำรา *Getting Things Done*):
- **Reflect** — ไม่มี Weekly Review เลย (ช่องว่างใหญ่สุด)
- **Engage** — ไม่มีวิธีเลือกงานจาก บริบท + เวลา + พลังงาน + ลำดับความสำคัญ
- ไม่มี date ใดๆ (hard landscape / tickler)
- ไม่มี export/import กันข้อมูลหาย

## 2. หลักการ GTD ที่ใช้ตัดสินใจ

- **Trusted system** — ระบบต้องน่าเชื่อถือพอที่สมองจะปล่อยทุกอย่างลงไป ฟีเจอร์ที่ทำลายความเชื่อถือ (เช่น รายการ overdue สีแดงเต็มจอ) ห้ามทำ
- **Hard landscape** — ปฏิทิน/เดดไลน์ลงเฉพาะสิ่งที่ *ต้อง* เกิดวันนั้นจริง ไม่แปะ due date ให้ทุก action
- **Weekly Review คือกาวที่ยึดระบบ** — ถ้าไม่มี ลิสต์จะเน่า
- **ทุก project ต้องมี next action** — ไม่งั้นถือว่า stalled

## 3. การตัดสินใจที่ล็อกแล้ว

| # | ประเด็น | สรุป |
|---|---------|------|
| Q1 | เป้าหมาย | เครื่องมือส่วนตัวใช้จริงทุกวัน — วัดผลที่ "เลิกใช้แอปเดิมได้" |
| Q2 | ยึดตำราแค่ไหน | ใช้ 5 ขั้นเป็นเข็มทิศ เน้นอุด Reflect + Engage |
| Q3 | งบเวลา | น้อย — บังคับจัดลำดับ ทำฟีเจอร์แหลมคมก่อน |
| Q4 | local-first | คงไว้ + เพิ่ม export/import JSON เป็นสะพานกันข้อมูลหาย |
| Q5 | ความหมายของ date | **แยกสองฟิลด์** — `deferUntil` (ซ่อนจนถึงวัน = tickler) กับ `dueDate` (เดดไลน์จริง) ทั้งคู่ **optional ไม่มี default** |
| Q6 | Weekly Review | ทำเฟสนี้ แบบ **checklist นำทางทีละขั้น** |

## 4. Spec ฟีเจอร์

### 4.1 Dates ใน Clarify (Q5)

**Data model** — เพิ่มใน `Task` (`src/types.ts`):
```ts
deferUntil?: number  // epoch ms, ต้นวัน — ซ่อนจาก Next Actions จนถึงวันนี้
dueDate?: number     // epoch ms, ต้นวัน — เดดไลน์จริง
```

**Store** (`src/store/useGtdStore.ts`):
- ขยาย `clarifyToNext(id, contexts, projectId, dates?)` ให้รับ `{ deferUntil?, dueDate? }`
- (มี `updateTask(id, patch)` อยู่แล้ว ใช้แก้ date ภายหลังได้)

**UI** (`src/components/ClarifyDialog.tsx`):
- ในโหมด "Next Action" เพิ่มช่อง date optional 2 อัน: "Defer until" และ "Due date"
- ปล่อยว่างได้ ไม่ต้องมีค่า default — **สำคัญ:** อย่าบังคับใส่ due
- ใช้ `<input type="date">` แปลงเป็นต้นวัน epoch ms

**พฤติกรรม** (`src/pages/NextActions.tsx`):
- งานที่ `deferUntil` ยังไม่ถึง → ซ่อนจาก Next Actions (แสดงในหน้า/section "Scheduled" ถ้าจะทำ หรือแค่ซ่อนก็พอในเฟสนี้)
- งานที่มี `dueDate` → แสดง badge วันที่ ถ้าเลย = สีเตือน (ระวัง: อย่าให้ dominate ทั้งหน้า)
- sort: due เร็วสุดขึ้นก่อน งานไม่มี due เรียงตามเดิม

### 4.2 Weekly Review — checklist นำทาง (Q6)

route ใหม่ `/review` + ลิงก์ใน Sidebar พร้อม nudge "รีวิวล่าสุด X วันก่อน"

checklist ทีละขั้น มี progress + ปุ่ม "เสร็จขั้นนี้":
1. **Clear Inbox** — ลิงก์ไป Inbox แสดงจำนวนที่เหลือ กระตุ้นจนเหลือ 0
2. **Review Next Actions** — ไล่ดูว่ายัง actionable อยู่ไหม
3. **Review Waiting For** — เช็กว่าต้องตามใครต่อไหม
4. **Review Projects** — ทุก active project ต้องมี next action ≥ 1 → **flag project ที่ stalled**
5. **Review Someday/Maybe** — เลื่อนขึ้นมาทำ หรือทิ้ง
6. **Glance ล่วงหน้า** — ดูงานที่ due/defer กำลังจะมาถึง

store: เพิ่ม `lastReviewAt?: number` เซ็ตเมื่อจบ review ครบ

### 4.3 [แนะนำ — branch ที่ยังค้าง] หน้า "วันนี้" / Engage

ยังไม่ได้ตกลงข้อนี้ แต่แนะนำทำต่อจากข้างบน เพราะเป็นครึ่งที่หายไปของ Engage:
- รวม: งาน due วันนี้/เลย + งานที่ defer มาถึงวันนี้ + กรองตาม context
- four-criteria ของ Allen: context (มีแล้ว), เวลาที่มี, พลังงาน, ลำดับความสำคัญ — เริ่มจาก context filter ก่อน ที่เหลือค่อยเติม

## 5. ลำดับการลงมือ (งบเวลาน้อย)

1. **Export/import JSON** — เล็ก ทำก่อนเพื่อกันข้อมูลหายระหว่างแก้ store (Q4)
2. **Dates ใน Clarify** — data model + UI + ให้ Next Actions เคารพ defer/แสดง due (Q5)
3. **Weekly Review checklist** — ผลตาม GTD สูงสุดต่อบรรทัดโค้ด (Q6)
4. **[แนะนำ] หน้า "วันนี้"/Engage** — ถ้ายังมีเวลาเหลือ

## 6. เกณฑ์ว่าเสร็จ

- Clarify ใส่ defer/due ได้แบบ optional, Next Actions ซ่อนงานที่ defer + โชว์ due badge
- `/review` เดินครบ 6 ขั้น flag project ที่ไม่มี next action ได้ และบันทึก `lastReviewAt`
- export/import JSON กลับมาได้ครบ
- `npm run build` และ `npm run lint` ผ่าน ไม่มี TS error

---

## Prompt สำหรับ Claude Code

> วางข้อความด้านล่างนี้ให้ Claude Code (รันในโฟลเดอร์โปรเจกต์)

```
Read NEXT-PHASE-PLAN.md in the repo root — it is the spec for this phase. Also read
src/types.ts, src/store/useGtdStore.ts, and the files under src/pages and
src/components to understand current conventions before writing code.

Implement the four items in section 5 "ลำดับการลงมือ", in that order, as separate
commits. Follow the existing code style (Zustand store patterns, Tailwind, functional
components). Do not add a backend — keep it local-first.

Key correctness requirements (from GTD principles in the spec):
1. `deferUntil` and `dueDate` are BOTH optional with NO default value. Never auto-fill a
   due date. In ClarifyDialog they appear only in the "Next Action" mode.
2. Store dates as start-of-day epoch ms.
3. Next Actions must HIDE tasks whose `deferUntil` is in the future, and show a due-date
   badge (with a warning style when overdue) — but the overdue styling must stay subtle,
   not dominate the whole list.
4. The Weekly Review at route `/review` is a step-by-step guided checklist with the 6
   steps in section 4.2, a progress indicator, and it must flag any active project that
   has zero incomplete next actions (a "stalled" project). Set `lastReviewAt` when the
   review is completed, and surface "last reviewed X days ago" in the Sidebar.
5. Add export-to-JSON and import-from-JSON for the whole store, so data can be backed up
   before/after these changes.

After each item: run `npm run lint` and `npm run build`, fix any TypeScript errors, and
only then move to the next. When all four are done, give me a short summary of what
changed per file and confirm the "เกณฑ์ว่าเสร็จ" (section 6) are met.

Item 4 (the "Today"/Engage view) is marked as recommended-but-not-yet-confirmed in the
spec — implement a minimal version (due-today/overdue + arrived-deferred + context
filter) and flag anything you were unsure about instead of guessing.
```
