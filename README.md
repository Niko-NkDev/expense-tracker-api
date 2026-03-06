# Expense Tracker API

API RESTful backend para gestionar gastos personales, construida con **Node.js**, **Express** y **TypeScript**.

Permite:
- Crear, listar, actualizar y eliminar gastos.
- Filtrar gastos por categoría y rango de fechas.
- Obtener un resumen agregado de los gastos.

---

## Tecnologías

- Node.js
- Express 5
- TypeScript
- UUID (generación de identificadores únicos)
- CORS
 - Jest + ts-jest (pruebas unitarias)

---

## Estructura del proyecto

```bash
src/
  app.ts              # Configuración de Express y middlewares
  server.ts           # Punto de entrada del servidor (puerto, listen)
  controllers/
    expense.controller.ts  # Lógica HTTP de la API (req/res)
  services/
    expense.service.ts     # Lógica de negocio para gastos
  models/
    expense.model.ts       # Tipos/Interfaces de dominio (Expense, ExpenseCategory)
  data/
    database.ts            # Fuente de datos en memoria (array de gastos)
  routes/
    expense.routes.ts      # Definición de rutas /expenses
```

---

## Modelo de datos

El modelo principal es `Expense` definido en `src/models/expense.model.ts`:

```ts
export type ExpenseCategory =
  | "Comida"
  | "Transporte"
  | "Entretenimiento"
  | "Vivienda"
  | "Salud";

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;        // ISO string, ej: "2026-03-06"
  description?: string;
}
```

Categorías válidas (enviadas exactamente con estos valores):

- `"Comida"`
- `"Transporte"`
- `"Entretenimiento"`
- `"Vivienda"`
- `"Salud"`

Si se envía una categoría distinta, la API devuelve **400 Bad Request** con un mensaje de error y la lista de categorías permitidas.

---

## Requisitos previos

- Node.js 18+ (recomendado)
- npm (incluido con Node)

---

## Instalación

```bash
# Instalar dependencias
npm install
```

---

## Scripts disponibles

Definidos en `package.json`:

- `npm test`
  - Ejecuta la suite de pruebas unitarias con **Jest** sobre la capa de servicios y controladores.

- `npm run dev`
  - Levanta el servidor en modo desarrollo con **ts-node-dev**.
  - Recarga automática al modificar archivos `.ts`.

- `npm run build`
  - Compila TypeScript a JavaScript en la carpeta `dist/` usando `tsc`.

- `npm start`
  - Ejecuta el servidor desde el código compilado: `node dist/server.js`.

---

## Ejecutar en desarrollo

```bash
npm run dev
```

Por defecto, el servidor se levanta en:

- Base URL: `http://localhost:3000`

---

## Endpoints de la API

### 1. Listar gastos (con filtros opcionales)

**GET** `/expenses`

Query params opcionales:
- `category`: categoría válida (Comida, Transporte, Entretenimiento, Vivienda, Salud)
- `startDate`: fecha de inicio (string, ej. `2025-01-01`)
- `endDate`: fecha de fin (string, ej. `2025-12-31`)

Ejemplos:

- Listar todos:
  - `GET http://localhost:3000/expenses`

- Filtrar por categoría:
  - `GET http://localhost:3000/expenses?category=Comida`

- Filtrar por rango de fechas:
  - `GET http://localhost:3000/expenses?startDate=2025-01-01&endDate=2025-12-31`

- Filtrar por categoría y rango:
  - `GET http://localhost:3000/expenses?category=Transporte&startDate=2025-01-01&endDate=2025-12-31`

Respuestas:

```json
[
  {
    "id": "bd9ac72c-3f67-4056-ab91-9f9a7eb721fe",
    "amount": 1000,
    "category": "Comida",
    "date": "2026-03-06",
    "description": "Almuerzo"
  }
]
```

Si se pasa una `category` inválida:

```json
{
  "message": "Categoría inválida",
  "allowedCategories": ["Comida", "Transporte", "Entretenimiento", "Vivienda", "Salud"]
}
```

---

### 2. Crear gasto

**POST** `/expenses`

Headers:
- `Content-Type: application/json`

Body (JSON):

```json
{
  "amount": 1000,
  "category": "Comida",
  "date": "2026-03-06",
  "description": "Almuerzo"
}
```

- `amount`: número (monto del gasto).
- `category`: una de las categorías válidas.
- `date`: string de fecha (idealmente ISO `YYYY-MM-DD`).
- `description`: opcional.

Respuesta (201 Created):

```json
{
  "id": "bd9ac72c-3f67-4056-ab91-9f9a7eb721fe",
  "amount": 1000,
  "category": "Comida",
  "date": "2026-03-06",
  "description": "Almuerzo"
}
```

