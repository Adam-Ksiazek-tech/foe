#Pisma ORM

##Install

docker exec -it foe npm install prisma @prisma/client
docker exec -it foe npx prisma init

##Generate

docker exec -it foe npx prisma generate


##Migracja - tworzy tabelę w bazie na podstawie schematu
docker exec -it foe npx prisma migrate dev --name init
docker restart foe

##prisma db pull i push

docker exec -it foe npx prisma db pull

docker exec -it foe npx prisma db push