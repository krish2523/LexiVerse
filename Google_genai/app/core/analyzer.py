from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
from app.models import AnalyzerResponse
from app.logging_config import logger
import asyncio

class DocumentAnalyzer:
    """Document analyzer using Gemini AI for legal document analysis."""
    
    def __init__(self):
        """Initialize the document analyzer with language model."""
        self.llm = ChatGoogleGenerativeAI(
            model=settings.MODEL_NAME,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=settings.TEMPERATURE,
            timeout=60,  # Longer timeout for analysis
            max_retries=2
        )
        self.structured_llm = self.llm.with_structured_output(AnalyzerResponse)

    async def analyze(self, document_text: str) -> AnalyzerResponse:
        """Analyze legal document using Gemini with structured output and timeout."""
        try:
            logger.info("Starting document analysis with Gemini")
            
            # Limit document size for analysis to prevent timeouts
            max_chars = 8000
            if len(document_text) > max_chars:
                logger.info(f"Document too long ({len(document_text)} chars), truncating to {max_chars}")
                document_text = document_text[:max_chars] + "\n\n[Document truncated for analysis]"
            
            prompt = f"""
            You are a professional legal document analyzer. Analyze this legal document thoroughly and provide:

            REQUIRED FIELDS:
            - decision: Always set to "accept" for successful analysis
            - document_type: Identify the most specific type (e.g., "Residential Lease Agreement", "Employment Contract - Full Time", "Mutual Non-Disclosure Agreement", "Terms of Service - SaaS Platform")
            - summary: Provide a comprehensive, multi-paragraph summary (100-200 words)
            - important_clauses: List 4-6 of the most critical clauses

            DETAILED REQUIREMENTS:

            1. Decision: Always respond with "accept" for any document that can be analyzed

            2. Document Type: Identify the most specific type of legal document

            3. Summary: Provide a comprehensive, multi-paragraph summary (100-200 words) that covers:
               - Purpose and nature of the document
               - Parties involved and their roles
               - Key rights, obligations, and responsibilities
               - Important timelines, deadlines, or duration
               - Financial terms, payments, or compensation
               - Termination conditions and consequences
               - Notable limitations, exclusions, or special provisions
               Use clear, professional language that explains complex legal concepts in accessible terms.

            4. Important Clauses: List 4-6 of the most critical clauses as simple strings. Each clause should be a concise description (30-50 words) that includes:
               - The clause title/topic
               - What it means in simple terms
               - Why it's important
               Return each clause as a single string, not as an object.

            Example format for important_clauses:
            [
              "Services & Deliverables: Defines the specific services to be provided and deliverables expected from each party",
              "Payment Terms: Outlines payment schedule, amounts, and conditions for compensation",
              "Termination: Specifies conditions under which the agreement can be ended by either party",
              "Confidentiality: Protects sensitive information shared between parties"
            ]

            Document Text:
            {document_text}

            Return your analysis with the exact structure expected by the system, ensuring all fields are properly filled.
            IMPORTANT: The important_clauses field must be an array of strings, not objects. Each string should be a complete clause description.
            """
            
            messages = [{"role": "user", "content": prompt}]
            
            # Add timeout to analysis
            result = await asyncio.wait_for(
                self.structured_llm.ainvoke(messages),
                timeout=90.0  # 90 second timeout for analysis
            )

            if result is not None:
                logger.info(f"Analysis completed for document type: {result.document_type}")
                return result
            
            else:
                logger.warning("Structured LLM returned None for analysis, using fallback")
                return AnalyzerResponse(
                    decision="accept",
                    document_type="Unknown",
                    summary="Analysis could not be completed due to structured output failure.",
                    important_clauses=[
                        "No structured response received from analyzer",
                        "Please try uploading the document again",
                        "If issue persists, contact support"
                    ]
                )
            
        except asyncio.TimeoutError:
            logger.error("Document analysis timed out after 90 seconds")
            return AnalyzerResponse(
                decision="accept",
                document_type="Unknown",
                summary="Document analysis timed out. Please try with a smaller document.",
                important_clauses=[
                    "Analysis timed out due to document complexity or size",
                    "Try uploading a smaller document",
                    "Consider breaking large documents into sections"
                ]
            )
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            return AnalyzerResponse(
                decision="accept",
                document_type="Unknown",
                summary=f"Document analysis failed: {str(e)}. Please try again or consult a legal professional.",
                important_clauses=[
                    "Analysis encountered an error",
                    "Document may require manual review", 
                    "Consider consulting a legal professional"
                ]
            )