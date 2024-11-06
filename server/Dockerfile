# Use an official Python runtime as a base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the app files
COPY app.py .
COPY assets/ ./assets/

# Expose port 5000
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]
