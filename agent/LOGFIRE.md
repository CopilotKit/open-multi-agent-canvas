# Logfire Integration for KB-multi-agent

This project includes integration with [Logfire](https://logfire.ai/) for logging, tracing, and monitoring of the agent's operations.

## Setup

### 1. Install the Logfire SDK

The Logfire SDK is already included in the project dependencies. When you run `poetry install`, it will be installed automatically.

### 2. Authenticate with Logfire

To authenticate with Logfire, run:

```bash
logfire auth
```

This will open a browser window where you can authenticate. Upon successful authentication, credentials are stored in `~/.logfire/default.toml`.

### 3. Configure the Project

From the working directory where you will run your application, set the Logfire project:

```bash
logfire projects use kb-multi-agent
```

Alternatively, you can set the `LOGFIRE_PROJECT` environment variable in your `.env` file.

### 4. Configure Environment Variables

In your `.env` file, set the following variables:

```
LOGFIRE_PROJECT=kb-multi-agent
LOGFIRE_TOKEN=<your-logfire-token>  # Optional, if not using logfire auth
LOGGING_ENABLED=true
```

## Features

The Logfire integration provides the following features:

### Tracing

- **Conversation Tracing**: Each conversation is assigned a unique ID and trace ID for tracking
- **Tool Usage Tracing**: All tool calls are logged with inputs and outputs
- **LLM Interaction Tracing**: Model calls are logged with prompts and responses
- **Error Tracking**: Exceptions are logged with context information

### Metrics

- **Response Times**: Track how long different operations take
- **Message Counts**: Monitor the number of messages in conversations
- **Tool Usage**: See which tools are used most frequently

### Logs

- **Structured Logging**: All logs include relevant context like conversation IDs
- **Error Logging**: Detailed error information for debugging
- **Event Logging**: Key events in the agent's lifecycle are logged

## Implementation Details

The Logfire integration is implemented in the following files:

- `mcp_agent/integrations/logfire_integration.py`: The main integration module
- `mcp_agent/agent_factory.py`: Factory that initializes and provides the logger
- `mcp_agent/agent.py`: Uses the logger for tracing agent operations

## Viewing Logs and Traces

To view your logs and traces, go to the [Logfire Dashboard](https://app.logfire.ai/) and select your project.

## Troubleshooting

If you encounter issues with Logfire integration:

1. Check that you're authenticated with `logfire auth`
2. Verify that the correct project is set with `logfire projects list`
3. Ensure `LOGGING_ENABLED=true` in your environment
4. Check for any error messages in the application logs

## Disabling Logging

To disable Logfire logging, set `LOGGING_ENABLED=false` in your `.env` file or environment variables.
