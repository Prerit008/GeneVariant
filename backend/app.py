from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from logic import process_vcf
from pydantic import BaseModel
from typing import List
import os

# FastAPI app instance
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Variant(BaseModel):
    rsid: str

class RiskAssessmentResponse(BaseModel):
    risk_label: str
    confidence_score: float
    severity: str

class PharmacogenomicProfileResponse(BaseModel):
    primary_gene: str
    diplotype: str
    phenotype: str
    detected_variants: List[Variant]

class ClinicalRecommendationResponse(BaseModel):
    recommendation: str

class LLMExplanationResponse(BaseModel):
    summary: str
    mechanism: str
    clinical_impact: str
    guideline_basis: str

class PharmaGuardResponse(BaseModel):
    patient_id: str
    drug: str
    timestamp: str
    risk_assessment: RiskAssessmentResponse
    pharmacogenomic_profile: PharmacogenomicProfileResponse
    clinical_recommendation: ClinicalRecommendationResponse
    llm_generated_explanation: LLMExplanationResponse
    quality_metrics: dict

@app.post("/process_vcf/")
async def process_vcf_api(file: UploadFile = File(...), drug: str = ""):
    # Save the uploaded file temporarily
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Call the logic from logic.py
    response = process_vcf(file_path, drug)

    # Delete the temporary file after processing
    os.remove(file_path)

    # Return the response as JSON
    return response
