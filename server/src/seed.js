import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, setSetting } from './db.js';
import { ensureSessionsGenerated } from './sessionsGenerator.js';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Iniciando carga de datos de ejemplo (seed) para Insigneo ---');

const db = getDb();

// Limpiar datos existentes de prueba de manera segura
db.exec(`
  DELETE FROM evidence;
  DELETE FROM session_tasks;
  DELETE FROM sessions;
  DELETE FROM task_events;
  DELETE FROM tasks;
  DELETE FROM inventory_services;
  DELETE FROM inventory;
  DELETE FROM weekly_reports;
`);

// Establecer configuración inicial para Insigneo
setSetting('schedule', '1|08:00|17:00,2|08:00|17:00,3|08:00|17:00,4|08:00|17:00,5|08:00|17:00');
setSetting('start_date', '2026-10-01');

// Generar sesiones para las últimas semanas y próximos días
ensureSessionsGenerated();

// Insertar tareas realistas para Insigneo
const sampleTasks = [
  {
    title: 'Instalación de segundo monitor en Estación Trading 02',
    description: 'Montaje de brazo articulado VESA y calibración de doble pantalla para analista',
    category: 'instalacion',
    status: 'done',
    priority: 'alta',
    location: 'Trading Room',
    requested_by: 'Operaciones',
    done_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Configurar túnel VPN IPsec y MFA para analista financiero',
    description: 'Enrolamiento en FortiClient, token 2FA en móvil y prueba de acceso a SAP',
    category: 'soporte',
    status: 'done',
    priority: 'alta',
    location: 'Data Room / Remoto',
    requested_by: 'Santiago',
    done_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Mantenimiento preventivo y limpieza de disipadores Workstations',
    description: 'Limpieza de ventiladores y sustitución de pasta térmica en puestos principales',
    category: 'mantenimiento',
    status: 'doing',
    priority: 'media',
    location: 'Oficina Principal',
    requested_by: 'Santiago'
  },
  {
    title: 'Actualización y parches de seguridad Windows 11 Enterprise',
    description: 'Auditoría de vulnerabilidades y despliegue de parches acumulativos',
    category: 'mantenimiento',
    status: 'doing',
    priority: 'media',
    location: 'Administración y Finanzas',
    requested_by: 'Gerencia TI'
  },
  {
    title: '2 Monitores Dell UltraSharp 27 pulgadas 4K U2723QE',
    description: 'Para renovación de pantallas en mesa de operaciones financieras',
    category: 'compra',
    status: 'waiting',
    priority: 'alta',
    location: 'Trading Room',
    requested_by: 'Operaciones',
    waiting_reason: 'Falta aprobación del presupuesto por dirección',
    est_cost: 720.0,
    currency: 'USD',
    supplier: 'Dell Store Barquisimeto',
    purchase_status: 'cotizado'
  },
  {
    title: 'Pack de 10 Licencias Office 365 Business Premium',
    description: 'Renovación anual y habilitación de directivas DLP y cifrado',
    category: 'compra',
    status: 'todo',
    priority: 'media',
    location: 'Oficina Principal',
    requested_by: 'Santiago',
    est_cost: 220.0,
    currency: 'USD',
    supplier: 'Microsoft Partner Vzla',
    purchase_status: 'por_cotizar'
  },
  {
    title: 'Batería de reemplazo para UPS APC Smart-UPS 1500VA',
    description: 'Cartucho RBC7 para banco de baterías del rack de servidores',
    category: 'compra',
    status: 'doing',
    priority: 'alta',
    location: 'Data Room',
    requested_by: 'Santiago',
    est_cost: 185.0,
    currency: 'USD',
    supplier: 'APC Distribuidor',
    purchase_status: 'aprobado'
  },
  {
    title: 'Auditoría y peinado de cableado estructurado en Data Room',
    description: 'Organizar patch cords con ordenadores horizontales y verificar etiquetado',
    category: 'mejora',
    status: 'todo',
    priority: 'baja',
    location: 'Data Room',
    requested_by: 'Santiago'
  },
  {
    title: 'Revisión de rendimiento en estación contable',
    description: 'Equipo presenta demoras al abrir reportes consolidados en Excel',
    category: 'soporte',
    status: 'waiting',
    priority: 'alta',
    location: 'Contabilidad',
    requested_by: 'Lic. Mariana',
    waiting_reason: 'Esperando respaldo de base de datos antes de optimizar'
  }
];

