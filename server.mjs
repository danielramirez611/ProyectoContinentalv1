import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import fs from 'fs-extra';
import multer from 'multer';
import { fileURLToPath } from 'url';

if (!process.env.JWT_SECRET) {
    console.error("❌ ERROR: JWT_SECRET no está definido en el archivo .env");
    process.exit(1);
}
// Definir __dirname manualmente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));


app.use(cors());
app.use('/media', express.static('media')); // Servir archivos multimedia

// 🔹 **Conexión a la Base de Datos**
let db;
const connectDatabase = async () => {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'continental_proyectos'
        });

        console.log("✅ Conexión exitosa a la base de datos: continental_proyectos");
    } catch (error) {
        console.error("❌ ERROR: No se pudo conectar a la base de datos", error);
        process.exit(1);
    }
};
await connectDatabase();

// 🔹 **Verificar y Crear Usuario Administrador**
const setupAdminUser = async () => {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    try {
        const [existingAdmin] = await db.execute(`SELECT id, password FROM users WHERE email = ?`, [adminEmail]);

        if (existingAdmin.length === 0) {
            console.log("🔹 No se encontró admin, creando uno nuevo...");
            const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
            await db.execute(
                `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                ['Administrador', adminEmail, hashedAdminPassword, 'admin']
            );
            console.log("✅ Administrador creado exitosamente");
        } else {
            console.log("✅ Administrador ya existe.");
        }
    } catch (error) {
        console.error("❌ ERROR: No se pudo verificar el usuario administrador", error);
    }
};
await setupAdminUser();

// 🔹 **Middleware para verificar JWT**
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Token requerido' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token inválido' });
        req.user = decoded;
        next();
    });
};

// 🔹 **Configuración de Multer para subir archivos**
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/');
        const uploadPath = isImage ? 'media/images/' : 'media/videos/';
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: {
      fileSize: 1000 * 1024 * 1024, // 1000 MB = 1 GB
    },
  });
  
  
// 🔹 LOGIN

// 🔹 **Ruta de Login**
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    try {
        const [users] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);

        if (users.length === 0) {
            console.log(`🔴 Usuario no encontrado: ${email}`);
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];
        
        console.log(`🔍 Usuario encontrado: ${user.email}, Role: ${user.role}`);

        // ✅ Verificar contraseña encriptada con bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log("❌ Contraseña incorrecta para usuario:", email);
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        console.log("✅ Login exitoso:", email);

        // 🔹 Generar token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 🔹 **Ruta Protegida para Verificar Token**
app.get('/api/verify', verifyToken, (req, res) => {
    res.json({ message: 'Token válido', user: req.user });
});

// 🔹 **Ruta de Prueba**
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});

// 🔹 **WebSockets (Opcional)**
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


// 🔹 PROYECTOS

// 🔹 **Ruta para subir imágenes de proyectos**
app.post('/api/projects/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Archivo no recibido' });

    const fileUrl = `/media/images/${req.file.filename}`;

    res.json({
        message: 'Imagen subida con éxito',
        fileUrl
    });
});
// 🔹 **Crear un proyecto dentro de una sección**
app.post('/api/projects', upload.single('image'), async (req, res) => {
    try {
        const { title, description, section_id, category } = req.body;
        const projectImage = req.file ? `/media/images/${req.file.filename}` : null; // 🔹 Si no hay imagen, será null

        if (!title || !section_id || !projectImage || !category) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        await db.execute(
            `INSERT INTO projects (project_name, project_description, project_image, category, section_id) VALUES (?, ?, ?, ?, ?)`,
            [title, description, projectImage, category, section_id]
        );

        res.status(201).json({ message: "Proyecto creado con éxito" });
    } catch (error) {
        console.error("❌ Error al crear proyecto:", error);
        res.status(500).json({ message: "Error al crear el proyecto", error });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const [projects] = await db.execute(`
            SELECT id, project_name AS title, project_description AS description, 
                   project_image AS image, category, section_id 
            FROM projects
        `);

        console.log("📢 Proyectos obtenidos:", projects);

        const formattedProjects = projects.map(project => ({
            ...project,
            image: project.image ? `http://localhost:5000${project.image}` : "/placeholder.jpg" // 🔹 URL completa
        }));

        res.json(formattedProjects);
    } catch (error) {
        console.error("❌ Error al obtener proyectos:", error);
        res.status(500).json({ message: "Error al obtener proyectos", error });
    }
});

