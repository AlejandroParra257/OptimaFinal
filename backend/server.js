import express from "express";
import cors from "cors";
import { getPool, sql } from "./db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mercadopago from 'mercadopago';
import crypto from 'crypto';

const app = express();

// ===== CONECTAR A LA BD AL INICIAR =====
(async () => {
    try {
        await getPool();
        console.log('🚀 Conexión a BD establecida al iniciar');
    } catch (err) {
        console.error('❌ Error al conectar a la BD:', err);
    }
})();

// ===== Middlewares =====
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ success: false, error: "Payload demasiado grande (413)" });
  }
  next(err);
});

app.get("/", (_req, res) => res.send("API 5S OK"));

// ============================================
// CONFIGURACIÓN DE AUTENTICACIÓN
// ============================================

const SECRET_KEY = '5S_OPTIMA_SECRET_KEY_2026_CAMBIAME_POR_UNA_MAS_SEGURA';

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido' });
    }
};

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ success: false, error: 'No autenticado' });
        }
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ success: false, error: 'No tienes permisos para esta acción' });
        }
        next();
    };
};

const verificarLimitesNoVip = async (req, res, next) => {
    if (req.usuario.rol === 'admin' || req.usuario.rol === 'vip') {
        return next();
    }
    try {
        const pool = await getPool();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const [rows] = await pool.execute(
            `SELECT COUNT(*) as total FROM entries 
             WHERE usuario_id = ? AND createdAt >= ?`,
            [req.usuario.id, hoy]
        );

        if (rows[0].total >= 5) {
            return res.status(403).json({ 
                success: false, 
                error: 'Límite diario alcanzado (máximo 5 entradas). Actualiza a VIP para acceso ilimitado.' 
            });
        }
        next();
    } catch (err) {
        console.error('Error al verificar límites:', err);
        res.status(500).json({ success: false, error: 'Error al verificar límites' });
    }
};

const generarToken = (usuario) => {
    return jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol }, 
        SECRET_KEY, 
        { expiresIn: '7d' }
    );
};

function uid() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9);
}

mercadopago.configure({
    access_token: 'TEST-7861619006214046-022118-c6b7f5c0a53137b02b55ee1dd1d9ce1c-1451094060'
});

// ============================================
// RUTAS DE AUTENTICACIÓN Y USUARIOS
// ============================================

app.post('/api/auth/register', async (req, res) => {
    const { nombre, email, password, rol_id = 3 } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
    }

    try {
        const pool = await getPool();

        const [existeResult] = await pool.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existeResult.length > 0) {
            return res.status(400).json({ success: false, error: 'El email ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const id = uid();

        await pool.execute(
            `INSERT INTO usuarios (id, nombre, email, password, rol_id, fecha_registro, activo)
             VALUES (?, ?, ?, ?, ?, NOW(), TRUE)`,
            [id, nombre, email, passwordHash, rol_id]
        );

        const [rolInfoResult] = await pool.execute(
            'SELECT nombre FROM roles WHERE id = ?',
            [rol_id]
        );

        const token = generarToken({ id, email, rol: rolInfoResult[0].nombre });

        res.status(201).json({ 
            success: true, 
            message: 'Usuario registrado exitosamente',
            token,
            usuario: { id, nombre, email, rol: rolInfoResult[0].nombre }
        });

    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Pase por aqui xd');
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
    }

    try {
        const pool = await getPool();

        const [usuariosResult] = await pool.execute(
            `SELECT u.id, u.nombre, u.email, u.password, u.rol_id, r.nombre as rol
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             WHERE u.email = ? AND u.activo = 1`,
            [email]
        );

        if (usuariosResult.length === 0) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }

        const usuario = usuariosResult[0];

        // TEMPORAL: aceptar cualquier contraseña para pruebas
        const passwordValida = true;

        const token = generarToken({ 
            id: usuario.id, 
            email: usuario.email, 
            rol: usuario.rol 
        });

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
    }
});

app.get('/api/auth/verify', verificarToken, async (req, res) => {
    try {
        const pool = await getPool();
        const [result] = await pool.execute(
            `SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre as rol
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             WHERE u.id = ?`,
            [req.usuario.id]
        );

        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        res.json({ success: true, usuario: result[0] });
    } catch (err) {
        console.error('Error al verificar token:', err);
        res.status(500).json({ success: false, error: 'Error al verificar usuario' });
    }
});

// ============================================
// RUTAS DEL BACKEND
// ============================================

app.get("/entries", verificarToken, async (req, res) => {
  try {
    const pool = await getPool();
    let query = "SELECT * FROM entries";
    const params = [];

    if (req.usuario.rol !== 'admin') {
      query += " WHERE usuario_id = ?";
      params.push(req.usuario.id);
    }
    query += " ORDER BY createdAt DESC";

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener entradas:", err);
    res.status(500).json({ success: false, error: "Error al obtener entradas" });
  }
});

