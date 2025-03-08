## Setup Instructions
# 1️⃣ Install Dependencies
npm install

# 2️⃣ Start Redis Server
redis-server

# 3️⃣ Run the Application
node src/server.js

## Load Balancing Strategy
    This project distributes tasks fairly across multiple workers using the Least-Loaded Worker Selection strategy,
    ensuring that no worker is overloaded while others remain idle.

## Optimizations & Design Choices
    Clustering: Multiple Node.js processes handle jobs in parallel.
    Redis for Job Queueing: Ensures reliable task management.
    Automatic Worker Management: Crashed workers restart automatically.
    Configurable Settings: Environment variables control worker count and queue names.