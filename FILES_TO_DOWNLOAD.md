# 📁 Files You Need to Download

Download ALL these files and folders, keeping the same structure:

```
agentcalc-pro/
├── .env.example          ← Rename to .env after adding your values
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── drizzle.config.json
│
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192x192.png
│       └── icon-512x512.png
│
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx              ← Main app (all calculators)
    │   ├── admin/
    │   │   └── page.tsx          ← Admin dashboard
    │   ├── help/
    │   │   └── page.tsx
    │   ├── privacy/
    │   │   └── page.tsx
    │   ├── terms/
    │   │   └── page.tsx
    │   └── api/
    │       ├── health/route.ts
    │       ├── calculate/route.ts
    │       ├── history/route.ts
    │       ├── upgrade/route.ts
    │       ├── auth/
    │       │   ├── login/route.ts
    │       │   ├── logout/route.ts
    │       │   ├── me/route.ts
    │       │   └── register/route.ts
    │       ├── admin/
    │       │   ├── audit/route.ts
    │       │   ├── login/route.ts
    │       │   ├── password/route.ts
    │       │   ├── settings/route.ts
    │       │   ├── stats/route.ts
    │       │   ├── verify/route.ts
    │       │   ├── payments/
    │       │   │   ├── route.ts
    │       │   │   └── confirm/route.ts
    │       │   └── users/
    │       │       ├── route.ts
    │       │       └── update/route.ts
    │       └── payment/
    │           ├── create/route.ts
    │           ├── settings/route.ts
    │           └── status/route.ts
    ├── db/
    │   ├── index.ts
    │   └── schema.ts
    └── lib/
        ├── auth.ts
        ├── adminAuth.ts
        └── security.ts
```

## ⚠️ DO NOT UPLOAD:
- `.env` (contains secrets!)
- `node_modules/` folder
- `.next/` folder

## ✅ DO UPLOAD:
- `.env.example` (safe template)
- Everything else listed above
