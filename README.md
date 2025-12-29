# HypoMap Frontend

A Vue 3 web application for single-cell RNA-seq analysis with AI-powered hypothesis generation.

## Features

- **UMAP Visualization**: Interactive scatter plots with cell type clustering and gene expression overlays
- **CCC Network Graph**: Cell-cell communication network visualization using vis-network
- **Regulon Network Graph**: Transcription factor regulatory network visualization
- **AI Assistant**: Chat interface powered by Ollama LLMs for biological interpretation and hypothesis generation
- **Gene Expression Analysis**: Heatmaps, dotplots, and feature plots

## Tech Stack

- Vue 3 + Composition API
- Vite
- Tailwind CSS
- vis-network for graph visualization
- marked for markdown rendering

## Getting Started

### Prerequisites

- Node.js v22+
- npm

### Development

```bash
# Install dependencies
npm install

# Start development server (port 9121)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Production Deployment

```bash
# Deploy using PM2 (pulls, builds, and restarts)
npm run deploy
```

PM2 Commands:
```bash
pm2 status                    # Check status
pm2 logs hypomap-frontend     # View logs
pm2 restart hypomap-frontend  # Restart
pm2 stop hypomap-frontend     # Stop
pm2 monit                     # Monitor
```

## Project Structure

```
src/
├── components/
│   ├── AIChatSection.vue      # AI chat interface
│   ├── CCCNetworkGraph.vue    # Cell-cell communication network
│   ├── RegulonNetworkGraph.vue # TF-target network
│   └── single-cell/           # UMAP and expression components
├── views/
│   ├── AtlasView.vue          # Main analysis view
│   └── HomeView.vue           # Landing page
├── composables/               # Shared state and API logic
└── services/                  # API client
```

## Configuration

Environment variables in `.env`:
```
VITE_API_BASE_URL=http://localhost:9120/hypomap-backend/api/v1
```

## Related

- [HypoMap Backend](https://github.com/Wang-Cankun/hypomap-backend) - FastAPI backend

## License

MIT
