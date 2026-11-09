# Autoservicio de instrumentos musicales

Trabajo Práctico Integrador de Programación III — UTN Avellaneda.
Grupo Palmieri – Juárez.

Autoservicio de venta de instrumentos musicales con dos categorías de productos: **Instrumentos** y **Accesorios**. El repositorio contiene dos proyectos:

```
├── backend/    API en JSON + back office con vistas EJS (Node.js, Express, Sequelize, MySQL)
└── frontend/   Aplicación del cliente
```

## Estructura del backend

```
backend/
├── public/           archivos estáticos del back office (CSS, logo, fotos de ejemplo)
├── uploads/          imágenes subidas desde el formulario (no se versionan)
└── src/
    ├── app.js            punto de entrada del servidor
    ├── seed.js           carga de datos iniciales
    ├── config/           conexión a la base de datos y datos del sitio
    ├── routes/           qué URL llama a qué controller
    ├── controllers/      lógica de cada petición
    ├── services/         lógica compartida entre la API y el back office
    ├── models/           modelos de Sequelize (Category, Product, User, Sale, SaleProduct)
    ├── middlewares/      validaciones, subida de imágenes y autenticación
    └── views/            plantillas EJS del back office
```

### Modelo de datos

- **Category** (`id`, `nombre`): solo dos filas, Instrumentos y Accesorios.
- **Product** (`id`, `nombre`, `descripcion`, `precio`, `stock`, `imagen`, `activo`, `categoryId`): `activo` en `false` es la baja lógica.
- **User** (`id`, `nombre`, `email`, `password`): administradores del back office. La contraseña se guarda con hash.
- **Sale** (`id`, `nombreCliente`, `total`, `fecha`): una compra realizada.
- **SaleProduct** (`saleId`, `productId`, `cantidad`, `precioUnitario`): tabla intermedia de la relación muchos a muchos entre ventas y productos. `precioUnitario` guarda el precio al momento de la compra.

## Puesta en marcha del backend

Requisitos: Node.js 22 o superior y MySQL.

1. Crear la base de datos vacía:
   ```sql
   CREATE DATABASE autoservicio;
   ```
2. Dentro de `backend/`, copiar `.env.example` a `.env` y completar los datos de conexión (si MySQL no tiene contraseña, `DB_PASSWORD` queda vacío).
3. Instalar dependencias y cargar los datos iniciales:
   ```bash
   npm install
   npm run seed
   npm run dev
   ```

El servidor queda en `http://localhost:3000`.

> `npm run seed` **borra y vuelve a crear todas las tablas**. Usarlo solo en la base de desarrollo.

En Windows, instalar MySQL Community Server con el instalador oficial, crear la base con MySQL Workbench o desde la consola y poner en `.env` la contraseña elegida durante la instalación.

**Administrador de prueba** (lo crea el seed): `admin@autoservicio.com` / `admin1234`.

## Back office

Pantallas con vistas EJS para administrar los productos y ver las ventas, en `http://localhost:3000/admin`:

| Ruta | Qué muestra |
|---|---|
| `GET /admin/dashboard` | Todos los productos (activos e inactivos), separados por categoría |
| `GET /admin/products/new` | Formulario para agregar un producto |
| `GET /admin/products/:id/edit` | El mismo formulario con los datos del producto cargados |
| `POST /admin/products` | Guarda un producto nuevo y vuelve al dashboard |
| `POST /admin/products/:id` | Guarda los cambios y vuelve al dashboard |
| `POST /admin/products/:id/desactivar` | Baja lógica: el producto queda inactivo y deja de verse en la tienda |
| `POST /admin/products/:id/activar` | Reactiva el producto |
| `GET /admin/sales` | Listado de ventas (6 por página, con `?page=N`): muestra el primer producto de cada una y un botón "Detalle" que abre un modal con todos sus productos |

Los formularios HTML solo permiten GET y POST, por eso la edición se envía por POST. La API sigue usando `PUT`. Si los datos son inválidos, el formulario se muestra de nuevo con los errores y lo que se había cargado. Al modificar un producto sin elegir una imagen nueva se conserva la actual.

Desde el dashboard, el botón **Eliminar** (productos activos) y el botón **Activar** (inactivos) piden confirmación en un modal antes de cambiar el estado. Eliminar no borra nada: es la baja lógica (`activo: false`).

Las imágenes subidas desde el formulario se guardan en `backend/uploads/`. Las del seed están en `backend/public/img/productos/`.

