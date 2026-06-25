# Backend Integration Plan — Kitob (Django REST + PythonAnywhere)

## Holat tahlili

Frontend hozir `zustand + localStorage` bilan ishlaydi (demo rejim).
Maqsad: Django REST backend yozib, frontendni real API ga ulash.
Deployment: PythonAnywhere (free tier → SQLite, WSGI).

---

## Arxitektura

```
Frontend (Vite/React) ←──HTTP/JSON──→ Django REST API ←──→ SQLite DB
    └─ authStore.ts  →  /api/auth/*
    └─ bookStore.ts  →  /api/projects/*
```

- Auth: JWT (djangorestframework-simplejwt)
- Token saqlash: `localStorage` (`kitob-access`, `kitob-refresh`)
- CORS: `django-cors-headers`

---

## API Endpointlar

### Auth `/api/auth/`

| Method | URL | Body | Response |
|--------|-----|------|----------|
| POST | `/register/` | `{name, email, password}` | `{access, refresh, user}` |
| POST | `/login/` | `{email, password}` | `{access, refresh, user}` |
| POST | `/refresh/` | `{refresh}` | `{access}` |
| GET  | `/me/` | — | `{id, name, email}` |

### Projects `/api/projects/`

| Method | URL | Body | Response |
|--------|-----|------|----------|
| GET    | `/` | — | `[Project]` |
| POST   | `/` | `{name, meta, format, ...}` | `Project` |
| GET    | `/{id}/` | — | `Project` |
| PATCH  | `/{id}/` | partial | `Project` |
| DELETE | `/{id}/` | — | 204 |

**Project JSON:**
```json
{
  "id": "uuid",
  "name": "string",
  "meta": { "title": "", "author": "", "year": 2024 },
  "format": { "id": "a5", "label": "A5", "widthMm": 148, "heightMm": 210 },
  "margins": { "top": 18, "bottom": 18, "inner": 20, "outer": 16 },
  "numbering": { "enabled": true, "startAtPage": 1, "startFrom": 1, "position": "bottom-center", "style": "arabic" },
  "typography": { "bodyFont": "Spectral", "bodySizePt": 11, "lineHeight": 1.5, "paragraphIndent": true, "justify": true, "pageBreak": "fill" },
  "content": "<h1>...</h1>",
  "createdAt": 1700000000000,
  "updatedAt": 1700000000000
}
```

---

## PHASE 1 — Django Loyiha Strukturasi

**Papka:**
```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── kitob/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py          # umumiy
│   │   ├── dev.py           # local
│   │   └── prod.py          # PythonAnywhere
│   ├── urls.py
│   └── wsgi.py
└── apps/
    ├── __init__.py
    ├── accounts/            # auth
    │   ├── __init__.py
    │   ├── apps.py
    │   ├── backends.py      # email-based login
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    └── projects/            # book CRUD
        ├── __init__.py
        ├── apps.py
        ├── models.py
        ├── serializers.py
        ├── views.py
        └── urls.py
```

**requirements.txt:**
```
django>=4.2,<5.0
djangorestframework>=3.15
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
python-decouple>=3.8
```

**Vazifalar:**
- [ ] Barcha papka/fayllar yaratish
- [ ] `requirements.txt` yozish
- [ ] `.env.example` yozish

---

## PHASE 2 — Auth API

**Django User:** `username=email`, `first_name=name`. Standart model yetarli.

**`apps/accounts/backends.py`** — email bilan authenticate qiluvchi custom backend.

**`apps/accounts/serializers.py`:**
- `RegisterSerializer` — name, email, password validate + User yaratish
- `UserSerializer` — `{id, name, email}` chiqarish

**`apps/accounts/views.py`:**
- `RegisterView` — User yaratib JWT qaytaradi
- `LoginView` — email/parol tekshirib JWT qaytaradi
- `MeView` — `IsAuthenticated`, hozirgi userni qaytaradi

**JWT (base.py):**
```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}
```

**Vazifalar:**
- [ ] `EmailBackend` yozish
- [ ] `RegisterSerializer`, `UserSerializer`
- [ ] `RegisterView`, `LoginView`, `MeView`
- [ ] `accounts/urls.py` ulash

---

## PHASE 3 — Projects CRUD

**Model (`apps/projects/models.py`):**
```python
class Project(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name       = models.CharField(max_length=255)
    meta       = models.JSONField(default=dict)
    format     = models.JSONField(default=dict)
    margins    = models.JSONField(default=dict)
    numbering  = models.JSONField(default=dict)
    typography = models.JSONField(default=dict)
    content    = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
```

**Serializer muhim nuqta:** `created_at/updated_at` → ms timestamp sifatida (`createdAt/updatedAt`) chiqarish — frontend shu formatda kutadi:
```python
def get_createdAt(self, obj):
    return int(obj.created_at.timestamp() * 1000)
```

**ViewSet:**
- `ModelViewSet` + `IsAuthenticated`
- `get_queryset` → faqat `owner=request.user`
- `perform_create` → `owner=request.user`
- `partial_update` (PATCH) — faqat yuborilgan fieldlarni yangilash

