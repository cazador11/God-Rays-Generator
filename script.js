// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const editorSection = document.getElementById('editorSection');
const exportSection = document.getElementById('exportSection');
const previewCanvas = document.getElementById('previewCanvas');
const beforeAfterToggle = document.getElementById('beforeAfterToggle');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const tutorialBtn = document.getElementById('tutorialBtn');
const tutorialOverlay = document.getElementById('tutorialOverlay');
const closeTutorial = document.getElementById('closeTutorial');
const startTutorial = document.getElementById('startTutorial');

// Control Elements
const positionXSlider = document.getElementById('positionX');
const positionYSlider = document.getElementById('positionY');
const intensitySlider = document.getElementById('intensity');
const rayCountSlider = document.getElementById('rayCount');
const spreadAngleSlider = document.getElementById('spreadAngle');
const rayColorPicker = document.getElementById('rayColor');
const presetButtons = document.querySelectorAll('.preset-btn');
const exportFormatSelect = document.getElementById('exportFormat');
const exportQualitySlider = document.getElementById('exportQuality');
const exportSizeSelect = document.getElementById('exportSize');
const shareButtons = document.querySelectorAll('.share-btn');

// Canvas Context
const ctx = previewCanvas.getContext('2d');

// State
let originalImage = null;
let processedImage = null;
let currentSettings = {
    positionX: 50,
    positionY: 50,
    intensity: 50,
    rayCount: 20,
    spreadAngle: 90,
    rayColor: '#ffffff'
};

// Presets
const presets = {
    'divine-glow': {
        positionX: 50,
        positionY: 30,
        intensity: 70,
        rayCount: 30,
        spreadAngle: 120,
        rayColor: '#fffacd'
    },
    'sunset-burst': {
        positionX: 50,
        positionY: 80,
        intensity: 60,
        rayCount: 15,
        spreadAngle: 160,
        rayColor: '#ff7f50'
    },
    'celestial-beam': {
        positionX: 50,
        positionY: 0,
        intensity: 80,
        rayCount: 10,
        spreadAngle: 30,
        rayColor: '#add8e6'
    }
};

// Initialize
function init() {
    console.log('Initializing God Rays Generator...');
    
    // Check if all required DOM elements are available
    const requiredElements = {
        'uploadArea': uploadArea,
        'fileInput': fileInput,
        'editorSection': editorSection,
        'exportSection': exportSection,
        'previewCanvas': previewCanvas,
        'beforeAfterToggle': beforeAfterToggle,
        'resetBtn': resetBtn,
        'downloadBtn': downloadBtn,
        'positionXSlider': positionXSlider,
        'positionYSlider': positionYSlider,
        'intensitySlider': intensitySlider,
        'rayCountSlider': rayCountSlider,
        'spreadAngleSlider': spreadAngleSlider,
        'rayColorPicker': rayColorPicker,
        'exportFormatSelect': exportFormatSelect,
        'exportQualitySlider': exportQualitySlider,
        'exportSizeSelect': exportSizeSelect
    };
    
    let missingElements = [];
    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            missingElements.push(name);
        }
    }
    
    if (missingElements.length > 0) {
        console.warn('Missing DOM elements:', missingElements.join(', '));
    }
    
    setupEventListeners();
    showTutorial();
    
    // Set initial values for sliders and color picker
    updateControlsFromSettings(currentSettings);
    
    console.log('Initialization complete with default settings:', currentSettings);
}

