# Service Funeral Preparation Website

A mobile-friendly web application for funeral services.

## Key Features

### 📱 Mobile Optimization
- Responsive design providing optimized experience on all devices
- Touch gesture support (swipe functionality)
- Mobile-friendly UI/UX

### 🖼️ Image Management
- Drag and drop image upload
- Click to select images
- Display uploaded image gallery
- Individual image deletion
- Automatic image saving to local storage

### 🚪 Metal Door Animation
- Metal door slowly descends from above when "Prepare Funeral" button is clicked
- 3-second smooth animation effect
- Restore original state by clicking the door or pressing ESC key

### 🎨 Design
- Dark theme suitable for funeral services
- Sophisticated gradient background
- Smooth animations and transition effects
- Korean font optimization (Noto Sans KR)

## How to Use

1. **Add Images**
   - Click upload area or drag and drop to add images
   - Multiple images can be uploaded simultaneously

2. **Start Funeral Preparation**
   - Click "Prepare Funeral" button
   - Metal door animation slowly descends

3. **Door Control**
   - Click the door or press ESC key to restore original state
   - On mobile, swipe up to reset the door

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: 
  - Flexbox & Grid layout
  - CSS animations and transitions
  - Responsive design
  - Custom scrollbar
- **JavaScript (ES6+)**:
  - Image processing using File API
  - Data storage using LocalStorage
  - Touch event handling
  - Keyboard shortcut support

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Installation and Execution

1. Clone or download the project
2. Run on web server or open `index.html` file directly in local environment

```bash
# Simple local server execution (Python 3)
python -m http.server 8000

# Or use Node.js http-server
npx http-server
```

## File Structure

```
funeral-service/
├── index.html          # Main HTML file
├── styles.css          # CSS stylesheet
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## Key Features

- **Accessibility**: Keyboard navigation support
- **Performance**: Image lazy loading and optimization
- **User Experience**: Intuitive interface and smooth animations
- **Data Preservation**: Image data storage through local storage

## License

This project was created for educational and personal use purposes.

---

**Note**: This website is designed for funeral services and was created with respect and courtesy. 