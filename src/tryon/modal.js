export class TryOnModal {
  constructor() {
    this.el = document.getElementById('tryon-modal');
    this.steps = ['consent', 'upload', 'preview', 'processing', 'result'];
    this.currentStep = 'consent';
    this.product = null;
    this.userImage = null;
    this.resultImage = null;
    this.stream = null;
  }

  open(product) {
    this.product = product;
    this.currentStep = 'consent';
    this.render();
    this.el.classList.remove('hidden');
    this.el.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.el.classList.add('hidden');
    this.el.classList.remove('flex');
    document.body.style.overflow = '';
    this.stopCamera();
    this.userImage = null;
    this.resultImage = null;
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  render() {
    const content = this.el.querySelector('#tryon-content');
    content.innerHTML = this.getStepHTML();
    this.bindStepEvents();
  }

  getStepHTML() {
    switch (this.currentStep) {
      case 'consent': return this.consentHTML();
      case 'upload': return this.uploadHTML();
      case 'preview': return this.previewHTML();
      case 'processing': return this.processingHTML();
      case 'result': return this.resultHTML();
    }
  }

  consentHTML() {
    return `
      <div class="p-6 text-center">
        <span class="material-symbols-outlined text-6xl mb-4 block" style="color:var(--md-sys-color-secondary)">diamond</span>
        <h3 class="text-xl font-semibold mb-2" style="font-family:'Bodoni Moda',serif">Virtual Try-On</h3>
        <p class="text-sm mb-4" style="color:var(--md-sys-color-outline)">Your photo is processed locally and never stored. We only send it to our server for AI processing and discard it immediately after.</p>
        <div class="text-left text-xs p-4 rounded-xl mb-6" style="background:var(--md-sys-color-surface-container)">
          <p class="font-medium mb-1">Privacy Promise:</p>
          <ul class="list-disc pl-4 space-y-1" style="color:var(--md-sys-color-outline)">
            <li>Photos processed in-memory only</li>
            <li>No images stored on our servers</li>
            <li>No images shared with third parties</li>
            <li>You can delete results anytime</li>
          </ul>
        </div>
        <button id="tryon-consent-btn" class="w-full py-3 rounded-full text-sm font-medium transition-all hover:scale-[1.02]" style="background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)">
          I consent — Let me try it
        </button>
      </div>`;
  }

  uploadHTML() {
    return `
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold" style="font-family:'Bodoni Moda',serif">Take a photo</h3>
          <button id="tryon-back-btn" class="p-2 rounded-full" style="color:var(--md-sys-color-outline)">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <div class="relative rounded-2xl overflow-hidden mb-4" style="aspect-ratio:3/4;background:var(--md-sys-color-surface-container)">
          <video id="tryon-video" autoplay playsinline class="w-full h-full object-cover"></video>
          <canvas id="tryon-canvas" class="hidden"></canvas>
          <div id="tryon-overlay" class="absolute inset-0 pointer-events-none"></div>
        </div>
        <div class="flex gap-3">
          <button id="tryon-upload-btn" class="flex-1 py-3 rounded-full text-sm font-medium border" style="border-color:var(--md-sys-color-outline);color:var(--md-sys-color-on-surface)">
            Upload photo
          </button>
          <button id="tryon-capture-btn" class="flex-1 py-3 rounded-full text-sm font-medium" style="background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)">
            Capture
          </button>
        </div>
        <input type="file" id="tryon-file-input" accept="image/*" class="hidden">
      </div>`;
  }

  previewHTML() {
    return `
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold" style="font-family:'Bodoni Moda',serif">Preview</h3>
          <button id="tryon-back-btn" class="p-2 rounded-full" style="color:var(--md-sys-color-outline)">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <div class="rounded-2xl overflow-hidden mb-4" style="aspect-ratio:3/4;background:var(--md-sys-color-surface-container)">
          <img id="tryon-preview-img" class="w-full h-full object-cover" />
        </div>
        <div class="flex gap-3">
          <button id="tryon-retake-btn" class="flex-1 py-3 rounded-full text-sm font-medium border" style="border-color:var(--md-sys-color-outline)">
            Retake
          </button>
          <button id="tryon-go-btn" class="flex-1 py-3 rounded-full text-sm font-medium" style="background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)">
            Try on ${this.product?.name || 'this item'}
          </button>
        </div>
      </div>`;
  }

  processingHTML() {
    return `
      <div class="p-6 text-center">
        <div class="relative w-16 h-16 mx-auto mb-4">
          <div class="absolute inset-0 rounded-full border-2" style="border-color:var(--md-sys-color-surface-container);border-top-color:var(--md-sys-color-secondary);animation:spin 1s linear infinite"></div>
          <span class="material-symbols-outlined absolute inset-0 m-auto text-2xl" style="color:var(--md-sys-color-secondary)">diamond</span>
        </div>
        <h3 class="text-lg font-semibold mb-2" style="font-family:'Bodoni Moda',serif">Processing your try-on...</h3>
        <p class="text-sm" style="color:var(--md-sys-color-outline)">AI is blending the jewelry with your photo</p>
      </div>`;
  }

  resultHTML() {
    return `
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold" style="font-family:'Bodoni Moda',serif">Your Try-On Result</h3>
          <button id="tryon-close-result-btn" class="p-2 rounded-full" style="color:var(--md-sys-color-outline)">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="rounded-2xl overflow-hidden mb-4" style="aspect-ratio:3/4;background:var(--md-sys-color-surface-container)">
          <img id="tryon-result-img" class="w-full h-full object-cover" />
        </div>
        <div class="flex gap-3">
          <button id="tryon-save-btn" class="flex-1 py-3 rounded-full text-sm font-medium" style="background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)">
            Save image
          </button>
          <button id="tryon-new-btn" class="flex-1 py-3 rounded-full text-sm font-medium border" style="border-color:var(--md-sys-color-outline)">
            Try another
          </button>
        </div>
      </div>`;
  }

  bindStepEvents() {
    if (this.currentStep === 'consent') {
      document.getElementById('tryon-consent-btn')?.addEventListener('click', () => {
        this.currentStep = 'upload';
        this.render();
        this.startCamera();
      });
    }

    if (this.currentStep === 'upload') {
      document.getElementById('tryon-back-btn')?.addEventListener('click', () => {
        this.stopCamera();
        this.currentStep = 'consent';
        this.render();
      });

      document.getElementById('tryon-capture-btn')?.addEventListener('click', () => this.capture());
      document.getElementById('tryon-upload-btn')?.addEventListener('click', () => {
        document.getElementById('tryon-file-input')?.click();
      });
      document.getElementById('tryon-file-input')?.addEventListener('change', (e) => this.handleFile(e));
    }

    if (this.currentStep === 'preview') {
      document.getElementById('tryon-back-btn')?.addEventListener('click', () => {
        this.userImage = null;
        this.currentStep = 'upload';
        this.render();
        this.startCamera();
      });
      document.getElementById('tryon-retake-btn')?.addEventListener('click', () => {
        this.userImage = null;
        this.currentStep = 'upload';
        this.render();
        this.startCamera();
      });
      document.getElementById('tryon-go-btn')?.addEventListener('click', () => this.process());
    }

    if (this.currentStep === 'result') {
      document.getElementById('tryon-close-result-btn')?.addEventListener('click', () => this.close());
      document.getElementById('tryon-save-btn')?.addEventListener('click', () => this.saveResult());
      document.getElementById('tryon-new-btn')?.addEventListener('click', () => {
        this.userImage = null;
        this.resultImage = null;
        this.currentStep = 'upload';
        this.render();
        this.startCamera();
      });
    }
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }
      });
      const video = document.getElementById('tryon-video');
      if (video) {
        video.srcObject = this.stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  }

  capture() {
    const video = document.getElementById('tryon-video');
    const canvas = document.getElementById('tryon-canvas');
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    this.userImage = canvas.toDataURL('image/jpeg', 0.85);
    this.stopCamera();

    const previewImg = document.getElementById('tryon-preview-img');
    if (previewImg) previewImg.src = this.userImage;

    this.currentStep = 'preview';
    this.render();
  }

  handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      this.userImage = ev.target.result;
      this.stopCamera();

      const previewImg = document.getElementById('tryon-preview-img');
      if (previewImg) previewImg.src = this.userImage;

      this.currentStep = 'preview';
      this.render();
    };
    reader.readAsDataURL(file);
  }

  async compressDataUrl(dataUrl, maxDim = 1280, quality = 0.85) {
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', quality);
    } catch {
      return dataUrl;
    }
  }

  async process() {
    this.currentStep = 'processing';
    this.render();

    try {
      const compressed = await this.compressDataUrl(this.userImage);
      const base64 = compressed.split(',')[1];
      const resp = await fetch('/api/tryon/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          category: this.product.tryOnCategory || 'ring',
          jewelryName: this.product.name,
          jewelryDesc: this.product.desc || this.product.tagline,
          skinHint: ''
        })
      });

      let data;
      try {
        data = await resp.json();
      } catch {
        throw new Error(`Server returned ${resp.status} — is the try-on server running?`);
      }
      if (!resp.ok) throw new Error(data.error || data.detail || 'Try-on failed');

      this.resultImage = `data:${data.mimeType};base64,${data.image}`;
      const resultImg = document.getElementById('tryon-result-img');
      if (resultImg) resultImg.src = this.resultImage;

      this.currentStep = 'result';
      this.render();
    } catch (err) {
      console.error('Try-on processing error:', err);
      alert('Failed to process try-on: ' + err.message);
      this.currentStep = 'upload';
      this.render();
      this.startCamera();
    }
  }

  saveResult() {
    if (!this.resultImage) return;
    const a = document.createElement('a');
    a.href = this.resultImage;
    a.download = `tryon-${this.product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    a.click();
  }
}
