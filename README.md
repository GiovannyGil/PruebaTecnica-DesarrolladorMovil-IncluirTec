# PruebaTecnica-DesarrolladorMovil-IncluirTec

#BACKEND
El backend se realiza con el framework NestJS, que usa ExpressJS por debajo, para darle un mejor organización inicial.

el puerto que utiliza el backend es el 3000
iniciar el backend en entorno de desarrollo con: npm run start:dev

- bibliiotecas:
    -- TypeORM: Se usa el ORM para hacer las operaciones equivalentes a SQL desde el backend con código TypeScript.
    -- class-validator: se usa para darle orden y tipado estatico fuerte a los datos a manejarse.
    -- sqlite3: se usa para almacenar la información en una base de datos local que permita se manipulada facilmente.



# Instalacion y ejecucion
instalar
- Node : version a gusto (se uso la 24)
- NestJS: npm i -g @nestjs/cli
    -- (crear un proyecto nuevo) : nest new project-name
    -- npm i --save @nestjs/config
    -- npm i --save class-validator class-transformer
    -- npm install --save @nestjs/typeorm typeorm sqlite3
    -- npm install (verificar que todas las bibliotecas esten instaladas)
    -- npm un start:dev (iniciar en local)
    -- npm run start (iniciar en producción)

EndPoints:

POST -> crear una nueva tarea: http://localhost:3000/tareas/
JSON :
{
    "titulo": "tarea 1",
    "descripcion": "descripcion tarea 1"
}

GET -> obtener todas las tareas: http://localhost:3000/tareas/

GET -> obtener una tarea por id: http://localhost:3000/tareas/1

PATCH -> actualizar la informacion de una tarea: http://localhost:3000/tareas/2
JSON:
{
    "titulo": "tarea 2",
    "descripcion": "descripcion tarea 2.0"
}

PATCH -> terminar tarea (cambiar "estado") : http://localhost:3000/tareas/terminar/2

DELETE -> eliminar tarea (eliminar soft delete) : http://localhost:3000/tareas/2

iniciar servidor con ngrok : ngrok http 3000 --domain=logical-rapid-dingo.ngrok-free.app


#MOBILE

- bibliotecas/recursos
 -- ionicons : para el uso de iconos en las vistas

para ejecutar en local se usa el comando "ionic serve"
se debe cambiar la apiUrl si se va usar el local(navegador/web) o en dispositivo

# Instalacion y ejecucion
instalar
    -- npm i -g @ionic/cli
    -- ionic start || ionic start miApp blank --type=angular (crear un proyecto nuevo)
    -- cd myApp (entrar a la carpeta del proyecto)
    -- npm install @capacitor-community/sqlite @capacitor/network
    -- npm install @capacitor/android
    -- npm install @ionic/angular@latest --save

    -- ionic serve (iniciar el proyecto en un entorno local/web)

# "EXPORTAR" APP A ANDROID STUDIO
- ionic build
- npx cap add android (SI YA EXISTE, ELIMINAR LA CARPETA ANDROID DEL PROYECTO)
- npx cap copy
- npx cap sync
- npx cap open android -> ABRE ANDROID STUDI CON LA APP APRA EXPORTARLA

en android estulo ejecutar la app en un emulador, un despositivo experno, o generar la apk