// 🔹 **Actualizar un proyecto con nueva imagen**
app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, section_id, category } = req.body;
        const { id } = req.params;
        
        // 📌 Obtener la URL de la imagen si se subió una nueva
        const projectImage = req.file ? `/media/images/${req.file.filename}` : null;

        const updates = [];
        const values = [];

        if (title) {
            updates.push("project_name = ?");
            values.push(title);
        }
        if (description) {
            updates.push("project_description = ?");
            values.push(description);
        }
        if (category) {
            updates.push("category = ?");
            values.push(category);
        }
        if (section_id) {
            updates.push("section_id = ?");
            values.push(section_id);
        }
        if (projectImage) {
            updates.push("project_image = ?");
            values.push(projectImage);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        values.push(id);

        await db.execute(
            `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: "Proyecto actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el proyecto", error });
    }
});


app.get('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 Validar si el ID es un número
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID de proyecto inválido' });
        }

        // 🔹 Consultar el proyecto
        const [rows] = await db.execute(
            `SELECT p.*, s.name AS section_name 
             FROM projects p
             LEFT JOIN sections s ON p.section_id = s.id
             WHERE p.id = ?`, 
            [id]
        );

        // 🔹 Si no existe el proyecto, devolver 404
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        // 🔹 Formatear el resultado
        const project = rows[0];

        // 🔹 Si la imagen está almacenada en el servidor, agregar la URL completa
        if (project.image && !project.image.startsWith("http")) {
            project.image = `http://localhost:5000/uploads/${project.image}`;
        }

        res.json(project);

    } catch (error) {
        console.error("❌ Error al obtener proyecto por ID:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

app.get('/api/projects/last', async (req, res) => {
    try {
        console.log("📢 Buscando el último proyecto...");

        const [rows] = await db.execute(`
            SELECT id, project_name, project_description, project_image, category, section_id 
            FROM projects 
            ORDER BY id DESC 
            LIMIT 1
        `);

        console.log("📌 Resultado de la consulta:", rows);

        if (rows.length === 0) {
            console.warn("⚠ No hay proyectos en la base de datos.");
            return res.status(404).json({ message: 'No hay proyectos disponibles' });
        }

        const lastProject = rows[0];

        // 🔹 Verificar que el ID sea un número válido
        if (!lastProject.id || isNaN(lastProject.id)) {
            console.error("❌ ERROR: ID de proyecto inválido", lastProject);
            return res.status(400).json({ message: 'ID de proyecto inválido', lastProject });
        }

        res.json(lastProject);
    } catch (error) {
        console.error("❌ Error al obtener el último proyecto:", error);
        res.status(500).json({ message: 'Error al obtener el último proyecto', error });
    }
});

// 🔹 **Eliminar un proyecto**
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el proyecto existe antes de eliminarlo
        const [rows] = await db.execute(`SELECT * FROM projects WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }

        // Si el proyecto tiene imagen, eliminar la imagen del servidor
        if (rows[0].project_image) {
            const imageFile = path.basename(rows[0].project_image); // Solo el nombre del archivo
            const imagePath = path.join(__dirname, 'media', 'images', imageFile);
            await fs.remove(imagePath);
        }

        // Eliminar el proyecto de la base de datos
        await db.execute(`DELETE FROM projects WHERE id = ?`, [id]);
        res.json({ message: "Proyecto eliminado con éxito" });

    } catch (error) {
        console.error("❌ Error al eliminar proyecto:", error);
        res.status(500).json({ message: "Error al eliminar el proyecto", error });
    }
});


// 🔹 SECCION DE GRILLA

app.get('/api/sections', async (req, res) => {
    try {
        // Seleccionar todos los campos necesarios
        const [sections] = await db.execute(`
            SELECT id, name, image_url 
            FROM sections
        `);

        // Obtener todos los proyectos de una sola vez
        const [allProjects] = await db.execute(`
            SELECT id, project_name AS title, project_description AS description, 
                   project_image AS image, section_id
            FROM projects
        `);

        // Procesar las secciones
        const processedSections = sections.map(section => {
            // Limpiar el image_url para quedarnos solo con el nombre del ícono
            let iconName = section.image_url;
            if (iconName && iconName.includes('http://localhost:5000')) {
                iconName = iconName.replace('http://localhost:5000', '');
            }

            return {
                id: section.id,
                name: section.name,
                image: iconName, // Guardamos solo el nombre del ícono
                projects: allProjects
                    .filter(p => p.section_id === section.id)
                    .map(p => ({
                        ...p,
                        image: p.image ? `http://localhost:5000${p.image}` : null
                    }))
            };
        });

        res.json(processedSections);
    } catch (error) {
        console.error("Error al obtener secciones:", error);
        res.status(500).json({ message: "Error al obtener secciones", error });
    }
});


app.post('/api/sections', async (req, res) => {
    try {
      console.log("🔍 Datos recibidos en el backend:", req.body); // Debug
  
      // Extraer los valores correctamente
      const { name, icon } = req.body;
      const sectionName = typeof name === 'object' ? name.name : name;
      const sectionIcon = typeof name === 'object' ? name.image : icon;
  
      if (!sectionName || !sectionIcon) {
        return res.status(400).json({ message: "El nombre y el icono son obligatorios." });
      }
  
      const [count] = await db.execute(`SELECT COUNT(*) AS total FROM sections`);
      if (count[0].total >= 18) {
        return res.status(400).json({ message: "Límite de 18 secciones alcanzado." });
      }
  
      await db.execute(
        `INSERT INTO sections (name, image_url) VALUES (?, ?)`,
        [sectionName, sectionIcon] // Guardamos el icono en image_url
      );
  
      res.status(201).json({ message: "Sección creada correctamente." });
    } catch (error) {
      console.error("❌ Error al agregar sección:", error);
      res.status(500).json({ message: "Error al agregar sección", error });
    }
  });
  
  
app.get('/api/sections', async (req, res) => {
    try {
        const [sections] = await db.execute(`SELECT id, name FROM sections`);

        // Para cada sección, obtener sus proyectos relacionados
        for (const section of sections) {
            const [projects] = await db.execute(`
                SELECT id, project_name AS title, project_description AS description, project_image AS image
                FROM projects
                WHERE section_id = ?
            `, [section.id]);

            section.projects = projects;
        }

        console.log("🟢 Secciones obtenidas:", sections);
        res.json(sections);
    } catch (error) {
        console.error("❌ Error al obtener secciones:", error);
        res.status(500).json({ message: "Error al obtener secciones", error });
    }
});

app.put('/api/sections/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const [sections] = await db.execute(`SELECT * FROM sections WHERE id = ?`, [id]);
        if (sections.length === 0) {
            return res.status(404).json({ message: "Sección no encontrada." });
        }

        const updates = [];
        const values = [];

        if (name) {
            updates.push("name = ?");
            values.push(name);
        }

        if (req.file) {
            const oldImage = sections[0].image_url;
            if (oldImage) {
                const oldPath = path.join(__dirname, 'media', 'images', path.basename(oldImage));
                await fs.remove(oldPath);
            }
            updates.push("image_url = ?");
            values.push(`/media/images/${req.file.filename}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar." });
        }

        values.push(id);
        await db.execute(`UPDATE sections SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({ message: "Sección actualizada correctamente." });
    } catch (error) {
        console.error("❌ Error al actualizar sección:", error);
        res.status(500).json({ message: "Error al actualizar sección", error });
    }
});

