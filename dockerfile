# Dockerfile for MCP Psychology Server

# Use official Python base image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Create logs directory and set permissions
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Copy source code
COPY . /app

# Expose server port
EXPOSE 8000

# Start the FastAPI app using Uvicorn
CMD ["uvicorn", "mcp_server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]