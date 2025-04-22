// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swUrl = './service-worker.js';
        
        // Register Service Worker
        navigator.serviceWorker.register(swUrl, { scope: './' })
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, show update notification
                            showUpdateNotification(registration);
                        }
                    });
                });

                // Handle updates
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                        refreshing = true;
                        window.location.reload();
                    }
                });
            })
            .catch(error => {
                console.error('ServiceWorker registration failed: ', error);
            });
    });
}

// Show update notification
function showUpdateNotification(registration) {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <p>New version available!</p>
            <button class="update-button">Update Now</button>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .update-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        .update-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .update-button {
            background: #005b96;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .update-button:hover {
            background: #004d80;
        }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(notification);

    // Handle update button click
    notification.querySelector('.update-button').addEventListener('click', () => {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        notification.remove();
    });
}

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('You are now online');
    // You can add code to sync data or show online status
});

window.addEventListener('offline', () => {
    console.log('You are now offline');
    // You can add code to show offline status or handle offline mode
});

// Check initial online status
if (!navigator.onLine) {
    console.log('You are currently offline');
    // You can add code to handle initial offline state
} 