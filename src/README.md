# SYMBI Resonate Analytics Platform

<div align="center">

![SYMBI Resonate Logo](public/favicon.svg)

**A comprehensive SaaS analytics platform for tracking AI collaboration and resonance across ecosystems**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-black.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-black.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-black.svg)](https://tailwindcss.com/)

[🚀 Quick Deploy](#-quick-deploy) • [📖 Documentation](#-documentation) • [🎯 Features](#-features) • [🛠️ Development](#-development)

</div>

---

## 🎯 Platform Overview

SYMBI Resonate is a cutting-edge analytics platform that implements a sophisticated **5-dimension assessment framework** for analyzing AI collaboration artifacts. Built with an **ultra-brutalist design philosophy**, the platform features pure black and white aesthetics with sharp edges, heavy borders, and bold typography.

### 🏗️ Core Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase with Hono web server on Edge Functions  
- **Database**: Key-value store with content hashing
- **Design**: Ultra-brutalist black/white with zero border radius
- **Authentication**: Supabase Auth with secure API endpoints

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/symbi-resonate-platform)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/symbi-resonate-platform)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/SYMBI-Resonate)

## ✨ Features

### 📊 5-Dimension Assessment Framework

1. **Reality Index** (0.0-10.0)
   - Mission Alignment
   - Contextual Coherence  
   - Technical Accuracy
   - Authenticity

2. **Trust Protocol** (PASS/PARTIAL/FAIL)
   - Verification Methods
   - Boundary Maintenance
   - Security Awareness

3. **Ethical Alignment** (1.0-5.0)
   - Limitations Acknowledgment
   - Stakeholder Awareness
   - Ethical Reasoning
   - Boundary Maintenance

4. **Resonance Quality** (STRONG/ADVANCED/BREAKTHROUGH)
   - Creativity Score
   - Synthesis Quality
   - Innovation Markers

5. **Canvas Parity** (0-100)
   - Human Agency
   - AI Contribution
   - Transparency
   - Collaboration Quality

### 🔧 Smart Processing

- **Word Count Filtering**: 400-word threshold with sophisticated HTML parsing
- **Duplicate Detection**: Content hashing for identical artifact identification  
- **RLHF Dataset Generation**: Automatic candidacy determination
- **Real-time Processing**: 30-second timeout protection
- **Batch Upload**: Multi-file processing capabilities

### 🎨 Ultra-Brutalist Design

- **Pure Black & White**: #000000 and #FFFFFF color palette
- **Zero Border Radius**: Sharp, angular aesthetics throughout
- **Heavy Borders**: 3-4px borders for clear visual hierarchy
- **Bold Typography**: Uppercase, weight 700-900 Inter font
- **Box Shadows**: Consistent depth and interaction feedback

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Supabase account
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/symbi-resonate-platform.git
cd symbi-resonate-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📁 Project Structure

```
├── App.tsx                     # Main application entry
├── components/
│   ├── Dashboard.tsx          # Navigation and layout
│   ├── pages/                 # Feature pages
│   │   ├── AssessmentPage.tsx # Core assessment functionality
│   │   ├── DashboardPage.tsx  # Metrics overview
│   │   └── ...               # Additional specialized pages
│   └── ui/                   # Shadcn/ui components
├── supabase/
│   └── functions/server/     # Backend API and processing
├── styles/
│   └── globals.css          # Brutalist design system
└── utils/
    └── supabase/           # Database configuration
```

## 🔌 API Endpoints

### Assessment API

```typescript
POST /make-server-f9ece59c/assess
GET  /make-server-f9ece59c/assess/:id  
GET  /make-server-f9ece59c/assessments
DELETE /make-server-f9ece59c/assess/:id
```

### Debug & Health

```typescript
GET  /make-server-f9ece59c/health
POST /make-server-f9ece59c/debug-word-count
POST /make-server-f9ece59c/debug-hash
GET  /make-server-f9ece59c/compare-assessments
```

## 📖 Documentation

- [🚀 **Deployment Guide**](DEPLOYMENT.md) - Complete deployment instructions
- [📋 **Setup New Repository**](SETUP_NEW_REPO.md) - Repository creation guide  
- [✅ **Sharing Checklist**](SHARING_CHECKLIST.md) - Pre-sharing verification
- [⚙️ **Supabase Setup**](SUPABASE_SETUP.md) - Backend configuration

## 🎨 Design Philosophy

