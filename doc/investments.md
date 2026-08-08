#api/investments

## test via curl

###POST Bez klucza, powinno być 401

```
curl -X POST http://localhost:3418/api/investments \
  -H "Content-Type: application/json" \
  -d '{
    "msgId": 131996690,
    "conversationId": 2871780,
    "playerId": 850509117,
    "playerName": "Player Testowy",
    "text": "B3V 90",
    "gameDate": "dzisiaj o 18:09"
  }'

```

###POST z kluczem

curl -X POST http://localhost:3418/api/investments \
  -H "Content-Type: application/json" \
  -H "X-API-Key: Twój klucz" \
  -d '{"msgId": 1, "conversationId": 2871780, "playerId": 123, "playerName": "test", "text": "90", "gameDate": "dzisiaj o 18:09"}'


###GET z kluczem

curl http://localhost:3418/api/investments \
  -H "X-API-Key: Twój klucz"