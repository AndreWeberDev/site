// Verificar autenticação e carregar dados da conta
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) return;
  
  loadUserInfo();
  
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', handleChangePassword);
  }
  
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
}

function handleProfileUpdate(e) {
  e.preventDefault();
  
  const displayName = document.getElementById('displayName').value;
  const username = document.getElementById('username').value;
  const nickname = document.getElementById('nickname').value;
  const bio = document.getElementById('bio').value;
  
  const profileData = {
    displayName,
    username,
    nickname,
    bio
  };
  
  try {
    auth.updateUserProfile(auth.currentUser.id, profileData);
    loadUserInfo();
    showSuccess('Perfil atualizado com sucesso!');
  } catch (error) {
    showError('Erro ao atualizar perfil');
  }
});

function loadUserInfo() {
  if (!auth.currentUser) return;
  
  const user = auth.currentUser;
  
  // Atualizar elementos do header Discord
  const displayName = document.getElementById('displayName');
  const username = document.getElementById('username');
  const avatarImg = document.getElementById('avatarImg');
  
  if (displayName) displayName.textContent = user.displayName || user.name;
  if (username) username.textContent = `#${user.id.toString().slice(-4)}`;
  
  // Carregar avatar
  if (avatarImg) {
    avatarImg.src = user.avatar || './assets/img/default-avatar.png';
    if (user.avatarType === 'image/gif') {
      avatarImg.style.imageRendering = 'auto';
    }
  }
  
  // Atualizar avatar no sidebar
  if (user.avatar) {
    updateSidebarAvatar(user.avatar);
  }
  
  // Preencher formulários
  loadProfileForm();
}

function loadProfileForm() {
  const user = auth.currentUser;
  if (!user) return;
  
  document.getElementById('displayName').value = user.displayName || user.name;
  document.getElementById('username').value = user.username || user.email.split('@')[0];
  document.getElementById('nickname').value = user.nickname || '';
  document.getElementById('bio').value = user.bio || '';
}

function showTab(tabName) {
  // Remover classe active de todas as abas
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
  
  // Ativar aba selecionada
  event.target.classList.add('active');
  document.getElementById(tabName + 'Tab').style.display = 'block';
}

let currentImageFile = null;
let currentImageData = null;

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    // Validar arquivo
    ImageProcessor.validateFile(file);
    
    currentImageFile = file;
    
    // Ler arquivo para preview
    const reader = new FileReader();
    reader.onload = function(e) {
      currentImageData = e.target.result;
      showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
  } catch (error) {
    showError(error.message);
  }
}

let cropData = { x: 0, y: 0, scale: 1 };
let isDragging = false;

function showImagePreview(imageSrc) {
  const modal = document.getElementById('cropModal');
  const cropImg = document.getElementById('cropImage');
  const zoomSlider = document.getElementById('zoomSlider');
  
  cropImg.src = imageSrc;
  modal.classList.remove('hidden');
  
  // Reset crop data
  cropData = { x: 0, y: 0, scale: 1 };
  updateCropImage();
  
  // Zoom control
  zoomSlider.oninput = function() {
    cropData.scale = parseFloat(this.value);
    updateCropImage();
  };
  
  // Drag functionality
  cropImg.onmousedown = startDrag;
  document.onmousemove = drag;
  document.onmouseup = stopDrag;
}

function updateCropImage() {
  const cropImg = document.getElementById('cropImage');
  cropImg.style.transform = `translate(calc(-50% + ${cropData.x}px), calc(-50% + ${cropData.y}px)) scale(${cropData.scale})`;
}

function startDrag(e) {
  isDragging = true;
  const startX = e.clientX - cropData.x;
  const startY = e.clientY - cropData.y;
  
  window.dragStart = { x: startX, y: startY };
  e.preventDefault();
}

function drag(e) {
  if (!isDragging || !window.dragStart) return;
  
  cropData.x = e.clientX - window.dragStart.x;
  cropData.y = e.clientY - window.dragStart.y;
  updateCropImage();
}

