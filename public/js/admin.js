// Verificar se é admin ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAdminAuth()) return;
  
  const userInfo = document.getElementById('userInfo');
  if (userInfo && auth.currentUser) {
    userInfo.textContent = `Logado como: ${auth.currentUser.name}`;
  }
  
  loadProjects();
  
  const addProjectForm = document.getElementById('addProjectForm');
  if (addProjectForm) {
    addProjectForm.addEventListener('submit', handleAddProject);
  }
});

// Sistema de gerenciamento de projetos
class ProjectManager {
  constructor() {
    this.projects = JSON.parse(localStorage.getItem('projects')) || [];
  }

  addProject(project) {
    project.id = Date.now();
    this.projects.push(project);
    this.saveProjects();
    return project;
  }

  deleteProject(id) {
    this.projects = this.projects.filter(p => p.id !== id);
    this.saveProjects();
  }

  getProjects() {
    return this.projects;
  }

  saveProjects() {
    localStorage.setItem('projects', JSON.stringify(this.projects));
  }
}

const projectManager = new ProjectManager();

function handleAddProject(e) {
  e.preventDefault();
  
  const title = document.getElementById('projectTitle').value;
  const description = document.getElementById('projectDescription').value;
  const link = document.getElementById('projectLink').value;
  const image = document.getElementById('projectImage').value;

  const project = {
    title,
    description,
    link,
    image: image || './assets/img/default-project.png'
  };

  projectManager.addProject(project);
  loadProjects();
  e.target.reset();
  
  alert('Projeto adicionado com sucesso!');
}

function loadProjects() {
  const projectsList = document.getElementById('projectsList');
  if (!projectsList) return;

  const projects = projectManager.getProjects();
  
  if (projects.length === 0) {
    projectsList.innerHTML = '<p>Nenhum projeto cadastrado.</p>';
    return;
  }

  projectsList.innerHTML = projects.map(project => `
    <div class="project-item">
      <h4>${project.title}</h4>
      <p>${project.description}</p>
      ${project.link ? `<p><strong>Link:</strong> <a href="${project.link}" target="_blank">${project.link}</a></p>` : ''}
      ${project.image ? `<p><strong>Imagem:</strong> ${project.image}</p>` : ''}
      <div class="project-actions">
        <button class="delete-btn" onclick="deleteProject(${project.id})">Deletar</button>
      </div>
    </div>
  `).join('');
}

function deleteProject(id) {
  if (confirm('Tem certeza que deseja deletar este projeto?')) {
    projectManager.deleteProject(id);
    loadProjects();
    alert('Projeto deletado com sucesso!');
  }
}