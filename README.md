# eTurist Test — Deployment na Render

## Fajlovi
- `server.js` — Express server + Playwright automatizacija
- `public/index.html` — Test forma (replika eTurist)
- `package.json` — Zavisnosti
- `render.yaml` — Render konfiguracija

## Deployment na Render

1. Napravi novi GitHub repozitorijum
2. Dodaj sve fajlove
3. Na render.com → New → Web Service
4. Poveži GitHub repo
5. Build command: `npm install && npx playwright install chromium --with-deps`
6. Start command: `node server.js`
7. Dodaj environment variable: `BASE_URL` = tvoj Render URL (npr. https://eturist-test.onrender.com)

## Testiranje

POST na `/trigger`:
```json
{
  "first_name": "МАРКО",
  "last_name": "ПЕТРОВИЋ",
  "date_of_birth": "15.03.1985",
  "gender": "M",
  "passport_number": "006137099",
  "nationality": "Srpsko",
  "document_type": "passport"
}
```

## Make.com

U HTTP modulu, promeni URL iz stare skripte na novi Render URL + `/trigger`
