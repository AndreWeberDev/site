// Sistema de menu lateral dinâmico com animações
function updateSidebar() {
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (!sidebarNav) {
    console.warn('Sidebar nav não encontrado');
    return;
  }

  const isLoggedIn = auth && auth.isLoggedIn();
  const isAdmin = auth && auth.isAdmin();
  
  // Animação de saída mais suave
  sidebarNav.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  sidebarNav.style.opacity = '0';
  sidebarNav.style.transform = 'translateX(-20px)';
  
  setTimeout(() => {
    // Obter caminho atual de forma mais robusta
    const currentPath = window.location.pathname.toLowerCase();
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Menu base com verificação melhorada de página ativa
    let menuItems = `
      <a href="./index.html" class="nav-item ${currentPage === 'index.html' || currentPage === '' || currentPath === '/' ? 'active' : ''}" onclick="handleNavClick(event, './index.html')">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">Home</span>
      </a>
      <a href="./meusProjetos.html" class="nav-item ${currentPage === 'meusprojetos.html' ? 'active' : ''}" onclick="handleNavClick(event, './meusProjetos.html')">
        <span class="nav-icon">💼</span>
        <span class="nav-text">Projetos</span>
      </a>
      <a href="./contatos.html" class="nav-item ${currentPage === 'contatos.html' ? 'active' : ''}" onclick="handleNavClick(event, './contatos.html')">
        <span class="nav-icon">📞</span>
        <span class="nav-text">Contatos</span>
      </a>
    `;

    if (isLoggedIn) {
      // Menu para usuários logados
      if (isAdmin) {
        menuItems += `
          <a href="./admin.html" class="nav-item ${currentPage === 'admin.html' ? 'active' : ''}" onclick="handleNavClick(event, './admin.html')">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">Admin</span>
          </a>
        `;
      }
      menuItems += `
        <a href="./conta.html" class="nav-item ${currentPage === 'conta.html' ? 'active' : ''}" onclick="handleNavClick(event, './conta.html')">
          <span class="nav-icon">👤</span>
          <span class="nav-text">Sua Conta</span>
        </a>
        <a href="#" class="nav-item logout-item" onclick="handleLogout(event)">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">Sair</span>
        </a>
      `;
    } else {
      // Menu para usuários não logados
      menuItems += `
        <a href="./login.html" class="nav-item ${currentPage === 'login.html' ? 'active' : ''}" onclick="handleNavClick(event, './login.html')">
          <span class="nav-icon">🔑</span>
          <span class="nav-text">Login</span>
        </a>
        <a href="./register.html" class="nav-item ${currentPage === 'register.html' ? 'active' : ''}" onclick="handleNavClick(event, './register.html')">
          <span class="nav-icon">📝</span>
          <span class="nav-text">Cadastro</span>
        </a>
      `;
    }

    sidebarNav.innerHTML = menuItems;
    
    // Adicionar avatar se logado e existir
    if (isLoggedIn && auth.currentUser && auth.currentUser.avatar) {
      const avatarSection = document.createElement('div');
      avatarSection.className = 'sidebar-avatar';
      avatarSection.innerHTML = `<img src="${auth.currentUser.avatar}" alt="Avatar" onerror="this.style.display='none'">`;
      sidebarNav.appendChild(avatarSection);
    }
    
    // Adicionar link de configurações para todos os usuários
    const configLink = document.createElement('a');
    configLink.href = './configuracoes.html';
    configLink.className = `nav-item ${currentPage === 'configuracoes.html' ? 'active' : ''}`;
    configLink.onclick = (e) => { handleNavClick(e, './configuracoes.html'); closeSidebarOnNavigation(); };
    configLink.innerHTML = `
      <span class="nav-icon">⚙️</span>
      <span class="nav-text">Configurações</span>
    `;
    sidebarNav.appendChild(configLink);
    
    // Animação de entrada
    sidebarNav.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sidebarNav.style.opacity = '1';
    sidebarNav.style.transform = 'translateX(0)';
    
    // Adicionar efeitos de ripple
    addRippleEffects();
    
    // Adicionar fechamento automático nos links
    document.querySelectorAll('.nav-item').forEach(item => {
      if (!item.onclick) {
        item.addEventListener('click', closeSidebarOnNavigation);
      }
    });
  }, 200);
}

