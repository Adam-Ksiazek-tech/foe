# FOE

Aplikacja Next.js (App Router, TypeScript, AntD, Tailwind)

Całość działa w Dockerze — **nie musisz mieć zainstalowanego Node.js ani
npm na komputerze**. Wszystkie zależności instalują się wewnątrz kontenera.

---

## 1. Pierwsze uruchomienie (od zera, tylko Docker)

### Krok 1 — skopiuj plik ze zmiennymi środowiskowymi

```bash
cp .env.example .env
```

Otwórz `.env` i uzupełnij:
- `DATABASE_URL` — connection string do Twojej hostowanej bazy Postgres
- `APP_PORT` — port na Twoim komputerze, pod którym appka będzie dostępna
  (domyślnie `3418` — zmień, jeśli akurat jest zajęty przez inny projekt)

### Krok 2 — uruchom kontener

```bash
docker compose up
```

Za pierwszym razem kontener:
1. Pobierze obraz `node:22-alpine` (jeśli jeszcze go nie masz)
2. Zainstaluje wszystkie zależności (`npm install`) **wewnątrz kontenera**
3. Uruchomi serwer deweloperski Next.js z hot-reloadem

Poczekaj, aż w logach zobaczysz coś w stylu `Ready in ...ms` — wtedy appka
działa. Zależnie od Twojego łącza, pierwszy start (instalacja zależności)
może potrwać minutę-dwie. Kolejne starty są dużo szybsze.

### Krok 3 — otwórz w przeglądarce

```
http://localhost:3418
```
(albo inny port, jeśli zmieniłeś `APP_PORT` w `.env`)

### Zatrzymanie

```bash
docker compose down
```

Zainstalowane zależności (`node_modules`) zostają w wolumenie Dockera —
nie znikają po `docker compose down`, więc następnym razem nie trzeba ich
instalować od nowa (chyba że zmienisz `package.json`).

---

## 2. Kolejne uruchomienia

Skoro `.env` już istnieje, a zależności są zainstalowane w wolumenie:

```bash
docker compose up
```

To wszystko. Kod edytujesz normalnie w swoim edytorze na hoście (folder
jest zamontowany do kontenera) — zmiany w plikach `.tsx`/`.ts`/`.css`
odświeżają się automatycznie (hot reload), bez restartu kontenera.

Jeśli dodasz/zmienisz zależność w `package.json` (np. nową bibliotekę),
kontener doinstaluje ją automatycznie przy kolejnym `docker compose up`
(polecenie startowe zawsze robi `npm install` przed odpaleniem serwera).

### Praca w tle

```bash
docker compose up -d      # uruchom w tle
docker compose logs -f    # podejrzyj logi
docker compose down       # zatrzymaj
```

### Podgląd stanu / wejście do kontenera

```bash
docker compose exec foe sh
```

---

## 3. Build produkcyjny (opcjonalnie, do wdrożenia)

Powyższy `docker-compose.yml` to **tryb deweloperski** (hot reload, obraz
bazowy `node:22-alpine` bez builda). Do wdrożenia produkcyjnego jest osobny,
zoptymalizowany multi-stage `Dockerfile` (obraz `standalone`, mniejszy,
bez dev-dependencies):

```bash
docker compose -f docker-compose.prod.yml up --build
```

Appka wystartuje na tym samym `APP_PORT` z `.env`, ale w trybie produkcyjnym
(`next start` zamiast `next dev`, bez hot reloadu, z buildem zoptymalizowanym
pod wydajność).

---

## Struktura projektu

```
foe/
├── docker-compose.yml       # tryb dev (hot reload, wszystko w kontenerze)
├── docker-compose.prod.yml  # tryb produkcyjny (build z Dockerfile)
├── Dockerfile               # multi-stage build pod produkcję
├── .env.example             # szablon zmiennych środowiskowych
├── next.config.ts
├── package.json
├── postcss.config.mjs       # Tailwind v4
├── app/
|   ├── components/
|   ├── Header.tsx
|   ├── dashboard/
|   |   └── page.tsx
│   ├── layout.tsx           # AntdRegistry (SSR style dla AntD)
│   ├── page.tsx
│   ├── globals.css          # Tailwind (bez preflight, żeby nie gryzło się z AntD)
│   └── api/health/route.ts  # endpoint pod Docker HEALTHCHECK
└── public/
```

## Rozwiązywanie problemów

**Port zajęty** — zmień `APP_PORT` w `.env` na inny (np. `3419`) i odpal
`docker compose up` ponownie.

**Chcę zacząć od zera (wyczyścić zainstalowane zależności)**

```bash
docker compose down -v   # -v usuwa też wolumeny (node_modules, .next)
docker compose up
```


##Test Jest

- [Testy Jest](./doc/testsJest.md) - Przewodnik po testach parsera inwestycji