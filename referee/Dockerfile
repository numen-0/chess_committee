# Use Python as the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the game logic script
COPY app.py .

# Run the game logic service
CMD ["python", "app.py"]

