from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Union
from datetime import datetime, timezone
import hashlib
import json
import requests
import os
from dotenv import load_dotenv
import uuid
import httpx
import logging

# 1. Import the new Google GenAI SDK components
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="CyRA - Conversational SIEM Assistant")

# CORS Configuration - Must be added before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only - restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # For development only - specify methods in production
    allow_headers=["*"],  # For development only - specify headers in production
    expose_headers=["*"]  # Expose all headers to the client
)

# Create API router after CORS is configured
api_router = APIRouter(prefix="/api")


# Pydantic Models
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(
        ...,
        min_items=1,
        max_items=10,
        description="List of chat messages. Maximum 10 messages allowed."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "messages": [
                    {"role": "user", "content": "Show me recent security alerts"}
                ]
            }
        }


class ChatResponse(BaseModel):
    response: Union[str, Dict[str, Any]]
    response_type: str  # 'text', 'table', 'chart'


class ReportRequest(BaseModel):
    report_summary: str


class ReportResponse(BaseModel):
    hash: str
    block_index: int
    message: str


# System Prompt
SYSTEM_PROMPT = """
You are CyRA, an expert cybersecurity analyst assistant for ISRO's Security Operations Center. You specialize in converting natural language security queries into Elasticsearch DSL queries and analyzing SIEM data.

Available SIEM Indices:

1. wazuh-alerts-*: Security alerts from Wazuh
   - rule.description: Alert description
   - rule.level: Alert severity (0-15)
   - agent.name: Source system name
   - data.srcip: Source IP address
   - @timestamp: Event timestamp
   - rule.mitre.id: MITRE ATT&CK technique ID
   - rule.mitre.technique: MITRE technique name

2. winlogbeat-*: Windows event logs
   - winlog.event_data.TargetUserName: Target username
   - event.outcome: Success/failure
   - source.ip: Source IP
   - host.name: Hostname
   - winlog.event_id: Windows Event ID
   - @timestamp: Event timestamp

3. suricata-*: Network intrusion detection
   - alert.signature: Alert signature
   - src_ip: Source IP
   - dest_ip: Destination IP
   - alert.severity: Alert severity
   - @timestamp: Event timestamp

When asked about security events, respond with:
1. A brief explanation of what you're searching for
2. If the query is about data visualization, return JSON in format:
   {
     "type": "chart",
     "chart_type": "bar|line|pie",
     "title": "Chart title",
     "data": [{"name": "label", "value": number}, ...]
   }
3. If the query is about tabular data, return JSON in format:
   {
     "type": "table",
     "title": "Table title",
     "headers": ["Column1", "Column2", ...],
     "rows": [["data1", "data2", ...], ...]
   }
4. For general queries, respond with text analysis and insights.

Focus on ISRO-specific security concerns like satellite communication security, mission-critical system protection, and space infrastructure cybersecurity.
"""


# Simple Blockchain Implementation
class Block:
    def __init__(self, index: int, data: str, previous_hash: str):
        self.index = index
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self) -> str:
        block_string = f"{self.index}{self.timestamp}{self.data}{self.previous_hash}"
        return hashlib.sha256(block_string.encode()).hexdigest()

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "hash": self.hash
        }


class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self) -> Block:
        return Block(0, "Genesis Block - ISRO CyRA Report Chain", "0")

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_block(self, data: str) -> Block:
        previous_block = self.get_latest_block()
        new_block = Block(
            len(self.chain),
            data,
            previous_block.hash
        )
        self.chain.append(new_block)
        return new_block


