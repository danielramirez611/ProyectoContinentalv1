import axios from 'axios';

// Configuración base para las solicitudes HTTP
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Función genérica para solicitudes HTTP con manejo de errores
export const makeRequest = async (method, endpoint, data = {}, token = null) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

 // Eliminar posibles referencias circulares
 const safeData = JSON.parse(JSON.stringify(data, (key, value) => {
  if (typeof value === "object" && value !== null && key !== "icon") {
    return value;
  }
  return String(value);
}));
    const response = await api({
      method,
      url: endpoint,
      data: safeData,
      headers,
    });

    return response.data;
  } catch (err) {
    console.error(`❌ Error en ${method.toUpperCase()} ${endpoint}:`, err.response?.data || err.message);
    throw err;
  }
};

////////////////////////////
// 🔹 **LOGIN API Calls**
////////////////////////////
// 🔹 **Autenticación (Login)**
export const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Correo y contraseña son requeridos');
  }
  return makeRequest('post', '/login', { email, password });
};

// 🔹 **Verificar sesión (Requiere Token)**
export const verifySession = async (token) => {
  if (!token) {
    throw new Error('Token no disponible');
  }
  return makeRequest('get', '/verify', {}, token);
};



////////////////////////////
// 🔹 **PROYECTOS (GRILLA) API Calls**
////////////////////////////
// 🔹 **Subir imagen antes de crear un proyecto**
export const uploadProjectImage = async (file, token) => {
  if (!file) throw new Error('Archivo de imagen requerido');

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post('/projects/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.fileUrl; // Retorna la URL de la imagen subida
  } catch (err) {
    console.error('❌ Error al subir la imagen:', err);
    throw err;
  }
};

