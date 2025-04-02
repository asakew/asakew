document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear().toString();

    // Get DOM elements
    const downloadForm = document.getElementById('download-form');
    const instagramUrlInput = document.getElementById('instagram-url');
    const downloadBtn = document.getElementById('download-btn');
    const loader = document.getElementById('loader');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const results = document.getElementById('results');
    const mediaContent = document.getElementById('media-content');
    
    // Add event listener for form submission
    downloadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get Instagram URL
        const instagramUrl = instagramUrlInput.value.trim();
        
        if (!instagramUrl) {
            showError('Please enter an Instagram URL');
            return;
        }
        
        // Reset UI
        resetUI();
        showLoader(true);
        
        try {
            // First validate the URL
            const isValid = await validateUrl(instagramUrl);
            
            if (!isValid) {
                showError('Invalid Instagram URL. Please enter a valid post, reel, or TV URL.');
                return;
            }
            
            // If valid, fetch the download links
            const downloadData = await fetchDownloadLinks(instagramUrl);
            
            if (downloadData.success && downloadData.data && downloadData.data.length > 0) {
                // Display results
                renderResults(downloadData);
            } else {
                showError(downloadData.error || 'Failed to extract download links. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred. Please try again later.');
        } finally {
            showLoader(false);
        }
    });
    
    // Function to validate Instagram URL
    async function validateUrl(url) {
        try {
            const response = await fetch(`/validate?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }
    
    // Function to fetch download links
    async function fetchDownloadLinks(url) {
        try {
            const response = await fetch(`/download?url=${encodeURIComponent(url)}`);
            return await response.json();
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    }
    
    // Function to render results
    function renderResults(data) {
        // Clear previous results
        mediaContent.innerHTML = '';
        
        // Add each media item
        data.data.forEach(item => {
            const mediaItem = createMediaItem(item);
            mediaContent.appendChild(mediaItem);
        });
        
        // Show results container
        results.style.display = 'block';
        
        // Scroll to results
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Function to create a media item
    function createMediaItem(item) {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        
        const thumbnailUrl = item.thumbnail || 'default-thumbnail.jpg';
        
        // Create HTML for the media item
        mediaItem.innerHTML = `
            <div class="media-thumbnail" style="background-image: url('${thumbnailUrl}')"></div>
            <div class="media-info">
                ${item.quality ? `<div class="media-quality">${item.quality}</div>` : ''}
                <a href="${item.url}" class="download-link" target="_blank" download>
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        `;
        
        return mediaItem;
    }
    
    // Function to show/hide loader
    function showLoader(show) {
        loader.style.display = show ? 'flex' : 'none';
        downloadBtn.disabled = show;
    }
    
    // Function to show error
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'flex';
        showLoader(false);
        
        // Scroll to error
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Function to reset UI
    function resetUI() {
        errorContainer.style.display = 'none';
        results.style.display = 'none';
    }
    
    // Function to clear URL input when it's clicked
    instagramUrlInput.addEventListener('focus', function() {
        if (this.value.includes('instagram.com')) {
            this.select();
        }
    });
});
