// 🎓 AULA: Sistema Admin Melhorado
// Vou explicar cada parte do código:

// 1. INICIALIZAÇÃO - Quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  // Primeiro, verificamos se o usuário é admin
  if (!checkAdminAuth()) return;
  
  // Mostramos informações do usuário logado
  const userInfo = document.getElementById('userInfo');
  if (userInfo && auth.currentUser) {
    userInfo.innerHTML = `👤 <strong>${auth.currentUser.name}</strong> (Admin)`;
  }
  
  // Carregamos os dados iniciais
  loadProjects();
  loadContacts();
  loadSettings();
  
  // Configuramos os event listeners dos formulários
  setupFormListeners();
});

// 2. FUNÇÃO PARA TROCAR ABAS
// Esta função controla qual seção está visível
function switchTab(tabName) {
  // Remove a classe 'active' de todas as abas
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Adiciona 'active' na aba clicada
  event.target.classList.add('active');
  document.getElementById(tabName + '-tab').classList.add('active');
}

// 3. CONFIGURAÇÃO DOS FORMULÁRIOS
// Centralizamos todos os event listeners aqui
function setupFormListeners() {
  // Formulário de projetos
  const addProjectForm = document.getElementById('addProjectForm');
  if (addProjectForm) {
    addProjectForm.addEventListener('submit', handleAddProject);
  }
  
  // Formulário de contatos
  const addContactForm = document.getElementById('addContactForm');
  if (addContactForm) {
    addContactForm.addEventListener('submit', handleAddContact);
  }
  
  // Formulário de configurações
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', handleSettings);
  }
}

// 🎓 AULA: CLASSES EM JAVASCRIPT
// Uma classe é como um "molde" para criar objetos
// Vou criar classes para organizar melhor o código:

// 4. CLASSE PARA GERENCIAR PROJETOS
class ProjectManager {
  constructor() {
    // Carrega projetos do localStorage ou array vazio
    this.projects = JSON.parse(localStorage.getItem('admin_projects')) || [];
  }

  addProject(project) {
    // Gera ID único baseado no timestamp
    project.id = Date.now();
    project.createdAt = new Date().toISOString();
    this.projects.push(project);
    this.saveProjects();
    return project;
  }

  updateProject(id, updatedProject) {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...updatedProject };
      this.saveProjects();
      return this.projects[index];
    }
    return null;
  }

  deleteProject(id) {
    this.projects = this.projects.filter(p => p.id !== id);
    this.saveProjects();
  }

  getProjects() {
    return this.projects;
  }

  saveProjects() {
    localStorage.setItem('admin_projects', JSON.stringify(this.projects));
  }
}

// 5. CLASSE PARA GERENCIAR CONTATOS
class ContactManager {
  constructor() {
    this.contacts = JSON.parse(localStorage.getItem('admin_contacts')) || [];
  }

  addContact(contact) {
    contact.id = Date.now();
    contact.createdAt = new Date().toISOString();
    this.contacts.push(contact);
    this.saveContacts();
    return contact;
  }

  updateContact(id, updatedContact) {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contacts[index] = { ...this.contacts[index], ...updatedContact };
      this.saveContacts();
      return this.contacts[index];
    }
    return null;
  }

  deleteContact(id) {
    this.contacts = this.contacts.filter(c => c.id !== id);
    this.saveContacts();
  }

  toggleContactVisibility(id) {
    const contact = this.contacts.find(c => c.id === id);
    if (contact) {
      contact.isPublic = !contact.isPublic;
      this.saveContacts();
      return contact;
    }
    return null;
  }

  getContacts() {
    return this.contacts;
  }

  getPublicContacts() {
    return this.contacts.filter(c => c.isPublic);
  }

  saveContacts() {
    localStorage.setItem('admin_contacts', JSON.stringify(this.contacts));
  }
}

// 6. INSTANCIANDO AS CLASSES
// Aqui criamos os objetos que vamos usar
const projectManager = new ProjectManager();
const contactManager = new ContactManager();

// 🎓 AULA: MANIPULAÇÃO DE FORMULÁRIOS
// Vou mostrar como capturar dados de formulários de forma profissional:

// 7. FUNÇÃO PARA ADICIONAR PROJETO
function handleAddProject(e) {
  e.preventDefault(); // Impede o envio padrão do formulário
  
  // Captura os valores dos campos
  const title = document.getElementById('projectTitle').value.trim();
  const description = document.getElementById('projectDescription').value.trim();
  const link = document.getElementById('projectLink').value.trim();
  const image = document.getElementById('projectImage').value.trim();
  const category = document.getElementById('projectCategory').value;
  const tech = document.getElementById('projectTech').value.trim();
  
  // Validação simples
  if (!title || !description) {
    showNotification('Título e descrição são obrigatórios!', 'error');
    return;
  }

  // Cria o objeto do projeto
  const project = {
    title,
    description,
    link: link || '#',
    image: image || getDefaultImage(category),
    category,
    technologies: tech ? tech.split(',').map(t => t.trim()) : [],
    status: 'active'
  };

  // Adiciona o projeto
  projectManager.addProject(project);
  loadProjects();
  e.target.reset();
  
  showNotification('✨ Projeto adicionado com sucesso!', 'success');
}

// 8. FUNÇÃO PARA ADICIONAR CONTATO
function handleAddContact(e) {
  e.preventDefault();
  
  const name = document.getElementById('contactName').value.trim();
  const type = document.getElementById('contactType').value;
  const value = document.getElementById('contactValue').value.trim();
  const icon = document.getElementById('contactIcon').value.trim();
  const description = document.getElementById('contactDescription').value.trim();
  const isPublic = document.getElementById('contactPublic').checked;
  
  if (!name || !value) {
    showNotification('Nome e valor são obrigatórios!', 'error');
    return;
  }

  const contact = {
    name,
    type,
    value,
    icon: icon || getDefaultIcon(type),
    description,
    isPublic
  };

  contactManager.addContact(contact);
  loadContacts();
  e.target.reset();
  
  showNotification('📞 Contato adicionado com sucesso!', 'success');
}

