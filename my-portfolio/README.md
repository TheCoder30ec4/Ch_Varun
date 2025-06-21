## 🚀 Deployment

### GitHub Pages
The project is configured for automatic deployment to GitHub Pages:

```bash
npm run deploy
```

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🔧 Troubleshooting

### Common Issues

#### Peer Dependency Warnings
If you see peer dependency warnings with React 19, this is normal and won't affect functionality. The project uses `--legacy-peer-deps` in CI/CD to handle these warnings.

#### Build Failures
If the build fails with missing dependencies:
```bash
npm install lucide-react
npm run build
```

#### Node Version Issues
The project requires Node.js 18+ (recommended: Node.js 20+). Update Node.js if you encounter engine warnings:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

#### Development Server Issues
If the dev server doesn't start:
```bash
npm run clean  # Clean install
npm run dev
```

## 🔄 Data Flow
