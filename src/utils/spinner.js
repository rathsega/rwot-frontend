// ✅ Spinner Management Utility
let activeRequests = 0;
let spinnerElement = null;

export const showSpinner = () => {
  if (spinnerElement) return; // Already showing

  spinnerElement = document.createElement('div');
  spinnerElement.id = 'rwot-spinner-overlay';
  spinnerElement.innerHTML = `
    <style>
      #rwot-spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        animation: fadeIn 0.2s ease-in;
        pointer-events: all;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      .rwot-spinner-container {
        text-align: center;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .rwot-letters {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-bottom: 20px;
      }

      .rwot-letter {
        font-size: 48px;
        font-weight: 800;
        color: #fff;
        text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
        animation: bounce 1.4s infinite;
        font-family: 'Arial', sans-serif;
        letter-spacing: 2px;
      }

      .rwot-letter:nth-child(1) { animation-delay: 0s; color: #667eea; }
      .rwot-letter:nth-child(2) { animation-delay: 0.1s; color: #764ba2; }
      .rwot-letter:nth-child(3) { animation-delay: 0.2s; color: #f093fb; }
      .rwot-letter:nth-child(4) { animation-delay: 0.3s; color: #4facfe; }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-15px); }
        50% { transform: translateY(0); }
      }

      .rwot-spinner-ring {
        width: 80px;
        height: 80px;
        margin: 0 auto;
        border: 6px solid rgba(255, 255, 255, 0.1);
        border-top: 6px solid #667eea;
        border-right: 6px solid #764ba2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .rwot-spinner-text {
        color: #fff;
        font-size: 16px;
        font-weight: 500;
        margin-top: 20px;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    </style>
    <div class="rwot-spinner-container">
      <div class="rwot-letters">
        <span class="rwot-letter">R</span>
        <span class="rwot-letter">W</span>
        <span class="rwot-letter">O</span>
        <span class="rwot-letter">T</span>
      </div>
      <div class="rwot-spinner-ring"></div>
      <div class="rwot-spinner-text">Processing...</div>
    </div>
  `;

  document.body.appendChild(spinnerElement);
  document.body.style.overflow = 'hidden'; // Prevent scrolling
};

export const hideSpinner = () => {
  if (spinnerElement) {
    spinnerElement.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => {
      if (spinnerElement && spinnerElement.parentNode) {
        spinnerElement.parentNode.removeChild(spinnerElement);
        spinnerElement = null;
        document.body.style.overflow = ''; // Restore scrolling
      }
    }, 200);
  }
};

// ✅ Increment active requests counter
export const incrementRequests = () => {
  activeRequests++;
  if (activeRequests === 1) {
    showSpinner();
  }
};

// ✅ Decrement active requests counter
export const decrementRequests = () => {
  activeRequests--;
  if (activeRequests === 0) {
    hideSpinner();
  }
};

// ✅ Get current active requests count
export const getActiveRequestsCount = () => activeRequests;

// ✅ Force hide spinner (use with caution)
export const forceHideSpinner = () => {
  activeRequests = 0;
  hideSpinner();
};