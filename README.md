# PruebaTecnica-DesarrolladorMovil-IncluirTec

#BACKEND
El backend se realiza con el framework NestJS, que usa ExpressJS por debajo, para darle un mejor organización inicial.

el puerto que utiliza el backend es el 3000
iniciar el backend en entorno de desarrollo con: npm run start:dev

- bibliiotecas:
    -- TypeORM: Se usa el ORM para hacer las operaciones equivalentes a SQL desde el backend con código TypeScript.
    -- class-validator: se usa para darle orden y tipado estatico fuerte a los datos a manejarse.
    -- sqlite3: se usa para almacenar la información en una base de datos local que permita se manipulada facilmente.

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




#MOBILE
