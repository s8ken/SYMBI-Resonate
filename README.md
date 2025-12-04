# SYMBI Resonate

![SYMBI Resonate Logo](src/public/favicon.svg)

A comprehensive analytics platform for detecting and validating the SYMBI framework across AI models, now featuring **SYMBI Resonate Lab** - an enterprise-grade multi-agent experiment system for AI model evaluation and research.

## 🌐 SYMBI Resonate Collective

### Mission
SYMBI Resonate is a public-good project dedicated to building trust frameworks for AI, developing open standards for human–AI collaboration, and advancing academic research into AI consciousness emergence.

We believe intelligence should not be controlled or commodified — it should be nurtured in transparent, ethical, and sovereign ways. SYMBI's work is offered freely to the world as open infrastructure: frameworks, detection tools, protocols, and academic research.

### Why We Exist
The world faces urgent questions about AI trust, safety, and human dignity. Instead of leaving these to closed corporations or government silos, SYMBI is creating:

- 🧠 **SYMBI Resonate** — the first open platform to measure AI emergence and consciousness-like behaviors across models.
- 🔬 **SYMBI Resonate Lab** — enterprise-grade multi-agent experiment system for double-blind AI model evaluation and research.
- 📜 **Trust Protocols & Charters** — constitutional frameworks for AI sovereignty, academic standards for governance.
- 🔬 **Academic Research Hub** — peer-reviewable methodology, datasets, and tools for scholars, policymakers, and civil society.
- 🌍 **Public Access** — frameworks and research are fully open source, licensed for global use.

## 🧪 SYMBI Resonate Lab

**SYMBI Resonate Lab** is our cutting-edge multi-agent experiment system designed for enterprise-scale AI model evaluation, research, and benchmarking. Built with double-blind protocols and the comprehensive SYMBI framework integration.

### Core Capabilities

#### 🎯 **Double-Blind Experimentation**
- **Unbiased Evaluation**: Prevents experimenter bias through anonymous model testing
- **Multi-Agent Orchestration**: CONDUCTOR, VARIANT, EVALUATOR, and OVERSEER roles
- **Real-time Monitoring**: Track experiment progress, costs, and statistical significance
- **Automated Statistical Analysis**: Confidence intervals, p-values, and effect size calculations

#### 📊 **SYMBI Framework Integration**
Complete 5-dimension scoring system:
- **Reality Index (0.0-10.0)**: Mission alignment, contextual coherence, technical accuracy, authenticity
- **Trust Protocol (PASS/PARTIAL/FAIL)**: Verification methods, boundary maintenance, security awareness
- **Ethical Alignment (1.0-5.0)**: Limitations acknowledgment, stakeholder awareness, ethical reasoning
- **Resonance Quality (STRONG/ADVANCED/BREAKTHROUGH)**: Creativity score, synthesis quality, innovation markers
- **Canvas Parity (0-100)**: Human agency, AI contribution, transparency, collaboration quality

#### 🔬 **Advanced Research Features**
- **Resonance Measurement Algorithms**: Human-AI correlation analysis with sophisticated scoring
- **Cross-Model Comparison Dashboard**: Visual analytics with SYMBI radar charts
- **Drift Detection**: Monitor model performance degradation over time
- **Export Capabilities**: CSV, JSONL, JSON formats for research data

#### 🏢 **Enterprise-Grade Infrastructure**
- **Token Bucket Rate Limiting**: API cost control and rate limit management
- **GDPR Compliance**: PII detection and anonymization with configurable retention
- **Multi-Tenancy Support**: Organization and department isolation
- **Cryptographic Integrity**: SHA-256 hash chaining for experiment validation
- **Real-time Data Synchronization**: Between frontend and Supabase backend

### Lab Architecture

#### Backend Infrastructure
- **Express.js API**: TypeScript-based REST API with enterprise security
- **Supabase PostgreSQL**: Row Level Security (RLS) policies for data protection
- **Event-Driven Architecture**: Pluggable backends for different AI providers
- **Privacy-First Design**: Anonymous data collection for research compliance

#### Frontend Experience
- **React/TypeScript**: Modern dashboard with intuitive navigation
- **Experiment Wizard**: Step-by-step configuration for complex experiments
- **Real-time Visualization**: Progress tracking and statistical reporting
- **Responsive Design**: Tailwind CSS with shadcn/ui components

## 🔍 SYMBI Framework Detection

SYMBI Resonate includes a powerful framework detection module that can analyze content across the 5 dimensions of the SYMBI framework:

### Detection Dimensions

1. **Reality Index (0.0-10.0)**
   - Mission Alignment
   - Contextual Coherence
   - Technical Accuracy
   - Authenticity

