FROM python:3.11-slim

WORKDIR /app

# Copy requirements first so Docker caches the layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and artifacts
COPY app.py .
COPY artifacts/ ./artifacts/

# Expose the port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