// Navegação com animação
function handleNavClick(event, url) {
  event.preventDefault();
  
  // Animação de saída da página
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.classList.add('page-transition-exit');
  }
  
  // Navegar após animação
  setTimeout(() => {
    window.location.href = url;
  }, 400);
}

// Logout com animação aprimorada
function handleLogout(event) {
  event.preventDefault();
  
  const navItem = event.currentTarget;
  const sidebar = document.getElementById('sidebar');
  
  // Animação do item de logout
  navItem.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  navItem.style.transform = 'scale(0.95) translateX(-10px)';
  navItem.style.background = 'rgba(255, 107, 107, 0.2)';
  
  // Animação da sidebar
  if (sidebar) {
    sidebar.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sidebar.style.transform = 'translateX(-20px) scale(0.98)';
    sidebar.style.opacity = '0.8';
  }
  
  setTimeout(() => {
    if (auth && typeof auth.logout === 'function') {
      auth.logout();
    }
    
    // Fechar sidebar após logout
    closeSidebarOnNavigation();
    
    // Atualizar sidebar e redirecionar
    setTimeout(() => {
      refreshSidebar();
      window.location.href = 'index.html';
    }, 200);
  }, 300);
}

// Adicionar efeitos de ripple aos itens do menu
function addRippleEffects() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', createNavRipple);
  });
}

// Criar efeito ripple no menu
function createNavRipple(e) {
  const item = e.currentTarget;
  const ripple = document.createElement('span');
  const rect = item.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  ripple.className = 'ripple';
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
  `;
  
  item.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

// Fechar sidebar ao clicar em link com animação
function closeSidebarOnNavigation() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  
  if (sidebar) {
    sidebar.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sidebar.classList.remove('active');
    sidebar.classList.add('hidden');
  }
  
  if (overlay) {
    overlay.classList.remove('active');
  }
  
  if (toggleBtn) {
    toggleBtn.classList.remove('active');
  }
}

// Fechar sidebar com ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('active')) {
      toggleSidebar();
    }
  }
});

// Atualizar sidebar quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  // Animação de entrada da página
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.classList.add('page-transition-enter');
  }
  
  // Inicializar sidebar corretamente
  initializeSidebar();
  
  // Atualizar conteúdo da sidebar
  setTimeout(() => {
    updateSidebar();
  }, 100);
});

// Inicializar sidebar
function initializeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  
  if (sidebar) {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('active');
  }
  
  if (overlay) {
    overlay.classList.remove('active');
  }
  
  if (toggleBtn) {
    toggleBtn.classList.remove('active');
  }
}

// Toggle sidebar estilo GitHub com animações aprimoradas
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  
  if (!sidebar || !overlay || !toggleBtn) {
    console.warn('Elementos da sidebar não encontrados');
    return;
  }
  
  const isActive = sidebar.classList.contains('active');
  
  // Animação do botão toggle
  toggleBtn.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  
  if (isActive) {
    // Fechar sidebar com animação
    sidebar.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sidebar.classList.remove('active');
    sidebar.classList.add('hidden');
    overlay.classList.remove('active');
    toggleBtn.classList.remove('active');
    toggleBtn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      toggleBtn.style.transform = 'scale(1)';
    }, 200);
  } else {
    // Abrir sidebar com animação
    sidebar.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sidebar.classList.remove('hidden');
    sidebar.classList.add('active');
    overlay.classList.add('active');
    toggleBtn.classList.add('active');
    toggleBtn.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
      toggleBtn.style.transform = 'scale(1)';
    }, 200);
  }
}

// Atualizar sidebar após login/logout
function refreshSidebar() {
  updateSidebar();
}