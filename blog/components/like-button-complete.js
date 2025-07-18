(function() {
    // Inject CSS
    const css = `
        .like-button-section {
            text-align: center;
            margin: 3em 0;
        }
        .like-button {
            background: #fff;
            border: 2px solid #49bf9d;
            color: #49bf9d;
            padding: 10px 30px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .like-button:hover {
            background: #49bf9d !important;
            color: white !important;
        }
        .like-button.liked {
            background: #49bf9d !important;
            color: white !important;
        }
        .like-button.liked .heart-icon {
            font-weight: 900;
        }
        .like-count {
            background: #49bf9d;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            margin-left: 5px;
            font-size: 14px;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    // Like Button Class (same as above)
    class LikeButton {
        // ... (same implementation as above)
    }
    
    // Auto-initialize
    document.addEventListener('DOMContentLoaded', function() {
        new LikeButton();
    });
})();