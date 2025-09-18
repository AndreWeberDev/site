// Sistema de menu lateral dinâmico com animações
function updateSidebar() {
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (!sidebarNav) return;

  const isLoggedIn = auth.isLoggedIn();
  const isAdmin = auth.isAdmin();
  
  // Animação de saída
  sidebarNav.style.opacity = '0';
  sidebarNav.style.transform = 'translateX(-20px)';
  
  setTimeout(() => {
    // Menu base
    let menuItems = `
      <a href="./index.html" class="nav-item ${window.location.pathname.includes('index.html') || window.location.pathname === '/' ? 'active' : ''}" onclick="handleNavClick(event, './index.html')">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">Home</span>
      </a>
      <a href="./meusProjetos.html" class="nav-item ${window.location.pathname.includes('meusProjetos.html') ? 'active' : ''}" onclick="handleNavClick(event, './meusProjetos.html')">
        <span class="nav-icon">💼</span>
        <span class="nav-text">Projetos</span>
      </a>
      <a href="./contatos.html" class="nav-item ${window.location.pathname.includes('contatos.html') ? 'active' : ''}" onclick="handleNavClick(event, './contatos.html')">
        <span class="nav-icon">📞</span>
        <span class="nav-text">Contatos</span>
      </a>
    `;

    if (isLoggedIn) {
      // Menu para usuários logados
      if (isAdmin) {
        menuItems += `
          <a href="./admin.html" class="nav-item ${window.location.pathname.includes('admin.html') ? 'active' : ''}" onclick="handleNavClick(event, './admin.html')">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">Admin</span>
          </a>
        `;
      }
      menuItems += `
        <a href="./conta.html" class="nav-item ${window.location.pathname.includes('conta.html') ? 'active' : ''}" onclick="handleNavClick(event, './conta.html')">
          <span class="nav-icon">👤</span>
          <span class="nav-text">Sua Conta</span>
        </a>
        <a href="#" class="nav-item" onclick="handleLogout(event)">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">Sair</span>
        </a>
      `;
    } else {
      // Menu para usuários não logados
      menuItems += `
        <a href="./login.html" class="nav-item ${window.location.pathname.includes('login.html') ? 'active' : ''}" onclick="handleNavClick(event, './login.html')">
          <span class="nav-icon">🔑</span>
          <span class="nav-text">Login</span>
        </a>
        <a href="./register.html" class="nav-item ${window.location.pathname.includes('register.html') ? 'active' : ''}" onclick="handleNavClick(event, './register.html')">
          <span class="nav-icon">📝</span>
          <span class="nav-text">Cadastro</span>
        </a>
      `;
    }

    sidebarNav.innerHTML = menuItems;
    
    // Adicionar avatar se logado
    if (isLoggedIn && auth.currentUser.avatar) {
      const avatarSection = document.createElement('div');
      avatarSection.className = 'sidebar-avatar';
      avatarSection.innerHTML = `<img src="${auth.currentUser.avatar}" alt="Avatar">`;
      sidebarNav.appendChild(avatarSection);
    }
    
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

// Logout com animação
function handleLogout(event) {
  event.preventDefault();
  
  const navItem = event.currentTarget;
  navItem.style.transform = 'scale(0.95)';
  
  setTimeout(() => {
    auth.logout();
    refreshSidebar();
    handleNavClick(event, 'index.html');
  }, 200);
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

// Fechar sidebar ao clicar em link
function closeSidebarOnNavigation() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  
  sidebar.classList.remove('active');
  sidebar.classList.add('hidden');
  overlay.classList.remove('active');
  toggleBtn.classList.remove('active');
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
  
  // Sidebar inicia fechado
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.add('hidden');
  }
  
  updateSidebar();
});

// Toggle sidebar estilo GitHub
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  
  const isActive = sidebar.classList.contains('active');
  
  if (isActive) {
    // Fechar sidebar
    sidebar.classList.remove('active');
    sidebar.classList.add('hidden');
    overlay.classList.remove('active');
    toggleBtn.classList.remove('active');
  } else {
    // Abrir sidebar
    sidebar.classList.remove('hidden');
    sidebar.classList.add('active');
    overlay.classList.add('active');
    toggleBtn.classList.add('active');
  }
}

// Atualizar sidebar após login/logout
function refreshSidebar() {
  updateSidebar();
}