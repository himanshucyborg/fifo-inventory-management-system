# FIFO Inventory Management System

A real-time inventory tracking system built with Node.js, Express, PostgreSQL (Sequelize ORM), Kafka (Redpanda), and React. It calculates inventory cost of goods sold using the FIFO (First-In, First-Out) method.

---

## How the FIFO Logic Works

In FIFO (First-In, First-Out), the oldest available stock is sold first.

**Quick Example:**
1. **Purchase 1:** 10 units @ ₹100 = ₹1,000
2. **Purchase 2:** 20 units @ ₹120 = ₹2,400
3. **Sale of 15 units:**
   - Takes 10 units from Purchase 1 (10 × ₹100 = ₹1,000) -> *Purchase 1 is now empty.*
   - Takes remaining 5 units from Purchase 2 (5 × ₹120 = ₹600) -> *Purchase 2 has 15 units left.*
   - **Total Sale Cost:** ₹1,000 + ₹600 = **₹1,600**

---

## How to Run the Producer Locally

### 1. Install Dependencies
```bash
npm install
cd backend && npm install
```

### 2. Configure Environment Variables
Make sure your `backend/.env` file has your database and Kafka details:
```env
PORT=5000
DATABASE_URL=postgres://postgres:password@localhost:5432/fifo_inventory
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=inventory-events
```

### 3. Start Backend & Kafka Consumer
```bash
# Run from root directory
npm run dev:backend
```

### 4. Run the Producer / Simulator Script
Open another terminal tab and execute:
```bash
# Run producer from root directory
npm run simulate

# Or directly inside the backend directory:
cd backend && node src/kafka/producer.js
```

---

## Staging & Application Links

- **Frontend Dashboard UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API Base URL:** [http://localhost:5000](http://localhost:5000)

