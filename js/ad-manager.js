class AdManager {
  constructor() {
    this.adPlacements = {
      'header-ad': { type: 'banner', size: '728x90' },
      'sidebar-ad': { type: 'rectangle', size: '300x250' },
      'footer-ad': { type: 'banner', size: '468x60' }
    };
  }

  loadAds() {
    for (const [placementId, adConfig] of Object.entries(this.adPlacements)) {
      this.displayAd(placementId, adConfig);
    }
  }

  displayAd(placementId, adConfig) {
    const adContainer = document.getElementById(placementId);
    if (!adContainer) return;

    const adHtml = this.generateMockAd(adConfig);
    adContainer.innerHTML = adHtml;
  }

  generateMockAd(adConfig) {
    const adImages = {
      'banner': 'https://via.placeholder.com/728x90?text=Premium+Chatbot+Solution',
      'rectangle': 'https://via.placeholder.com/300x250?text=Upgrade+Your+Plan+Today'
    };
    
    return `
      <div class="ad-container ${adConfig.type}">
        <a href="#" class="ad-link">
          <img src="${adImages[adConfig.type]}" alt="Advertisement" class="ad-image">
        </a>
        <div class="ad-label">Sponsored</div>
      </div>
    `;
  }
}

const adManager = new AdManager();
document.addEventListener('DOMContentLoaded', () => adManager.loadAds());
