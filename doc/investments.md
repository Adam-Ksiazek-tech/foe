#api/investments

## test via curl

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