---

# Contrato de la API

URL base: `http://localhost:3000/api`

## Convenciones

- Todas las respuestas son JSON, incluidos los errores.
- Las peticiones con cuerpo envían `Content-Type: application/json`, salvo el alta y la modificación de productos, que usan `multipart/form-data` porque llevan una imagen.
- **Autenticación:** las rutas marcadas como *admin* requieren el encabezado `Authorization: Bearer <token>`. El token se obtiene con `POST /auth/login`.
- **Precios:** se devuelven como número (`185000`), no como texto.
- **Fechas:** formato ISO 8601 (`2026-10-20T14:30:00.000Z`).
- **Imágenes:** las subidas por el alta o la modificación se guardan en el servidor y se sirven desde `/uploads/<archivo>`; las fotos de ejemplo del seed se sirven desde `/img/productos/<archivo>`. El campo `imagen` de un producto contiene esa ruta (por ejemplo `/uploads/1761500000000-ab12cd.jpg`) o `null`. Formatos permitidos: JPG, PNG y WEBP, hasta 2 MB.

### Paginación

Los listados paginados aceptan `page` (por defecto `1`) y `limit` (por defecto `6`, máximo `50`) y responden con esta forma:

```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 6, "totalItems": 17, "totalPages": 3 }
}
```

### Errores

Todos los errores responden con el código HTTP correspondiente y este cuerpo:

```json
{ "error": "Mensaje general del error" }
```

Los errores de validación (400) agregan el detalle por campo:

```json
{
  "error": "Datos inválidos",
  "detalles": [
    { "campo": "precio", "mensaje": "El precio debe ser un número mayor a 0" }
  ]
}
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos o faltantes |
| 401 | Falta el token, es inválido o las credenciales son incorrectas |
| 404 | El recurso no existe |
| 409 | Conflicto, por ejemplo un email ya registrado |
| 500 | Error interno del servidor |

## Resumen de rutas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | público | Estado del servidor |
| GET | `/categories` | público | Listado de categorías |
| GET | `/products` | público | Productos activos, paginados |
| GET | `/products/:id` | público | Detalle de un producto activo |
| POST | `/auth/login` | público | Iniciar sesión como administrador |
| POST | `/users` | admin | Crear un administrador |
| POST | `/products` | admin | Alta de producto (con imagen) |
| PUT | `/products/:id` | admin | Modificar producto |
| DELETE | `/products/:id` | admin | Baja lógica (`activo: false`) |
| PATCH | `/products/:id/activar` | admin | Reactivar (`activo: true`) |
| POST | `/sales` | público | Registrar una compra |
| GET | `/sales` | admin | Ventas con sus productos |
| GET | `/sales/:id` | admin | Una venta con sus productos |

---

## Estado del servidor

### `GET /health`

**200**
```json
{ "ok": true, "mensaje": "API del autoservicio funcionando" }
```

## Categorías

### `GET /categories`

**200**
```json
[
  { "id": 1, "nombre": "Instrumentos" },
  { "id": 2, "nombre": "Accesorios" }
]
```

## Productos

Forma de un producto en las respuestas:

```json
{
  "id": 1,
  "nombre": "Guitarra criolla clásica",
  "descripcion": "Guitarra de estudio con tapa de pino y cuerdas de nylon.",
  "precio": 185000,
  "stock": 8,
  "imagen": "/img/productos/guitarra-criolla.jpg",
  "activo": true,
  "categoryId": 1,
  "category": { "id": 1, "nombre": "Instrumentos" }
}
```

### `GET /products`

Lista paginada de productos **activos**. Es la ruta que usa el cliente.

| Parámetro (query) | Obligatorio | Descripción |
|---|---|---|
| `page` | no | Número de página |
| `limit` | no | Productos por página |
| `categoryId` | no | Filtra por categoría |
| `incluirInactivos` | no | Con `true` incluye los inactivos. **Requiere token de administrador** |

**200**
```json
{
  "data": [ { "id": 1, "nombre": "Guitarra criolla clásica", "precio": 185000, "...": "..." } ],
  "pagination": { "page": 1, "limit": 6, "totalItems": 17, "totalPages": 3 }
}
```

**400** si `page`, `limit` (1 a 50) o `categoryId` no son enteros válidos. **401** si se usa `incluirInactivos=true` sin token.

> Hasta que esté el login, `incluirInactivos` todavía no se aplica: el listado devuelve siempre solo los activos.

### `GET /products/:id`

Detalle de un producto. Si el producto no existe o está inactivo responde **404**.

**200**: un producto con la forma indicada arriba.

### `POST /products` — admin

`multipart/form-data`

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| `nombre` | texto | sí | No vacío |
| `descripcion` | texto | no | |
| `precio` | número | sí | Mayor a 0 |
| `stock` | entero | no | Mayor o igual a 0. Por defecto `0` |
| `categoryId` | entero | sí | Debe existir la categoría |
| `imagen` | archivo | no | JPG, PNG o WEBP, hasta 2 MB |

El producto se crea con `activo: true`.

**201**: el producto creado. **400** si algún dato es inválido. **401** sin token.

### `PUT /products/:id` — admin

`multipart/form-data`, con los mismos campos que el alta. Si no se envía `imagen`, se conserva la actual.

**200**: el producto modificado. **400**, **401**, **404**.

### `DELETE /products/:id` — admin

Baja lógica: cambia `activo` a `false`. El producto deja de verse del lado del cliente pero no se borra de la base.

**200**
```json
{ "mensaje": "Producto desactivado", "producto": { "id": 1, "activo": false, "...": "..." } }
```
**401**, **404**.

### `PATCH /products/:id/activar` — admin

Reactivación: cambia `activo` a `true`.

**200**
```json
{ "mensaje": "Producto activado", "producto": { "id": 1, "activo": true, "...": "..." } }
```
**401**, **404**.

## Autenticación y usuarios

### `POST /auth/login`

**Body**
```json
{ "email": "admin@autoservicio.com", "password": "admin1234" }
```

**200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { "id": 1, "nombre": "Administrador", "email": "admin@autoservicio.com" }
}
```
**400** si faltan datos. **401** si el email o la contraseña no coinciden.

