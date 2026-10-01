const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `
<!-- Card 1 -->
<div class="flex-none w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] snap-start bg-surface-container-lowest flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all duration-300">
  <div>
    <div class="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
      <img class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPMLAzR0vlgCTmQ_xAK1kTCmRa9D3nN2xsyUfiHpVg7AOGGKFYYX3p9wXZQ4zK29k-q46Fxwnr1FMYMxQZg6PfA6s65Z0CywjBqymnpbDiwdD893dYYG4ZV0MyTgXI_QfigjtRuDk-_VUOIubk80ZoOTGvi6EWW5F1dZSa1_zC-sM5-Ph9HsYTzruqE1HPLvHa6X-QWCgD7h9J5vKHYAv4IOOuKDGTPO6eeZKTE6Y27-7acSPG3OHV"/>
      <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
      <div class="absolute bottom-6 left-6 right-6">
        <span class="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">18K Yellow Gold &amp; Platinum</span>
        <h3 class="font-headline-md text-2xl text-on-primary mt-1">Solitaire Brilliant Pavé</h3>
      </div>
      <span class="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm font-label-caps text-[10px] uppercase tracking-widest px-3 py-1 text-primary">Signature</span>
    </div>
    <div class="p-6">
      <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">Solitaire brilliant round diamond engagement ring set on a micro-pavé band of 18k Ethiopian yellow gold.</p>
      <div class="font-body-md text-sm text-secondary font-semibold mt-4">Price Upon Request</div>
    </div>
  </div>
  <div class="p-6 pt-0 flex flex-col gap-2">
    <button class="try-on-btn inline-flex items-center justify-between w-full py-3 px-4 bg-secondary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors" data-name="Solitaire Brilliant Pavé" data-category="ring" data-desc="Solitaire brilliant round diamond engagement ring set on a micro-pavé band of 18k Ethiopian yellow gold">
      <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">checkroom</span> Try On</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
    </button>
    <a class="inline-flex items-center justify-between w-full py-3 px-4 bg-surface-container hover:bg-primary hover:text-on-primary font-label-caps text-label-caps uppercase tracking-widest text-primary transition-colors" href="#">
      <span>View Details</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
    </a>
  </div>
</div>
<!-- Card 2 -->
<div class="flex-none w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] snap-start bg-surface-container-lowest flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all duration-300">
  <div>
    <div class="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
      <img class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXRb9ivNbvNFSu6Sj1vDGmNt25mRFL_aGC6hXo6JeZViQefCCgGvyg8N_Q5Fem9Zr0OXn3U9OCo9HUyoRfWdViaAze6Qi3C3u07tH6CF24Btv33d-mXzzpm7IT4lSY9ttTLu1n9a_KF7PS6kj5Wu1omE2paI-mkzYaJootKlN2igR1yOyR-mEmAyzK2fsMAQcAHearYlrWpNJHjaSIhIOXUbQsBEjfdRnuLe7nD_XX3bLdD-BzqHpo"/>
      <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
      <div class="absolute bottom-6 left-6 right-6">
        <span class="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">Pure Platinum 950</span>
        <h3 class="font-headline-md text-2xl text-on-primary mt-1">Vintage Emerald Cut Halo</h3>
      </div>
      <span class="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm font-label-caps text-[10px] uppercase tracking-widest px-3 py-1 text-primary">Heirloom</span>
    </div>
    <div class="p-6">
      <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">Vintage emerald cut halo diamond ring crafted in solid platinum with baguette side accents.</p>
      <div class="font-body-md text-sm text-secondary font-semibold mt-4">Price Upon Request</div>
    </div>
  </div>
  <div class="p-6 pt-0 flex flex-col gap-2">
    <button class="try-on-btn inline-flex items-center justify-between w-full py-3 px-4 bg-secondary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors" data-name="Vintage Emerald Cut Halo" data-category="ring" data-desc="Vintage emerald cut halo diamond ring crafted in solid platinum with baguette side accents">
      <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">checkroom</span> Try On</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
    </button>
    <a class="inline-flex items-center justify-between w-full py-3 px-4 bg-surface-container hover:bg-primary hover:text-on-primary font-label-caps text-label-caps uppercase tracking-widest text-primary transition-colors" href="#">
      <span>View Details</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
    </a>
  </div>
</div>
<!-- Card 3 -->
<div class="flex-none w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] snap-start bg-surface-container-lowest flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all duration-300">
  <div>
    <div class="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
      <img class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR-RM-ybABhoRmMcalpVcoBCZgJgjGxrLyW-e4qkkfztuS3D8DHVp7844uxZaTWECN6hFhKNXbucryFCNKGI2iUlT7q8_F61dGMj0v2uRlb9VkruaY4g7mxiw8ZPgl-y_y_fG1WmI9DfvgCIa13YWtD22TgdHsQ7jemeAkoyz74pknEAt26LgoF82S1l4w1504xvO7LuaiMsMPCp48HNcsObtT9WjqFJauL68G9PnjaJXY0u9aUOEG"/>
      <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
      <div class="absolute bottom-6 left-6 right-6">
        <span class="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">18K Warm Rose Gold</span>
        <h3 class="font-headline-md text-2xl text-on-primary mt-1">Royal Queen Pear Ring</h3>
      </div>
      <span class="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm font-label-caps text-[10px] uppercase tracking-widest px-3 py-1 text-primary">Limited</span>
    </div>
    <div class="p-6">
      <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">Royal Queen pear shaped diamond engagement ring with hidden halo and twisted diamond band in warm rose gold.</p>
      <div class="font-body-md text-sm text-secondary font-semibold mt-4">Price Upon Request</div>
    </div>
  </div>
  <div class="p-6 pt-0 flex flex-col gap-2">
    <button class="try-on-btn inline-flex items-center justify-between w-full py-3 px-4 bg-secondary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors" data-name="Royal Queen Pear Ring" data-category="ring" data-desc="Royal Queen pear shaped diamond engagement ring with hidden halo and twisted diamond band in warm rose gold">
      <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">checkroom</span> Try On</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
    </button>
    <a class="inline-flex items-center justify-between w-full py-3 px-4 bg-surface-container hover:bg-primary hover:text-on-primary font-label-caps text-label-caps uppercase tracking-widest text-primary transition-colors" href="#">
      <span>View Details</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
    </a>
  </div>
</div>
<!-- Card 4 -->
<div class="flex-none w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] snap-start bg-surface-container-lowest flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all duration-300">
  <div>
    <div class="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
      <img class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfSk82FBNDUya2XV7JpClyMDuZHPInqMinucwko9_c6Aq2Z5BJYnsmL7_PXpwqid7H0zBEpTMElyxjkfQlLwjfCE1AzHy8zj8bDpXgUD_LvuRTDMar5dejBC7VNcDjMFHXMkoSEgGCyMH3KPyHKEGEz_Y-FS9tLAWjxTGjUXAwQ9K1JzPR8IwaGkPscCbqOGR74cSYP9Q7Z2I6d-_rJYzQsXNCN7s-YAcvvgk1LlJyUZK1d8Y3zqwi"/>
      <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
      <div class="absolute bottom-6 left-6 right-6">
        <span class="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">Platinum &amp; Yellow Gold</span>
        <h3 class="font-headline-md text-2xl text-on-primary mt-1">Two-Stone Toi et Moi</h3>
      </div>
      <span class="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm font-label-caps text-[10px] uppercase tracking-widest px-3 py-1 text-primary">Bespoke</span>
    </div>
    <div class="p-6">
      <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">Avant-garde bespoke two-stone Toi et Moi engagement ring pairing a vivid oval diamond and an emerald cut diamond on an open bypass platinum band.</p>
      <div class="font-body-md text-sm text-secondary font-semibold mt-4">Price Upon Request</div>
    </div>
  </div>
  <div class="p-6 pt-0 flex flex-col gap-2">
    <button class="try-on-btn inline-flex items-center justify-between w-full py-3 px-4 bg-secondary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors" data-name="Two-Stone Toi et Moi" data-category="ring" data-desc="Avant-garde bespoke two-stone Toi et Moi engagement ring pairing a vivid oval diamond and an emerald cut diamond on an open bypass platinum band">
      <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">checkroom</span> Try On</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
    </button>
    <a class="inline-flex items-center justify-between w-full py-3 px-4 bg-surface-container hover:bg-primary hover:text-on-primary font-label-caps text-label-caps uppercase tracking-widest text-primary transition-colors" href="#">
      <span>View Details</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
    </a>
  </div>
</div>
`;

html = html.replace(/<!-- Card 1 -->[\s\S]*?<!-- Card 4 -->[\s\S]*?<\/div>\s*<\/div>/, replacement);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Replaced cards!');
