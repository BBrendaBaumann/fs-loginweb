# LOGINWEB App
## 🌐 URLs públicas

**Frontend:** https://fs-loginweb.vercel.app/login

**Backend:** ESTÁ DENTRO DE LA CARPETA API DE FRONT

## 👤 Demo user

Puedes probar la aplicación con el siguiente usuario demo:

**Email/USUARIO:** user1@example.com

**Password:** Password1!
- - -
**Email/USUARIO:** user2@example.com

**Password:** Password2!

##  📂 Repositorios

**Backend:** https://github.com/BBrendaBaumann/be-choppi

**Frontend:** https://github.com/BBrendaBaumann/fe-choppi

## 🛠️ Setup local

## FRONTEND

*Pasos para leavntar el proyecto*

Clonar el repositorio:

git clone https://github.com/BBrendaBaumann/fs-loginweb
cd front


Instalar dependencias:

npm install


Configurar las variables de entorno en .env:

JWT_SECRET=supersecret
JWT_EXPIRES_IN=2h
***(Las variables de entorno de google no están en el .env porque violan las reglas de seguridad)***

Ejecutar seeds (opcional):

npm run seed

## Despliegue

Build command: npm install && npm run build

Start command: npm run start:prod


## Notas

- Usuario demo ya está en la base de datos con el email y password proporcionados.

- Seeds deben ejecutarse solo si quieres replicar la base de datos localmente.

***Muchísimas gracias por la oportunidad!***
