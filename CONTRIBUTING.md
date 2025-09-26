# Contributing to SYMBI-Resonate

Thank you for your interest in contributing to the SYMBI-Resonate project! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python 3.8+ (for ML testing)

### Installation
```bash
# Clone the repository
git clone https://github.com/s8ken/SYMBI-Resonate.git
cd SYMBI-Resonate

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code formatting
- Write comprehensive tests
- Document all public APIs

### Commit Messages
Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `test:` Test additions or updates
- `refactor:` Code refactoring
- `style:` Code style changes

### Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Add tests for new functionality
4. Update documentation if needed
5. Submit a pull request

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm run test

# ML tests
python test/test_ml_enhanced_detection.py

# All tests
npm run test:all
```

### Test Coverage
- Maintain >85% test coverage
- Include unit tests for all new features
- Add integration tests for user workflows

## 📖 Documentation

### Code Documentation
- Use JSDoc for TypeScript functions
- Include examples in documentation
- Update README.md for new features

### Case Studies
- Add new case studies to the `case-studies/` folder
- Follow the established format
- Include quantitative metrics where possible

## 🔧 Development Environment

### Recommended Tools
- VS Code with ESLint extension
- Prettier for code formatting
- GitHub Desktop for version control

### Environment Variables
Create a `.env.local` file:
```bash
VITE_API_URL=http://localhost:3000
VITE_DEBUG_MODE=true
```

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Test with the latest version
- Provide a minimal reproduction case

### Bug Report Template
```markdown
**Description**: Brief description of the issue
**Steps to Reproduce**: 1. 2. 3.
**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Environment**: Browser, OS, version
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Problem**: What problem does this solve?
**Solution**: Your proposed solution
**Alternatives**: Other solutions considered
**Additional Context**: Any other relevant information
```

## 🎯 Case Study Contributions

### Adding New Case Studies
1. Create in appropriate folder: `case-studies/[category]/`
2. Follow established format
3. Include both quantitative and qualitative analysis
4. Add to main README index

### Case Study Format
- Executive Summary
- Methodology
- Findings
- Discussion
- Future Research
- References

## 📊 Metrics and Evaluation

### Key Metrics to Track
- Framework effectiveness scores
- User engagement metrics
- Performance benchmarks
- Error rates and recovery

### Evaluation Tools
- SYMBI framework scoring
- User surveys
- Performance monitoring
- A/B testing

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Maintain professional communication

### Recognition
Contributors will be recognized in:
- README.md acknowledgments
- Release notes
- GitHub contributors page

## 📞 Getting Help

### Support Channels
- GitHub Issues for bugs and features
- Discussions for questions
- Email for sensitive issues

### Resources
- [SYMBI Framework Guide](./docs/SYMBI_FRAMEWORK_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Case Studies](./case-studies/)

## 🏆 Recognition

### Hall of Fame
Outstanding contributors will be featured in:
- Project README
- Case study acknowledgments
- Special contributor badges

### Contribution Tiers
- **Contributor**: First PR merged
- **Maintainer**: Regular contributions
- **Architect**: Major framework contributions

Thank you for contributing to making AI evaluation more transparent, trustworthy, and effective!