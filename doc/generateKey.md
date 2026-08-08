#Generater klucza

docker exec -it foe node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