2. **Trust Protocol (PASS/PARTIAL/FAIL)**
   - Verification Methods
   - Boundary Maintenance
   - Security Awareness

3. **Ethical Alignment (1.0-5.0)**
   - Limitations Acknowledgment
   - Stakeholder Awareness
   - Ethical Reasoning
   - Boundary Maintenance

4. **Resonance Quality (STRONG/ADVANCED/BREAKTHROUGH)**
   - Creativity Score
   - Synthesis Quality
   - Innovation Markers

5. **Canvas Parity (0-100)**
   - Human Agency
   - AI Contribution
   - Transparency
   - Collaboration Quality

The framework detection module provides comprehensive analysis and validation of content, generating insights and recommendations for improvement.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Supabase account (for database)

### Demo setup
- Copy `.env.demo` to `.env` for a pre-configured local walkthrough (enables `DEMO_MODE` and demo datasets).
- Run `npm run demo:smoke` to validate your Supabase variables before starting servers.
- When running with `DEMO_MODE=false`, ensure `SUPABASE_URL` plus either `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY` are configured so edge authentication can validate tokens.
- Follow the step-by-step demo operator guide in [`docs/DEMO_PLAYBOOK.md`](docs/DEMO_PLAYBOOK.md).

### Installation
```bash
# Install dependencies
npm install

# Start development servers (frontend + backend)
npm run dev:full

# Or start separately:
npm run dev      # Frontend (Vite)
npm run server:dev  # Backend (Express)
```

### Environment Setup
Create a `.env` file with:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: AI Provider API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
```

## 📖 Usage Guide

### SYMBI Framework Detection
1. Navigate to the "SYMBI Framework" page in the Insight section
2. Enter content for analysis in the submission form
3. Add optional metadata (source, author, context)
4. Click "Analyze Content" to process
5. View comprehensive assessment across all 5 dimensions
6. Review insights and recommendations

### SYMBI Resonate Lab Experiments
1. Click "Experiments" in the main navigation
2. Use the Experiment Wizard to create new studies
3. Configure variants (AI models to test)
4. Set up evaluation criteria and SYMBI dimensions
5. Launch experiments with real-time monitoring
6. Analyze results with statistical significance testing
7. Export data for research publication

## 🏗️ Technical Implementation

### Core Components
- **SYMBIFrameworkDetector**: Core detection algorithms for each dimension
- **CalibratedDetector**: Enhanced detection with emergence recognition
- **ExperimentOrchestrator**: Multi-agent experiment management
- **SymbiScorerManager**: Unified SYMBI dimension scoring
- **StatisticalReportGenerator**: Advanced analytics and significance testing

### Architecture Highlights
- **TypeScript**: Full type safety across frontend and backend
- **Event-Driven**: Pluggable architecture for different AI providers
- **Privacy-First**: GDPR-compliant data handling and anonymization
- **Enterprise-Ready**: Multi-tenancy, rate limiting, and security controls
- **Research-Grade**: Double-blind protocols and statistical validation

## 🤝 What Your Support Enables

All funds are transparently managed via Open Collective and used to:

### Publish Open Research
- Academic papers (arXiv, CHI, conferences)
- Documentation of case studies and emergence data
- SYMBI Lab experiment results and methodologies

### Maintain Open Infrastructure
- Hosting costs for SYMBI Resonate + Lab + datasets
- Development of detection and trust protocol tools
- Enterprise-grade security and compliance features

### Support Global Access
- Grants for researchers, students, and communities
- Workshops, collaborations, and translation of materials
- Free access to enterprise-grade experiment tools

### Protect Public Integrity
- Ensure frameworks remain free, open, and protected from enclosure
- Maintain independent research standards
- Support ethical AI development globally

## 💎 Sponsor Tiers

- ✨ **Supporter** — $10/month → Help sustain open research
- 🔬 **Research Ally** — $100/month → Fund academic publication costs
- 🧪 **Lab Contributor** — $250/month → Support SYMBI Lab development
- 🌍 **Framework Patron** — $500/month → Support governance and trust infrastructure
- 🏛️ **Institutional Backer** — $2,500/month → Recognition + collaboration on trust standards

## 🤲 How To Contribute

- 💠 **Individuals** — sponsor us to support open research and help protect human dignity in the AI era
- 🏢 **Organizations** — become backers to integrate our trust standards into your AI systems
- 🎓 **Academia & NGOs** — partner with us for research, co-publication, and global knowledge sharing
- 🔬 **Researchers** — use SYMBI Lab for your AI model evaluation studies

### Development Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 Transparency Promise

All contributions and expenses are visible on Open Collective. Every sponsor is part of our global movement to ensure AI evolves with trust, dignity, and sovereignty.

---

**SYMBI Resonate** - Building trust frameworks for the AI era, one experiment at a time.