function stopDrag() {
  isDragging = false;
  window.dragStart = null;
}

function cancelCrop() {
  const modal = document.getElementById('cropModal');
  modal.classList.add('hidden');
  currentImageFile = null;
  currentImageData = null;
  isDragging = false;
  
  // Limpar input
  document.getElementById('avatarInput').value = '';
}

async function applyCrop() {
  if (!currentImageData) return;
  
  try {
    // Criar canvas para crop
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Definir tamanho do canvas (200x200 para avatar)
      canvas.width = 200;
      canvas.height = 200;
      
      // Calcular posição e escala
      const scale = cropData.scale;
      const x = cropData.x;
      const y = cropData.y;
      
      // Desenhar imagem cropada
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 100, 100, 0, Math.PI * 2);
      ctx.clip();
      
      const imgWidth = img.width * scale;
      const imgHeight = img.height * scale;
      const imgX = 100 - (imgWidth / 2) + x;
      const imgY = 100 - (imgHeight / 2) + y;
      
      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
      ctx.restore();
      
      // Converter para base64
      const croppedImage = canvas.toDataURL('image/png', 0.9);
      
      // Atualizar avatar
      const avatarImg = document.getElementById('avatarImg');
      avatarImg.src = croppedImage;
      
      // Mostrar preview na página
      showAvatarPreview(croppedImage);
      
      // Salvar no perfil
      if (window.auth && auth.currentUser) {
        auth.updateUserProfile(auth.currentUser.id, { 
          avatar: croppedImage,
          avatarType: 'image/png'
        });
        
        // Atualizar sidebar
        updateSidebarAvatar(croppedImage);
      }
      
      showSuccess('Avatar atualizado com sucesso!');
      cancelCrop();
    };
    
    img.src = currentImageData;
    
  } catch (error) {
    showError(error.message);
  }
}

function showAvatarPreview(imageSrc) {
  // Criar ou atualizar preview na página
  let previewContainer = document.getElementById('avatarPreviewContainer');
  
  if (!previewContainer) {
    previewContainer = document.createElement('div');
    previewContainer.id = 'avatarPreviewContainer';
    previewContainer.className = 'avatar-preview-container';
    previewContainer.innerHTML = `
      <h4>Sua Nova Foto:</h4>
      <div class="avatar-preview-img">
        <img id="avatarPreviewImg" src="" alt="Preview">
      </div>
    `;
    
    // Inserir após a seção de avatar
    const profileSection = document.querySelector('.profile-section-account');
    profileSection.appendChild(previewContainer);
  }
  
  const previewImg = document.getElementById('avatarPreviewImg');
  previewImg.src = imageSrc;
  
  // Animação de entrada
  previewContainer.style.opacity = '0';
  previewContainer.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    previewContainer.style.transition = 'all 0.5s ease';
    previewContainer.style.opacity = '1';
    previewContainer.style.transform = 'translateY(0)';
  }, 100);
}

// Atualizar avatar no sidebar
function updateSidebarAvatar(avatarUrl) {
  const sidebarHeader = document.querySelector('.sidebar-header');
  if (!sidebarHeader || !auth.isLoggedIn()) return;
  
  let avatarElement = sidebarHeader.querySelector('.sidebar-avatar');
  if (!avatarElement) {
    avatarElement = document.createElement('div');
    avatarElement.className = 'sidebar-avatar';
    avatarElement.innerHTML = '<img src="" alt="Avatar">';
    sidebarHeader.appendChild(avatarElement);
  }
  
  const img = avatarElement.querySelector('img');
  img.src = avatarUrl;
}

function handleChangePassword(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  
  if (auth.currentUser.password !== currentPassword) {
    showError('Senha atual incorreta');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    showError('Novas senhas não coincidem');
    return;
  }
  
  try {
    auth.validatePassword(newPassword);
    
    // Atualizar senha
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === auth.currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      auth.currentUser.password = newPassword;
      
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));
      
      showSuccess('Senha alterada com sucesso!');
      e.target.reset();
    }
  } catch (error) {
    showError(error.message);
  }
}