app.post("/entries", verificarToken, verificarLimitesNoVip, async (req, res) => {
  const { id, sKey, sLabel, note, photo, authorRole, createdAt } = req.body || {};
  const usuario_id = req.usuario.id;

  if (!id || !sKey || !sLabel || !createdAt) {
    return res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
  }

  try {
    const pool = await getPool();
    await pool.execute(
      `INSERT INTO entries (id, sKey, sLabel, note, photo, authorRole, createdAt, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, sKey, sLabel, note || null, photo || null, authorRole || null, createdAt, usuario_id]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error("Error al crear entrada:", err);
    res.status(500).json({ success: false, error: "Error al crear entrada" });
  }
});

app.post("/entry_checks", verificarToken, async (req, res) => {
  const { entry_id, check_label, ok } = req.body || {};

  if (!entry_id || !check_label) {
    return res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
  }

  try {
    const pool = await getPool();
    await pool.execute(
      "INSERT INTO entry_checks (entry_id, check_label, ok) VALUES (?, ?, ?)",
      [entry_id, check_label, ok ? 1 : 0]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error al crear check:", err);
    res.status(500).json({ success: false, error: "Error al crear check" });
  }
});

app.delete("/entries/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const [result] = await pool.execute(
      "DELETE FROM entries WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Entrada no encontrada" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar:", err);
    res.status(500).json({ success: false, error: "Error al eliminar la entrada" });
  }
});

// ============================
// 📊 RUTAS DE REPORTE
// ============================

app.get("/report/summary", verificarToken, async (req, res) => {
  try {
    const pool = await getPool();
    let query = `
      SELECT 
        e.sKey,
        SUM(CASE WHEN c.ok = 1 THEN 1 ELSE 0 END) AS ok,
        COUNT(c.id) AS total
      FROM entries e
      LEFT JOIN entry_checks c ON c.entry_id = e.id
    `;
    const params = [];

    if (req.usuario.rol !== 'admin') {
      query += " WHERE e.usuario_id = ?";
      params.push(req.usuario.id);
    }

    query += " GROUP BY e.sKey";
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error en /report/summary:", err);
    res.status(500).json({ success: false, error: "Error al generar resumen" });
  }
});

app.get("/entry_checks", verificarToken, async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.execute("SELECT id, entry_id, check_label, ok FROM entry_checks ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /entry_checks:", err);
    res.status(500).json({ success: false, error: "Error al obtener checks" });
  }
});

// ============================================
// RUTAS DE ADMINISTRACIÓN (SOLO PARA ADMIN)
// ============================================

app.get('/api/admin/usuarios', verificarToken, verificarRol(['admin']), async (req, res) => {
    try {
        const pool = await getPool();
        const [rows] = await pool.execute(
            `SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre as rol
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             ORDER BY u.id DESC`
        );
        res.json({ success: true, usuarios: rows });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
    }
});

app.put('/api/admin/usuarios/:id/rol', verificarToken, verificarRol(['admin']), async (req, res) => {
    const { id } = req.params;
    const { rol_id } = req.body;

    if (!rol_id) {
        return res.status(400).json({ success: false, error: 'Rol requerido' });
    }

    try {
        const pool = await getPool();
        await pool.execute(
            'UPDATE usuarios SET rol_id = ? WHERE id = ?',
            [rol_id, id]
        );
        res.json({ success: true, message: 'Rol actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar rol:', err);
        res.status(500).json({ success: false, error: 'Error al actualizar rol' });
    }
});

app.put('/api/admin/usuarios/:id/datos', verificarToken, verificarRol(['admin']), async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;

    if (!email && !password) {
        return res.status(400).json({ success: false, error: 'No hay datos para actualizar' });
    }

    try {
        const pool = await getPool();
        
        if (email) {
            const [existe] = await pool.execute(
                'SELECT id FROM usuarios WHERE email = ? AND id != ?',
                [email, id]
            );
            if (existe.length > 0) {
                return res.status(400).json({ success: false, error: 'El email ya está en uso' });
            }
            await pool.execute('UPDATE usuarios SET email = ? WHERE id = ?', [email, id]);
        }
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            await pool.execute('UPDATE usuarios SET password = ? WHERE id = ?', [passwordHash, id]);
        }
        
        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ success: false, error: 'Error al actualizar usuario' });
    }
});

app.delete('/api/admin/usuarios/:id', verificarToken, verificarRol(['admin']), async (req, res) => {
    const { id } = req.params;

    try {
        if (parseInt(id) === req.usuario.id) {
            return res.status(400).json({ success: false, error: 'No puedes eliminarte a ti mismo' });
        }

        const pool = await getPool();
        await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
    }
});

app.get('/api/admin/estadisticas', verificarToken, verificarRol(['admin']), async (req, res) => {
    try {
        const pool = await getPool();
        const [total] = await pool.execute('SELECT COUNT(*) as total FROM usuarios');
        const [vip] = await pool.execute('SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 2');
        const [noVip] = await pool.execute('SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 3');
        
        res.json({
            success: true,
            total: total[0].total,
            vip: vip[0].total,
            noVip: noVip[0].total
        });
    } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
});

// ============================================
// RUTAS DE PAGOS
// ============================================

app.post('/api/pagos/crear-preferencia', verificarToken, async (req, res) => {
    try {
        if (req.usuario.rol !== 'no_vip') {
            return res.status(400).json({ 
                success: false, 
                error: 'Solo usuarios No VIP pueden actualizar' 
            });
        }

        const pool = await getPool();
        await pool.execute(
            'UPDATE usuarios SET rol_id = 2 WHERE id = ?',
            [req.usuario.id]
        );

        console.log(`✅ Usuario ${req.usuario.id} actualizado a VIP (modo prueba)`);

        res.json({
            success: true,
            message: '✅ Usuario actualizado a VIP (modo prueba)',
            init_point: '/pago-exitoso'
        });
    } catch (err) {
        console.error('Error en pago:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.use((_req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));

// ✅ Puerto dinámico para Render
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Servidor backend corriendo en el puerto ${PORT}`));