// 9. FUNÇÃO PARA SALVAR CONFIGURAÇÕES
function handleSettings(e) {
  e.preventDefault();
  
  const siteName = document.getElementById('siteName').value.trim();
  const siteDescription = document.getElementById('siteDescription').value.trim();
  const siteTheme = document.getElementById('siteTheme').value.trim();
  
  const settings = {
    siteName,
    siteDescription,
    siteTheme,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('site_settings', JSON.stringify(settings));
  showNotification('⚙️ Configurações salvas!', 'success');
}

// 🎓 AULA: RENDERIZAÇÃO DINÂMICA DE CONTEÚDO
// Vou mostrar como criar HTML dinamicamente com JavaScript:

// 10. FUNÇÃO PARA CARREGAR PROJETOS
function loadProjects() {
  const projectsList = document.getElementById('projectsList');
  if (!projectsList) return;

  const projects = projectManager.getProjects();
  
  if (projects.length === 0) {
    projectsList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #9aa0a6;">
        <h3>📁 Nenhum projeto cadastrado</h3>
        <p>Adicione seu primeiro projeto usando o formulário acima!</p>
      </div>
    `;
    return;
  }

  // Usa map() para transformar array de projetos em HTML
  projectsList.innerHTML = projects.map(project => `
    <div class="project-item">
      <h4>🚀 ${project.title}</h4>
      <p>${project.description}</p>
      
      ${project.technologies && project.technologies.length > 0 ? 
        `<div class="tech-tags">
          ${project.technologies.map(tech => `<span class="project-tech">${tech}</span>`).join('')}
        </div>` : ''
      }
      
      <div class="project-info">
        <p><strong>Categoria:</strong> ${getCategoryName(project.category)}</p>
        ${project.link && project.link !== '#' ? 
          `<p><strong>Link:</strong> <a href="${project.link}" target="_blank">🔗 Ver projeto</a></p>` : ''
        }
      </div>
      
      <div class="item-actions">
        <button class="edit-btn" onclick="editProject(${project.id})">✏️ Editar</button>
        <button class="delete-btn" onclick="deleteProject(${project.id})">🗑️ Deletar</button>
      </div>
    </div>
  `).join('');
}

// 11. FUNÇÃO PARA CARREGAR CONTATOS
function loadContacts() {
  const contactsList = document.getElementById('contactsList');
  if (!contactsList) return;

  const contacts = contactManager.getContacts();
  
  if (contacts.length === 0) {
    contactsList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #9aa0a6;">
        <h3>📞 Nenhum contato cadastrado</h3>
        <p>Adicione seus contatos para facilitar o networking!</p>
      </div>
    `;
    return;
  }

  contactsList.innerHTML = contacts.map(contact => `
    <div class="contact-item ${!contact.isPublic ? 'private' : ''}">
      <h4>${contact.icon} ${contact.name}</h4>
      <p><strong>Tipo:</strong> <span class="contact-type">${getContactTypeName(contact.type)}</span></p>
      <p><strong>Contato:</strong> ${formatContactValue(contact.type, contact.value)}</p>
      ${contact.description ? `<p><strong>Descrição:</strong> ${contact.description}</p>` : ''}
      <p><strong>Status:</strong> ${contact.isPublic ? '🌐 Público' : '🔒 Privado'}</p>
      
      <div class="item-actions">
        <button class="edit-btn" onclick="editContact(${contact.id})">✏️ Editar</button>
        <button class="toggle-btn" onclick="toggleContact(${contact.id})">
          ${contact.isPublic ? '🔒 Tornar Privado' : '🌐 Tornar Público'}
        </button>
        <button class="delete-btn" onclick="deleteContact(${contact.id})">🗑️ Deletar</button>
      </div>
    </div>
  `).join('');
}

// 12. FUNÇÃO PARA CARREGAR CONFIGURAÇÕES
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('site_settings')) || {};
  
  if (settings.siteName) {
    document.getElementById('siteName').value = settings.siteName;
  }
  if (settings.siteDescription) {
    document.getElementById('siteDescription').value = settings.siteDescription;
  }
  if (settings.siteTheme) {
    document.getElementById('siteTheme').value = settings.siteTheme;
  }
}

// 13. FUNÇÕES DE AÇÃO (DELETE, EDIT, TOGGLE)
function deleteProject(id) {
  if (confirm('🗑️ Tem certeza que deseja deletar este projeto?')) {
    projectManager.deleteProject(id);
    loadProjects();
    showNotification('Projeto deletado com sucesso!', 'success');
  }
}

function deleteContact(id) {
  if (confirm('🗑️ Tem certeza que deseja deletar este contato?')) {
    contactManager.deleteContact(id);
    loadContacts();
    showNotification('Contato deletado com sucesso!', 'success');
  }
}

function toggleContact(id) {
  const contact = contactManager.toggleContactVisibility(id);
  if (contact) {
    loadContacts();
    const status = contact.isPublic ? 'público' : 'privado';
    showNotification(`Contato agora é ${status}!`, 'info');
  }
}

function editProject(id) {
  // TODO: Implementar edição de projeto
  showNotification('Função de edição em desenvolvimento!', 'info');
}

function editContact(id) {
  // TODO: Implementar edição de contato
  showNotification('Função de edição em desenvolvimento!', 'info');
}