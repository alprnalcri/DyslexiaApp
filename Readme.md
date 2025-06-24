# Dyslexia Readability Analyzer

Bu proje, disleksi dostu metin okunabilirlik tahmin uygulamasıdır. FastAPI tabanlı backend ve React Native frontend içerir.  
**Not:** Büyük model dosyaları (`backend/models/`) Git deposuna dahil edilmez.

---

## 📂 Çıkartılan Dosyalar

| Klasör/Dosya | Durum |
| --- | --- |
| `backend/models/` | **Git'e yüklenmez (.gitignore'da dışlandı)** |
| `.env` dosyaları | **Yüklenmez, local ortamda oluşturulmalı** |
| `node_modules/` | **Yüklenmez, localde `npm install` ile kurulmalı** |
| Sanal ortam klasörleri (`venv/`, `env/`) | **Yüklenmez, localde oluşturulmalı** |

---

## ✅ Gereksinimler

- Python 3.10+
- Node.js & npm
- pip veya conda

---

## ⚙️ Kurulum

### Backend için:

```bash
# Sanal ortam oluştur
python -m venv venv
# Ortamı aktifleştir (Windows)
venv\Scripts\activate

# Gereken paketleri kur
pip install -r backend/requirements.txt

# Çalıştır
uvicorn backend.main:app --reload

Frontend için:


# Frontend klasörüne geç
cd frontend

# Gerekli paketleri yükle
npm install

# Çalıştır
npm run start
---------------------------------------------------------------------------------------------------------------------------

---

## 🇬🇧 **README.md**

```markdown
# Dyslexia Readability Analyzer

This project is a dyslexia-friendly text readability prediction application.  
It includes a FastAPI backend and a React Native frontend.  
**Note:** Large model files (`backend/models/`) are excluded from the Git repository.

---

## 📂 Excluded Files

| Folder/File | Status |
| --- | --- |
| `backend/models/` | **Not uploaded to GitHub (ignored via .gitignore)** |
| `.env` files | **Not uploaded, must be created locally** |
| `node_modules/` | **Not uploaded, must be installed locally with `npm install`** |
| Virtual environment folders (`venv/`, `env/`) | **Not uploaded, must be created locally** |

---

## ✅ Requirements

- Python 3.10+
- Node.js & npm
- pip or conda

---

## ⚙️ Installation

### For backend:

```bash
# Create virtual environment
python -m venv venv
# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run
uvicorn backend.main:app --reload



For frontend:
# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Run
npm run start