app.delete('/api/sections/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [projects] = await db.execute(`SELECT id FROM projects WHERE section_id = ?`, [id]);
        if (projects.length > 0) {
            return res.status(400).json({ message: "No puedes eliminar esta sección porque tiene proyectos asociados." });
        }

        const [sections] = await db.execute(`SELECT image_url FROM sections WHERE id = ?`, [id]);
        if (sections.length === 0) {
            return res.status(404).json({ message: "Sección no encontrada." });
        }

        if (sections[0].image_url) {
            const imagePath = path.join(__dirname, 'media', 'images', path.basename(sections[0].image_url));
            await fs.remove(imagePath);
            console.log(`🗑 Imagen de sección eliminada: ${imagePath}`);
        }

        await db.execute(`DELETE FROM sections WHERE id = ?`, [id]);
        res.json({ message: "Sección eliminada correctamente." });
    } catch (error) {
        console.error("❌ Error al eliminar sección:", error);
        res.status(500).json({ message: "Error al eliminar sección", error });
    }
});
// 🔹 ADAVANTAGES (SECCION DE VENTAJAS)

// 🔹 **Obtener todas las ventajas de un proyecto**
app.get('/api/projects/:project_id/advantages', async (req, res) => {
    try {
        const project_id = Number(req.params.project_id);

        if (!project_id || isNaN(project_id)) {
            return res.status(400).json({ message: "Error: `project_id` es inválido." });
        }
        
        const [advantages] = await db.execute(
            `SELECT * FROM advantages WHERE project_id = ?`, 
            [project_id]
        );

        res.json(advantages);
    } catch (error) {
        console.error("❌ Error al obtener ventajas:", error);
        res.status(500).json({ message: "Error al obtener ventajas", error });
    }
});

