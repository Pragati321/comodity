"""
Commodity Intelligence Platform — FastAPI Backend Entry Point

Features:
- CORS pre-configured for localhost:3000
- Auto database initialization on startup
- Agent pipeline trigger endpoint
- APScheduler for 24-hour refresh cycle
"""
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import settings
from database import init_db
from routers import auth, dashboard, commodity, management
from agents.agent1_scraper import run_agent1
from agents.agent2_research import run_agent2
from agents.agent3_insights import run_agent3


# --- Agent Pipeline ---

# Global pipeline status tracking
pipeline_status = {
    "status": "idle", # idle, running, completed, failed
    "last_run": None,
    "current_agent": None,
    "error": None
}

async def run_full_pipeline():
    """Execute the full 3-agent pipeline sequentially."""
    global pipeline_status
    pipeline_status["status"] = "running"
    pipeline_status["error"] = None
    
    print("\n" + "=" * 60)
    print("STARTING FULL AGENT PIPELINE")
    print("=" * 60)

    try:
        pipeline_status["current_agent"] = "Scraper (Agent 1)"
        await run_agent1()
        
        pipeline_status["current_agent"] = "Research (Agent 2)"
        await run_agent2()
        
        pipeline_status["current_agent"] = "Insights (Agent 3)"
        await run_agent3()
        
        pipeline_status["status"] = "completed"
        pipeline_status["last_run"] = datetime.utcnow().isoformat() + "Z"
        pipeline_status["current_agent"] = None
    except Exception as e:
        print(f"Pipeline failed: {e}")
        pipeline_status["status"] = "failed"
        pipeline_status["error"] = str(e)
        pipeline_status["current_agent"] = None

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)


# --- App Lifecycle ---

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    # Startup
    print("Initializing database...")
    await init_db()

    print(f"LLM Mode: {'LIVE (Gemini)' if settings.use_live_llm else 'MOCK'}")
    print(f"Agent refresh: every {settings.AGENT_REFRESH_HOURS} hours")

    # Check if we have any data to determine if this is a fresh install
    from services.data_service import get_all_commodities, get_latest_summary
    commodities = await get_all_commodities()
    has_summary = await get_latest_summary()
    is_empty = not commodities or "being generated" in has_summary

    # Run initial pipeline in background ONLY if:
    # 1. We have a live LLM key (to get fresh real data)
    # 2. OR it's a fresh install/empty DB (to get initial mock data for UI)
    if settings.use_live_llm or is_empty:
        print(f"Starting initial pipeline (Mode: {'LIVE' if settings.use_live_llm else 'MOCK-INIT'})")
        asyncio.create_task(run_full_pipeline())
    else:
        print("Skipping automatic pipeline run: No API key provided and existing data found in database.")

    # Schedule recurring pipeline only if we have a live LLM
    if settings.use_live_llm:
        scheduler.add_job(
            run_full_pipeline,
            'interval',
            hours=settings.AGENT_REFRESH_HOURS,
            id='agent_pipeline',
            replace_existing=True,
        )
        scheduler.start()
        print("Scheduler started for periodic updates")
    else:
        print("Scheduler NOT started: Live LLM required for periodic updates")

    yield

    # Shutdown
    scheduler.shutdown()
    print("Shutting down")


# --- FastAPI App ---

app = FastAPI(
    title="STL COMIQ Platform",
    description="Enterprise-grade commodity intelligence for optical fibre manufacturing",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(commodity.router)
app.include_router(management.router)


# --- Manual trigger endpoint ---

@app.post("/api/pipeline/trigger")
async def trigger_pipeline():
    """Manually trigger the full agent pipeline."""
    asyncio.create_task(run_full_pipeline())
    return {"status": "Pipeline triggered", "mode": "live" if settings.use_live_llm else "mock"}


@app.get("/api/pipeline/status")
async def get_pipeline_status():
    """Get the current status of the agent pipeline."""
    return pipeline_status


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "llm_mode": "live" if settings.use_live_llm else "mock",
        "refresh_hours": settings.AGENT_REFRESH_HOURS,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
