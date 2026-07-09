# AgriSense-AI Backend

FastAPI backend for AgriSense-AI smart farming assistant.

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create PostgreSQL database:

```sql
CREATE DATABASE agrisense_db;
```

Copy `.env.example` to `.env` and update your PostgreSQL password.

Run server:

```bash
uvicorn app.main:app --reload
```

Open API docs:

```text
http://127.0.0.1:8000/docs
```