// Event Listeners
function setupEventListeners() {
    // Upload handlers
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Control handlers - Make sure all sliders are properly connected
    if (positionXSlider) positionXSlider.addEventListener('input', handleControlChange);
    if (positionYSlider) positionYSlider.addEventListener('input', handleControlChange);
    if (intensitySlider) intensitySlider.addEventListener('input', handleControlChange);
    if (rayCountSlider) rayCountSlider.addEventListener('input', handleControlChange);
    if (spreadAngleSlider) spreadAngleSlider.addEventListener('input', handleControlChange);
    if (rayColorPicker) rayColorPicker.addEventListener('input', handleControlChange);
    
    // Before/After toggle
    if (beforeAfterToggle) beforeAfterToggle.addEventListener('change', toggleBeforeAfter);
    
    // Reset button
    if (resetBtn) resetBtn.addEventListener('click', resetControls);
    
    // Preset buttons
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const presetName = button.dataset.preset;
            applyPreset(presetName);
        });
    });
    
    // Download button
    if (downloadBtn) downloadBtn.addEventListener('click', downloadImage);
    
    // Share buttons
    shareButtons.forEach(button => {
        button.addEventListener('click', () => {
            const platform = button.dataset.platform;
            shareImage(platform);
        });
    });
    
    // Tutorial buttons
    if (tutorialBtn) tutorialBtn.addEventListener('click', showTutorial);
    if (closeTutorial) closeTutorial.addEventListener('click', hideTutorial);
    if (startTutorial) startTutorial.addEventListener('click', hideTutorial);
    
    // Window resize
    window.addEventListener('resize', handleResize);
}

// File Upload Handlers
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
        processFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
        processFile(file);
    }
}

function processFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            originalImage = img;
            
            // Show editor and export sections
            editorSection.classList.remove('hidden');
            exportSection.classList.remove('hidden');
            
            // Setup canvas
            setupCanvas();
            
            // Apply initial effect
            applyGodRaysEffect();
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

// Canvas Setup
function setupCanvas() {
    // Set canvas dimensions based on image and container
    const containerWidth = previewCanvas.parentElement.clientWidth;
    const containerHeight = previewCanvas.parentElement.clientHeight;
    
    // Calculate aspect ratio
    const imageAspectRatio = originalImage.width / originalImage.height;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let canvasWidth, canvasHeight;
    
    if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imageAspectRatio;
    } else {
        // Image is taller than container
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imageAspectRatio;
    }
    
    // Set canvas dimensions
    previewCanvas.width = canvasWidth;
    previewCanvas.height = canvasHeight;
    
    // Draw original image
    ctx.drawImage(originalImage, 0, 0, canvasWidth, canvasHeight);
}

// Handle window resize
function handleResize() {
    if (originalImage) {
        setupCanvas();
        applyGodRaysEffect();
    }
}

// God Rays Effect
function applyGodRaysEffect() {
    console.log('Applying God Rays effect with settings:', currentSettings);
    
    if (!originalImage) {
        console.error('No original image available');
        return;
    }
    
    try {
        // Get canvas dimensions
        const width = previewCanvas.width;
        const height = previewCanvas.height;
        
        // Create off-screen canvas for processing
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const offCtx = offscreenCanvas.getContext('2d');
        
        // Draw original image to offscreen canvas
        offCtx.drawImage(originalImage, 0, 0, width, height);
        
        // Get image data
        const imageData = offCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Calculate ray source position
        const sourceX = (currentSettings.positionX / 100) * width;
        const sourceY = (currentSettings.positionY / 100) * height;
        
        // Convert ray color from hex to RGB
        const rayColor = hexToRgb(currentSettings.rayColor);
        
        // Calculate intensity factor (0-1)
        const intensityFactor = currentSettings.intensity / 100;
        
        // Calculate ray parameters
        const rayCount = currentSettings.rayCount;
        const spreadAngleRad = (currentSettings.spreadAngle * Math.PI) / 180;
        const startAngle = -spreadAngleRad / 2;
        const angleStep = spreadAngleRad / (rayCount - 1);
        
        console.log(`Ray parameters: count=${rayCount}, angle=${spreadAngleRad}, intensity=${intensityFactor}`);
        console.log(`Source position: x=${sourceX}, y=${sourceY}`);
        console.log(`Ray color: r=${rayColor.r}, g=${rayColor.g}, b=${rayColor.b}`);
        
        // Create a temporary canvas for the rays
        const raysCanvas = document.createElement('canvas');
        raysCanvas.width = width;
        raysCanvas.height = height;
        const raysCtx = raysCanvas.getContext('2d');
        
        // Draw rays
        raysCtx.save();
        raysCtx.globalCompositeOperation = 'lighter';
        
        for (let i = 0; i < rayCount; i++) {
            const angle = startAngle + (i * angleStep);
            const rayLength = Math.max(width, height) * 2;
            
            // Calculate end point of ray
            const endX = sourceX + Math.cos(angle) * rayLength;
            const endY = sourceY + Math.sin(angle) * rayLength;
            
            // Create gradient for ray
            const gradient = raysCtx.createLinearGradient(sourceX, sourceY, endX, endY);
            gradient.addColorStop(0, `rgba(${rayColor.r}, ${rayColor.g}, ${rayColor.b}, ${intensityFactor})`);
            gradient.addColorStop(1, `rgba(${rayColor.r}, ${rayColor.g}, ${rayColor.b}, 0)`);
            
            // Draw ray
            raysCtx.beginPath();
            raysCtx.moveTo(sourceX, sourceY);
            raysCtx.lineTo(endX, endY);
            raysCtx.lineWidth = 2 + Math.random() * 4; // Vary ray thickness
            raysCtx.strokeStyle = gradient;
            raysCtx.stroke();
        }
        
        raysCtx.restore();
        
        // Clear the canvas and draw original image
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(originalImage, 0, 0, width, height);
        
        // Apply rays with screen blend mode
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(raysCanvas, 0, 0);
        ctx.restore();
        
        // Store processed image
        processedImage = ctx.getImageData(0, 0, width, height);
        
        // Update display based on toggle state
        toggleBeforeAfter();
        
        console.log('God Rays effect applied successfully');
    } catch (error) {
        console.error('Error applying God Rays effect:', error);
    }
}

