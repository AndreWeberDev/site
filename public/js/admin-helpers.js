// 🎓 AULA: FUNÇÕES AUXILIARES
// Vou mostrar como criar funções pequenas e reutilizáveis:

// 14. FUNÇÕES PARA OBTER NOMES AMIGÁVEIS
function getCategoryName(category) {
  const categories = {
    'web': '🌐 Desenvolvimento Web',
    'game': '🎮 Desenvolvimento de Jogos',
    'mobile': '📱 Aplicativo Mobile',
    'other': '🔧 Outros'
  };
  return categories[category] || category;
}

function getContactTypeName(type) {
  const types = {
    'email': '📧 Email',
    'phone': '📱 Telefone',
    'social': '🌐 Rede Social',
    'professional': '💼 Profissional'
  };
  return types[type] || type;
}

// 15. FUNÇÕES PARA OBTER ÍCONES PADRÃO
function getDefaultIcon(type) {
  const icons = {
    'email': '📧',
    'phone': '📱',
    'social': '🌐',
    'professional': '💼'
  };
  return icons[type] || '📞';
}

function getDefaultImage(category) {
  const images = {
    'web': './assets/img/IconeJogos/controle-de-video-game (1).png',
    'game': './assets/img/IconeJogos/controlador.png',
    'mobile': './assets/img/IconeJogos/controle-de-jogo.png',
    'other': './assets/img/IconeJogos/controlador.png'
  };
  return images[category] || './assets/img/IconeJogos/controlador.png';
}

// 16. FUNÇÃO PARA FORMATAR VALORES DE CONTATO
function formatContactValue(type, value) {
  switch(type) {
    case 'email':
      return `<a href="mailto:${value}" style="color: #8ab4f8;">${value}</a>`;
    case 'phone':
      return `<a href="tel:${value}" style="color: #8ab4f8;">${value}</a>`;
    case 'social':
    case 'professional':
      if (value.startsWith('http')) {
        return `<a href="${value}" target="_blank" style="color: #8ab4f8;">🔗 ${value}</a>`;
      }
      return value;
    default:
      return value;
  }
}

// 17. SISTEMA DE NOTIFICAÇÕES
function showNotification(message, type = 'info') {
  // Remove notificação existente se houver
  const existingNotification = document.querySelector('.admin-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Cria nova notificação
  const notification = document.createElement('div');
  notification.className = `admin-notification ${type}`;
  
  // Define ícone baseado no tipo
  const icons = {
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️'
  };
  
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Adiciona ao body
  document.body.appendChild(notification);
  
  // Animação de entrada
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// 18. FUNÇÃO PARA EXPORTAR DADOS
function exportData() {
  const data = {
    projects: projectManager.getProjects(),
    contacts: contactManager.getContacts(),
    settings: JSON.parse(localStorage.getItem('site_settings')) || {},
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showNotification('📥 Backup dos dados exportado!', 'success');
}

// 19. FUNÇÃO PARA IMPORTAR DADOS
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.projects) {
        localStorage.setItem('admin_projects', JSON.stringify(data.projects));
      }
      if (data.contacts) {
        localStorage.setItem('admin_contacts', JSON.stringify(data.contacts));
      }
      if (data.settings) {
        localStorage.setItem('site_settings', JSON.stringify(data.settings));
      }
      
      // Recarrega os dados
      location.reload();
      
    } catch (error) {
      showNotification('❌ Erro ao importar dados: arquivo inválido', 'error');
    }
  };
  
  reader.readAsText(file);
}

// 20. FUNÇÃO PARA LIMPAR TODOS OS DADOS
function clearAllData() {
  if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados do painel admin. Tem certeza?')) {
    if (confirm('🚨 ÚLTIMA CHANCE: Esta ação não pode ser desfeita!')) {
      localStorage.removeItem('admin_projects');
      localStorage.removeItem('admin_contacts');
      localStorage.removeItem('site_settings');
      
      showNotification('🗑️ Todos os dados foram apagados!', 'warning');
      
      setTimeout(() => {
        location.reload();
      }, 2000);
    }
  }
}

// 21. FUNÇÃO PARA ESTATÍSTICAS RÁPIDAS
function getStats() {
  const projects = projectManager.getProjects();
  const contacts = contactManager.getContacts();
  const publicContacts = contactManager.getPublicContacts();
  
  return {
    totalProjects: projects.length,
    totalContacts: contacts.length,
    publicContacts: publicContacts.length,
    privateContacts: contacts.length - publicContacts.length,
    projectsByCategory: projects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {})
  };
}

// 22. FUNÇÃO PARA MOSTRAR ESTATÍSTICAS
function showStats() {
  const stats = getStats();
  const message = `
    📊 Estatísticas do Portfolio:
    • ${stats.totalProjects} projetos cadastrados
    • ${stats.totalContacts} contatos (${stats.publicContacts} públicos, ${stats.privateContacts} privados)
    • Projetos por categoria: ${Object.entries(stats.projectsByCategory).map(([cat, count]) => `${getCategoryName(cat)}: ${count}`).join(', ')}
  `;
  
  alert(message);
}