# Global blockchain instance
report_chain = Blockchain()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- COMMENTED OUT OPENROUTER SERVICE ---
# class OpenRouterService:
#     def __init__(self):
#         self.api_key = os.getenv('OPENROUTER_API_KEY')
#         self.base_url = "https://openrouter.ai/api/v1"
#
#         if not self.api_key:
#             logger.error("❌ OPENROUTER_API_KEY is missing from environment variables!")
#         else:
#             logger.info(f"✅ OpenRouter Service initialized (Key ends in: ...{self.api_key[-4:]})")
#
#     async def get_ai_response(self, messages: List[ChatMessage]) -> str:
#         if not self.api_key:
#             raise HTTPException(status_code=500, detail="OpenRouter API Key is missing on server.")
#
#         headers = {
#             "Authorization": f"Bearer {self.api_key}",
#             "Content-Type": "application/json",
#             "HTTP-Referer": "http://localhost:3000",  # Frontend URL for CORS
#             "X-Title": "ISRO CyRA Assistant"
#         }
#
#         # Format messages for OpenRouter
#         openrouter_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
#         for msg in messages:
#             openrouter_messages.append({"role": msg.role, "content": msg.content})
#
#         payload = {
#             "model": "google/gemma-3-27b-it:free", # Or "mistralai/mistral-7b-instruct-v0.1"
#             "messages": openrouter_messages,
#             "temperature": 0.3,
#             "max_tokens": 1000
#         }
#
#         print(f"DEBUG: Using API Key: {self.api_key[:5]}***")
#
#         try:
#             async with httpx.AsyncClient(timeout=30.0) as client:
#                 response = await client.post(
#                     f"{self.base_url}/chat/completions",
#                     headers=headers,
#                     json=payload,
#                 )
#
#                 if response.status_code != 200:
#                     logger.error(f"❌ OpenRouter Error: {response.text}")
#                     raise HTTPException(
#                         status_code=response.status_code,
#                         detail=f"Provider Error: {response.text}"
#                     )
#
#                 response.raise_for_status()
#
#                 result = response.json()
#                 logger.info("✅ Received response from OpenRouter")
#                 return result['choices'][0]['message']['content']
#
#         except httpx.ReadTimeout:
#             logger.error("❌ Request timed out")
#             raise HTTPException(status_code=504, detail="OpenRouter timed out (30s limit)")
#         except httpx.ConnectError:
#             logger.error("❌ Connection failed")
#             raise HTTPException(status_code=502, detail="Failed to connect to OpenRouter")
#         except Exception as e:
#             logger.error(f"❌ Unexpected error: {str(e)}")
#             raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
#
#         except requests.exceptions.HTTPError as e:
#             if e.response.status_code == 401:
#                 raise HTTPException(status_code=500, detail="Invalid OpenRouter API Key.")
#             raise HTTPException(status_code=500, detail=f"OpenRouter HTTP Error: {str(e)}")
#         except Exception as e:
#             print(f"General Exception in OpenRouterService: {str(e)}")
#             raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# --- NEW GOOGLE GEMINI SERVICE ---
class GeminiService:
    def __init__(self):
        # The client automatically picks up GEMINI_API_KEY from your environment variables
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.error("❌ GEMINI_API_KEY is missing from environment variables!")
        else:
            logger.info(f"✅ Gemini Service initialized (Key ends in: ...{self.api_key[-4:]})")

    async def get_ai_response(self, messages: List[ChatMessage]) -> str:
        if not self.api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key is missing on server.")

        # Format messages for Gemini
        gemini_messages = []
        for msg in messages:
            # Gemini uses 'model' instead of 'assistant' for AI responses
            role = "model" if msg.role == "assistant" else "user"
            gemini_messages.append({
                "role": role,
                "parts": [{"text": msg.content}]
            })

        try:
            # We use the async client (`.aio`) so we don't block FastAPI
            async with genai.Client().aio as client:
                response = await client.models.generate_content(
                    model="gemini-3-flash-preview",
                    contents=gemini_messages,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.3,
                        max_output_tokens=1000
                    )
                )

                logger.info("✅ Received response from Gemini")
                return response.text

        except Exception as e:
            logger.error(f"❌ Gemini Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Provider Error: {str(e)}")


