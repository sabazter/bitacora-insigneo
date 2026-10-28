# 🏢 Insigneo — Bitácora y Soporte TI

Sistema web **mobile-first** para la gestión técnica, operativa y de compras de Santiago en **Insigneo**.
Diseñado exclusivamente para uso administrativo privado (sin portales públicos ni usuarios externos).

---

## 🚀 Módulos y Capacidades

1. **📋 Tablero Kanban:**
   - Organización en 4 estados (*Por hacer*, *En curso*, *Esperando*, *Hecho*).
   - Filtros por categoría y prioridad, drag & drop en escritorio y selectores táctiles en móvil.
   - Insignias especiales para compras y materiales pendientes.

2. **🛒 Módulo Dedicado de Compras:**
   - Botón directo `+ Nueva Petición de Compra`.
   - Formulario de adquisición: Artículo, justificación, costo cotizado (\$ USD o Bs), proveedor, prioridad y ciclo de vida de compra (Por cotizar $\rightarrow$ Cotizado $\rightarrow$ Aprobado $\rightarrow$ Comprado $\rightarrow$ Recibido).
   - Métricas de presupuesto en tiempo real y **sincronización bidireccional automática con el Tablero Kanban**.

3. **🖥️ Inventario y Hoja de Vida de Equipos:**
   - Jerarquía: **Área $\rightarrow$ Espacio/Piso $\rightarrow$ Workstation/Equipo**.
   - Áreas corporativas preconfiguradas: *Oficina Principal*, *Operaciones y Trading*, *Administración y Finanzas*, *Servidores y Redes*, *General*.
   - Hoja de vida con registro cronológico de mantenimientos, cambio de componentes y servicios técnicos.

4. **⏱️ Bitácora y Registro Diario de Actividades:**
   - Control de sesiones de soporte con registro de horas reales.
   - Checklist de tareas trabajadas y notas de avance.
   - Evidencia fotográfica comprimida en el navegador antes de subir.

5. **📊 Reportes Ejecutivos de Soporte:**
   - Reporte semanal de los viernes para supervisores y directiva con 4 secciones clave:
     1. Fallas o problemas ocurridos
     2. Equipos reparados / tareas concluidas
     3. Trabajos en curso
     4. Tareas pendientes para la siguiente semana
   - Formato listo para copiar a WhatsApp y vista de impresión a PDF limpia.

6. **🔒 Seguridad y Privacidad:**
   - Contraseña única de acceso (`APP_PASSWORD`), cookies seguras `httpOnly` firmadas.
   - Rate limiting contra fuerza bruta (bloqueo tras 5 intentos erróneos).
   - Base de datos SQLite local en `./data/bitacora.db` sin dependencias externas.

---

## 📦 Despliegue en el Servidor Ubuntu (En Paralelo)

Este contenedor corre en el puerto host **`3006`** para convivir sin conflictos con el contenedor del colegio (`3005`).

### 1. Clonar el repositorio en el servidor
```bash
cd ~
git clone https://github.com/sabazter/bitacora-insigneo.git
cd bitacora-insigneo

# Configurar variables de entorno
cp .env.example .env
nano .env   # coloca tu contraseña en APP_PASSWORD
```

### 2. Levantar el contenedor Docker
```bash
docker compose up -d --build
```

### 3. Configuración en Cloudflare Tunnel
En tu archivo `/etc/cloudflared/config.yml` del servidor, añade la entrada para Insigneo apuntando al puerto `3006`:

```yaml
tunnel: f1c1b022-1904-4f4b-9f17-3eda4771ffa3
credentials-file: /etc/cloudflared/f1c1b022-1904-4f4b-9f17-3eda4771ffa3.json

ingress:
  - hostname: soportecsam.sjgmtech.qzz.io
    service: http://localhost:3005
  - hostname: soporteinsigneo.sjgmtech.qzz.io
    service: http://localhost:3006
  - service: http_status:404
```

Luego reinicia el túnel o el servicio:
```bash
sudo systemctl restart cloudflared
```

---

## 🛠️ Comandos de Mantenimiento

* **Ver logs del contenedor:**
  ```bash
  docker compose logs -f
  ```
* **Actualizar a la última versión:**
  ```bash
  git pull && docker compose up -d --build
  ```
* **Cargar datos de ejemplo corporativos:**
  ```bash
  docker compose exec insigneo node server/src/seed.js
  ```
* **Ejecutar pruebas del sistema:**
  ```bash
  npm test
  ```