// 🔹 **Agregar una nueva ventaja a un proyecto**
app.post('/api/projects/:project_id/advantages', async (req, res) => {
    try {
        const { project_id } = req.params;
        const { section_title, section_subtitle, title, description, icon, stat } = req.body;

        if (!title || !description || !icon || !stat) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        await db.execute(
            `INSERT INTO advantages (project_id, section_title, section_subtitle, title, description, icon, stat) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [project_id, section_title, section_subtitle, title, description, JSON.stringify(icon), stat] // ✅ Guardar `icon` como string
        );
        

        res.status(201).json({ message: "Ventaja agregada con éxito" });
    } catch (error) {
        console.error("❌ Error al agregar ventaja:", error);
        res.status(500).json({ message: "Error al agregar ventaja", error });
    }
});

// 🔹 **Actualizar una ventaja existente**
app.put('/api/projects/:project_id/advantages/:id', async (req, res) => {
    try {
        const { id, project_id } = req.params;
        const { section_title, section_subtitle, title, description, icon, stat } = req.body;

        const updates = [];
        const values = [];

        if (section_title !== undefined) {
            updates.push("section_title = ?");
            values.push(section_title);
        }
        if (section_subtitle !== undefined) {
            updates.push("section_subtitle = ?");
            values.push(section_subtitle);
        }
        if (title) {
            updates.push("title = ?");
            values.push(title);
        }
        if (description) {
            updates.push("description = ?");
            values.push(description);
        }
        if (icon) {
            updates.push("icon = ?");
            values.push(icon);
        }
        if (stat) {
            updates.push("stat = ?");
            values.push(stat);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        values.push(id, project_id);

        await db.execute(
            `UPDATE advantages SET ${updates.join(', ')} WHERE id = ? AND project_id = ?`,
            values
        );

        res.json({ message: "Ventaja actualizada con éxito" });
    } catch (error) {
        console.error("❌ Error al actualizar ventaja:", error);
        res.status(500).json({ message: "Error al actualizar ventaja", error });
    }
});

// 🔹 **Eliminar una ventaja**
app.delete('/api/projects/:project_id/advantages/:id', async (req, res) => {
    try {
        const { id, project_id } = req.params;

        await db.execute(`DELETE FROM advantages WHERE id = ? AND project_id = ?`, [id, project_id]);

        res.json({ message: "Ventaja eliminada con éxito" });
    } catch (error) {
        console.error("❌ Error al eliminar ventaja:", error);
        res.status(500).json({ message: "Error al eliminar ventaja", error });
    }
});

// =======================================
// RUTAS PARA "project_config"
// =======================================

// (A) OBTENER LA CONFIGURACIÓN DE UN PROYECTO
app.get('/api/projects/:project_id/config', async (req, res) => {
    try {
      const { project_id } = req.params;
  
      // Buscar si existe una fila de configuración para ese proyecto
      const [rows] = await db.execute(
        `SELECT * FROM project_config WHERE project_id = ?`,
        [project_id]
      );
  
      if (rows.length === 0) {
        // Si no existe config, devolvemos 404 (o podrías crearla por defecto aquí)
        return res.status(404).json({
          message: "No hay configuración para este proyecto."
        });
      }
  
      // Devolver el objeto de configuración (hay solo una fila por proyecto)
      res.json(rows[0]);
    } catch (error) {
      console.error("❌ Error al obtener configuración de proyecto:", error);
      res.status(500).json({ message: "Error interno al obtener configuración", error });
    }
  });
  
  // (B) CREAR CONFIGURACIÓN PARA UN PROYECTO
  app.post('/api/projects/:project_id/config', async (req, res) => {
    try {
      const { project_id } = req.params;
      const {
        showAdvantages = 0,
        showFeatures = 0,
        showWorkflow = 0,
        showTeam = 0,
        showContact = 0,
        showImpacto = 0,
        showInvestigacion = 0
      } = req.body;  // Banderas que envíes desde tu frontend
  
      // Verificar si ya existe config para ese proyecto
      const [existing] = await db.execute(
        `SELECT config_id FROM project_config WHERE project_id = ?`,
        [project_id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ 
          message: "Ya existe una configuración para este proyecto." 
        });
      }
  
      await db.execute(
        `INSERT INTO project_config 
   (project_id, showAdvantages, showFeatures, showWorkflow, showTeam, showContact, showImpacto, showInvestigacion)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project_id,
          showAdvantages,
          showFeatures,
          showWorkflow,
          showTeam,
          showContact,
          showImpacto,
          showInvestigacion
        ]
      );
  
      res.status(201).json({
        message: "Configuración creada con éxito",
        config: {
          project_id,
          showAdvantages,
          showFeatures,
          showWorkflow,
          showTeam,
          showContact,
          showImpacto,
    showInvestigacion
        }
      });
    } catch (error) {
      console.error("❌ Error al crear configuración:", error);
      res.status(500).json({ message: "Error interno al crear configuración", error });
    }
  });
  
  // (C) ACTUALIZAR LA CONFIGURACIÓN DE UN PROYECTO
  app.put('/api/projects/:project_id/config', async (req, res) => {
    try {
      const { project_id } = req.params;
      const {
        showAdvantages,
        showFeatures,
        showWorkflow,
        showTeam,
        showContact,
        showImpacto,
    showInvestigacion
      } = req.body;
  
      // Construir consulta dinámica
      const fields = [];
      const values = [];
  
      if (showAdvantages !== undefined) {
        fields.push("showAdvantages = ?");
        values.push(showAdvantages);
      }
      if (showFeatures !== undefined) {
        fields.push("showFeatures = ?");
        values.push(showFeatures);
      }
      if (showWorkflow !== undefined) {
        fields.push("showWorkflow = ?");
        values.push(showWorkflow);
      }
      if (showTeam !== undefined) {
        fields.push("showTeam = ?");
        values.push(showTeam);
      }
      if (showContact !== undefined) {
        fields.push("showContact = ?");
        values.push(showContact);
      }
      if (showImpacto !== undefined) {
        fields.push("showImpacto = ?");
        values.push(showImpacto);
      }
      if (showInvestigacion !== undefined) {
        fields.push("showInvestigacion = ?");
        values.push(showInvestigacion);
      }
      
  
      if (fields.length === 0) {
        return res.status(400).json({ message: "No hay campos para actualizar" });
      }
  
      values.push(project_id);
  
      // Verificar si la fila existe
      const [existing] = await db.execute(
        `SELECT config_id FROM project_config WHERE project_id = ?`,
        [project_id]
      );
      if (existing.length === 0) {
        return res.status(404).json({ 
          message: "No existe configuración para este proyecto" 
        });
      }
  
      // Actualizar
      await db.execute(
        `UPDATE project_config 
         SET ${fields.join(', ')}
         WHERE project_id = ?`,
        values
      );
  
      res.json({
        message: "Configuración actualizada con éxito",
        updatedFields: req.body
      });
    } catch (error) {
      console.error("❌ Error al actualizar configuración:", error);
      res.status(500).json({ message: "Error interno al actualizar configuración", error });
    }
  });
  
  // (D) ELIMINAR CONFIGURACIÓN DE UN PROYECTO (OPCIONAL)
  app.delete('/api/projects/:project_id/config', async (req, res) => {
    try {
      const { project_id } = req.params;
  
      const [existing] = await db.execute(
        `SELECT config_id FROM project_config WHERE project_id = ?`,
        [project_id]
      );
  
      if (existing.length === 0) {
        return res.status(404).json({
          message: "No existe configuración para este proyecto"
        });
      }
  
      await db.execute(
        `DELETE FROM project_config WHERE project_id = ?`,
        [project_id]
      );
  
      res.json({ message: "Configuración eliminada con éxito" });
    } catch (error) {
      console.error("❌ Error al eliminar configuración:", error);
      res.status(500).json({ message: "Error interno al eliminar configuración", error });
    }
  });
  


// 🔹 **Subir media (imagen o video)**
// 🔹 Ruta para subir solo videos a `media/videos/`
app.post('/api/features/upload', upload.single('media'), async (req, res) => { 
    if (!req.file) {
        return res.status(400).json({ message: '❌ Archivo no recibido' });
    }

    const fileUrl = `/media/videos/${req.file.filename}`;
    console.log("✅ Archivo de video subido correctamente:", fileUrl);

    res.json({
        message: '✅ Archivo subido con éxito',
        fileUrl // ✅ Enviar la URL generada
    });
});