// Toggle between before and after
function toggleBeforeAfter() {
    if (!originalImage) return;
    
    const width = previewCanvas.width;
    const height = previewCanvas.height;
    
    if (beforeAfterToggle.checked) {
        // Show original
        ctx.drawImage(originalImage, 0, 0, width, height);
    } else {
        // Show processed
        ctx.putImageData(processedImage, 0, 0);
    }
}

// Handle control changes
function handleControlChange(e) {
    const control = e.target;
    const value = control.type === 'range' ? parseInt(control.value) : control.value;
    const id = control.id;
    
    console.log(`Control changed: ${id}, value: ${value}`); // Debug log
    
    // Update value display
    if (control.type === 'range') {
        const displayElement = control.nextElementSibling;
        if (displayElement) {
            let displayValue = value;
            
            // Add units if needed
            if (id === 'spreadAngle') {
                displayValue += '°';
            } else if (id !== 'rayCount') {
                displayValue += '%';
            }
            
            displayElement.textContent = displayValue;
        }
    } else if (control.type === 'color') {
        const displayElement = control.nextElementSibling;
        if (displayElement) {
            displayElement.textContent = value;
        }
    }
    
    // Update settings
    switch (id) {
        case 'positionX':
            currentSettings.positionX = value;
            break;
        case 'positionY':
            currentSettings.positionY = value;
            break;
        case 'intensity':
            currentSettings.intensity = value;
            break;
        case 'rayCount':
            currentSettings.rayCount = value;
            break;
        case 'spreadAngle':
            currentSettings.spreadAngle = value;
            break;
        case 'rayColor':
            currentSettings.rayColor = value;
            break;
    }
    
    // Apply effect with new settings
    if (originalImage) {
        // Use throttled version for better performance
        throttledApplyEffect();
    }
}

// Reset controls to default values
function resetControls() {
    const defaultSettings = {
        positionX: 50,
        positionY: 50,
        intensity: 50,
        rayCount: 20,
        spreadAngle: 90,
        rayColor: '#ffffff'
    };
    
    // Update settings
    currentSettings = { ...defaultSettings };
    
    // Update UI
    updateControlsFromSettings(defaultSettings);
    
    // Apply effect with default settings
    if (originalImage) {
        applyGodRaysEffect();
    }
}

// Apply preset
function applyPreset(presetName) {
    console.log(`Applying preset: ${presetName}`); // Debug log
    
    const preset = presets[presetName];
    if (!preset) {
        console.error(`Preset not found: ${presetName}`);
        return;
    }
    
    // Update settings
    currentSettings = { ...preset };
    
    // Update UI
    updateControlsFromSettings(preset);
    
    // Apply effect with preset settings
    if (originalImage) {
        applyGodRaysEffect();
    }
}