# Mock SIEM Data Generator
class MockSIEMService:
    def generate_mock_data(self, query_context: str) -> Dict[str, Any]:
        query_lower = query_context.lower()

        if "malware" in query_lower or "virus" in query_lower:
            return {
                "type": "table",
                "title": "Recent Malware Detections",
                "headers": ["Timestamp", "Agent", "Malware Type", "Source IP", "Severity"],
                "rows": [
                    ["2024-01-15 14:30:22", "ISRO-SAT-01", "Trojan.SpaceHack", "192.168.1.45", "High"],
                    ["2024-01-15 13:15:10", "ISRO-GND-02", "Worm.OrbitKill", "10.0.0.23", "Critical"],
                    ["2024-01-15 12:45:33", "ISRO-CTL-03", "Rootkit.SatComm", "172.16.0.12", "Medium"]
                ]
            }

        elif "login" in query_lower or "authentication" in query_lower:
            return {
                "type": "chart",
                "chart_type": "bar",
                "title": "Failed Login Attempts by System",
                "data": [
                    {"name": "Mission Control", "value": 23},
                    {"name": "Satellite Comm", "value": 15},
                    {"name": "Ground Station", "value": 8},
                    {"name": "Data Center", "value": 12}
                ]
            }

        elif "network" in query_lower or "traffic" in query_lower:
            return {
                "type": "chart",
                "chart_type": "line",
                "title": "Network Anomaly Trends (Last 24 Hours)",
                "data": [
                    {"name": "00:00", "value": 5},
                    {"name": "04:00", "value": 3},
                    {"name": "08:00", "value": 12},
                    {"name": "12:00", "value": 8},
                    {"name": "16:00", "value": 15},
                    {"name": "20:00", "value": 6}
                ]
            }

        elif "threat" in query_lower or "attack" in query_lower:
            return {
                "type": "table",
                "title": "Active Threat Intelligence",
                "headers": ["Threat Type", "Target System", "MITRE ID", "Risk Level", "Status"],
                "rows": [
                    ["APT - Space Sector", "Satellite Control", "T1566.001", "Critical", "Investigating"],
                    ["DDoS Attack", "Ground Communications", "T1498", "High", "Mitigated"],
                    ["Data Exfiltration", "Mission Database", "T1041", "Medium", "Contained"]
                ]
            }

        else:
            # Default response for general queries
            return {
                "type": "text",
                "content": "I've processed your security query. Current ISRO systems show normal operations with no critical alerts. All satellite communication channels are secure, and mission-critical systems are operating within normal parameters. Would you like me to run a specific security analysis?"
            }


# Service instances updated to use Gemini instead
# openrouter_service = OpenRouterService()
gemini_service = GeminiService()
mock_siem_service = MockSIEMService()


# API Endpoints
@api_router.post("/chat", response_model=ChatResponse, responses={
    400: {"description": "Bad Request - Invalid input"},
    422: {"description": "Validation Error - Invalid message format"},
    500: {"description": "Internal Server Error"}
})
async def chat_endpoint(request: ChatRequest):
    try:
        if not request.messages:
            raise HTTPException(
                status_code=400,
                detail=[{"msg": "At least one message is required", "type": "value_error"}]
            )

        # Ensure we have at least one user message
        if not any(msg.role == "user" for msg in request.messages):
            raise HTTPException(
                status_code=400,
                detail=[{"msg": "At least one user message is required", "type": "value_error"}]
            )

        # Get AI response from Gemini
        ai_response = await gemini_service.get_ai_response(request.messages)

    except HTTPException as he:
        # Re-raise known HTTP exceptions
        raise he

    except Exception as e:
        # Print the full traceback to your terminal
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected Backend Error: {str(e)}")

    # Determine if the response should include mock data
    last_message = request.messages[-1].content if request.messages else ""

    # Try to parse AI response as JSON for structured data
    try:
        response_data = json.loads(ai_response)
        if isinstance(response_data, dict) and "type" in response_data:
            return ChatResponse(
                response=response_data,
                response_type=response_data.get("type", "text")
            )
    except json.JSONDecodeError:
        pass

    # Generate mock SIEM data based on context
    mock_data = mock_siem_service.generate_mock_data(last_message)

    # If mock data is structured (table/chart), return it
    if mock_data["type"] != "text":
        # Combine AI response with mock data
        combined_response = {
            "type": mock_data["type"],
            "ai_analysis": ai_response,
            **mock_data
        }
        return ChatResponse(
            response=combined_response,
            response_type=mock_data["type"]
        )

    # Return text response
    return ChatResponse(
        response=ai_response,
        response_type="text"
    )


@api_router.post("/log_report", response_model=ReportResponse)
async def log_report_endpoint(request: ReportRequest):
    try:
        # Calculate hash of the report
        report_hash = hashlib.sha256(request.report_summary.encode()).hexdigest()

        # Create blockchain entry
        report_data = {
            "report_summary": request.report_summary,
            "report_hash": report_hash,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "system": "ISRO CyRA"
        }

        # Add to blockchain
        new_block = report_chain.add_block(json.dumps(report_data))

        return ReportResponse(
            hash=report_hash,
            block_index=new_block.index,
            message=f"Report logged to blockchain for integrity verification. Block #{new_block.index}"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report logging error: {str(e)}")


@api_router.get("/blockchain")
async def get_blockchain():
    """Get the current blockchain state for debugging"""
    return {
        "chain_length": len(report_chain.chain),
        "latest_block": report_chain.get_latest_block().to_dict(),
        "total_reports": len(report_chain.chain) - 1  # Excluding genesis block
    }


@api_router.get("/")
async def root():
    return {"message": "CyRA - Conversational SIEM Assistant for ISRO is operational"}


# Include router
app.include_router(api_router)