**Vazifalar:**
- [ ] `Project` model + migration
- [ ] `ProjectSerializer` (camelCase output, ms timestamps)
- [ ] `ProjectViewSet` (owner filter, partial update)
- [ ] `projects/urls.py` ulash

---

## PHASE 4 — Settings (PythonAnywhere)

**`kitob/settings/base.py`:**
```python
from decouple import config
from datetime import timedelta

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'apps.accounts',
    'apps.projects',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # ← birinchi bo'lishi shart
    'django.middleware.security.SecurityMiddleware',
    ...
]

AUTHENTICATION_BACKENDS = ['apps.accounts.backends.EmailBackend']

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

LANGUAGE_CODE = 'uz'
TIME_ZONE = 'Asia/Tashkent'
```

**`kitob/settings/dev.py`:**
```python
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
CORS_ALLOW_ALL_ORIGINS = True
```

**`kitob/settings/prod.py` (PythonAnywhere):**
```python
from .base import *

ALLOWED_HOSTS = [
    'yourusername.pythonanywhere.com',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/home/yourusername/kitob/backend/db.sqlite3',
    }
}

CORS_ALLOWED_ORIGINS = [
    'https://yourusername.pythonanywhere.com',
]

STATIC_URL = '/static/'
STATIC_ROOT = '/home/yourusername/kitob/backend/staticfiles/'
```

**`.env.example`:**
```
SECRET_KEY=change-me-to-50-random-chars
DEBUG=True
DJANGO_SETTINGS_MODULE=kitob.settings.dev
```

**PythonAnywhere WSGI (`/var/www/yourusername_pythonanywhere_com_wsgi.py`):**
```python
import os, sys
path = '/home/yourusername/kitob/backend'
if path not in sys.path:
    sys.path.insert(0, path)
os.environ['DJANGO_SETTINGS_MODULE'] = 'kitob.settings.prod'
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**Vazifalar:**
- [ ] `base.py`, `dev.py`, `prod.py` yozish
- [ ] `.env.example` yozish
- [ ] `wsgi.py` ichiga PythonAnywhere snippet comment sifatida
- [ ] `yourusername` ni real username bilan almashtirish (deploy paytida)

---

## PHASE 5 — Frontend Integration

**Yangi fayl `src/lib/api.ts`:**
- Base URL: `import.meta.env.VITE_API_URL || 'http://localhost:8000'`
- Har requestda: `Authorization: Bearer <kitob-access>`
- 401 kelsa: `kitob-refresh` bilan yangi token olish, qayta urinish
- Refresh ham fail bo'lsa: logout

**`src/store/authStore.ts` refactor:**
```typescript
// Olib tashlanadi: users[], StoredUser, plaintext password logic
// Qo'shiladi: async login/register → API call
// Token: localStorage da kitob-access, kitob-refresh
// currentUser: API dan keladi (/api/auth/me/)
```

**`src/store/bookStore.ts` refactor:**
```typescript
// Olib tashlanadi: zustand persist (localStorage)
// Qo'shiladi:
//   loadProjects()   → GET /api/projects/
//   createProject()  → POST /api/projects/
//   deleteProject()  → DELETE /api/projects/{id}/
//   renameProject()  → PATCH /api/projects/{id}/
// setContent/setMeta/... → debounce 1500ms + PATCH /api/projects/{id}/
```

**`.env.local` (frontend root):**
```
VITE_API_URL=http://localhost:8000
```

**Vazifalar:**
- [ ] `src/lib/api.ts` yozish (fetch wrapper + refresh interceptor)
- [ ] `authStore.ts` async API ga o'tkazish
- [ ] `bookStore.ts` async API ga o'tkazish + debounce save
- [ ] Loading/error state qo'shish (UI da spinner)
- [ ] `.env.local.example` yozish

---

## PHASE 6 — PythonAnywhere Deploy

**Qadamlar (bir marta):**

```bash
# 1. PythonAnywhere bash console
git clone <repo-url> ~/kitob
# yoki Files tab orqali yuklash

# 2. virtualenv
cd ~/kitob/backend
python3.10 -m venv venv
source venv/bin/activate

# 3. paketlar
pip install -r requirements.txt

# 4. .env fayl
cp .env.example .env
nano .env   # SECRET_KEY, DEBUG=False, DJANGO_SETTINGS_MODULE=kitob.settings.prod

# 5. DB + static
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# 6. Web tab sozlamalari:
#    Source code: /home/yourusername/kitob/backend
#    Virtualenv:  /home/yourusername/kitob/backend/venv
#    WSGI file:   ko'chirish (yuqoridagi snippet)
#    Static:      /static/ → /home/yourusername/kitob/backend/staticfiles/
```

**Vazifalar:**
- [ ] PythonAnywhere da repo clone qilish
- [ ] virtualenv + requirements install
- [ ] `.env` to'ldirish
- [ ] migrate + collectstatic
- [ ] WSGI fayl to'g'irlash
- [ ] Web app reload → test

---

## Implementatsiya tartibi

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
 setup     auth     CRUD    settings  frontend   deploy
```

**Keyingi qadam:** "Phase 1 boshlang" de — backend kod yozishni boshlayman.
