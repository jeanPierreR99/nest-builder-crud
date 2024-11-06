# Descripción de la Aplicación NEST BUILDER CRUD

Esta aplicación es un **CRUD (Crear, Leer, Actualizar, Eliminar)** desarrollado utilizando **NestJS**, un potente framework para construir aplicaciones de servidor en Node.js. La aplicación se centra en la creación automática de componentes esenciales para gestionar datos a través de una API RESTful.

![db](/images/output.png)
## Funcionalidad Principal

La aplicación permite a los usuarios interactuar con un conjunto de entidades mediante una API, generando automáticamente:

- **DTOs (Data Transfer Objects)**: Estructuras que definen cómo se envían y reciben los datos entre el cliente y el servidor, asegurando la validación y la integridad de la información.
- **Entidades**: Representaciones de las tablas en la base de datos, que contienen propiedades y relaciones necesarias para modelar los datos del dominio.

- **Servicios**: Clases que encapsulan la lógica del negocio y facilitan las operaciones CRUD sobre las entidades.

- **Controladores**: Manejan las solicitudes HTTP entrantes y devuelven respuestas adecuadas, utilizando los servicios para realizar operaciones solicitadas.

## Beneficios

- **Automatización**: Generación automática de DTOs, entidades, servicios y controladores, lo que reduce el tiempo de desarrollo y minimiza errores.

- **Estructura Clara**: Separación entre la lógica de negocio y la presentación, facilitando el mantenimiento y escalabilidad del código.

- **Validación de Datos**: Implementación de validaciones antes de que los datos lleguen a la base de datos, mejorando la integridad y seguridad del sistema.

## Ejemplo de Uso y explicacion de los datos de entrada

A continuación se muestra la configuración de las entidades.
Esta configuración define las propiedades, relaciones y nodos para cada entidad.

```typescript
    {
      entityName: 'New', //nombre de la entidad empezando con  mayúscula
      properties: { // propiedades, representan los campos (seguir agregando) puede ser string o number
        campo1: 'string', //string o number
        campo2: 'number',
      },
      relations: [ // relacion entre entidades
        {
          type: 'one-to-many', // one-to-one, one-to-many , many-to-one, many-to-many
          target: 'NewRelation' } // Entidad que se relaciona
          joinTable: true // agregar solo si la relacion es many-to-may u one-to-one y si es la entidad que llevara la relacion fuerte
        ],
      nodoRelations: [ ],// nodo de relacion si se tiene conocimiento de typeorm (find({ relations: ['books','books.author']});) o agregar las relaciones directamente en el servicio generado
    },
```

## Ejemplo

![db](/images/db.png)

- Consfigurar el archivo controllers/generate/GenerateEntitiesController
- npm run start:dev
- hacer Post a  /entities
- Ingresar a la documentación: localhost/4000/api
### salida

## ![db](/images/output-2.png)
