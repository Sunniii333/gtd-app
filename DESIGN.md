# GTD — Design (ยึดตามหนังสือ *Getting Things Done*, David Allen)

เอกสารนี้แทน `NEXT-PHASE-PLAN.md` เดิม หลักตัดสินทุกข้อคือ **"หนังสือว่าอย่างไร"**
อะไรที่หนังสือไม่มีหรือขัดกับหนังสือ เอาออก

## เป้าหมายหลัก

1. **ไม่มีงานตกหล่น** — ทุกอย่างที่ค้างในหัวต้องมีที่อยู่ในระบบ และระบบต้องชี้ให้เห็นเองเมื่อมีอะไรหลุด
2. **ทุก project ต้องมีการเคลื่อนไหวเสมอ** — ทำ next action ของ project เสร็จเมื่อไร แอป *ถาม* ทันทีว่า "ขั้นต่อไปคืออะไร"

## ห้าขั้นของ GTD → หน้าจอในแอป

| ขั้น | ในหนังสือ | ในแอป |
|---|---|---|
| Capture | in-basket, จับทุกอย่างออกจากหัว | ช่อง Capture อยู่ทุกหน้า (ไม่ต้องเข้า Inbox ก่อน) |
| Clarify | แผนผังคำถาม: *What is it? → Is it actionable? → …* | Clarify เป็น **คำถามทีละข้อ** ตามแผนผัง ไม่ใช่ฟอร์ม 4 ปุ่ม |
| Organize | Projects, Next Actions ตาม context, Calendar, Waiting For, Someday/Maybe, Tickler, Reference | ครบทุกลิสต์ |
| Reflect | Weekly Review: Get Clear / Get Current / Get Creative | Weekly Review 11 ขั้นตามหนังสือ |
| Engage | ดู Calendar ก่อน แล้วเลือกจาก Next Actions ตาม context | Calendar + Next Actions จัดกลุ่มตาม context |

## Clarify — แผนผังจากหนังสือ

```
What is it?  →  Is it actionable?
  ├─ No  → ทิ้ง (Trash) / Someday-Maybe (เลือกวันเตือนใน Tickler ได้) / Reference
  └─ Yes → ต้องทำมากกว่า 1 ขั้นไหม?
            └─ ใช่ → Project: เขียน outcome ("เสร็จแล้วหน้าตาเป็นยังไง") + next action แรก (บังคับ)
           Next action คืออะไร? (ขึ้นต้นด้วยกริยา)
            ├─ < 2 นาที → ทำเลย (Done)
            ├─ ให้คนอื่นทำ → Waiting For (บันทึกว่ารอใคร ตั้งแต่เมื่อไร)
            └─ เลื่อนไปทำเอง → ต้องทำวันใดวันหนึ่งเท่านั้นไหม?
                               ├─ ใช่ → Calendar (hard landscape)
                               └─ ไม่ → Next Actions @context
```

## กลไก "ไม่ให้ project ค้าง" (หัวใจของ redesign)

- **Project follow-up prompt** — ติ๊กเสร็จงานใดก็ตามที่ผูกกับ active project (Next Action, Calendar
  หรือ Waiting For) แอปเปิดคำถาม *"ขั้นต่อไปของ [project] คืออะไร?"* ทันที ตอบได้ 5 ทาง:
  เพิ่ม next action · รอคนอื่น (Waiting For) · ลงปฏิทิน · project เสร็จแล้ว · พักไว้ Someday/Maybe
  ถ้า project ยังมีงานค้างอยู่ จะแสดงให้เห็นและกด "ไปต่อด้วยงานที่มีอยู่" ได้
- ลบงานสุดท้ายของ project → ถามแบบเดียวกัน
- สร้าง project ใหม่ → ต้องใส่ next action แรกตั้งแต่ตอนสร้าง
- **Stalled project** = active project ที่ไม่มีงานเปิดอยู่เลย (ไม่มีทั้ง next action, calendar, waiting for)
  ตามหนังสือ waiting-for นับเป็นการเคลื่อนไหว — แสดงเตือนที่ Sidebar, หน้า Projects และ Weekly Review
  พร้อมช่องเพิ่ม next action ในที่เดียวกัน
- ปิดแอปกลางคำถาม → ไม่หาย project นั้นกลายเป็น stalled และถูกเตือน

## กลไก "ไม่ให้งานตกหล่น" อื่น ๆ

- **Tickler** (43 folders ในหนังสือ): Someday item ที่ตั้งวันเตือนไว้ พอถึงวัน **เด้งกลับเข้า Inbox**
  ให้ clarify ใหม่ (ตามหนังสือ: ดึงแฟ้มของวันนั้นเทลง in-basket)
- **Calendar ที่ผ่านไปแล้วแต่ยังไม่เสร็จ** ไม่เงียบหาย — ขึ้นหัวหน้า Calendar ให้ตัดสินใจ
  (ทำแล้ว / เลื่อนวัน / ย้ายไป Next Actions) และอยู่ในขั้น "Review previous calendar" ของ Weekly Review
- Waiting For แสดง "รอมา N วัน" เพื่อรู้ว่าต้องตาม
- Sidebar แสดงจำนวน Inbox ที่ยังไม่ clarify, stalled projects และวันที่รีวิวล่าสุด

## สิ่งที่เอาออก (ไม่มีในหนังสือ / ขัดหนังสือ)

