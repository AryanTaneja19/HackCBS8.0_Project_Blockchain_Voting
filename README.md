# 🗳️ HACKCBS 8.0 – Decentralized Voting DApp

A **decentralized blockchain-based voting system** built for the **HACKCBS 8.0 hackathon**, combining the power of **Ethereum Smart Contracts**, **FastAPI**, and a modern **JavaScript frontend**.  
This project ensures **transparency**, **security**, and **immutability** in online voting through blockchain technology.

---

## 🌟 Project Overview

The **HACKCBS 8.0 Voting DApp** allows users to:
- Register as voters and candidates.
- Cast votes securely using Ethereum transactions.
- View live vote counts with real-time smart contract interactions.
- Maintain a transparent, tamper-proof ledger of votes on the blockchain.

The system consists of:
- ⚙️ **Backend (API)** – Python FastAPI server for data management and authentication.  
- 💻 **Frontend (UI)** – JavaScript-based interface for voter interaction with MetaMask.  
- ⛓️ **Blockchain Layer** – Ethereum smart contracts written in Solidity and deployed using Truffle + Ganache.

---

## 🧱 Tech Stack

| Layer | Technology | Description |
|:------|:------------|:-------------|
| 🖥️ Frontend | HTML, CSS, JS (ES6), Web3.js | Responsive UI for voter interaction |
| ⚙️ Backend | FastAPI (Python), Uvicorn | Handles API calls and server logic |
| ⛓ Blockchain | Solidity, Truffle, Ganache | Smart contracts and local blockchain |
| 💳 Wallet | MetaMask | Transaction signing and account management |
| 🧩 Deployment Script | Node.js | Contract migration and testing |
| 💾 Database (API) | FastAPI + SQLite (Optional) | Stores user metadata / logs |

---

## 📂 Project Structure

HACKCBS8.0VOTING/
│
├── build/
│ └── contracts/
│ ├── Migrations.json
│ └── Voting.json
│
├── contracts/
│ ├── Migrations.sol
│ └── Voting.sol
│
├── migrations/
│ ├── 1_initial_migration.js
│ └── 2_deploy_contracts.js
│
├── Database_API/
│ ├── pycache/
│ ├── .env
│ ├── .gitignore
│ ├── main.py
│ └── requirements.txt
│
├── public/
│ ├── admin ss.png
│ ├── favicon.ico
│ ├── index ss.png
│ └── login ss.png
│
├── src/
│ ├── assets/
│ ├── css/
│ ├── dist/
│ ├── html/
│ ├── js/
│ ├── .babelrc
│ ├── .env
│ ├── index.js
│ ├── LICENSE
│ ├── package.json
│ └── package-lock.json
│
├── node_modules/
├── .gitignore
└── README.md


---

## ⚙️ Setup Guide

### 🧩 Prerequisites

Install the following:
- [Python 3.10+](https://www.python.org/downloads/)  
- [Node.js v18+](https://nodejs.org/en/)  
- [Truffle Suite](https://trufflesuite.com/truffle/) (`npm install -g truffle`)  
- [Ganache](https://trufflesuite.com/ganache/)  
- [MetaMask Extension](https://metamask.io/)  

---

### 🖥️ Backend (API) Setup – FastAPI

1. Navigate to the backend directory:  
   ```bash
   cd Database_API
2. pip install -r requirements.txt
3. uvicorn main:app --reload --host 127.0.0.1 --port 8000

### 🖥️ Frontend Setup

Navigate to the frontend source:

1.cd src
2.Install Node modules:
npm install
Build and run the frontend:
3.npm run build
4.npm start

✅ Frontend available at http://localhost:3000
