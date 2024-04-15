This is a [Next.js](https://nextjs.org/) project bootstrapped with [⁠ create-next-app ⁠](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

# Prerequisites

To run this project, make sure you have the following software installed on your computer:

•⁠  ⁠Node.js version 20 or higher
•⁠  ⁠npm version 10 or higher

You can download Node.js from the official website: [https://nodejs.org](https://nodejs.org)

After installing Node.js, you will have npm (Node Package Manager) automatically installed along with it.

# Frontend

First, run the frontend development server:

⁠ bash

git clone https://github.com/likhithnemani/broken-calculator

cd dev/frontend/broken-calculator

npm install

npm run dev
 ⁠

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Backend

Next, run the backend development server:

⁠bash

cd dev/backend

pip install -r requirements.txt

create a .env file and include these variables with values
POSTGRES_USER=""
POSTGRES_HOST=""
POSTGRES_PASSWORD=""
POSTGRES_DATABASE=""

I'm using postgres which is deployed in vercel

python3 app.py
⁠
Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.