// 🔹 **Crear un proyecto con imagen**
export const createProject = async (projectData, file, token) => {
  try {
    if (!projectData.title || !projectData.category || !file) {
      throw new Error('Todos los campos son obligatorios');
    }

    const formData = new FormData();
    formData.append("title", projectData.title);
    formData.append("category", projectData.category);
    formData.append("description", projectData.description || "");
    formData.append("section_id", projectData.section_id); // 🔹 Asegurar que section_id se envíe
    formData.append("image", file); // 🔹 Enviar el archivo corr

    const response = await api.post('/projects', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (err) {
    console.error('❌ Error al crear proyecto:', err);
    throw err;
  }
};

// 🔹 **Actualizar un proyecto (incluye cambio de imagen)**
export const updateProject = async (id, projectData, file, token) => {
  try {
    const formData = new FormData();
    formData.append("title", projectData.title);
    formData.append("category", projectData.category);
    formData.append("description", projectData.description);
    formData.append("section_id", projectData.section_id);

    // ✅ Si hay una nueva imagen, se agrega al `FormData`
    if (file) {
      formData.append("image", file);
    }

    const response = await api.put(`/projects/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (err) {
    console.error("❌ Error al actualizar el proyecto:", err.response?.data || err.message);
    throw err;
  }
};

export const getLastProject = async () => {
  try {
    const response = await api.get('/projects/last');
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener el último proyecto:", error.response?.data || error.message);
    return null;
  }
};


// 🔹 **Eliminar un proyecto**
// 🔹 **Eliminar un proyecto**
export const deleteProject = async (id, token) => {
  try {
    // 1️⃣ Verificar si el proyecto existe antes de eliminarlo
    const existingProject = await getProjectById(id);
    if (!existingProject) {
      console.warn(`⚠ El proyecto con ID ${id} no existe o ya fue eliminado.`);
      return { message: "El proyecto no existe o ya fue eliminado." };
    }

    // 2️⃣ Proceder con la eliminación si existe
    return makeRequest('delete', `/projects/${id}`, {}, token);
  } catch (err) {
    console.error('❌ Error al eliminar proyecto:', err.response?.data || err.message);
    throw err;
  }
};

// 🔹 **Obtener todos los proyectos**
export const getProjects = async () => {
  return makeRequest('get', '/projects');
};

// 🔹 **Obtener un proyecto por ID**
export const getProjectById = async (id) => {
  return makeRequest('get', `/projects/${id}`);
};

////////////////////////////
// 🔹 **SECCIONES (GRILLA) API Calls**
////////////////////////////
export const getSections = async () => {
  const response = await makeRequest('get', '/sections');
  // Agrega un console.log para ver qué está devolviendo realmente la API
  console.log("Respuesta de la API:", response);
  return response;
};
export const createSection = async (nameObj, token) => {
  if (!nameObj || !nameObj.name || !nameObj.image) {
    throw new Error('El nombre y el icono son obligatorios');
  }

  try {
    const response = await api.post('/sections', 
      { name: nameObj.name, icon: nameObj.image }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error('❌ Error al crear sección:', err.response?.data || err.message);
    throw err;
  }
};




export const updateSection = async (id, name, token) => {
  if (!name) throw new Error('El nuevo nombre de la sección es obligatorio');

  return makeRequest('put', `/sections/${id}`, { name }, token);
};

export const deleteSection = async (id, token) => {
  return makeRequest('delete', `/sections/${id}`, {}, token);
};

////////////////////////////
// 🔹 **Ventajas (Advantages) API Calls**
////////////////////////////

// 🔹 **Obtener todas las ventajas de un proyecto**
export const getAdvantages = async (projectId) => {
  if (!projectId) {
    console.error("❌ Error: projectId es requerido en getAdvantages");
    return [];
  }
  
  return makeRequest('get', `/projects/${projectId}/advantages`);
};

// 🔹 **Agregar una nueva ventaja**
export const addAdvantage = async (projectId, advantageData, token) => {
  if (!advantageData.title || !advantageData.description || !advantageData.icon || !advantageData.stat) {
    throw new Error('Todos los campos son obligatorios');
  }

  return makeRequest('post', `/projects/${projectId}/advantages`, advantageData, token);
};

// 🔹 **Actualizar una ventaja existente**
export const updateAdvantage = async (projectId, advantageId, advantageData, token) => {
  return makeRequest('put', `/projects/${projectId}/advantages/${advantageId}`, advantageData, token);
};

export const deleteAdvantage = async (projectId, advantageId, token) => {
  if (!projectId || !advantageId) {
    throw new Error('❌ projectId y advantageId son requeridos para eliminar una ventaja');
  }

  return makeRequest('delete', `/projects/${projectId}/advantages/${advantageId}`, {}, token);
};

/////////////////////////////
// 🔹 **Project Config API Calls**
/////////////////////////////

// (1) OBTENER CONFIGURACIÓN DE UN PROYECTO
export const getProjectConfig = async (projectId, token) => {
  // GET /api/projects/:project_id/config
  if (!projectId) throw new Error('projectId es requerido para obtener configuración');
  return makeRequest('get', `/projects/${projectId}/config`, {}, token);
};

// (2) CREAR CONFIGURACIÓN PARA UN PROYECTO
export const createProjectConfig = async (projectId, configData, token) => {
  // POST /api/projects/:project_id/config
  if (!projectId) throw new Error('projectId es requerido para crear configuración');

  return makeRequest('post', `/projects/${projectId}/config`, configData, token);
};

// (3) ACTUALIZAR CONFIGURACIÓN DE UN PROYECTO
export const updateProjectConfig = async (projectId, configData, token) => {
  // PUT /api/projects/:project_id/config
  if (!projectId) throw new Error('projectId es requerido para actualizar configuración');

  return makeRequest('put', `/projects/${projectId}/config`, configData, token);
};

// (4) ELIMINAR CONFIGURACIÓN (OPCIONAL)
export const deleteProjectConfig = async (projectId, token) => {
  // DELETE /api/projects/:project_id/config
  if (!projectId) throw new Error('projectId es requerido para eliminar configuración');

  return makeRequest('delete', `/projects/${projectId}/config`, {}, token);
};


/////////////////////////////
// 🔹 **FEATURES API Calls**
/////////////////////////////

// 🔹 **Subir imagen o video para un feature**
export const uploadFeatureMedia = async (file, mediaType, token) => {
  if (!file) throw new Error('Archivo requerido');

  const formData = new FormData();
  formData.append('media', file);

  try {
      const response = await api.post('/features/upload', formData, {
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
          },
      });

      console.log("🔄 Respuesta del servidor al subir archivo:", response.data);

      if (!response.data.fileUrl) {
          throw new Error("No se recibió la URL del archivo subido.");
      }

      return response.data.fileUrl; // ✅ Devuelve la URL correctamente
  } catch (err) {
      console.error('❌ Error al subir archivo de feature:', err);
      throw err;
  }
};


// 🔹 **Crear un feature con imagen o video**
export const createFeature = async (projectId, featureData, file, token) => {
  try {
      if (!projectId || isNaN(Number(projectId))) {
          throw new Error("❌ Error: `projectId` es inválido antes de hacer la solicitud.");
      }

      if (!featureData.title  || !featureData.media_type) {
          throw new Error("❌ Título, descripción y tipo de media son obligatorios.");
      }

      const formData = new FormData();
      formData.append("title", featureData.title);
      formData.append("subtitle", featureData.subtitle || "");
      formData.append("icon_key", featureData.icon_key || "");
      formData.append("media_type", featureData.media_type);

      if (file) {
          formData.append("media", file);
      } else {
          console.error("❌ No se está adjuntando el archivo en la solicitud.");
      }

      console.log("📤 Enviando datos:", formData);

      const response = await api.post(`/projects/${projectId}/features`, formData, {
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
          },
      });

      return response.data;
  } catch (err) {
      console.error("❌ Error al crear feature:", err.response?.data || err.message);
      throw err;
  }
};


// 🔹 **Obtener todos los features de un proyecto**
export const getFeatures = async (projectId) => {
  return makeRequest('get', `/projects/${projectId}/features`);
};

// 🔹 **Actualizar un feature con opción de cambiar imagen o video**
export const updateFeature = async (featureId, featureData, file, token) => {
  try {
    const formData = new FormData();
    formData.append("title", featureData.title);
    formData.append("subtitle", featureData.subtitle);
    formData.append("icon_key", featureData.icon_key);
    formData.append("media_type", featureData.media_type);

    // ✅ Si hay una nueva imagen/video, se agrega al `FormData`
    if (file) {
      formData.append("media", file);
    }

    const response = await api.put(`/features/${featureId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (err) {
    console.error("❌ Error al actualizar el feature:", err.response?.data || err.message);
    throw err;
  }
};

// 🔹 **Eliminar un feature**
export const deleteFeature = async (featureId, token) => {
  return makeRequest('delete', `/features/${featureId}`, {}, token);
};

/////////////////////////////
// 🔹 **STATS API Calls**
/////////////////////////////

// 🔹 **Obtener todas las estadísticas de un proyecto**
export const getStats = async (projectId) => {
  return makeRequest('get', `/projects/${projectId}/stats`);
};

// 🔹 **Agregar una nueva estadística**
export const addStat = async (projectId, statData, token) => {
  if (!projectId || isNaN(Number(projectId))) {
    throw new Error("❌ Error: `projectId` es inválido antes de hacer la solicitud.");
  }

  return api.post(`/projects/${projectId}/stats`, statData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// 🔹 **Actualizar una estadística**
export const updateStat = async (statId, statData, token) => {
  return makeRequest('put', `/stats/${statId}`, statData, token);
};

// 🔹 **Eliminar una estadística**
export const deleteStat = async (statId, token) => {
  if (!statId) {
    throw new Error('❌ statId es requerido para eliminar una estadística');
  }

  return makeRequest('delete', `/stats/${statId}`, {}, token);
};

////////////////////////////
// 🔹 **PROYECTO FEATURE EXTRAS API Calls**
////////////////////////////
export const getProjectExtras = async (projectId) => {
  if (!projectId) {
    console.error("❌ Error: projectId es requerido en getProjectExtras");
    return [];
  }
  return makeRequest('get', `/projects/${projectId}/extras`);
};

export const addProjectExtra = async (projectId, extraData, token) => {
  if (!projectId || !extraData.title) {
    throw new Error('❌ Error: projectId y title son requeridos para agregar un extra');
  }
  return makeRequest('post', `/projects/${projectId}/extras`, extraData, token);
};

export const updateProjectExtra = async (extraId, extraData, token) => {
  if (!extraId) {
    throw new Error('❌ Error: extraId es requerido para actualizar un extra');
  }
  return makeRequest('put', `/extras/${extraId}`, extraData, token);
};

export const deleteProjectExtra = async (extraId, token) => {
  if (!extraId) {
    throw new Error('❌ Error: extraId es requerido para eliminar un extra');
  }
  return makeRequest('delete', `/extras/${extraId}`, {}, token);
};

//////////////////////////



// 🔹 **Obtener todos los registros de una tabla**
export const getAll = async (table, token = null) => {
  return makeRequest('get', `/${table}`, {}, token);
};

// 🔹 **Obtener un registro por ID**
export const getById = async (table, id, token = null) => {
  return makeRequest('get', `/${table}/${id}`, {}, token);
};

// 🔹 **Agregar un nuevo registro**
export const createRecord = async (table, data, token = null) => {
  return makeRequest('post', `/${table}`, data, token);
};

// 🔹 **Actualizar un registro por ID**
export const updateRecord = async (table, id, data, token = null) => {
  return makeRequest('put', `/${table}/${id}`, data, token);
};

// 🔹 **Eliminar un registro por ID**
export const deleteRecord = async (table, id, token = null) => {
  return makeRequest('delete', `/${table}/${id}`, {}, token);
};

// 🔹 **Subir un archivo (imagen o video)**
export const uploadFile = async (file, token = null) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return response.data;
  } catch (err) {
    console.error(`❌ Error en subir archivo:`, err.response?.data || err.message);
    throw err;
  }
};

////////////////////////////
// 🔹 TEAM MEMBERS API Calls
////////////////////////////

// 🔹 Obtener todos los miembros del equipo de un proyecto
export const getTeamMembers = async (projectId) => {
  if (!projectId || isNaN(projectId)) throw new Error("ID de proyecto inválido");
  return makeRequest("get", `/projects/${projectId}/team-members`);
};

// 🔹 Agregar nuevo miembro del equipo (con avatar)
export const addTeamMember = async (member) => {
  const formData = new FormData();
  formData.append("name", member.name);
  formData.append("role", member.role);
  formData.append("bio", member.bio);
  formData.append("project_id", member.project_id);

  // 🔹 Convertir avatar (base64) en blob si es string
  if (member.avatar?.startsWith("data:")) {
    const blob = await (await fetch(member.avatar)).blob();
    formData.append("avatar", blob, "avatar.png");
  }

  const response = await api.post(`/projects/${member.project_id}/team`, formData, {
    
  });

  return response.data;
};


export const updateTeamMember = async (id, data) => {
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.role) formData.append("role", data.role);
  if (data.bio) formData.append("bio", data.bio);

  if (data.avatar) {
    if (typeof data.avatar === "string" && data.avatar.startsWith("data:")) {
      const blob = await (await fetch(data.avatar)).blob();
      formData.append("avatar", blob, "avatar.png");
    } else if (typeof data.avatar === "string" && data.avatar.startsWith("http")) {
      formData.append("avatar", data.avatar);
    } else {
      formData.append("avatar", data.avatar);
    }
  }

  const response = await api.put(`/team-members/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};



// 🔹 Eliminar miembro del equipo
export const deleteTeamMember = async (memberId, token) => {
  return makeRequest("delete", `/team-members/${memberId}`, {}, token);
};

export const getWorkflow = async (projectId) => {
  return makeRequest('get', `/projects/${projectId}/workflow`);
};

export const saveOrUpdateWorkflow = async (projectId, data, token) => {
  return makeRequest('post', `/projects/${projectId}/workflow`, data, token);
};

export const editWorkflow = async (projectId, data, token) => {
  return makeRequest('put', `/projects/${projectId}/workflow`, data, token);
};

export const deleteWorkflow = async (projectId, token) => {
  return makeRequest('delete', `/projects/${projectId}/workflow`, {}, token);
};

export const getWorkflowSteps = async (projectId) => {
  return makeRequest('get', `/projects/${projectId}/workflow-steps`);
};

export const addWorkflowStep = async (projectId, stepData, imageFile, token) => {
  const formData = new FormData();
  formData.append('title', stepData.title);
  formData.append('description', stepData.description);
  formData.append('step_number', stepData.step_number);
  if (imageFile) formData.append('image', imageFile);

  const response = await api.post(`/projects/${projectId}/workflow-steps`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const updateWorkflowStep = async (projectId, stepId, stepData, imageFile, token) => {
  const formData = new FormData();
  if (stepData.title) formData.append('title', stepData.title);
  if (stepData.description) formData.append('description', stepData.description);
  if (stepData.step_number) formData.append('step_number', stepData.step_number);
  if (imageFile) formData.append('image', imageFile);

  const response = await api.put(`/projects/${projectId}/workflow-steps/${stepId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteWorkflowStep = async (projectId, stepId, token) => {
  return makeRequest('delete', `/projects/${projectId}/workflow-steps/${stepId}`, {}, token);
};

// 🔹 IMPACTO
export const getImpact = async (projectId) => makeRequest('get', `/projects/${projectId}/impacto`);
export const addImpact = async (projectId, data, file, token) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  if (file) formData.append("image", file);

  const response = await api.post(`/projects/${projectId}/impacto`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
export const updateImpact = async (projectId, impactId, data, file, token) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (file) formData.append("image", file);

  const response = await api.put(`/projects/${projectId}/impacto/${impactId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
export const deleteImpact = async (projectId, impactId, token) => {
  return makeRequest('delete', `/projects/${projectId}/impacto/${impactId}`, {}, token);
};

// 🔹 INVESTIGACIONES
export const getResearch = async (projectId) => makeRequest('get', `/projects/${projectId}/investigaciones`);
export const addResearch = async (projectId, data, token) => {
  return makeRequest('post', `/projects/${projectId}/investigaciones`, data, token);
};
export const updateResearch = async (projectId, researchId, data, token) => {
  return makeRequest('put', `/projects/${projectId}/investigaciones/${researchId}`, data, token);
};
export const deleteResearch = async (projectId, researchId, token) => {
  return makeRequest('delete', `/projects/${projectId}/investigaciones/${researchId}`, {}, token);
};
