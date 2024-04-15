# Use the official Python image as the base image
FROM python:3.9

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Flask application code into the container
COPY . .

# Set the environment variable for Flask to use the correct app
ENV FLASK_APP=app.py

# Expose port 4000 to the host
EXPOSE 4000

# Run the Flask application when the container starts
CMD ["flask", "run", "--host=0.0.0.0", "--port=4000"]