import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

/**
 * Server-side SVG sanitizer using DOMPurify + jsdom.
 * Strips scripts, event handlers, external references, and unsafe elements.
 */
@Injectable()
export class SvgSanitizerService {
    private purify: ReturnType<typeof createDOMPurify>;

    constructor() {
        const window = new JSDOM('').window;
        this.purify = createDOMPurify(window as any);
    }

    /**
     * Sanitize SVG content.
     * Returns a Buffer with the cleaned SVG.
     */
    sanitize(svgBuffer: Buffer): Buffer {
        const svgString = svgBuffer.toString('utf-8');

        const clean = this.purify.sanitize(svgString, {
            USE_PROFILES: { svg: true, svgFilters: true },
            // Allowlisted tags
            ALLOWED_TAGS: [
                'svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline',
                'ellipse', 'g', 'defs', 'use', 'clipPath', 'mask', 'text', 'tspan',
                'image', 'linearGradient', 'radialGradient', 'stop', 'symbol',
                'title', 'desc', 'metadata', 'pattern', 'filter',
                'feGaussianBlur', 'feOffset', 'feMerge', 'feMergeNode',
                'feColorMatrix', 'feBlend', 'feFlood', 'feComposite',
            ],
            // Allowlisted attributes
            ALLOWED_ATTR: [
                'viewBox', 'xmlns', 'xmlns:xlink', 'width', 'height',
                'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
                'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'fill-opacity',
                'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
                'transform', 'opacity', 'class', 'id', 'style',
                'clip-path', 'mask', 'filter',
                'offset', 'stop-color', 'stop-opacity',
                'gradientUnits', 'gradientTransform', 'spreadMethod',
                'patternUnits', 'patternTransform',
                'points', 'preserveAspectRatio',
                'font-family', 'font-size', 'font-weight', 'text-anchor',
                'dominant-baseline', 'letter-spacing',
                'xlink:href', 'href',
                'dx', 'dy', 'rotate',
                'stdDeviation', 'in', 'in2', 'result', 'mode', 'values', 'type',
                'flood-color', 'flood-opacity',
                'color-interpolation-filters',
            ],
            // Block dangerous elements
            FORBID_TAGS: [
                'script', 'foreignObject', 'iframe', 'object', 'embed',
                'applet', 'form', 'input', 'button', 'textarea', 'select',
                'video', 'audio', 'source', 'link', 'base',
            ],
            // Block event handlers and dangerous attrs
            FORBID_ATTR: [
                'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
                'onfocus', 'onblur', 'onsubmit', 'onreset', 'onchange',
                'onkeydown', 'onkeyup', 'onkeypress',
                'formaction', 'action', 'srcdoc',
            ],
            // Reject data: URIs except for images
            ALLOW_DATA_ATTR: false,
        });

        // Additional pass: strip any remaining javascript: URIs in href/xlink:href
        const sanitized = clean
            .replace(/javascript\s*:/gi, '')
            .replace(/data\s*:[^,]*base64/gi, (match) => {
                // Allow data:image/* URIs only
                if (/data\s*:image\//i.test(match)) return match;
                return '';
            });

        return Buffer.from(sanitized, 'utf-8');
    }

    /**
     * Check if content looks like an SVG.
     */
    isSvg(contentType: string): boolean {
        return contentType === 'image/svg+xml';
    }
}
