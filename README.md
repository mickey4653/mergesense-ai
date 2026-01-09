# 🤖 MergeSense AI - Complete Project

> **AI-powered Git Merge Conflict Resolver** - A complete solution with both a Next.js web application and VS Code extension.

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](./merge-sense-ai-vscode)
[![Next.js App](https://img.shields.io/badge/Next.js-Web%20App-black)](./merge-sense-ai)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)](LICENSE)

---

## 📁 Project Structure

This is a **monorepo** containing two related projects:

```
.
├── merge-sense-ai/          # Next.js web application
│   ├── app/                 # Next.js app directory
│   ├── lib/                 # Shared utilities
│   ├── components/          # React components
│   └── README.md           # Web app documentation
│
├── merge-sense-ai-vscode/   # VS Code extension
│   ├── src/                # TypeScript source
│   ├── media/              # WebView assets
│   ├── docs/               # Documentation & screenshots
│   └── README.md           # Extension documentation
│
└── README.md               # This file (root overview)
```

---

## 🚀 Quick Start

### Option 1: VS Code Extension (Recommended)

The VS Code extension is the main product. See the [VS Code Extension README](./merge-sense-ai-vscode/README.md) for complete setup.

```bash
cd merge-sense-ai-vscode
npm install
npm run compile
# Press F5 in VS Code to run extension
```

### Option 2: Next.js Web Application

The web app provides a browser-based interface. See the [Web App README](./merge-sense-ai/README.md) for details.

```bash
cd merge-sense-ai
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🎯 What is MergeSense AI?

MergeSense AI uses AI (via n8n workflows) to automatically resolve Git merge conflicts. Instead of manually comparing conflict markers, let AI do the heavy lifting while you review and approve.

### ✨ Key Features

- 🤖 **AI-Powered Resolution**: Automatically resolves Git merge conflicts using AI
- 🔍 **Auto-Detection**: Automatically detects conflicts when you open files
- 📝 **Side-by-Side Diff**: View original and resolved code side-by-side
- ✅ **Multiple Options**: Accept HEAD, Incoming, or AI-merged version
- 🎯 **Confidence Scoring**: See AI confidence levels for each resolution
- 🔒 **Production Ready**: API key authentication, timeout handling, error recovery
- 🎨 **Beautiful UX**: Status bar integration, success toasts, inline previews

---

## 📦 Components

### 1. VS Code Extension (`merge-sense-ai-vscode/`)

The main product - a VS Code extension that integrates directly into your editor.

**Features**:
- Status bar integration
- Command palette commands
- Inline diff preview
- One-click apply & save
- Success toast notifications
- Confidence tooltips

**Documentation**: [VS Code Extension README](./merge-sense-ai-vscode/README.md)

### 2. Next.js Web Application (`merge-sense-ai/`)

A web-based interface for resolving conflicts in the browser.

**Features**:
- Browser-based conflict resolution
- Monaco editor integration
- Real-time AI analysis
- Confidence visualization

**Documentation**: [Web App README](./merge-sense-ai/README.md)

---

## 🛠️ Development

### Prerequisites

- **Node.js** 18+ 
- **VS Code** 1.74+ (for extension development)
- **n8n** workflow running with webhook endpoint

### Setup Both Projects

```bash
# Clone the repository
git clone <your-repo-url>
cd gmr-resolut-n8n

# Setup VS Code Extension
cd merge-sense-ai-vscode
npm install
npm run compile

# Setup Next.js App (optional)
cd ../merge-sense-ai
npm install
```

### Running

**VS Code Extension**:
1. Open `merge-sense-ai-vscode` in VS Code
2. Press `F5` to launch Extension Development Host
3. Test the extension in the new window

**Next.js App**:
```bash
cd merge-sense-ai
npm run dev
# Open http://localhost:3000
```

---

## 📚 Documentation

### VS Code Extension
- **[README](./merge-sense-ai-vscode/README.md)** - Complete extension documentation
- **[QUICK_START.md](./merge-sense-ai-vscode/QUICK_START.md)** - Get started in 5 minutes
- **[DEMO.md](./merge-sense-ai-vscode/DEMO.md)** - Demo guide and presentation script
- **[API_KEY_SETUP.md](./merge-sense-ai-vscode/API_KEY_SETUP.md)** - API key authentication setup

### Web Application
- **[README](./merge-sense-ai/README.md)** - Web app documentation
- **[ENV_SETUP.md](./merge-sense-ai/ENV_SETUP.md)** - Environment setup

---

## 🔧 Configuration

Both projects require an n8n webhook URL:

### VS Code Extension
Add to VS Code settings:
```json
{
  "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
}
```

### Next.js App
Create `.env.local`:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/git/conflict/resolve
```

---

## 🚀 Deployment

### VS Code Extension
```bash
cd merge-sense-ai-vscode
npm run package
# Creates merge-sense-ai-0.1.0.vsix
```

### Next.js App
Deploy to Vercel, Netlify, or any Node.js hosting:
```bash
cd merge-sense-ai
npm run build
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please see individual project READMEs for contribution guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

See [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Powered by [n8n](https://n8n.io/) workflows
- Uses [Next.js](https://nextjs.org/) for web interface
- Uses AI for intelligent conflict resolution

---

## ⭐ Show Your Support

If you find MergeSense AI helpful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with your team

**Made with ❤️ for developers who hate merge conflicts**