// 🔹 **Crear un feature asegurando que los videos se guarden en `media/videos/`**
app.post('/api/projects/:project_id/features', upload.single('media'), async (req, res) => {
    try {
        console.log("🔍 Datos recibidos en el backend:", req.body);
        console.log("🔍 project_id recibido en params:", req.params.project_id);
        console.log("🔍 Archivo recibido:", req.file);

        const project_id = Number(req.params.project_id);
        if (!project_id || isNaN(project_id)) {
            return res.status(400).json({ message: "❌ Error: `project_id` es inválido." });
        }

        const { title, subtitle, icon_key, media_type } = req.body;

        if (!title  || !media_type) {
            return res.status(400).json({ message: "❌ Error: Título, descripción y tipo de media son obligatorios." });
        }

        // ✅ Verificar si `req.file` existe antes de asignar la URL
        const media_url = req.file ? `/media/videos/${req.file.filename}` : null;
        console.log("✅ URL del archivo que se guardará en la BD:", media_url);

        // ✅ Insertar el feature en la base de datos con `media_url`
        const [result] = await db.execute(
            `INSERT INTO features (project_id, title, subtitle, icon_key, media_type, media_url) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [project_id, title, subtitle ?? null, icon_key ?? null, media_type, media_url]
        );
        

        console.log("✅ Registro insertado con éxito en la base de datos:", result);

        res.status(201).json({ message: "✅ Feature creado con éxito", media_url });

    } catch (error) {
        console.error("❌ Error al crear feature:", error);
        res.status(500).json({ message: "Error al crear feature", error });
    }
});


// 🔹 **Obtener features de un proyecto**
app.get('/api/projects/:project_id/features', async (req, res) => {
    try {
        const { project_id } = req.params;
        console.log("🔍 Obteniendo features para project_id:", project_id);

        if (!project_id) {
            return res.status(400).json({ message: "❌ project_id es requerido." });
        }

        const [features] = await db.execute(`SELECT * FROM features WHERE project_id = ?`, [project_id]);

        if (features.length === 0) {
            console.warn("⚠ No se encontraron features.");
        }

        res.json(features);
    } catch (error) {
        console.error("❌ Error al obtener features:", error);
        res.status(500).json({ message: "Error al obtener features", error });
    }
});
// 🔹 **Actualizar un feature**
app.put('/api/features/:id', upload.single('media'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, description, stat, icon_key, media_type } = req.body;
        const media_url = req.file ? `/media/${media_type === 'image' ? 'images' : 'videos'}/${req.file.filename}` : null;

        const updates = [];
        const values = [];

        if (title) { updates.push("title = ?"); values.push(title); }
        if (subtitle) { updates.push("subtitle = ?"); values.push(subtitle); }
        if (description) { updates.push("description = ?"); values.push(description); }
        if (stat) { updates.push("stat = ?"); values.push(stat); }
        if (icon_key) { updates.push("icon_key = ?"); values.push(icon_key); }
        if (media_url) { updates.push("media_url = ?"); values.push(media_url); }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        values.push(id);
        await db.execute(`UPDATE features SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({ message: "Feature actualizado con éxito" });
    } catch (error) {
        console.error("❌ Error al actualizar feature:", error);
        res.status(500).json({ message: "Error al actualizar feature", error });
    }
});

// 🔹 **Eliminar un feature**
app.delete('/api/features/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener la URL del archivo multimedia antes de eliminar el feature
        const [feature] = await db.execute(`SELECT media_url FROM features WHERE id = ?`, [id]);

        if (feature.length === 0) {
            return res.status(404).json({ message: "Feature no encontrado" });
        }

        // Eliminar el archivo multimedia si existe
        if (feature[0].media_url) {
            const mediaFile = path.basename(feature[0].media_url); // Extraer solo el nombre
            const folder = feature[0].media_url.includes('/videos/') ? 'videos' : 'images'; // Verificar carpeta
            const filePath = path.join(__dirname, 'media', folder, mediaFile); // Ruta absoluta

            await fs.remove(filePath);
            console.log(`🗑 Archivo multimedia eliminado: ${filePath}`);
        }

        // Eliminar el feature de la base de datos
        await db.execute(`DELETE FROM features WHERE id = ?`, [id]);

        res.json({ message: "Feature eliminado con éxito" });
    } catch (error) {
        console.error("❌ Error al eliminar feature:", error);
        res.status(500).json({ message: "Error al eliminar feature", error });
    }
});
// 🔹 **Obtener estadísticas de un proyecto**
app.get('/api/projects/:project_id/stats', async (req, res) => {
    try {
        const { project_id } = req.params;
        console.log("🔍 Obteniendo stats para project_id:", project_id);

        if (!project_id) {
            return res.status(400).json({ message: "❌ project_id es requerido." });
        }

        const [stats] = await db.execute(`SELECT * FROM stats WHERE project_id = ?`, [project_id]);

        if (stats.length === 0) {
            console.warn("⚠ No se encontraron stats.");
        }

        res.json(stats);
    } catch (error) {
        console.error("❌ Error al obtener stats:", error);
        res.status(500).json({ message: "Error al obtener stats", error });
    }
});
// 🔹 **Agregar una nueva estadística**
app.post('/api/projects/:project_id/stats', async (req, res) => {
    try {
        const { project_id } = req.params;
        const { icon_key, title, text } = req.body;

        if (!icon_key || !title || !text) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        await db.execute(
            `INSERT INTO stats (project_id, icon_key, title, text) VALUES (?, ?, ?, ?)`,
            [project_id, icon_key, title, text]
        );

        res.status(201).json({ message: "Stat agregado con éxito" });
    } catch (error) {
        console.error("❌ Error al agregar stat:", error);
        res.status(500).json({ message: "Error al agregar stat", error });
    }
});

// 🔹 **Actualizar una estadística**
app.put('/api/stats/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { icon_key, title, text } = req.body;

        await db.execute(`UPDATE stats SET icon_key = ?, title = ?, text = ? WHERE id = ?`, [icon_key, title, text, id]);

        res.json({ message: "Stat actualizado con éxito" });
    } catch (error) {
        console.error("❌ Error al actualizar stat:", error);
        res.status(500).json({ message: "Error al actualizar stat", error });
    }
});

// 🔹 **Eliminar una estadística**
app.delete('/api/stats/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(`DELETE FROM stats WHERE id = ?`, [id]);

        res.json({ message: "Stat eliminado con éxito" });
    } catch (error) {
        console.error("❌ Error al eliminar stat:", error);
        res.status(500).json({ message: "Error al eliminar stat", error });
    }
});

// 🔹 **OBTENER EXTRAS DE UN PROYECTO**
app.get('/api/projects/:project_id/extras', async (req, res) => {
    try {
        const { project_id } = req.params;

        if (!project_id || isNaN(Number(project_id))) {
            return res.status(400).json({ message: "❌ Error: `project_id` inválido." });
        }

        const [extras] = await db.execute(
            `SELECT * FROM project_feature_extras WHERE project_id = ?`,
            [project_id]
        );

        res.json(extras);
    } catch (error) {
        console.error("❌ Error al obtener extras:", error);
        res.status(500).json({ message: "Error al obtener extras", error });
    }
});