// Update controls from settings
function updateControlsFromSettings(settings) {
    console.log('Updating controls from settings:', settings); // Debug log
    
    // Update sliders
    if (positionXSlider) positionXSlider.value = settings.positionX;
    if (positionYSlider) positionYSlider.value = settings.positionY;
    if (intensitySlider) intensitySlider.value = settings.intensity;
    if (rayCountSlider) rayCountSlider.value = settings.rayCount;
    if (spreadAngleSlider) spreadAngleSlider.value = settings.spreadAngle;
    
    // Update color picker
    if (rayColorPicker) rayColorPicker.value = settings.rayColor;
    
    // Update displays
    if (positionXSlider && positionXSlider.nextElementSibling) 
        positionXSlider.nextElementSibling.textContent = settings.positionX + '%';
    if (positionYSlider && positionYSlider.nextElementSibling) 
        positionYSlider.nextElementSibling.textContent = settings.positionY + '%';
    if (intensitySlider && intensitySlider.nextElementSibling) 
        intensitySlider.nextElementSibling.textContent = settings.intensity + '%';
    if (rayCountSlider && rayCountSlider.nextElementSibling) 
        rayCountSlider.nextElementSibling.textContent = settings.rayCount;
    if (spreadAngleSlider && spreadAngleSlider.nextElementSibling) 
        spreadAngleSlider.nextElementSibling.textContent = settings.spreadAngle + '°';
    if (rayColorPicker && rayColorPicker.nextElementSibling) 
        rayColorPicker.nextElementSibling.textContent = settings.rayColor;
}

// Download image
function downloadImage() {
    console.log('Download image function called');
    
    if (!processedImage) {
        console.error('No processed image available for download');
        return;
    }
    
    try {
        // Get export settings
        const format = exportFormatSelect ? exportFormatSelect.value : 'png';
        const quality = exportQualitySlider ? exportQualitySlider.value / 10 : 0.8;
        const size = exportSizeSelect ? exportSizeSelect.value : 'original';
        
        console.log(`Export settings: format=${format}, quality=${quality}, size=${size}`);
        
        // Create a temporary canvas for the export
        const exportCanvas = document.createElement('canvas');
        let exportWidth, exportHeight;
        
        // Set export dimensions based on selected size
        if (size === 'original') {
            exportWidth = originalImage.width;
            exportHeight = originalImage.height;
        } else if (size === '1080p') {
            exportWidth = 1920;
            exportHeight = 1080;
        } else if (size === '720p') {
            exportWidth = 1280;
            exportHeight = 720;
        } else if (size === '480p') {
            exportWidth = 854;
            exportHeight = 480;
        }
        
        // Adjust dimensions to maintain aspect ratio
        const aspectRatio = originalImage.width / originalImage.height;
        if (exportWidth / exportHeight > aspectRatio) {
            exportWidth = Math.round(exportHeight * aspectRatio);
        } else {
            exportHeight = Math.round(exportWidth / aspectRatio);
        }
        
        console.log(`Export dimensions: ${exportWidth}x${exportHeight}`);
        
        // Set canvas dimensions
        exportCanvas.width = exportWidth;
        exportCanvas.height = exportHeight;
        
        // Get context
        const exportCtx = exportCanvas.getContext('2d');
        
        // Apply the effect at the export resolution
        // First draw the original image
        exportCtx.drawImage(originalImage, 0, 0, exportWidth, exportHeight);
        
        // Calculate ray source position for export size
        const sourceX = (currentSettings.positionX / 100) * exportWidth;
        const sourceY = (currentSettings.positionY / 100) * exportHeight;
        
        // Convert ray color from hex to RGB
        const rayColor = hexToRgb(currentSettings.rayColor);
        
        // Calculate intensity factor (0-1)
        const intensityFactor = currentSettings.intensity / 100;
        
        // Calculate ray parameters
        const rayCount = currentSettings.rayCount;
        const spreadAngleRad = (currentSettings.spreadAngle * Math.PI) / 180;
        const startAngle = -spreadAngleRad / 2;
        const angleStep = spreadAngleRad / (rayCount - 1);
        
        // Create a temporary canvas for the rays
        const raysCanvas = document.createElement('canvas');
        raysCanvas.width = exportWidth;
        raysCanvas.height = exportHeight;
        const raysCtx = raysCanvas.getContext('2d');
        
        // Draw rays
        raysCtx.save();
        raysCtx.globalCompositeOperation = 'lighter';
        
        for (let i = 0; i < rayCount; i++) {
            const angle = startAngle + (i * angleStep);
            const rayLength = Math.max(exportWidth, exportHeight) * 2;
            
            // Calculate end point of ray
            const endX = sourceX + Math.cos(angle) * rayLength;
            const endY = sourceY + Math.sin(angle) * rayLength;
            
            // Create gradient for ray
            const gradient = raysCtx.createLinearGradient(sourceX, sourceY, endX, endY);
            gradient.addColorStop(0, `rgba(${rayColor.r}, ${rayColor.g}, ${rayColor.b}, ${intensityFactor})`);
            gradient.addColorStop(1, `rgba(${rayColor.r}, ${rayColor.g}, ${rayColor.b}, 0)`);
            
            // Draw ray
            raysCtx.beginPath();
            raysCtx.moveTo(sourceX, sourceY);
            raysCtx.lineTo(endX, endY);
            raysCtx.lineWidth = 2 + Math.random() * 4; // Vary ray thickness
            raysCtx.strokeStyle = gradient;
            raysCtx.stroke();
        }
        
        raysCtx.restore();
        
        // Apply rays with screen blend mode
        exportCtx.save();
        exportCtx.globalCompositeOperation = 'screen';
        exportCtx.drawImage(raysCanvas, 0, 0);
        exportCtx.restore();
        
        // Create download link
        const link = document.createElement('a');
        
        // Set MIME type based on format
        let mimeType;
        switch (format) {
            case 'jpeg':
                mimeType = 'image/jpeg';
                break;
            case 'webp':
                mimeType = 'image/webp';
                break;
            default:
                mimeType = 'image/png';
        }
        
        // Convert canvas to data URL
        const dataURL = exportCanvas.toDataURL(mimeType, quality);
        
        // Set download attributes
        link.href = dataURL;
        link.download = `god-rays-effect.${format}`;
        
        console.log(`Download link created with MIME type: ${mimeType}`);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Download initiated');
    } catch (error) {
        console.error('Error in downloadImage function:', error);
    }
}