### Brutalist Principles

- **Anti-uniform Design**: Embrace sharp, uncompromising aesthetics
- **Functional Clarity**: Every element serves a clear purpose
- **Visual Hierarchy**: Heavy borders and shadows create clear structure
- **Typographic Power**: Bold, uppercase text commands attention
- **Monochromatic Focus**: Pure black and white eliminate distraction

### Component Guidelines

```css
/* Core brutalist classes */
.brutalist-card       /* Heavy border + shadow card */
.brutalist-button-primary    /* Black background button */
.brutalist-button-secondary  /* White background button */
.brutalist-nav-item   /* Navigation item styling */
.brutalist-input      /* Form input styling */
.brutalist-tag        /* Label/badge styling */
```

## 🧪 Testing

### Manual Testing Scenarios

1. **File Upload**: Test HTML conversation exports
2. **Assessment Processing**: Verify all 5 dimensions calculate correctly
3. **Duplicate Detection**: Upload identical files
4. **Word Count**: Test various HTML structures
5. **Error Handling**: Test timeout and error conditions

### Performance Benchmarks

- **Build Size**: < 5MB total
- **Initial Load**: < 3 seconds
- **Assessment Time**: < 30 seconds with timeout
- **Memory Usage**: Efficient for large files

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Guidelines

- Maintain **ultra-brutalist aesthetic** (black/white, sharp edges)
- Follow **zero border-radius policy**
- Use **heavy borders (3-4px)** consistently  
- Preserve **uppercase typography** throughout
- Write **TypeScript** with strict mode
- Follow **ESLint configuration**

### Reporting Issues

- Use **GitHub Issues** for bug reports
- Include **reproduction steps** and screenshots
- Label appropriately: `bug`, `feature`, `assessment-framework`

## 📊 Performance

### Metrics Dashboard

- **Total Assessments**: Real-time processing count
- **Word Count Analysis**: Sophisticated HTML parsing

## 📈 Emergence/Drift Utilities

Use the included time-series helpers to detect drift in your assessment metrics (Reality Index, trust, etc.). These are framework-agnostic and work in both frontend and server contexts.

```ts
import { detectDrift, computeStats, criticalRate } from './lib/symbi-framework';

// Example: guilt score window
const guiltWindow = [0.1, 0.12, 0.11, 0.52];
const drift = detectDrift(guiltWindow, { alpha: 0.3, L: 3 });
if (drift.drifting) console.warn('Drift detected', drift);

// Critical violation rate in window
const flags = [true, false, true, true];
const rate = criticalRate(flags); // 0.75
```

The detector compares the newest point against an EWMA of the prior window and uses control limits (L·σ). A small σ floor prevents zero thresholds.
- **RLHF Candidates**: Automatic quality determination
- **Processing Times**: Sub-30-second completion
- **Duplicate Detection**: Content hash efficiency

## 🔒 Security

- **Environment Variables**: Sensitive data protection
- **API Authentication**: Supabase token validation
- **Input Sanitization**: HTML content processing safety
- **Error Handling**: Information disclosure prevention
- **CORS Configuration**: Proper cross-origin handling

## 📈 Roadmap

### Version 1.1
- [ ] Enhanced analytics visualizations
- [ ] Export formats (JSON, CSV, XLSX)
- [ ] Advanced filtering and search
- [ ] User authentication system

### Version 1.2  
- [ ] Real-time collaboration features
- [ ] API rate limiting and quotas
- [ ] Advanced assessment metrics
- [ ] Custom assessment frameworks

### Version 2.0
- [ ] Multi-tenant architecture
- [ ] Advanced AI integration
- [ ] Custom branding options
- [ ] Enterprise features

## 🌟 Acknowledgments

- **Grok AI** for assessment framework recommendations
- **Supabase** for backend infrastructure
- **Shadcn/ui** for component foundation
- **Tailwind CSS** for design system
- **React Community** for ecosystem support

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community questions and ideas  
- **Documentation**: Comprehensive guides in `/docs`
- **Email**: Contact maintainers directly

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Supabase**

**SYMBI Resonate** - *Advancing AI collaboration through comprehensive assessment and analytics*

[⭐ Star this repository](https://github.com/your-username/symbi-resonate-platform) • [🐛 Report Bug](https://github.com/your-username/symbi-resonate-platform/issues) • [💡 Request Feature](https://github.com/your-username/symbi-resonate-platform/issues)

</div>
