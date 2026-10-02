# ฟอนต์ PT Link

Anuphan โดย Cadson Demak ใช้ไทยและละตินในตระกูลเดียว ใบอนุญาต [SIL Open Font License 1.1](OFL.txt)

| ไฟล์ | น้ำหนัก | ขนาด |
|---|---|---|
| anuphan-400.woff2 | 400 | 14,716 bytes |
| anuphan-600.woff2 | 600 | 15,720 bytes |

รวม 30,436 bytes เป็น static WOFF2 ที่สร้างจากไฟล์ variable ต้นทางโดยเลือกน้ำหนัก 400/600 และ subset ไทย ละตินพื้นฐาน ตัวเลข และเครื่องหมายที่ใช้ใน UI เก็บ shaping ของภาษาไทยไว้ ตัวเลข 0–9 มี advance เท่ากัน (600 font units) ทั้งสองน้ำหนัก

ต้นทางที่ใช้ ดาวน์โหลด 2 ตุลาคม 2026:

- [Anuphan ใน Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/anuphan)
- [ไฟล์ต้นทาง Anuphan[wght].ttf](https://github.com/google/fonts/blob/main/ofl/anuphan/Anuphan%5Bwght%5D.ttf)
- [ข้อมูลตระกูลและไลเซนส์](https://github.com/google/fonts/blob/main/ofl/anuphan/METADATA.pb)
- [ไลเซนส์ต้นทาง](https://github.com/google/fonts/blob/main/ofl/anuphan/OFL.txt)

`index.html` อ้างไฟล์ด้วย relative URL และ `font-display: swap` ไม่โหลดจาก CDN และใช้ system font สำรองเมื่อไม่มีไฟล์ ก่อน publish ทีมต้องเพิ่มไฟล์ฟอนต์ทั้งสองและ OFL.txt เข้า output เว็บไซต์และรายการไฟล์ offline ตามบรีฟ ไม่ฝังฟอนต์ใน firmware
