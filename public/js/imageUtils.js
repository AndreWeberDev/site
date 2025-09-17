// Utilitários para processamento de imagens

class ImageProcessor {
  static validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato não suportado. Use apenas JPG, PNG ou GIF.');
    }
    
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB.');
    }
    
    return true;
  }
  
  static async processImage(file, maxDimension = 400, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
          // Para GIFs, manter original
          if (file.type === 'image/gif') {
            resolve(e.target.result);
            return;
          }
          
          // Redimensionar outras imagens
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let { width, height } = img;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(optimizedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Erro ao processar imagem'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }
  
  static getFileExtension(dataUrl) {
    if (dataUrl.includes('data:image/gif')) return 'gif';
    if (dataUrl.includes('data:image/png')) return 'png';
    return 'jpg';
  }
  
  static createAvatarPreview(src, container) {
    const preview = document.createElement('div');
    preview.className = 'avatar-preview';
    preview.innerHTML = `
      <img src="${src}" alt="Preview">
      <div class="avatar-type-indicator">${this.getFileExtension(src)}</div>
    `;
    container.appendChild(preview);
    return preview;
  }
}

// Exportar para uso global
window.ImageProcessor = ImageProcessor;