### `POST /users` — admin

Crea un administrador. La contraseña se guarda con hash y nunca se devuelve.

**Body**
```json
{ "nombre": "Nuevo Admin", "email": "nuevo@autoservicio.com", "password": "clave1234" }
```

| Campo | Reglas |
|---|---|
| `nombre` | Obligatorio |
| `email` | Obligatorio, con formato de correo |
| `password` | Obligatorio, mínimo 8 caracteres |

**201**
```json
{ "id": 2, "nombre": "Nuevo Admin", "email": "nuevo@autoservicio.com" }
```
**400**, **401**, **409** si el email ya está registrado.

## Ventas

### `POST /sales`

Registra una compra. El cliente envía solo su nombre y los productos con cantidades: **el servidor busca los precios en la base y calcula el total**.

**Body**
```json
{
  "nombreCliente": "Rocío",
  "items": [
    { "productId": 1, "cantidad": 1 },
    { "productId": 13, "cantidad": 3 }
  ]
}
```

| Campo | Reglas |
|---|---|
| `nombreCliente` | Obligatorio, no vacío |
| `items` | Obligatorio, al menos un elemento, sin productos repetidos |
| `items[].productId` | Debe existir y estar activo |
| `items[].cantidad` | Entero mayor o igual a 1 |

**201**: devuelve el ticket de la compra.
```json
{
  "id": 7,
  "nombreCliente": "Rocío",
  "fecha": "2026-10-20T14:30:00.000Z",
  "total": 198500,
  "productos": [
    { "id": 1, "nombre": "Guitarra criolla clásica", "cantidad": 1, "precioUnitario": 185000, "subtotal": 185000 },
    { "id": 13, "nombre": "Púas pack x12", "cantidad": 3, "precioUnitario": 4500, "subtotal": 13500 }
  ]
}
```
**400** si hay datos inválidos o un producto está inactivo. **404** si un `productId` no existe.

### `GET /sales` — admin

Listado paginado de ventas, de la más reciente a la más antigua, con los productos asociados. Acepta `page` y `limit`.

**200**
```json
{
  "data": [
    {
      "id": 7,
      "nombreCliente": "Rocío",
      "fecha": "2026-10-20T14:30:00.000Z",
      "total": 185000,
      "productos": [
        { "id": 1, "nombre": "Guitarra criolla clásica", "cantidad": 1, "precioUnitario": 185000, "subtotal": 185000 }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 6, "totalItems": 1, "totalPages": 1 }
}
```
**401** sin token.

### `GET /sales/:id` — admin

Una venta con la misma forma que el ticket de `POST /sales`. **401**, **404**.
