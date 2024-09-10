document.addEventListener("DOMContentLoaded", function() {
    const colorPicker = document.getElementById("colorPicker");
    const colorDisplay = document.getElementById("colorDisplay");
    const toggleFormatBtn = document.getElementById("toggleFormat");
    const copyColorBtn = document.getElementById("copyColor");
    const randomColorBtn = document.getElementById("randomColor");
    const colorHistory = document.getElementById("colorHistory");
    const notification = document.getElementById("notification");
    const colorDetails = document.getElementById("colorDetails");
    const accessibilityInfo = document.getElementById("accessibilityInfo");
    const paletteDisplay = document.getElementById("paletteDisplay");
    const hueSlider = document.getElementById("hueSlider");
    const saturationSlider = document.getElementById("saturationSlider");
    const lightnessSlider = document.getElementById("lightnessSlider");

    let isHex = true;
    const history = JSON.parse(localStorage.getItem('colorHistory')) || [];

    function updateDisplay(color) {
        colorDisplay.textContent = isHex ? color.toUpperCase() : hexToRgb(color);
        colorDisplay.style.color = getContrastColor(color);
        document.body.style.backgroundColor = color;
        updateColorDetails(color);
        updateAccessibilityInfo(color);
        updateColorAdjuster(color);
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function getContrastColor(hexColor) {
        const rgb = hexToRgb(hexColor).match(/\d+/g);
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    function addToHistory(color) {
        if (!history.includes(color)) {
            history.unshift(color);
            if (history.length > 20) history.pop();
            localStorage.setItem('colorHistory', JSON.stringify(history));
            updateHistoryDisplay();
        }
    }

    function updateHistoryDisplay() {
        colorHistory.innerHTML = '';
        history.forEach(color => {
            const colorDiv = document.createElement("div");
            colorDiv.classList.add("history-item");
            colorDiv.style.backgroundColor = color;
            colorDiv.setAttribute("aria-label", `Color: ${color}`);
            colorDiv.addEventListener("click", () => {
                updateDisplay(color);
                colorPicker.value = color;
            });
            colorHistory.appendChild(colorDiv);
        });
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add("show");
        setTimeout(() => {
            notification.classList.remove("show");
        }, 2000);
    }

    function updateColorDetails(color) {
        const rgb = hexToRgb(color).match(/\d+/g);
        const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
        colorDetails.innerHTML = `
            <p><strong>HEX:</strong> ${color.toUpperCase()}</p>
            <p><strong>RGB:</strong> ${rgb.join(", ")}</p>
            <p><strong>HSL:</strong> ${hsl[0]}°, ${hsl[1]}%, ${hsl[2]}%</p>
        `;
    }

    function updateAccessibilityInfo(color) {
        const contrastWithWhite = getContrastRatio(color, "#FFFFFF");
        const contrastWithBlack = getContrastRatio(color, "#000000");
        accessibilityInfo.innerHTML = `
            <p><strong>Contrast ratio with white:</strong> ${contrastWithWhite.toFixed(2)}</p>
            <p><strong>Contrast ratio with black:</strong> ${contrastWithBlack.toFixed(2)}</p>
            <p><strong>WCAG 2.0 AA compliant (large text):</strong> ${isWCAGCompliant(contrastWithWhite, "AA", "large") || isWCAGCompliant(contrastWithBlack, "AA", "large")}</p>
            <p><strong>WCAG 2.0 AA compliant (small text):</strong> ${isWCAGCompliant(contrastWithWhite, "AA", "small") || isWCAGCompliant(contrastWithBlack, "AA", "small")}</p>
        `;
    }

    function getContrastRatio(color1, color2) {
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    function getLuminance(color) {
        const rgb = hexToRgb(color).match(/\d+/g);
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function isWCAGCompliant(contrastRatio, level, size) {
        if (level === "AA") {
            return size === "large" ? contrastRatio >= 3 : contrastRatio >= 4.5;
        } else if (level === "AAA") {
            return size === "large" ? contrastRatio >= 4.5 : contrastRatio >= 7;
        }
    }

    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    function hslToRgb(h, s, l) {
        h /= 360, s /= 100, l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function updateColorAdjuster(color) {
        const hsl = rgbToHsl(...hexToRgb(color).match(/\d+/g).map(Number));
        hueSlider.value = hsl[0];
        saturationSlider.value = hsl[1];
        lightnessSlider.value = hsl[2];
    }

    function generateColorPalette(type) {
        const baseColor = colorPicker.value;
        const hsl = rgbToHsl(...hexToRgb(baseColor).match(/\d+/g).map(Number));
        let palette = [];

        switch (type) {
            case 'analogous':
                palette = [
                    hslToRgb((hsl[0] - 30 + 360) % 360, hsl[1], hsl[2]),
                    hslToRgb(hsl[0], hsl[1], hsl[2]),
                    hslToRgb((hsl[0] + 30) % 360, hsl[1], hsl[2])
                ];
                break;
            case 'complementary':
                palette = [
                    hslToRgb(hsl[0], hsl[1], hsl[2]),
                    hslToRgb((hsl[0] + 180) % 360, hsl[1], hsl[2])
                ];
                break;
            case 'triadic':
                palette = [
                    hslToRgb(hsl[0], hsl[1], hsl[2]),
                    hslToRgb((hsl[0] + 120) % 360, hsl[1], hsl[2]),
                    hslToRgb((hsl[0] + 240) % 360, hsl[1], hsl[2])
                ];
                break;
            case 'tetradic':
                palette = [
                    hslToRgb(hsl[0], hsl[1], hsl[2]),
                    hslToRgb((hsl[0] + 90) % 360, hsl[1], hsl[2]),
                    hslToRgb((hsl[0] + 180) % 360, hsl[1], hsl[2]),
                    hslToRgb((hsl[0] + 270) % 360, hsl[1], hsl[2])
                ];
                break;
        }

        return palette.map(rgb => rgbToHex(...rgb));
    }

    function displayColorPalette(palette) {
        paletteDisplay.innerHTML = '';
        palette.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.classList.add('palette-color');
            colorDiv.style.backgroundColor = color;
            colorDiv.setAttribute("aria-label", `Palette color: ${color}`);
            colorDiv.addEventListener('click', () => {
                updateDisplay(color);
                colorPicker.value = color;
            });
            paletteDisplay.appendChild(colorDiv);
        });
    }

    colorPicker.addEventListener("input", function() {
        const color = colorPicker.value;
        updateDisplay(color);
    });

    colorPicker.addEventListener("change", function() {
        const color = colorPicker.value;
        addToHistory(color);
    });

    toggleFormatBtn.addEventListener("click", function() {
        isHex = !isHex;
        updateDisplay(colorPicker.value);
    });

    copyColorBtn.addEventListener("click", function() {
        const colorValue = isHex ? colorPicker.value : hexToRgb(colorPicker.value);
        navigator.clipboard.writeText(colorValue).then(() => {
            showNotification("Color copied to clipboard!");
        });
    });

    randomColorBtn.addEventListener("click", function() {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        colorPicker.value = randomColor;
        updateDisplay(randomColor);
        addToHistory(randomColor);
    });

    [hueSlider, saturationSlider, lightnessSlider].forEach(slider => {
        slider.addEventListener('input', () => {
            const hsl = [
                parseInt(hueSlider.value),
                parseInt(saturationSlider.value),
                parseInt(lightnessSlider.value)
            ];
            const rgb = hslToRgb(...hsl);
            const hex = rgbToHex(...rgb);
            colorPicker.value = hex;
            updateDisplay(hex);
        });
    });

    document.getElementById('analogousPalette').addEventListener('click', () => {
        const palette = generateColorPalette('analogous');
        displayColorPalette(palette);
    });

    document.getElementById('complementaryPalette').addEventListener('click', () => {
        const palette = generateColorPalette('complementary');
        displayColorPalette(palette);
    });

    document.getElementById('triadicPalette').addEventListener('click', () => {
        const palette = generateColorPalette('triadic');
        displayColorPalette(palette);
    });

    document.getElementById('tetradicPalette').addEventListener('click', () => {
        const palette = generateColorPalette('tetradic');
        displayColorPalette(palette);
    });

    // Keyboard accessibility
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && document.activeElement.classList.contains('palette-color')) {
            document.activeElement.click();
        }
    });

    updateDisplay(colorPicker.value);
    addToHistory(colorPicker.value);
    updateHistoryDisplay();

    function simulateColorBlindness(color, type) {
        
        return color;
    }

    // Export color palette (optional feature)
    function exportColorPalette(palette) {
        const paletteString = palette.join('\n');
        const blob = new Blob([paletteString], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    document.getElementById('exportPalette').addEventListener('click', () => {
        const currentPalette = Array.from(paletteDisplay.children).map(div => div.style.backgroundColor);
        exportColorPalette(currentPalette);
    });
});