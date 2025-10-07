// 🎓 AULA: Upload de Avatar Funcional

// Função para lidar com upload de avatar
async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const profileManager = new ProfileManager();
    
    // Validar arquivo
    profileManager.validateImage(file);
    
    // Mostrar loading no avatar
    const avatarImg = document.getElementById('avatarImg');
    const originalSrc = avatarImg.src;
    
    avatarImg.style.opacity = '0.5';
    avatarImg.style.filter = 'blur(2px)';
    
    // Criar indicador de loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'avatar-loading';
    loadingDiv.innerHTML = '⏳ Carregando...';
    loadingDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 10;
    `;
    
    const avatarContainer = document.getElementById('profileAvatar');
    avatarContainer.style.position = 'relative';
    avatarContainer.appendChild(loadingDiv);
    
    // Redimensionar e fazer upload
    const resizedImage = await profileManager.resizeImage(file, 128, 128);
    const result = await profileManager.uploadAvatar(file);
    
    // Atualizar avatar na interface
    avatarImg.src = result;
    avatarImg.style.opacity = '1';
    avatarImg.style.filter = 'none';
    
    // Atualizar avatar na sidebar
    updateSidebarAvatar(result);
    
    // Remover loading
    loadingDiv.remove();
    
    // Mostrar sucesso
    showNotification('📸 Avatar atualizado com sucesso!', 'success');
    
    // Limpar input para permitir re-upload do mesmo arquivo
    event.target.value = '';
    
  } catch (error) {
    // Restaurar estado original
    const avatarImg = document.getElementById('avatarImg');
    avatarImg.style.opacity = '1';
    avatarImg.style.filter = 'none';
    
    // Remover loading se existir
    const loadingDiv = document.querySelector('.avatar-loading');
    if (loadingDiv) loadingDiv.remove();
    
    // Mostrar erro
    showNotification(`❌ ${error.message}`, 'error');
    
    // Limpar input
    event.target.value = '';
  }
}

// Atualizar avatar na sidebar
function updateSidebarAvatar(avatarSrc) {
  const sidebarAvatar = document.querySelector('.sidebar-avatar img');
  if (sidebarAvatar) {
    sidebarAvatar.src = avatarSrc;
  }
}

// Salvar biografia
async function saveBio() {
  const bio = document.getElementById('bio').value;
  const profileManager = new ProfileManager();
  
  try {
    const result = await profileManager.saveProfile({ bio });
    showNotification('💬 Biografia salva!', 'success');
  } catch (error) {
    showNotification('❌ Erro ao salvar biografia', 'error');
  }
}

// Carregar dados do perfil
function loadProfileData() {
  const profileManager = new ProfileManager();
  const profile = profileManager.getProfile();
  
  if (profile) {
    // Carregar avatar
    if (profile.avatar) {
      const avatarImg = document.getElementById('avatarImg');
      if (avatarImg) {
        avatarImg.src = profile.avatar;
      }
    }
    
    // Carregar nome
    const displayName = document.getElementById('displayName');
    if (displayName) {
      displayName.textContent = profile.nickname || profile.name;
    }
    
    // Carregar username
    const username = document.getElementById('username');
    if (username) {
      username.textContent = `@${profile.email.split('@')[0]}`;
    }
    
    // Carregar biografia
    const bio = document.getElementById('bio');
    if (bio && profile.bio) {
      bio.value = profile.bio;
    }
    
    // Carregar campos do formulário
    const profileDisplayName = document.getElementById('profileDisplayName');
    if (profileDisplayName) {
      profileDisplayName.value = profile.nickname || profile.name;
    }
    
    const profileUsername = document.getElementById('profileUsername');
    if (profileUsername) {
      profileUsername.value = profile.email.split('@')[0];
    }
  }
}

// Salvar configurações do perfil
async function saveProfileSettings(event) {
  event.preventDefault();
  
  const displayName = document.getElementById('profileDisplayName').value;
  const username = document.getElementById('profileUsername').value;
  
  const profileManager = new ProfileManager();
  
  try {
    await profileManager.saveProfile({
      nickname: displayName,
      username: username
    });
    
    // Atualizar interface
    document.getElementById('displayName').textContent = displayName;
    document.getElementById('username').textContent = `@${username}`;
    
    showNotification('⚙️ Configurações salvas!', 'success');
  } catch (error) {
    showNotification('❌ Erro ao salvar configurações', 'error');
  }
}

// Sistema de notificações simples
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `profile-notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 1000;
    animation: slideInRight 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  // Carregar dados do perfil
  loadProfileData();
  
  // Configurar formulário de perfil
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', saveProfileSettings);
  }
  
  // Verificar autenticação
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
  }
});

// Adicionar CSS para animações
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .avatar-edit-btn {
    position: absolute;
    bottom: -5px;
    right: -5px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #5865f2;
    border: 2px solid #2f3136;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }
  
  .avatar-edit-btn:hover {
    background: #4752c4;
    transform: scale(1.1);
  }
`;
document.head.appendChild(style);