const insertTaskStmt = db.prepare(`
  INSERT INTO tasks (
    title, description, category, status, priority, location,
    requested_by, waiting_reason, done_at, est_cost, currency, supplier, purchase_status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const taskIds = [];
for (const t of sampleTasks) {
  const res = insertTaskStmt.run(
    t.title,
    t.description,
    t.category,
    t.status,
    t.priority,
    t.location,
    t.requested_by,
    t.waiting_reason || null,
    t.done_at || null,
    t.est_cost || null,
    t.currency || 'USD',
    t.supplier || null,
    t.purchase_status || null
  );
  const taskId = Number(res.lastInsertRowid);
  taskIds.push(taskId);

  db.prepare(`
    INSERT INTO task_events (task_id, type, to_value, note)
    VALUES (?, 'created', ?, 'Tarea creada en seed')
  `).run(taskId, t.status);
}

// Configurar sesiones pasadas
const sessions = db.prepare('SELECT * FROM sessions ORDER BY date ASC, sched_start ASC').all();
console.log(`Sesiones generadas: ${sessions.length}`);

const today = new Date().toISOString().slice(0, 10);
let count = 0;

for (const s of sessions) {
  if (s.date < today) {
    count++;
    if (count === 1) {
      db.prepare(`
        UPDATE sessions 
        SET status = 'realizada', 
            actual_start = sched_start, 
            actual_end = sched_end, 
            notes = 'Mantenimiento preventivo completado en estaciones de trading.',
            closed_at = datetime('now')
        WHERE id = ?
      `).run(s.id);

      db.prepare('INSERT INTO session_tasks (session_id, task_id, minutes, note) VALUES (?, ?, 60, ?)')
        .run(s.id, taskIds[1], 'Configuración de seguridad');
    } else if (count === 2) {
      db.prepare(`
        UPDATE sessions 
        SET status = 'suspendida', 
            reason = 'Feriado bancario',
            notes = 'No hubo actividad en oficina.'
        WHERE id = ?
      `).run(s.id);
    } else if (count === 3) {
      db.prepare(`
        UPDATE sessions 
        SET status = 'realizada', 
            actual_start = sched_start, 
            actual_end = sched_end, 
            notes = 'Instalación de monitores y pruebas de video.',
            closed_at = datetime('now')
        WHERE id = ?
      `).run(s.id);

      db.prepare('INSERT INTO session_tasks (session_id, task_id, minutes, note) VALUES (?, ?, 75, ?)')
        .run(s.id, taskIds[0], 'Montaje y calibración');
    }
  }
}

// Insertar equipos de inventario de Insigneo
console.log('Insertando equipos de inventario de Insigneo...');

const sampleEquipment = [
  {
    code: 'WS-TRD-01',
    name: 'Workstation Trader 01',
    area: 'Operaciones y Trading',
    location: 'Trading Room',
    unit_number: 'WS 01',
    category: 'pc',
    brand: 'Dell',
    model: 'Precision 3650 Tower',
    specs: 'Intel Core i7-11700 2.5GHz, 32GB DDR4, SSD NVMe 1TB, Nvidia Quadro T1000, Windows 11 Pro',
    status: 'operativo',
    last_service_date: '2026-10-22',
    last_service_summary: 'Mantenimiento preventivo, cambio de pasta térmica y limpieza de disipador'
  },
  {
    code: 'WS-TRD-02',
    name: 'Workstation Trader 02',
    area: 'Operaciones y Trading',
    location: 'Trading Room',
    unit_number: 'WS 02',
    category: 'pc',
    brand: 'Dell',
    model: 'Precision 3650 Tower',
    specs: 'Intel Core i7-11700 2.5GHz, 32GB DDR4, SSD NVMe 1TB, Nvidia Quadro T1000, Windows 11 Pro',
    status: 'operativo',
    last_service_date: '2026-10-22',
    last_service_summary: 'Configuración de perfil de usuario y monitores duales'
  },
  {
    code: 'LAP-GER-01',
    name: 'Laptop Gerencia General',
    area: 'Oficina Principal',
    location: 'Despacho',
    unit_number: 'LAP 01',
    category: 'laptop',
    brand: 'Dell',
    model: 'Latitude 7420',
    specs: 'Intel Core i7-1185G7, 16GB LPDDR4x, SSD 512GB NVMe, Pantalla 14 FHD, Windows 11 Pro',
    status: 'operativo',
    last_service_date: '2026-10-25',
    last_service_summary: 'Actualización de firmware BIOS y configuración de VPN segura'
  },
  {
    code: 'WS-ADM-01',
    name: 'Workstation Administración / Contabilidad',
    area: 'Administración y Finanzas',
    location: 'Contabilidad',
    unit_number: 'PC 01',
    category: 'pc',
    brand: 'Lenovo',
    model: 'ThinkCentre M70q Tiny',
    specs: 'Intel Core i5-10400T, 16GB RAM, SSD 512GB, Windows 11 Pro',
    status: 'mantenimiento_pendiente',
    last_service_date: '2026-09-18',
    last_service_summary: 'Reporta lentitud en Excel consolidado, programada limpieza de temporales'
  },
  {
    code: 'SRV-APP-01',
    name: 'Servidor Principal de Aplicaciones',
    area: 'Servidores y Redes',
    location: 'Data Room',
    unit_number: 'SRV 01',
    category: 'otro',
    brand: 'Dell',
    model: 'PowerEdge R640 Rack 1U',
    specs: '2x Intel Xeon Silver 4210R, 64GB ECC RAM, 4x 1.2TB SAS 10K RAID 10, iDRAC9 Enterprise, VMware ESXi',
    status: 'operativo',
    last_service_date: '2026-10-15',
    last_service_summary: 'Revisión de logs RAID en PERC H730P y actualización de VMware ESXi'
  },
  {
    code: 'FW-CORP-01',
    name: 'Firewall Corporativo FortiGate',
    area: 'Servidores y Redes',
    location: 'Data Room',
    unit_number: 'FW 01',
    category: 'red',
    brand: 'Fortinet',
    model: 'FortiGate 60F',
    specs: '10x GE RJ45 ports, UTM throughput 1 Gbps, VPN IPsec 6.5 Gbps, FortiOS 7.2',
    status: 'operativo',
    last_service_date: '2026-10-10',
    last_service_summary: 'Respaldo de configuración y ajuste de políticas de acceso SSL-VPN'
  },
  {
    code: 'SW-CORE-01',
    name: 'Switch Core Gigabit 24 Puertos',
    area: 'Servidores y Redes',
    location: 'Data Room',
    unit_number: 'SW 01',
    category: 'red',
    brand: 'Cisco',
    model: 'Catalyst 2960X-24TS-L',
    specs: '24 puertos 10/100/1000 Ethernet, 4 enlaces SFP 1G, Cisco IOS LAN Base',
    status: 'operativo',
    last_service_date: '2026-09-05',
    last_service_summary: 'Revisión de VLANs y monitoreo de enlaces troncales'
  },
  {
    code: 'UPS-RACK-01',
    name: 'UPS Respaldo Rack Servidores',
    area: 'Servidores y Redes',
    location: 'Data Room',
    unit_number: 'UPS 01',
    category: 'ups',
    brand: 'APC',
    model: 'Smart-UPS 1500VA LCD RM 2U',
    specs: '1500VA / 1000W, Onda senoidal pura, 6 tomas NEMA 5-15R, Tarjeta Network Management AP9630',
    status: 'mantenimiento_pendiente',
    last_service_date: '2026-08-20',
    last_service_summary: 'Alerta de batería desgastada (>3 años), cotizado reemplazo de cartucho RBC7'
  }
];

const insertEquipStmt = db.prepare(`
  INSERT INTO inventory (
    code, name, area, location, unit_number, category, brand, model, specs, status, last_service_date, last_service_summary
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertServiceStmt = db.prepare(`
  INSERT INTO inventory_services (
    equipment_id, service_date, action_taken, technician, notes
  ) VALUES (?, ?, ?, ?, ?)
`);

for (const eq of sampleEquipment) {
  const r = insertEquipStmt.run(
    eq.code,
    eq.name,
    eq.area || 'General',
    eq.location,
    eq.unit_number || null,
    eq.category,
    eq.brand,
    eq.model,
    eq.specs,
    eq.status,
    eq.last_service_date,
    eq.last_service_summary
  );
  const equipId = Number(r.lastInsertRowid);

  if (eq.last_service_date && eq.last_service_summary) {
    insertServiceStmt.run(
      equipId,
      eq.last_service_date,
      eq.last_service_summary,
      'Santiago',
      'Servicio inicial registrado en inventario Insigneo'
    );
  }
}

console.log('✅ Seed completado con éxito: Tareas corporativas, historial de sesiones y 8 equipos corporativos de Insigneo.');
