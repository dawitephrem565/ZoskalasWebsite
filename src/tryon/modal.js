export class TryOnModal {
  constructor() {
    this.el = document.getElementById('tryon-modal');
    this.steps = ['consent', 'upload', 'preview', 'collection', 'processing', 'result'];
    this.currentStep = 'consent';
    this.product = null;
    this.userImage = null;
    this.resultImage = null;
    this.stream = null;
    this.collection = [];
    this.collectionLoaded = false;
    this.selectedJewelry = null;
  }

  open(product) {
    this.product = product;
    this.currentStep = 'consent';
    this.selectedJewelry = null;
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
    this.selectedJewelry = null;
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  canTryOn() {
    if (this.selectedJewelry) return true;
    return this.collectionLoaded && this.collection.length === 0;
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
      case 'collection': return this.collectionHTML();
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
    const sel = this.selectedJewelry;
    const canTry = this.canTryOn();
    const selBlock = sel ? `
        <img src="${this.esc(sel.url)}" alt="${this.esc(sel.title)}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0">
        <div class="flex-1 min-w-0 text-left">
          <div class="text-[10px] uppercase tracking-widest" style="color:var(--md-sys-color-outline)">Selected piece</div>
          <div class="text-sm font-medium truncate" style="color:var(--md-sys-color-on-surface)">${this.esc(sel.title || 'Collection piece')}</div>
        </div>` : `
        <span class="material-symbols-outlined flex-shrink-0" style="color:var(--md-sys-color-secondary)">diamond</span>
        <div class="flex-1 text-sm text-left" style="color:var(--md-sys-color-outline)">Select a piece from the collection to try on</div>`;
    return `
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold" style="font-family:'Bodoni Moda',serif">Preview</h3>
          <button id="tryon-back-btn" class="p-2 rounded-full" style="color:var(--md-sys-color-outline)">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <div class="rounded-2xl overflow-hidden mb-4" style="aspect-ratio:3/4;background:var(--md-sys-color-surface-container)">
          <img id="tryon-preview-img" src="${this.userImage || ''}" alt="Your photo preview" class="w-full h-full object-cover" />
        </div>
        <div class="flex items-center gap-3 p-3 rounded-xl mb-4" style="background:var(--md-sys-color-surface-container)">
          ${selBlock}
          <button id="tryon-select-collection-btn" class="px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap" style="border-color:var(--md-sys-color-outline);color:var(--md-sys-color-on-surface)">
            ${sel ? 'Change' : 'Select Collection'}
          </button>
        </div>
        <div class="flex gap-3">
          <button id="tryon-retake-btn" class="flex-1 py-3 rounded-full text-sm font-medium border" style="border-color:var(--md-sys-color-outline)">
            Retake
          </button>
          <button id="tryon-go-btn" ${canTry ? '' : 'disabled'} class="flex-1 py-3 rounded-full text-sm font-medium transition-all ${canTry ? 'hover:scale-[1.02]' : 'opacity-40 cursor-not-allowed'}" style="background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)">
            Try It
          </button>
        </div>
      </div>`;
  }

  collectionHTML() {
    const items = this.collection;
    const body = items.length
      ? `<div class="grid grid-cols-2 gap-3" style="max-height:55vh;overflow-y:auto;padding-right:4px">
          ${items.map((im, i) => `
            <button class="tryon-collection-item group relative rounded-xl overflow-hidden border text-left" data-url="${this.esc(im.url)}" data-title="${this.esc(im.title || '')}" style="aspect-ratio:1/1;border-color:${this.selectedJewelry?.url === im.url ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}">
              <img src="${this.esc(im.url)}" alt="${this.esc(im.title || 'Collection piece')}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] uppercase tracking-widest p-2 truncate">${this.esc(im.title || 'Piece ' + (i + 1))}</span>
            </button>`).join('')}
        </div>`
      : `<div class="text-center py-10 text-sm" style="color:var(--md-sys-color-outline)">
          ${this.collectionLoaded ? 'No collection images yet. Upload them from the admin panel.' : 'Loading collection...'}
        </div>`;
    return `
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold" style="font-family:'Bodoni Moda',serif">Select Collection</h3>
          <button id="tryon-collection-back-btn" class="p-2 rounded-full" style="color:var(--md-sys-color-outline)">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        ${body}
      </div>`;
  }

  processingHTML() {
    return `
      <div class="p-6 text-center">
        <div class="relative w-16 h-16 mx-auto mb-4">
          <div class="absolute inset-0 rounded-full border-2" style="border-color:var(--md-sys-color-surface-container);border-top-color:var(--md-sys-color-secondary);animation:spin 1s linear infinite"></div>
          <span class="material-symbols-outlined absolute inset-0 m-auto text-2xl" style="color:var(--md-sys-color-secondary)">diamond</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Processing your try-on...</h3>
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
          <img id="tryon-result-img" src="${this.resultImage || ''}" alt="Try-on result" class="w-full h-full object-cover" />
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
      document.getElementById('tryon-select-collection-btn')?.addEventListener('click', () => {
        this.currentStep = 'collection';
        this.render();
        this.loadCollection();
      });
      document.getElementById('tryon-go-btn')?.addEventListener('click', () => {
        if (!this.canTryOn()) return;
        this.process();
      });
    }

    if (this.currentStep === 'collection') {
      document.getElementById('tryon-collection-back-btn')?.addEventListener('click', () => {
        this.currentStep = 'preview';
        this.render();
      });
      this.el.querySelectorAll('.tryon-collection-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.selectedJewelry = { url: btn.dataset.url, title: btn.dataset.title || '' };
          this.currentStep = 'preview';
          this.render();
        });
      });
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
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    this.userImage = canvas.toDataURL('image/jpeg', 0.85);
    this.stopCamera();

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
      this.currentStep = 'preview';
      this.render();
    };
    reader.readAsDataURL(file);
  }

  async loadCollection() {
    if (this.collectionLoaded) return;
    try {
      const resp = await fetch('/api/collection');
      const data = await resp.json();
      this.collection = data.images || [];
    } catch (err) {
      console.error('Collection load error:', err);
      this.collection = [];
    }
    this.collectionLoaded = true;
    if (this.currentStep === 'collection') this.render();
  }

  async urlToDataUrl(url) {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      return await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
    } catch {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/jpeg', 0.9);
    }
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

      let jewelryImage = null;
      let jewelryMimeType = 'image/jpeg';
      const jewelryTitle = this.selectedJewelry?.title || '';
      if (this.selectedJewelry?.url) {
        try {
          const refDataUrl = await this.urlToDataUrl(this.selectedJewelry.url);
          const refCompressed = await this.compressDataUrl(refDataUrl, 768, 0.82);
          jewelryImage = refCompressed.split(',')[1];
          jewelryMimeType = refCompressed.match(/^data:(.*?);/)?.[1] || 'image/jpeg';
        } catch (err) {
          console.warn('Jewelry reference load failed, falling back to text-only:', err);
        }
      }

      const resp = await fetch('/api/tryon/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          category: this.product.tryOnCategory || 'ring',
          jewelryName: this.product.name,
          jewelryDesc: this.product.desc || this.product.tagline,
          jewelryImage,
          jewelryMimeType,
          jewelryTitle,
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
      this.currentStep = 'result';
      this.render();
    } catch (err) {
      console.error('Try-on processing error:', err);
      alert('Failed to process try-on: ' + err.message);
      this.currentStep = 'preview';
      this.render();
    }
  }

  saveResult() {
    if (!this.resultImage) return;
    const a = document.createElement('a');
    a.href = this.resultImage;
    a.download = `tryon-${(this.product?.name || 'piece').toLowerCase().replace(/\s+/g, '-')}.jpg`;
    a.click();
  }
}
