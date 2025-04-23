#!/usr/bin/env python
"""
Test script to verify the MCP Agent server is working correctly.
This script tests the health endpoint and other basic functionality.
"""

import sys
import time
import requests
import argparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_health_endpoint(base_url="http://localhost:8124"):
    """Test the health endpoint."""
    try:
        logger.info(f"Testing health endpoint at {base_url}/health")
        response = requests.get(f"{base_url}/health", timeout=5)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses

        logger.info(f"Health endpoint response: {response.status_code} {response.reason}")
        logger.info(f"Response body: {response.json()}")

        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Error testing health endpoint: {e}")
        return False

def test_routes_endpoint(base_url="http://localhost:8124"):
    """Test the routes endpoint."""
    try:
        logger.info(f"Testing routes endpoint at {base_url}/routes")
        response = requests.get(f"{base_url}/routes", timeout=5)
        response.raise_for_status()

        logger.info(f"Routes endpoint response: {response.status_code} {response.reason}")
        routes = response.json().get("routes", [])
        logger.info(f"Available routes: {len(routes)}")
        for route in routes:
            logger.info(f"  {route['path']} [{','.join(route['methods'])}]")

        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Error testing routes endpoint: {e}")
        return False

def test_root_endpoint(base_url="http://localhost:8124"):
    """Test the root endpoint."""
    try:
        logger.info(f"Testing root endpoint at {base_url}/")
        response = requests.get(f"{base_url}/", timeout=5)
        response.raise_for_status()

        logger.info(f"Root endpoint response: {response.status_code} {response.reason}")
        logger.info(f"Response body: {response.json()}")

        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Error testing root endpoint: {e}")
        return False

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Test the MCP Agent server")
    parser.add_argument("--url", default="http://localhost:8124", help="Base URL of the server")
    parser.add_argument("--wait", type=int, default=0, help="Wait time in seconds before testing")
    args = parser.parse_args()

    if args.wait > 0:
        logger.info(f"Waiting {args.wait} seconds for server to start...")
        time.sleep(args.wait)

    # Run the tests
    health_ok = test_health_endpoint(args.url)
    routes_ok = test_routes_endpoint(args.url)
    root_ok = test_root_endpoint(args.url)

    # Print summary
    logger.info("\nTest Summary:")
    logger.info(f"Health Endpoint: {'✅ PASS' if health_ok else '❌ FAIL'}")
    logger.info(f"Routes Endpoint: {'✅ PASS' if routes_ok else '❌ FAIL'}")
    logger.info(f"Root Endpoint: {'✅ PASS' if root_ok else '❌ FAIL'}")

    # Exit with appropriate status code
    if health_ok and routes_ok and root_ok:
        logger.info("All tests passed! Server is working correctly.")
        return 0
    else:
        logger.error("Some tests failed. Server may not be working correctly.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
