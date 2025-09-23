# Olbil 
La primera red social solidaria que permite donaciones directas, rápidas y seguras mediante Open Payments, sin intermediarios, garantizando transparencia y trazabilidad total de cada aporte.

## Especificaciones técnicas
Nuestra aplicación está construida con Next.js como base, consta de una carpeta de backend y una de frontend

* En la carpeta de backend, dentro de src/routes encuentrarás las funcionalidades clave de nuestra aplicación, por su parte la carpeta src/utils tiene algunas configuraciones para la conexión entre backend y frontend.

---
Para ver la implementación de open-payments, esta Implementacion se encuentra en la siguiente ruta
backend/source/routes/donations.ts
---

* En la carpeta frontend, el núcleo del programa lo encontrarás dentro de src/app donde hay distintas carpetas como AddWallet, Profile, SearchProfile, etc. que corresponden a las pantallas de la aplicación, dentro hay un archivo page.tsx con todo el código typescript y html necesario para el funcionamiento de las interfaces.
    

## Cómo correr el proyecto

1. Clona en tu computadora el repositorio de  ([github](https://github.com/AaronUgalde/Memory-Leaks)), posteriormente abre la ubicación de tu proyecto desde el cmd (Command Prompt) y escribe

```sh
	npm install
	
```

2. Ingresa a la carpeta backend y crea un archivo ".env" (sin nombre, solo extensión) en dicho archivo copia lo siguiente

```
DATABASE_URL = "postgres://avnadmin:AVNS_SWCSzR4ezZV2Jr4wKHN@bd-memory-leaks1-aaronugaldet-memoryleaks.k.aivencloud.com:10887/defaultdb"

FRONTEND_URL = "http://localhost:3000"

JWT_SECRET = "your_jwt_secret_key"

```

3. Por último en una ventana del command promp ingresa a la carpeta de frontend y ejecuta el siguiente comando
	
```sh
    cd frontend
    npm run dev
```

	De la misma manera, ejecuta el comando desde la carpeta de backend.
	
```sh
    cd backend
    npm run dev
```
  En la terminal del frontend se mostrará un enlace parecido a  http://localhost:3000 copia este link en un navegador y ¡listo! ya podrás ver el proyecto. 

