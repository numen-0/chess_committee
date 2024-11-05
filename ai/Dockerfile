# Use Python as the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the AI logic script
COPY ai_logic.py .

# Run the AI logic service
CMD ["python", "ai_logic.py"]

