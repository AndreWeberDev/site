// 🎓 AULA: Sistema de Perfil Estilo Discord

class ProfileManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
  }

  // UPLOAD DE AVATAR
  async uploadAvatar(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        try {
          // Salvar no localStorage (backup)
          this.updateLocalProfile({ avatar: imageData });
          
          // Tentar salvar no servidor
          const response = await fetch('http://localhost:5487/api/upload/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: this.currentUser.id,
              imageData
            })
          });
          
          if (response.ok) {
            console.log('✅ Avatar salvo no servidor');
          }
          
          resolve(imageData);
        } catch (error) {
          console.log('⚠️ Usando localStorage para avatar');
          resolve(imageData);
        }
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ATUALIZAR PERFIL LOCAL
  updateLocalProfile(data) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === this.currentUser.email);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...data };
      localStorage.setItem('users', JSON.stringify(users));
      
      // Atualizar usuário atual
      this.currentUser = { ...this.currentUser, ...data };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  // SALVAR PERFIL COMPLETO
  async saveProfile(profileData) {
    try {
      // Salvar localmente primeiro
      this.updateLocalProfile(profileData);
      
      // Tentar salvar no servidor
      const response = await fetch('http://localhost:5487/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.currentUser.id,
          ...profileData
        })
      });
      
      if (response.ok) {
        console.log('✅ Perfil salvo no servidor');
        return { success: true, message: 'Perfil atualizado!' };
      }
    } catch (error) {
      console.log('⚠️ Perfil salvo apenas localmente');
    }
    
    return { success: true, message: 'Perfil atualizado localmente!' };
  }

  // OBTER PERFIL ATUAL
  getProfile() {
    return this.currentUser;
  }

  // VALIDAR IMAGEM
  validateImage(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato não suportado. Use JPG, PNG, GIF ou WebP');
    }
    
    if (file.size > maxSize) {
      throw new Error('Imagem muito grande. Máximo 5MB');
    }
    
    return true;
  }

  // REDIMENSIONAR IMAGEM
  async resizeImage(file, maxWidth = 256, maxHeight = 256) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para base64
        const resizedData = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedData);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}

// INTERFACE DE UPLOAD
function createAvatarUploader() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const profileManager = new ProfileManager();
      
      // Validar arquivo
      profileManager.validateImage(file);
      
      // Mostrar loading
      const avatarImg = document.querySelector('.profile-avatar img');
      if (avatarImg) {
        avatarImg.style.opacity = '0.5';
        avatarImg.style.filter = 'blur(2px)';
      }
      
      // Redimensionar e fazer upload
      const resizedImage = await profileManager.resizeImage(file);
      const result = await profileManager.uploadAvatar(file);
      
      // Atualizar interface
      if (avatarImg) {
        avatarImg.src = result;
        avatarImg.style.opacity = '1';
        avatarImg.style.filter = 'none';
      }
      
      // Atualizar sidebar se existir
      const sidebarAvatar = document.querySelector('.sidebar-avatar img');
      if (sidebarAvatar) {
        sidebarAvatar.src = result;
      }
      
      showNotification('📸 Avatar atualizado!', 'success');
      
    } catch (error) {
      showNotification(error.message, 'error');
      
      // Restaurar imagem original
      const avatarImg = document.querySelector('.profile-avatar img');
      if (avatarImg) {
        avatarImg.style.opacity = '1';
        avatarImg.style.filter = 'none';
      }
    }
  });
  
  return input;
}

// INICIALIZAR SISTEMA DE PERFIL
function initializeProfileSystem() {
  // Adicionar uploader de avatar
  const avatarUploader = createAvatarUploader();
  document.body.appendChild(avatarUploader);
  
  // Adicionar evento de clique no avatar
  const avatarButton = document.querySelector('.avatar-upload');
  if (avatarButton) {
    avatarButton.addEventListener('click', () => {
      avatarUploader.click();
    });
  }
  
  // Carregar perfil atual
  const profileManager = new ProfileManager();
  const profile = profileManager.getProfile();
  
  if (profile && profile.avatar) {
    const avatarImg = document.querySelector('.profile-avatar img');
    if (avatarImg) {
      avatarImg.src = profile.avatar;
    }
  }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializeProfileSystem);

// Exportar para uso global
window.ProfileManager = ProfileManager;
window.createAvatarUploader = createAvatarUploader;