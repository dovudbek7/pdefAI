# Kitob — Backend Implementation Steps

Har bir step = 1 commit. Jami 30 commit.

---

## Phase 0 — Documentation

- [x] **Step 1** — `steps.md` yozish (shu fayl)
  - Commit: `docs: add full implementation steps plan to steps.md`

---

## Phase 1 — Django Project Skeleton

- [ ] **Step 2** — `backend/` folder structure (bo'sh `__init__.py` fayllar, papkalar)
  - Commit: `chore: scaffold backend folder structure`

- [ ] **Step 3** — `backend/requirements.txt`
  - `django>=4.2,<5.0`, `djangorestframework>=3.15`, `djangorestframework-simplejwt>=5.3`, `django-cors-headers>=4.3`, `python-decouple>=3.8`
  - Commit: `chore: add requirements.txt`

- [ ] **Step 4** — `backend/.env.example` + `backend/.gitignore`
  - Commit: `chore: add .env.example and .gitignore`

- [ ] **Step 5** — `backend/manage.py`
  - Commit: `chore: add manage.py`

- [ ] **Step 6** — `backend/kitob/settings/base.py`
  - INSTALLED_APPS, MIDDLEWARE (corsheaders birinchi), REST_FRAMEWORK (JWT default), SIMPLE_JWT (60min access / 7day refresh), AUTHENTICATION_BACKENDS (EmailBackend), timezone Asia/Tashkent
  - Commit: `feat: add base Django settings (REST + JWT + CORS)`

- [ ] **Step 7** — `backend/kitob/settings/dev.py`
  - DEBUG=True, CORS_ALLOW_ALL_ORIGINS=True, SQLite local
  - Commit: `feat: add dev settings`

- [ ] **Step 8** — `backend/kitob/settings/prod.py`
  - PythonAnywhere ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, STATIC_ROOT
  - Commit: `feat: add prod settings for PythonAnywhere`

- [ ] **Step 9** — `backend/kitob/wsgi.py`
  - PythonAnywhere snippet comment ichida
  - Commit: `chore: add wsgi.py with PythonAnywhere deploy comment`

- [ ] **Step 10** — `backend/kitob/urls.py`
  - `/api/auth/` → accounts.urls
  - `/api/projects/` → projects.urls
  - `/api/auth/refresh/` → TokenRefreshView
  - Commit: `feat: add root urlconf`

---

## Phase 2 — Accounts App

- [ ] **Step 11** — `backend/apps/accounts/apps.py`
  - Commit: `feat(accounts): add AppConfig`

- [ ] **Step 12** — `backend/apps/accounts/backends.py`
  - `EmailBackend`: `authenticate(email=..., password=...)` → User query by email
  - Commit: `feat(accounts): add email-based auth backend`

- [ ] **Step 13** — `backend/apps/accounts/serializers.py`
  - `RegisterSerializer`: name, email, password validate → User.objects.create_user(username=email, first_name=name)
  - `UserSerializer`: `{id, name(=first_name), email(=username)}`
  - Commit: `feat(accounts): add Register + User serializers`

- [ ] **Step 14** — `backend/apps/accounts/views.py`
  - `RegisterView`: POST AllowAny → yaratadi + JWT qaytaradi
  - `LoginView`: POST AllowAny → email/parol tekshiradi + JWT qaytaradi
  - `MeView`: GET IsAuthenticated → `{id, name, email}`
  - Commit: `feat(accounts): add RegisterView, LoginView, MeView`

- [ ] **Step 15** — `backend/apps/accounts/urls.py`
  - `/register/`, `/login/`, `/me/`
  - Commit: `feat(accounts): add URL patterns`

---

## Phase 3 — Projects App

- [ ] **Step 16** — `backend/apps/projects/apps.py`
  - Commit: `feat(projects): add AppConfig`

- [ ] **Step 17** — `backend/apps/projects/models.py`
  - `Project`: UUID pk, owner FK(User), name, meta/format/margins/numbering/typography (JSONField), content (TextField), created_at/updated_at (auto)
  - Commit: `feat(projects): add Project model`

- [ ] **Step 18** — `makemigrations` → migration fayllar commit
  - Commit: `feat: add initial database migrations`

- [ ] **Step 19** — `backend/apps/projects/serializers.py`
  - `ProjectSerializer`: camelCase fields, `createdAt`/`updatedAt` ms timestamp (SerializerMethodField)
  - Commit: `feat(projects): add ProjectSerializer with camelCase + ms timestamps`

- [ ] **Step 20** — `backend/apps/projects/views.py`
  - `ProjectViewSet(ModelViewSet)`: IsAuthenticated, get_queryset → owner=request.user, perform_create → owner=request.user
  - Commit: `feat(projects): add ProjectViewSet with owner filter`

- [ ] **Step 21** — `backend/apps/projects/urls.py`
  - `DefaultRouter` → `/api/projects/`
  - Commit: `feat(projects): add URL router`

---

## Phase 4 — Admin + README

- [ ] **Step 22** — `backend/apps/accounts/admin.py`
  - User ro'yxatda email, first_name, date_joined ko'rsatish
  - Commit: `feat(accounts): register in admin`

- [ ] **Step 23** — `backend/apps/projects/admin.py`
  - Project ro'yxatda name, owner, updated_at ko'rsatish
  - Commit: `feat(projects): register in admin`

- [ ] **Step 24** — `backend/README.md`
  - Quick-start, curl test misollar
  - Commit: `docs: add backend README with quick-start and curl examples`

---

## Phase 5 — Frontend Integration

- [ ] **Step 25** — `src/lib/api.ts`
  - `apiFetch()`: VITE_API_URL, Bearer token, 401 → refresh → retry, refresh fail → logout
  - Commit: `feat(frontend): add api.ts fetch wrapper with JWT refresh`

- [ ] **Step 26** — `src/store/authStore.ts` refactor
  - `users[]` va plaintext password olib tashlanadi
  - `register/login` → async API call
  - `logout` → localStorage tokenlarni tozalaydi
  - `init()` → `/api/auth/me/` bilan session tiklash
  - Commit: `feat(frontend): refactor authStore to use Django API`

- [ ] **Step 27** — `src/store/bookStore.ts` refactor
  - `zustand/persist` olib tashlanadi
  - `loadProjects/createProject/deleteProject/renameProject` → API calls
  - barcha setterlar → 1500ms debounce → PATCH
  - Commit: `feat(frontend): refactor bookStore to use Django API with debounce save`

- [ ] **Step 28** — `.env.local.example`
  - `VITE_API_URL=http://localhost:8000`
  - Commit: `chore(frontend): add .env.local.example`

- [ ] **Step 29** — `Home.tsx` + `Editor.tsx` loading/error state
  - Spinner yuklanayotganda, xato xabar ko'rsatish
  - Commit: `feat(frontend): add loading and error states for async API calls`

- [ ] **Step 30** — `App.tsx` session restore
  - `authStore.init()` app ochilganda token bo'lsa `/me` dan user olib keladi
  - Commit: `feat(frontend): restore auth session on app load via /me endpoint`

---

## Verification

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver

# Test
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","password":"pass123"}'
# → {access, refresh, user}

# Frontend
cd ../
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
# Register → Login → Create project → Edit → Reload → DB dan keladi
```