// Share image
function shareImage(platform) {
    if (!processedImage) return;
    
    // Create a temporary canvas for sharing
    const shareCanvas = document.createElement('canvas');
    shareCanvas.width = previewCanvas.width;
    shareCanvas.height = previewCanvas.height;
    
    // Get context
    const shareCtx = shareCanvas.getContext('2d');
    
    // Draw processed image
    shareCtx.putImageData(processedImage, 0, 0);
    
    // Convert to data URL
    const dataURL = shareCanvas.toDataURL('image/jpeg', 0.8);
    
    // Share based on platform
    let shareUrl;
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this image I created with God Rays Generator!')}&url=${encodeURIComponent(window.location.href)}`;
            break;
        case 'pinterest':
            shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(dataURL)}&description=${encodeURIComponent('Image created with God Rays Generator')}`;
            break;
    }
    
    // Open share dialog
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Tutorial functions
function showTutorial() {
    tutorialOverlay.classList.remove('hidden');
}

function hideTutorial() {
    tutorialOverlay.classList.add('hidden');
}

// Utility functions
function hexToRgb(hex) {
    try {
        // Default to white if hex is invalid
        if (!hex || typeof hex !== 'string') {
            console.warn('Invalid hex color provided, defaulting to white');
            return { r: 255, g: 255, b: 255 };
        }
        
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Handle shorthand hex (e.g., #fff)
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Ensure hex is valid
        if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
            console.warn('Invalid hex color format, defaulting to white');
            return { r: 255, g: 255, b: 255 };
        }
        
        // Parse hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    } catch (error) {
        console.error('Error parsing hex color:', error);
        return { r: 255, g: 255, b: 255 }; // Default to white on error
    }
}

// Performance optimization: Throttle function for expensive operations
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Throttle the applyGodRaysEffect function for better performance
const throttledApplyEffect = throttle(applyGodRaysEffect, 100);

// Initialize the application
document.addEventListener('DOMContentLoaded', init); 