Si `category` es inválida, devuelve 400 con el mismo formato de error de validación.

---

### 3. Actualizar gasto

**PUT** `/expenses/:id`

Parámetros de ruta:
- `:id`: identificador del gasto (UUID devuelto al crearlo).

Headers:
- `Content-Type: application/json`

Body (JSON): puedes enviar campos parciales o todos:

```json
{
  "amount": 1200,
  "description": "Almuerzo con postre"
}
```

Notas:
- Si envías `category` en el body, se valida contra `EXPENSE_CATEGORIES`.
- Si el `id` no existe, devuelve **404** con `{ "message": "Expense not found" }`.

---

### 4. Eliminar gasto

**DELETE** `/expenses/:id`

Parámetros de ruta:
- `:id`: identificador del gasto.

Respuestas:
- 200 OK si se elimina correctamente:
  ```json
  {
    "message": "Expense deleted"
  }
  ```
- 404 si el `id` no existe:
  ```json
  {
    "message": "Expense not found"
  }
  ```

---

### 5. Resumen de gastos

**GET** `/expenses/summary`

Calcula:
- `total`: suma de todos los montos (`amount`).
- `byCategory`: objeto con suma por categoría.

Ejemplo de respuesta:

```json
{
  "total": 2200,
  "byCategory": {
    "Comida": 1500,
    "Transporte": 700
  }
}
```

---

## Pruebas unitarias (Jest)

El proyecto incluye pruebas unitarias escritas con **Jest** y **ts-jest**.

- Configuración principal en `jest.config.cjs`.
- Pruebas actuales:
  - `src/services/expense.service.test.ts`: lógica de negocio (creación, filtrado, actualización, eliminación y resumen de gastos).
  - `src/controllers/expense.controller.test.ts`: capa HTTP (validación de categorías, códigos de estado y respuestas), mockeando la capa de servicios.

### Ejecutar las pruebas

```bash
npm test
```

Esto ejecuta toda la suite y muestra el resultado de los tests.

---

## Pruebas rápidas con Postman / Insomnia

1. Asegúrate de haber ejecutado:
   ```bash
   npm run dev
   ```

2. En Postman / Insomnia:
   - Crear una nueva request **POST** a `http://localhost:3000/expenses`.
   - En **Body** → `raw` → `JSON`, poner:
     ```json
     {
       "amount": 1000,
       "category": "Comida",
       "date": "2026-03-06",
       "description": "Almuerzo"
     }
     ```
   - Enviar y verificar la respuesta con `id`.

3. Usar el `id` devuelto para:
   - **PUT** `http://localhost:3000/expenses/<ID>`
   - **DELETE** `http://localhost:3000/expenses/<ID>`

4. Consultar resumen:
   - **GET** `http://localhost:3000/expenses/summary`

---

## Despliegue en Render (visión general)

> Nota: estos pasos asumen que el repositorio está en GitHub y que se usarán los scripts `build` y `start` ya definidos en `package.json`.

1. **Subir el proyecto a GitHub**
   - Inicializa un repo (`git init`), haz commit y súbelo a GitHub.

2. **Crear un nuevo servicio Web en Render**
   - Entra a [https://render.com](https://render.com).
   - Crea un nuevo **Web Service** conectado a tu repositorio de GitHub.

3. **Configurar Build & Start**
   - *Build Command*: `npm run build`
   - *Start Command*: `npm start`
   - *Node Version*: opcionalmente especificar (ej. 18) en variables de entorno de Render (`NODE_VERSION=18`), si se desea.

4. **Deploy**
   - Render ejecutará `npm install`, luego `npm run build`, y finalmente `npm start`.
   - Una vez desplegado, tendrás una URL pública tipo:
     - `https://expense-tracker-api.onrender.com`
   - Tus endpoints quedarán accesibles como:
     - `https://expense-tracker-api.onrender.com/expenses`

5. **Variables de entorno (opcional / futuro)**
   - Actualmente la API no usa base de datos externa ni variables de entorno.
   - Si en el futuro se agrega una DB (PostgreSQL, MongoDB, etc.), aquí se documentarían las variables requeridas (por ejemplo `DATABASE_URL`).

---

## Futuras mejoras

- Persistencia con una base de datos real (PostgreSQL, MongoDB, etc.).
- Autenticación y autorización (usuarios, login, etc.).
- Paginación y ordenamiento en el listado de gastos.
- Validación más avanzada con librerías como `zod` o `joi`.
- Pruebas de integración/end-to-end sobre rutas y servidor (por ejemplo usando `supertest`).
