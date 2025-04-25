"""
Test script for verifying the framework integration.
This script tests the framework selection endpoint and verifies that both LangGraph and OpenAI Agents frameworks work.
"""

import os
import sys
import json
import time
import requests
from typing import Dict, Any, Optional

# Set the backend URL
BACKEND_URL = "http://localhost:8124"

def test_health_endpoint() -> Dict[str, Any]:
    """Test the health endpoint."""
    print(f"\n🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        response.raise_for_status()
        data = response.json()
        print(f"✅ Health endpoint is working: {data['status']}")
        print(f"   Current framework: {data.get('framework', 'unknown')}")
        
        # Check if services are available
        services = data.get("services", {})
        for service_name, service_info in services.items():
            status = "✅" if service_info.get("status") == "ok" else "❌"
            print(f"   {status} {service_name}: {service_info.get('status')}")
            
        return data
    except Exception as e:
        print(f"❌ Error testing health endpoint: {e}")
        sys.exit(1)

def test_framework_selection(framework: str) -> Dict[str, Any]:
    """Test the framework selection endpoint."""
    print(f"\n🔍 Testing framework selection: {framework}...")
    try:
        response = requests.post(
            f"{BACKEND_URL}/config/mode",
            json={"mode": framework}
        )
        response.raise_for_status()
        data = response.json()
        print(f"✅ Framework set to: {data['mode']}")
        
        # Verify the framework was set correctly
        health_data = test_health_endpoint()
        if health_data.get("framework") == framework:
            print(f"✅ Framework successfully changed to {framework}")
        else:
            print(f"❌ Framework change failed. Expected {framework}, got {health_data.get('framework')}")
            
        return data
    except Exception as e:
        print(f"❌ Error setting framework to {framework}: {e}")
        return {"error": str(e)}

def test_invoke_endpoint(framework: str, message: str) -> Dict[str, Any]:
    """Test the invoke endpoint with the specified framework."""
    print(f"\n🔍 Testing invoke endpoint with {framework} framework...")
    try:
        # Set the framework first
        test_framework_selection(framework)
        
        # Prepare the request data
        request_data = {
            "inputs": {
                "messages": [
                    {"role": "user", "content": message}
                ]
            },
            "config": {
                "instructions": "You are a helpful assistant. Respond briefly."
            }
        }
        
        # Send the request
        response = requests.post(
            f"{BACKEND_URL}/v1/graphs/mcp-agent/invoke",
            json=request_data
        )
        response.raise_for_status()
        data = response.json()
        
        # Extract the assistant's response
        outputs = data.get("outputs", {})
        messages = outputs.get("messages", [])
        assistant_messages = [msg for msg in messages if msg.get("role") == "assistant"]
        
        if assistant_messages:
            print(f"✅ Received response from {framework} framework:")
            print(f"   {assistant_messages[-1].get('content')[:100]}...")
        else:
            print(f"❌ No assistant response received from {framework} framework")
            
        return data
    except Exception as e:
        print(f"❌ Error invoking {framework} framework: {e}")
        return {"error": str(e)}

def main():
    """Run the tests."""
    print("🧪 Testing Framework Integration")
    print("===============================")
    
    # Test the health endpoint
    health_data = test_health_endpoint()
    
    # Test LangGraph framework
    langgraph_result = test_invoke_endpoint("langgraph", "What is LangGraph?")
    
    # Test OpenAI Agents framework
    openai_agents_result = test_invoke_endpoint("openai_agents", "What is OpenAI Agents SDK?")
    
    # Test Hybrid framework
    hybrid_result = test_invoke_endpoint("hybrid", "What is the difference between LangGraph and OpenAI Agents SDK?")
    
    # Reset to default framework
    test_framework_selection("langgraph")
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()
