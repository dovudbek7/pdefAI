# Kitob — yozuvchilar uchun live kitob editori

Telegram'da yozgandek oddiy yoz, yon tomonda real kitob ko'rinishida (sahifama-sahifa)
chiqib tursin. Sahifa raqami, mundarija, chekkalar — avtomatik. Oxirida PDF eksport.

Yozuvchilar Canva / InDesign'da har sahifani qo'lda terib, raqam qo'yib qiynaladi.
Bu app shuni hal qiladi: muallif faqat matnga e'tibor beradi, tartib o'zi shakllanadi.

> Bu bosqich — **faqat frontend**. Ma'lumot brauzerda (`localStorage`) bir sessiyada
> saqlanadi. Django backend keyingi bosqichda.

## Imkoniyatlar

- **Ikki panel** — chapda TipTap editori, o'ngda jonli kitob preview (real vaqtda sahifalanadi)
- **Ko'rinish rejimi** — Split / Faqat matn / Faqat kitob (`Cmd/Ctrl + \` bilan almashtirish)
- **Aniq paginatsiya** — matn hech qachon kesilmaydi (render sahifaning o'zi offscreen o'lchanadi)
  - **So'zlab to'ldirish** — abzas joyga to'ladi, ortig'i keyingi sahifaga oqadi
  - **Butun abzas** — abzas to'liq keyingi sahifaga ko'chadi
- **Auto mundarija** — sarlavhalardan (H1/H2/H3) shakllanadi; bosilsa editor ham, preview ham
  o'sha joyga scroll qiladi; kitob oxirida mundarija sahifasi
- **Format** — A4 / A5 / B5 / maxsus (mm); juft/toq sahifa chekkasi (mirror margin)
- **Sahifa raqami** — qaysi sahifadan boshlash, joylashuv (past o'rta / past chekka / tepa chekka),
  arab yoki rim raqami
- **Tipografiya** — shrift, razmer (pt), abzas otступи, justify
- **Rasm** — URL yoki kompyuterdan fayl
- **Hisob** — so'z / sahifa soni, o'qish vaqti, maqsad progress
- **Saqlash** — `localStorage` sessiya + avtosaqlash
- **PDF eksport** — yashirin iframe orqali print: muqova + mundarija + raqamlash
- **Aesthetik** — editorial qog'oz uslubi (Fraunces + Spectral shriftlari)

## Stack

| Qism | Tanlov |
|------|--------|
| Build | Vite + React + TypeScript |
| Styling | Tailwind CSS |
| Editor | TipTap (ProseMirror) |
| Holat | Zustand + `localStorage` persist |
| Paginatsiya | O'lchovga asoslangan custom paginator |
| PDF | iframe + `window.print()` (`@page` CSS) |

## Ishga tushirish

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # produksiya build (dist/)
npm run preview    # build'ni ko'rish
```

## Tuzilish

```
src/
├─ App.tsx                    # layout: rail + editor + preview, view-mode
├─ store/bookStore.ts         # Zustand: book, format, margins, numbering, typography
├─ types.ts                   # Book, PageFormat, NumberSettings, Typography ...
├─ lib/
│  ├─ paginate.ts             # o'lchovga asoslangan paginator (yadro)
│  ├─ pageFormats.ts          # A4/A5/B5 mm o'lchamlari, mm↔px, rim raqam
│  └─ exportPdf.ts            # print-ready HTML + iframe print
└─ components/
   ├─ TopBar.tsx              # logo, sarlavha, view-mode toggle, eksport
   ├─ ChapterRail.tsx         # mundarija + progress
   ├─ Editor/                 # EditorPane, Toolbar
   ├─ Preview/                # BookPreview, Page, TocPage, PreviewControls, usePaginate
   ├─ ExportDialog.tsx        # eksport sozlamalari
   └─ ui/                     # Icon, Modal
```

## Paginatsiya qanday ishlaydi

`lib/paginate.ts` render sahifaning aynan nusxasini (header + body + footer, real padding)
ekrandan tashqarida quradi va body'ning **haqiqiy bo'sh balandligini** o'lchaydi. Bloklar
ketma-ket joylanadi; sig'masa yangi sahifa ochiladi. Uzun abzas so'z chegarasida bo'linadi
(`fill` rejimi) yoki to'liq ko'chadi (`paragraph` rejimi). Taxmin yo'q — shuning uchun matn
kesilmaydi.

## Yo'l xaritasi (keyin)

- Muqova shabllonlari, orphan/widow nazorati
- Django backend, hamkorlik + izoh, versiyalar
- EPUB / DOCX eksport, server-side print-ready PDF (Puppeteer)
