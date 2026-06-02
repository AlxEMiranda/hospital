# 🏥 API REST Hospitalaria - Parcial 4

## Integrantes
* [Tu Nombre] - [Tu Carné]

## 🚀 Inicio Rápido
1. `npm install`
2. `cp .env.example .env`
3. `npm run dev` (Servidor en puerto 3000)
4. `npm test` (Ejecuta los 12 escenarios)
5. Docs: http://localhost:3000/api-docs

## 👥 Credenciales
| Usuario | Contraseña | Rol |
| --- | --- | --- |
| admin | Admin2024! | ADMIN |
| dr.garcia | Medico1! | MEDICO |
| recepcion | Recep123! | RECEPCION |

## 🧠 Reflexiones Técnicas

1. **Caché y datos desactualizados:**
   Garantizamos la consistencia invalidando la caché (`flushAll` o por prefijo) inmediatamente después de cualquier operación de escritura (POST/PUT/DELETE). Así, el siguiente GET traerá datos frescos de la DB.

2. **Optimistic Locking en Frontend:**
   Si no se maneja bien, el usuario podría perder datos al sobrescribir cambios de otro médico. El frontend debe detectar el error 409, mostrar un mensaje de "Conflicto" y obligar al usuario a recargar los datos más recientes antes de intentar guardar de nuevo.

3. **Exportar desde API vs BD:**
   *API:* Permite aplicar filtros de seguridad (RBAC) y transformaciones antes de la descarga. *BD:* Es más rápido para grandes volúmenes, pero requiere que el usuario tenga acceso directo al servidor de datos, lo cual es un riesgo de seguridad.

4. **Auditoría a 1000 peticiones/seg:**
   Escribir síncronamente en memoria o disco colapsaría el sistema. La solución es usar colas de mensajes asíncronas (RabbitMQ/Kafka) para almacenar los logs de auditoría en segundo plano sin bloquear la respuesta al usuario.