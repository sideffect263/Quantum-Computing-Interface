// Constants
const FRAME_INTERVAL = 500; // Animation interval in milliseconds
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// Create an array of SVG strings for different animation frames
const frames = [
    // Frame 1
    `<svg xmlns="${SVG_NAMESPACE}" viewBox="0 0 32 32">
      <g transform="translate(16 16)">
        <ellipse cx="0" cy="0" rx="14" ry="8" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <ellipse cx="0" cy="0" rx="8" ry="14" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <circle cx="0" cy="0" r="11" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <circle cx="12" cy="4" r="2.5" fill="#4A90E2"/>
        <circle cx="-4" cy="-12" r="2.5" fill="#F5A623"/>
        <circle cx="-8" cy="8" r="2.5" fill="#D0021B"/>
      </g>
      <circle cx="16" cy="16" r="4" fill="#4A90E2"/>
    </svg>`,
    // Frame 2
    `<svg xmlns="${SVG_NAMESPACE}" viewBox="0 0 32 32">
      <g transform="translate(16 16)">
        <ellipse cx="0" cy="0" rx="14" ry="8" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <ellipse cx="0" cy="0" rx="8" ry="14" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <circle cx="0" cy="0" r="11" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <circle cx="4" cy="12" r="2.5" fill="#4A90E2"/>
        <circle cx="12" cy="-4" r="2.5" fill="#F5A623"/>
        <circle cx="-12" cy="-4" r="2.5" fill="#D0021B"/>
      </g>
      <circle cx="16" cy="16" r="4" fill="#F5A623"/>
    </svg>`,
    // Frame 3
    `<svg xmlns="${SVG_NAMESPACE}" viewBox="0 0 32 32">
      <g transform="translate(16 16)">
        <ellipse cx="0" cy="0" rx="14" ry="8" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <ellipse cx="0" cy="0" rx="8" ry="14" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <circle cx="0" cy="0" r="11" fill="none" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        <circle cx="-12" cy="4" r="2.5" fill="#4A90E2"/>
        <circle cx="4" cy="12" r="2.5" fill="#F5A623"/>
        <circle cx="8" cy="-8" r="2.5" fill="#D0021B"/>
      </g>
      <circle cx="16" cy="16" r="4" fill="#D0021B"/>
    </svg>`
];

// Function to convert SVG string to data URL
function svgToDataURL(svgStr) {
    return 'data:image/svg+xml;base64,' + btoa(svgStr);
}

// Function to update favicon
function updateFavicon(frameIndex) {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = svgToDataURL(frames[frameIndex]);
    document.getElementsByTagName('head')[0].appendChild(link);
}

// Animation loop
let currentFrame = 0;
function animateFavicon() {
    updateFavicon(currentFrame);
    currentFrame = (currentFrame + 1) % frames.length;
}

// Start animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Run animation every FRAME_INTERVAL milliseconds
    setInterval(animateFavicon, FRAME_INTERVAL);
});