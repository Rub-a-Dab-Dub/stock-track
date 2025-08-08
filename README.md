# Multi-Tenant Inventory Management System

A blockchain-powered inventory management platform built for industrial companies, enabling secure multi-tenant operations with role-based access control and supply chain transparency.

## 🏗️ Architecture

- **Backend**: NestJS with TypeScript
- **Frontend**: React with TypeScript
- **Blockchain**: Flare Network
- **Database**: PostgreSQL
- **Authentication**: JWT with role-based access control

## 🚀 Features

### Core Functionality
- Multi-tenant architecture supporting multiple companies
- Role-based access control (Super Admin, Admin, Manager, Supervisor, Employee)
- Real-time inventory tracking and management
- Supply chain traceability via blockchain
- Automated reordering and stock alerts
- Comprehensive reporting and analytics

### Blockchain Integration
- Immutable audit trails on Flare Network
- Smart contracts for automated workflows
- Anti-counterfeiting through digital fingerprints
- Cross-company transparency with privacy controls
- Integration with external data sources via Flare oracles

## 🛠️ Tech Stack

### Backend (NestJS)
```
├── Authentication & Authorization
├── Multi-tenant data isolation
├── RESTful APIs
├── WebSocket for real-time updates
├── Blockchain integration services
├── Background job processing
└── Comprehensive logging & monitoring
```

### Frontend (React)
```
├── Material-UI / Ant Design components
├── Redux Toolkit for state management
├── React Router for navigation
├── Web3 integration for blockchain
├── Real-time notifications
└── Responsive design
```

### Blockchain (Flare Network)
```
├── Smart contracts for inventory tracking
├── State Connector for external data
├── FTSO integration for price feeds
├── Multi-signature wallets for companies
└── Event-driven architecture
```

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Docker & Docker Compose (recommended)
- Flare Network wallet and testnet FLR tokens

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/inventory-management-system.git
cd inventory-management-system
```

### 2. Environment Setup
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update configuration values
nano backend/.env
nano frontend/.env
```

### 3. Database Setup
```bash
# Using Docker (recommended)
docker-compose up -d postgres

# Or install PostgreSQL locally
# Create database: inventory_management
```

### 4. Backend Setup
```bash
cd backend
npm install

# Run database migrations
npm run migration:run

# Seed initial data
npm run seed

# Start development server
npm run start:dev
```

### 5. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm start
```

### 6. Blockchain Setup
```bash
cd blockchain

# Install dependencies
npm install

# Deploy contracts to Flare testnet
npm run deploy:testnet

# Update contract addresses in backend/.env
```

## 📁 Project Structure

```
inventory-management-system/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication & JWT
│   │   ├── companies/      # Multi-tenant management
│   │   ├── users/          # User management & RBAC
│   │   ├── inventory/      # Core inventory logic
│   │   ├── blockchain/     # Flare Network integration
│   │   ├── reports/        # Analytics & reporting
│   │   └── common/         # Shared utilities
│   ├── migrations/         # Database migrations
│   └── seeds/              # Initial data
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls & blockchain
│   │   ├── store/          # Redux store
│   │   └── utils/          # Helper functions
├── blockchain/
│   ├── contracts/          # Solidity smart contracts
│   ├── scripts/            # Deployment scripts
│   └── test/               # Contract tests
└── docs/                   # Documentation
```

## 🔐 Authentication & Authorization

### User Roles & Permissions

| Role | Inventory | Users | Reports | Settings | Blockchain |
|------|-----------|-------|---------|----------|------------|
| Super Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Admin | ✅ Full | ✅ Manage | ✅ Full | ✅ Company | ✅ View |
| Manager | ✅ Edit | ✅ View | ✅ Department | ❌ | ✅ View |
| Supervisor | ✅ Edit | ❌ | ✅ Team | ❌ | ❌ |
| Employee | 👁️ View | ❌ | 👁️ Limited | ❌ | ❌ |

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@company.com",
  "company_id": "company_uuid",
  "roles": ["admin"],
  "permissions": ["inventory:read", "inventory:write"],
  "exp": 1234567890
}
```

## 🔗 Blockchain Integration

### Smart Contract Functions
```solidity
// Core inventory tracking
function addItem(string itemId, string metadata) external
function updateItem(string itemId, string metadata) external
function transferItem(string itemId, address to) external

// Supply chain tracking
function recordMovement(string itemId, string location, uint256 timestamp) external
function verifyAuthenticity(string itemId) external view returns (bool)

// Multi-company operations
function grantCompanyAccess(address company, string itemId) external
function revokeCompanyAccess(address company, string itemId) external
```

### Flare Network Features Used
- **State Connector**: Integration with external inventory systems
- **FTSO**: Real-time pricing for inventory valuation  
- **EVM Compatibility**: Standard Web3 tooling and libraries
- **Low Gas Costs**: Cost-effective for high-frequency updates

## 🗄️ Database Schema

### Key Tables
```sql
companies          # Multi-tenant company data
users             # User accounts with company association  
roles             # Role definitions and permissions
inventory_items   # Core inventory data
movements         # Item movement history
blockchain_events # Blockchain transaction records
audit_logs        # System audit trail
```

## 🔧 Configuration

### Backend Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/inventory_management

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=24h

# Blockchain
FLARE_RPC_URL=https://flare-api.flare.network/ext/C/rpc
PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=0x...

# External Services
REDIS_URL=redis://localhost:6379
EMAIL_SERVICE_API_KEY=your-email-api-key
```

### Frontend Environment Variables
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_BLOCKCHAIN_NETWORK=flare-testnet
REACT_APP_CONTRACT_ADDRESS=0x...
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm run test

# Integration tests  
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend

# Component tests
npm test

# E2E tests with Cypress
npm run cypress:open
```

### Smart Contract Tests
```bash
cd blockchain

# Contract unit tests
npm test

# Gas usage analysis
npm run gas-report
```

## 🚀 Deployment

### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

### Manual Deployment
1. **Database**: Set up PostgreSQL instance
2. **Backend**: Deploy NestJS app to cloud provider
3. **Frontend**: Build React app and deploy to CDN
4. **Blockchain**: Deploy contracts to Flare mainnet

## 📊 Monitoring & Observability

- **Logging**: Structured logging with Winston
- **Metrics**: Prometheus metrics collection
- **Tracing**: Distributed tracing with Jaeger
- **Alerts**: PagerDuty integration for critical issues
- **Blockchain Monitoring**: Contract event monitoring and alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Full documentation](docs/)
- **API Reference**: [OpenAPI/Swagger UI](http://localhost:3001/api-docs)
- **Issues**: [GitHub Issues](https://github.com/your-org/inventory-management-system/issues)
- **Discord**: [Community Chat](https://discord.gg/your-community)

## 🗺️ Roadmap

### Phase 1 - MVP (Current)
- [x] Multi-tenant architecture
- [x] Basic inventory management
- [x] Flare Network integration
- [x] Role-based access control

### Phase 2 - Advanced Features
- [ ] IoT sensor integration
- [ ] Advanced analytics & ML predictions
- [ ] Mobile applications
- [ ] Integration marketplace

### Phase 3 - Enterprise
- [ ] Advanced compliance features
- [ ] Multi-region deployment
- [ ] Advanced blockchain features
- [ ] Enterprise SSO integration

---

**Built with ❤️ for modern supply chain management**
