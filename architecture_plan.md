# Commodity Intelligence Platform - Architecture Plan

## 1. System Overview
A mobile-first, responsive web application serving as an enterprise-grade commodity intelligence tool tailored for an **Optical Fibre Manufacturing Company**. The system is driven by a multi-agent backend architecture that continuously scours public sources, conducts deep research, and synthesizes CXO-ready insights.

## 2. UI/UX & Frontend Structure
*   **Login Page:** A secure entry point for enterprise users. For the initial phase, this will be "open" (bypassing strict auth) but the UI will be fully designed.
*   **CXO Dashboard:** A high-level overview page that displays:
    *   Prices for each tracked commodity
    *   Key market highlights
    *   An executive summary
*   **Detailed Commodity View:** An individual detailed insights pack for each commodity.

## 3. Multi-Agent Architecture

### Agent 1: Data Scraping & Aggregation Agent
**Goal:** Reliable, automated extraction of quantitative data.
*   **Sources:** World Bank APIs, Commodity Exchanges (CME, LME via aggregators), Federal Reserve Economic Data (FRED), USGS (for specific minerals).
*   **Data Points:** Spot prices, historical price trends, production volumes, and macroeconomic indicators.
*   **Mechanism:** Scheduled background workers (e.g., daily crons) ensuring data freshness without overwhelming rate limits.

### Agent 2: Deep Research & Market Analysis Agent
**Goal:** Qualitative analysis of the market landscape across all relevant geographies.
*   **Core Focus:** Supply & Demand dynamics, capacity forecasting, scenario modeling (bull/bear/base cases).
*   **Geographic Coverage:** Truly global monitoring, tracking intelligence across **all countries** relevant to the supply chain.
*   **Risk & Opportunity Assessment:** Evaluating geopolitical tensions, trade tariffs, supply chain bottlenecks, and natural disasters.

### Agent 3: CXO Insights & Global Intelligence Agent
**Goal:** Synthesizing data and research into professional, actionable intelligence.
*   **Outputs:** A **detailed insights pack for each commodity**, including procurement strategies, cost-curve impacts, and high-level summaries.
*   **Global Intelligence Feed:** A chronologically sorted (descending order) feed of key global news, events, and macroeconomic shifts. Each item will be strictly classified as:
    *   🔴 **Risk**
    *   🟢 **Opportunity**
    *   ⚪ **Normal**
    (Complete with sources and publication dates).

## 4. Technology Stack (Proposed)
*   **Frontend:** Next.js (React) + Tailwind CSS (ensuring strict mobile-first, responsive design principles).
*   **Backend:** Python (FastAPI) for robust data handling and AI orchestration.
*   **AI Orchestration:** LLM-driven agents (e.g., Google Gemini 1.5 Pro) for natural language reasoning, research synthesis, and insight generation.
*   **Database/Storage:** JSON-based local storage or lightweight DB (SQLite/PostgreSQL) depending on scale requirements.

## 5. Phased Development Approach
1.  **Phase 1: Foundation & Authentication UI** - Setup project and build the login page (open access for now).
2.  **Phase 2: Agent Pipeline Refinement** - Configure the web scrapers, API integrations, and ensure the LLMs classify news (Risk/Opportunity/Normal) and cover all geographies.
3.  **Phase 3: Dashboard & Intelligence Feed** - Build the mobile-first CXO Dashboard (prices, highlights, summary) and the chronologically sorted global intelligence feed.
4.  **Phase 4: Detailed Insight Packs** - Build out the individual pages/components providing detailed insight packs for each commodity.
