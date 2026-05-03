"""
Management Router — Admin tools for managing commodities.
"""
from fastapi import APIRouter, HTTPException
from models import CommodityManagementRequest
from services.data_service import (
    get_all_commodities, get_commodity, add_commodity, 
    update_commodity, delete_commodity
)

router = APIRouter(prefix="/api/management", tags=["management"])


@router.get("/commodities")
async def list_commodities():
    """List all commodities with management details."""
    return await get_all_commodities()


@router.post("/commodities")
async def create_or_update_commodity(req: CommodityManagementRequest):
    """Add a new commodity or update an existing one."""
    existing = await get_commodity(req.slug)
    if existing:
        await update_commodity(req.slug, req.name, req.unit, req.relevance)
        return {"status": "updated", "slug": req.slug}
    else:
        await add_commodity(req.slug, req.name, req.unit, req.relevance)
        return {"status": "created", "slug": req.slug}


@router.delete("/commodities/{slug}")
async def remove_commodity(slug: str):
    """Remove a commodity from the platform."""
    existing = await get_commodity(slug)
    if not existing:
        raise HTTPException(status_code=404, detail="Commodity not found")
    
    await delete_commodity(slug)
    return {"status": "deleted", "slug": slug}
