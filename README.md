# ssKIND

## Introduction

**ssKIND (Single-cell and Spatial omics Knowledgebase and AI platform for Neurodegenerative Disease)** is a comprehensive web application designed to facilitate the exploration, analysis, and understanding of single-cell and spatial omics data related to neurodegenerative diseases. It aims to provide researchers and users with an intuitive platform to navigate complex biological datasets, gain insights, and leverage AI-powered assistance for their studies.

## Features

*   **Interactive Data Table:** Explore a curated collection of single-cell and spatial datasets with advanced filtering (by species, sex, tissue, and disease) and sorting capabilities (e.g., by Data ID). View detailed information for each dataset in a dedicated modal.
*   **Dynamic Atlas Visualization:** Visualize UMAP projections of integrated single-cell data, interactively explore cell type clusters, and apply filters to refine your view. The right panel provides aggregated statistics about the displayed atlas.
*   **Knowledge Base:** A searchable repository of articles, tutorials, documentation, and news, including a dedicated section for NDD-related drug resources.
*   **Analysis Functions:** Access various computational tools for tasks such as differential expression analysis and pathway analysis, with intuitive interfaces to configure and run analyses.
*   **AI-Powered Chat Assistant:** An integrated, draggable, and resizable chatbox that offers assistance with exploring datasets, interpreting results, and navigating analysis workflows using natural language.
*   **Intuitive Navigation:** Easily access different sections of the application through a responsive navigation bar, with clickable logos and text elements leading to the home page.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.


### Customize Configuration


### Project Setup
version: node.js v22.11.0 
you can just run `./deploy.sh`  by pm2

Useful PM2 commands:
Check status: pm2 status
View logs: pm2 logs sskind-app
Restart app: pm2 restart sskind-app
Stop app: pm2 stop sskind-app
Delete app: pm2 delete sskind-app
Monitor: pm2 monit

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
pm2 start npm --name "ssKIND" -- run start

or 
## Usage

Once the application is running, you can:
*   Navigate through the main sections using the top navigation bar.
*   Explore datasets in the "Data Table" by applying various filters and sorting options.
*   Interact with the "Atlas" page to visualize single-cell data.
*   Utilize the "Knowledge Base" for information and resources.
*   Engage with the AI chat assistant (located in the bottom-right corner) for personalized help and queries.

## Contact

For questions or support, please refer to the "Help" section within the application or reach out to us at [Weidong Wu](weidong.wu@osumc.edu).

## License

[MIT License]