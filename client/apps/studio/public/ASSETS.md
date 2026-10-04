# Diverxen Studio — Asset Placement Guide

Paste exported Figma assets directly into their dedicated folders:

| Asset Type | Export Format | Target Folder | Example Usage |
| :--- | :--- | :--- | :--- |
| **Hero Section** | WebP / PNG | `public/images/hero/` | `<Image src="/images/hero/watermark.webp" ... />` |
| **About Section** | WebP / PNG / SVG | `public/images/about/` | `<Image src="/images/about/gradient-accent.png" ... />` |
| **Our Work Section** | WebP / PNG | `public/images/work/` | `<Image src="/images/work/card-stack.webp" ... />` |
| **Brand Logos** | SVG | `public/images/brand/` | `<Image src="/images/brand/logo-white.svg" ... />` |
| **Static Vectors & Shapes** | SVG | `public/vectors/` | `<Image src="/vectors/pattern.svg" ... />` |
| **Static SVG Icons** | SVG | `public/icons/` | `<Image src="/icons/globe.svg" ... />` |
| **Custom Animatable Icons** | React `.tsx` | `components/icons/` | `<BrandLogo className="..." />` |

> **Tip**: For best performance, export photos and 3D renders from Figma as **WebP** or **2x PNG**.