| เอาออก | เหตุผลจากหนังสือ | แทนด้วย |
|---|---|---|
| หน้า **Today** | หนังสือไม่มี "today list" — Allen เตือนว่า daily to-do list ทำให้ปฏิทินไม่น่าเชื่อถือ | **Calendar** (เฉพาะสิ่งที่ต้องเกิดวันนั้นจริง) |
| **Due date** บน next action | deadline จริงไปอยู่บน calendar (hard landscape); next action ไม่มีวันที่ | ย้ายไป Calendar อัตโนมัติ |
| **Defer until** บน next action | หนังสือใช้ tickler ที่ส่งกลับ in-basket ไม่ใช่ซ่อนงานใน list | Tickler บน Someday/Maybe |
| ป้าย overdue สีแดง | ขัดหลัก trusted system | — |
| หลาย context ต่อหนึ่งงาน | หนังสือแยก list ตาม context หนึ่ง action อยู่ list เดียว | context เดียว + รายการ context ตามหนังสือ |
| ปุ่ม "Move to Next" ข้าม clarify | งานที่กลับมาต้องผ่าน clarify ใหม่ | "Activate" = ส่งกลับ Inbox |
| ปุ่ม "Mark done" ใน clarify | — | กฎ 2 นาที "ทำเลย" |

## สิ่งที่เพิ่ม (มีในหนังสือแต่แอปเดิมขาด)

Reference · Trash เป็นทางเลือกตรงใน Clarify · กฎ 2 นาที · Project outcome · Tickler ·
Calendar · Weekly Review ครบ 3 ช่วง 11 ขั้น (รวม "Empty your head" พร้อม trigger list)

## สิ่งที่คงไว้แม้ไม่อยู่ในหนังสือ

- **Export/Import JSON** — เป็นโครงสร้างพื้นฐานให้ระบบ "น่าไว้ใจ" (ข้อมูล sync ผ่าน Firestore แล้ว แต่ backup ของตัวเองยังจำเป็น; Import = แทนที่ข้อมูลทุกเครื่อง)
- ข้อมูลเดิม migrate อัตโนมัติ (store version 2) และ import backup เก่าได้

## โมเดลข้อมูล

```ts
type ItemStatus = 'inbox' | 'next' | 'calendar' | 'waiting' | 'someday' | 'reference' | 'done'
Item    { id, title, notes?, status, context?, projectId?, date?, waitingOn?, waitingSince?,
          ticklerDate?, createdAt, updatedAt, completedAt? }
Project { id, name, outcome?, status: 'active' | 'someday' | 'done', createdAt, completedAt? }
```

- `date` ใช้เฉพาะ `calendar` · `ticklerDate` ใช้เฉพาะ `someday` · วันที่ทุกตัวเป็น epoch ms ต้นวันตามเวลาท้องถิ่น
- logic ล้วนอยู่ใน `src/domain/gtd.ts` (มี test) — store กับ UI เรียกใช้ ไม่ทำ logic ซ้ำ

## Paper UI (หน้าตา)

ตกลงกันเมื่อ 27/9/2026 — แอปหน้าตาเหมือน "แฟ้มเอกสารการบิน" (Apollo checklist) ผสมใบเสร็จ/ตั๋ว
redesign นี้เปลี่ยนแค่หน้าตาและโครงหน้า **ไม่แตะ logic** (`src/domain`, `src/store` เหมือนเดิม test ผ่านครบ)

| เรื่อง | ตัดสินใจ |
|---|---|
| แกนสไตล์ | Apollo checklist: งานมีเลขลำดับ `01 02 03` (CSS counter บน `.step`), หัวข้อกลุ่มเป็นกล่องคั่นเส้น, หัว/ท้ายหน้าเป็นแถบ metadata แบบใบเสร็จ (`ACT-03 · DATE 27/09/26`, `END OF SHEET`) |
| ฟอนต์ | IBM Plex Mono (ละติน/ตัวเลข) → ตัวไทย fallback ไป IBM Plex Sans Thai · Mali = "ลายมือปากกาแดง" ใช้เฉพาะคำเตือนและคำถาม "What’s the next action?" · self-host ด้วย `@fontsource` (ใช้ offline ได้) |
| สี | กระดาษครีม + หมึกดำ + แดงปากกาเฉพาะสิ่งที่ต้องตัดสินใจ (Inbox ค้าง, stalled, ปฏิทินเลยวัน, review เลยกำหนด) · dark mode = กระดาษคาร์บอน · ไม่มีมุมโค้ง ไม่มี italic |
| มือถือ | แท็บกระดาษด้านล่าง `INBOX · CAL · NEXT · PROJ · MORE` พร้อมตัวเลข; MORE = Waiting For, Someday/Maybe, Reference, Weekly Review, Backup |
| Desktop | Sidebar = แท็บดัชนีของ binder |
| Capture | ปุ่ม **＋ CAPTURE** เด่นชัดทุกหน้า (มือถือ: ลอยเหนือแท็บ ระยะนิ้วโป้ง · desktop: บนสุดของ sidebar) → popup ช่องใหญ่ focus ทันที, Enter บันทึกแล้วพิมพ์ต่อได้เลย · ช่อง capture แบบ inline เหลือเฉพาะในขั้น mind sweep ของ Weekly Review |