// 🔹 **AGREGAR UN EXTRA A UN PROYECTO**
app.post('/api/projects/:project_id/extras', async (req, res) => {
    try {
        const { project_id } = req.params;
        const { title, stat, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "❌ Error: El título es obligatorio." });
        }

        const [result] = await db.execute(
            `INSERT INTO project_feature_extras (project_id, title, stat, description) 
             VALUES (?, ?, ?, ?)`,
            [project_id, title, stat || null, description || null]
        );

        res.status(201).json({
            message: "✅ Extra agregado con éxito",
            id: result.insertId,
        });
    } catch (error) {
        console.error("❌ Error al agregar extra:", error);
        res.status(500).json({ message: "Error al agregar extra", error });
    }
});

// 🔹 **ACTUALIZAR UN EXTRA**
app.put('/api/extras/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, stat, description } = req.body;

        const updates = [];
        const values = [];

        if (title) { updates.push("title = ?"); values.push(title); }
        if (stat !== undefined) { updates.push("stat = ?"); values.push(stat); }
        if (description !== undefined) { updates.push("description = ?"); values.push(description); }

        if (updates.length === 0) {
            return res.status(400).json({ message: "❌ No hay datos para actualizar." });
        }

        values.push(id);

        await db.execute(
            `UPDATE project_feature_extras SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: "✅ Extra actualizado con éxito" });
    } catch (error) {
        console.error("❌ Error al actualizar extra:", error);
        res.status(500).json({ message: "Error al actualizar extra", error });
    }
});

// 🔹 **ELIMINAR UN EXTRA**
app.delete('/api/extras/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute(`DELETE FROM project_feature_extras WHERE id = ?`, [id]);

        res.json({ message: "✅ Extra eliminado con éxito" });
    } catch (error) {
        console.error("❌ Error al eliminar extra:", error);
        res.status(500).json({ message: "Error al eliminar extra", error });
    }
});


// =======================================
// RUTAS PARA "team_members"
// =======================================
// Rutas para miembros del equipo

// Obtener todos los miembros de un proyecto
app.get('/api/projects/:project_id/team-members', async (req, res) => {
    try {
      const { project_id } = req.params;
      const [rows] = await db.execute('SELECT * FROM team_members WHERE project_id = ?', [project_id]);
      res.json(rows);
    } catch (error) {
      console.error('❌ Error al obtener miembros del equipo:', error);
      res.status(500).json({ message: 'Error al obtener miembros del equipo', error });
    }
  });
  
  // Subir avatar
  app.post('/api/team-members/upload-avatar', upload.single('avatar'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Archivo no recibido' });
    const avatarUrl = `/media/images/${req.file.filename}`;
    res.json({ message: 'Avatar subido correctamente', avatarUrl });
  });
  
  // Crear nuevo miembro
  app.post('/api/projects/:project_id/team', upload.single('avatar'), async (req, res) => {
    const { project_id } = req.params;
    const { name, role, bio } = req.body;
    const avatarPath = req.file ? `/media/images/${req.file.filename}` : null;
  
    if (!name || !role || !bio || !avatarPath) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }
  
    const [result] = await db.execute(
      `INSERT INTO team_members (project_id, name, role, bio, avatar) VALUES (?, ?, ?, ?, ?)`,
      [project_id, name, role, bio, avatarPath]
    );
  
    res.status(201).json({
      id: result.insertId,
      project_id,
      name,
      role,
      bio,
      avatar: avatarPath,
    });
  });
  
  // Actualizar miembro
 app.put("/api/team-members/:id", upload.single("avatar"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio } = req.body;
    const avatarFile = req.file;

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (role) {
      updates.push("role = ?");
      values.push(role);
    }
    if (bio) {
      updates.push("bio = ?");
      values.push(bio);
    }
    if (avatarFile) {
        const avatarPath = `/media/images/${avatarFile.filename}`;
        updates.push("avatar = ?");
        values.push(avatarPath);
      } else if (req.body.avatar) {
        // 🟢 Siempre guardar como está (la URL completa)
        updates.push("avatar = ?");
        values.push(req.body.avatar);
      }
      

    if (updates.length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }

    values.push(id);
    await db.execute(`UPDATE team_members SET ${updates.join(", ")} WHERE id = ?`, values);

    res.json({ message: "Miembro actualizado con éxito" });
  } catch (error) {
    console.error("❌ Error al actualizar miembro:", error);
    res.status(500).json({ message: "Error al actualizar miembro", error });
  }
});
  // Eliminar miembro
  app.delete('/api/team-members/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener la URL del avatar antes de eliminar
        const [rows] = await db.execute('SELECT avatar FROM team_members WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Miembro no encontrado" });
        }

        const avatarUrl = rows[0].avatar;

        // Si tiene avatar, eliminar el archivo físico
        if (avatarUrl) {
            const avatarFile = path.basename(avatarUrl);
            const filePath = path.join(__dirname, 'media', 'images', avatarFile);
            await fs.remove(filePath);
            console.log(`🗑 Avatar eliminado: ${filePath}`);
        }

        // Eliminar de la base de datos
        await db.execute('DELETE FROM team_members WHERE id = ?', [id]);

        res.json({ message: '✅ Miembro eliminado con éxito' });
    } catch (error) {
        console.error('❌ Error al eliminar miembro:', error);
        res.status(500).json({ message: 'Error al eliminar miembro', error });
    }
});

  // 📦 WORKFLOW: Título y Subtítulo
app.get('/api/projects/:project_id/workflow', async (req, res) => {
    const { project_id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM workflow WHERE project_id = ?', [project_id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Workflow no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el workflow', error });
    }
});

app.post('/api/projects/:project_id/workflow', async (req, res) => {
    const { project_id } = req.params;
    const { title, subtitle } = req.body;
    try {
        const [existing] = await db.execute('SELECT id FROM workflow WHERE project_id = ?', [project_id]);
        if (existing.length > 0) {
            await db.execute('UPDATE workflow SET title = ?, subtitle = ? WHERE project_id = ?', [title, subtitle, project_id]);
        } else {
            await db.execute('INSERT INTO workflow (project_id, title, subtitle) VALUES (?, ?, ?)', [project_id, title, subtitle]);
        }
        res.json({ message: 'Workflow guardado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar el workflow', error });
    }
});

app.put('/api/projects/:project_id/workflow', async (req, res) => {
    const { project_id } = req.params;
    const { title, subtitle } = req.body;
    try {
        await db.execute('UPDATE workflow SET title = ?, subtitle = ? WHERE project_id = ?', [title, subtitle, project_id]);
        res.json({ message: 'Workflow actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el workflow', error });
    }
});

app.delete('/api/projects/:project_id/workflow', async (req, res) => {
    const { project_id } = req.params;
    try {
        await db.execute('DELETE FROM workflow WHERE project_id = ?', [project_id]);
        res.json({ message: 'Workflow eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el workflow', error });
    }
});

// 📦 WORKFLOW STEPS
app.get('/api/projects/:project_id/workflow-steps', async (req, res) => {
    const { project_id } = req.params;
    try {
        const [steps] = await db.execute('SELECT * FROM workflow_steps WHERE project_id = ? ORDER BY step_number ASC', [project_id]);
        res.json(steps);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pasos del workflow', error });
    }
});

app.post('/api/projects/:project_id/workflow-steps', upload.single('image'), async (req, res) => {
    const { project_id } = req.params;
    const { title, description, step_number } = req.body;
    const image_url = req.file ? `/media/images/${req.file.filename}` : null;
    try {
        await db.execute(
            'INSERT INTO workflow_steps (project_id, step_number, title, description, image_url) VALUES (?, ?, ?, ?, ?)',
            [project_id, step_number, title, description, image_url]
        );
        res.status(201).json({ message: 'Paso agregado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar paso', error });
    }
});

app.put('/api/projects/:project_id/workflow-steps/:id', upload.single('image'), async (req, res) => {
    const { project_id, id } = req.params;
    const { title, description, step_number } = req.body;
    const image_url = req.file ? `/media/images/${req.file.filename}` : null;
    const updates = [];
    const values = [];

    if (title) { updates.push('title = ?'); values.push(title); }
    if (description) { updates.push('description = ?'); values.push(description); }
    if (step_number) { updates.push('step_number = ?'); values.push(step_number); }
    if (image_url) { updates.push('image_url = ?'); values.push(image_url); }

    if (updates.length === 0) return res.status(400).json({ message: 'No hay datos para actualizar' });

    values.push(id, project_id);
    try {
        await db.execute(`UPDATE workflow_steps SET ${updates.join(', ')} WHERE id = ? AND project_id = ?`, values);
        res.json({ message: 'Paso actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar paso', error });
    }
});

app.delete('/api/projects/:project_id/workflow-steps/:id', async (req, res) => {
    const { id, project_id } = req.params;

    try {
        // Obtener la URL de la imagen antes de eliminar
        const [rows] = await db.execute(
            'SELECT image_url FROM workflow_steps WHERE id = ? AND project_id = ?',
            [id, project_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Paso no encontrado' });
        }

        const imageUrl = rows[0].image_url;

        // Eliminar la imagen si existe
        if (imageUrl) {
            const imageFile = path.basename(imageUrl); // solo el nombre del archivo
            const filePath = path.join(__dirname, 'media', 'images', imageFile);
            await fs.remove(filePath);
            console.log(`🗑 Imagen de paso eliminada: ${filePath}`);
        }

        // Eliminar el paso de la base de datos
        await db.execute('DELETE FROM workflow_steps WHERE id = ? AND project_id = ?', [id, project_id]);

        res.json({ message: '✅ Paso eliminado con éxito' });
    } catch (error) {
        console.error("❌ Error al eliminar paso:", error);
        res.status(500).json({ message: 'Error al eliminar paso', error });
    }
});

// 🔹 IMPACTO
app.get('/api/projects/:project_id/impacto', async (req, res) => {
    try {
        const { project_id } = req.params;
        const [impactos] = await db.execute(`SELECT * FROM project_impact WHERE project_id = ?`, [project_id]);
        res.json(impactos);
    } catch (error) {
        console.error("❌ Error al obtener impacto:", error);
        res.status(500).json({ message: "Error al obtener impacto", error });
    }
});

app.post('/api/projects/:project_id/impacto', upload.single('image'), async (req, res) => {
    try {
        const { project_id } = req.params;
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Título y descripción son obligatorios" });
        }

        const image_url = req.file ? `/media/images/${req.file.filename}` : null;
        await db.execute(
            `INSERT INTO project_impact (project_id, title, description, image_url) VALUES (?, ?, ?, ?)`,
            [project_id, title, description, image_url]
        );

        res.status(201).json({ message: "Impacto agregado con éxito" });
    } catch (error) {
        console.error("❌ Error al agregar impacto:", error);
        res.status(500).json({ message: "Error al agregar impacto", error });
    }
});

app.put('/api/projects/:project_id/impacto/:id', upload.single('image'), async (req, res) => {
    try {
        const { id, project_id } = req.params;
        const { title, description } = req.body;

        const updates = [];
        const values = [];

        if (title) { updates.push("title = ?"); values.push(title); }
        if (description) { updates.push("description = ?"); values.push(description); }
        if (req.file) {
            const image_url = `/media/images/${req.file.filename}`;
            updates.push("image_url = ?");
            values.push(image_url);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        values.push(id, project_id);
        await db.execute(`UPDATE project_impact SET ${updates.join(', ')} WHERE id = ? AND project_id = ?`, values);

        res.json({ message: "Impacto actualizado con éxito" });
    } catch (error) {
        console.error("❌ Error al actualizar impacto:", error);
        res.status(500).json({ message: "Error al actualizar impacto", error });
    }
});

app.delete('/api/projects/:project_id/impacto/:id', async (req, res) => {
    try {
        const { id, project_id } = req.params;

        const [rows] = await db.execute(`SELECT image_url FROM project_impact WHERE id = ? AND project_id = ?`, [id, project_id]);
        if (rows.length > 0 && rows[0].image_url) {
            const filePath = path.join(__dirname, rows[0].image_url);
            await fs.remove(filePath);
        }

        await db.execute(`DELETE FROM project_impact WHERE id = ? AND project_id = ?`, [id, project_id]);
        res.json({ message: "Impacto eliminado con éxito" });
    } catch (error) {
        console.error("❌ Error al eliminar impacto:", error);
        res.status(500).json({ message: "Error al eliminar impacto", error });
    }
});

// 🔹 INVESTIGACIONES
app.get('/api/projects/:project_id/investigaciones', async (req, res) => {
    try {
        const { project_id } = req.params;
        const [rows] = await db.execute(`SELECT * FROM project_research WHERE project_id = ?`, [project_id]);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener investigaciones:", error);
        res.status(500).json({ message: "Error al obtener investigaciones", error });
    }
});

app.post('/api/projects/:project_id/investigaciones', async (req, res) => {
    try {
        const { project_id } = req.params;
        const { title, link, copyright } = req.body;

        if (!title || !link) {
            return res.status(400).json({ message: "Título y enlace son obligatorios" });
        }

        await db.execute(
            `INSERT INTO project_research (project_id, title, link, copyright) VALUES (?, ?, ?, ?)`,
            [project_id, title, link, copyright || 'CC']
        );

        res.status(201).json({ message: "Investigación agregada con éxito" });
    } catch (error) {
        console.error("❌ Error al agregar investigación:", error);
        res.status(500).json({ message: "Error al agregar investigación", error });
    }
});

app.put('/api/projects/:project_id/investigaciones/:id', async (req, res) => {
    try {
        const { id, project_id } = req.params;
        const { title, link, copyright } = req.body;

        const updates = [];
        const values = [];

        if (title) { updates.push("title = ?"); values.push(title); }
        if (link) { updates.push("link = ?"); values.push(link); }
        if (copyright) { updates.push("copyright = ?"); values.push(copyright); }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        values.push(id, project_id);
        await db.execute(`UPDATE project_research SET ${updates.join(', ')} WHERE id = ? AND project_id = ?`, values);

        res.json({ message: "Investigación actualizada con éxito" });
    } catch (error) {
        console.error("❌ Error al actualizar investigación:", error);
        res.status(500).json({ message: "Error al actualizar investigación", error });
    }
});

app.delete('/api/projects/:project_id/investigaciones/:id', async (req, res) => {
    try {
        const { id, project_id } = req.params;
        await db.execute(`DELETE FROM project_research WHERE id = ? AND project_id = ?`, [id, project_id]);
        res.json({ message: "Investigación eliminada con éxito" });
    } catch (error) {
        console.error("❌ Error al eliminar investigación:", error);
        res.status(500).json({ message: "Error al eliminar investigación", error });
    }
});



// 🔹 **CRUD Genérico para Tablas (excepto `users`)**
const tables = [
    'projects',
    'advantages',
    'features',
    'technical_icons',
    'workflow_steps',
    'team_members',
    'stats', 
    'media_files',
    'contact_info'
];

// **Obtener todos los registros**
app.get('/api/:table', async (req, res) => {
    const { table } = req.params;
    if (!tables.includes(table)) return res.status(400).json({ message: 'Tabla no permitida' });

    try {
        const [rows] = await db.execute(`SELECT * FROM ${table}`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener registros', error });
    }
});

// **Obtener un registro por ID**
app.get('/api/:table/:id', async (req, res) => {
    const { table, id } = req.params;
    if (!tables.includes(table)) return res.status(400).json({ message: 'Tabla no permitida' });

    try {
        const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener registro', error });
    }
});

// **Agregar un nuevo registro**
app.post('/api/:table', async (req, res) => {
    const { table } = req.params;
    if (!tables.includes(table)) return res.status(400).json({ message: 'Tabla no permitida' });

    const columns = Object.keys(req.body).join(', ');
    const values = Object.values(req.body);
    const placeholders = values.map(() => '?').join(', ');

    try {
        await db.execute(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values);
        res.status(201).json({ message: 'Registro agregado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar registro', error });
    }
});

// **Editar un registro**
app.put('/api/:table/:id', async (req, res) => {
    const { table, id } = req.params;
    if (!tables.includes(table)) return res.status(400).json({ message: 'Tabla no permitida' });

    const updates = Object.keys(req.body).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(req.body), id];

    try {
        await db.execute(`UPDATE ${table} SET ${updates} WHERE id = ?`, values);
        res.json({ message: 'Registro actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar registro', error });
    }
});

// **Eliminar un registro**
app.delete('/api/:table/:id', async (req, res) => {
    const { table, id } = req.params;
    if (!tables.includes(table)) return res.status(400).json({ message: 'Tabla no permitida' });

    try {
        await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
        res.json({ message: 'Registro eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar registro', error });
    }
});

// **Subir un archivo**
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Archivo no recibido' });

    const fileUrl = `/media/${req.file.destination.includes('images') ? 'images' : 'videos'}/${req.file.filename}`;
    res.json({ message: 'Archivo subido con éxito', fileUrl });
});


// 🔹 **Iniciar el Servidor**
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});