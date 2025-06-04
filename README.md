# Imperium - Modern Banking App
##  🌟 Overview
Imperium is a comprehensive financial management application built with Next.js 14 that allows users to securely connect their bank accounts via Plaid, view transaction history, and transfer funds between accounts. The app leverages Appwrite for backend services, Dwolla for payment processing, and Sentry for error monitoring.

Please sign up for your own account to try, miniumum authentication is needed for a smoother sandbox experience.
**Due to limitations from Plaid Sandbox accounts which expires after some time of inactivity, longer accounts that have no activity will be deactivated**

![image](https://github.com/user-attachments/assets/d90e18c4-dbad-4a8b-b7aa-29caa71219bf)


## ✨ Features
- Account Aggregation: Connect multiple bank accounts using Plaid's secure API
- Financial Dashboard: Get a holistic view of your finances across all connected accounts
- Transaction History: View and search detailed transaction records with filtering options
- Fund Transfers: Easily move money between connected accounts using Dwolla
- Secure Authentication: Powered by Appwrite's authentication system
- Real-time Error Monitoring: Integrated with Sentry for instant issue detection
- Responsive Design: Optimized experience across desktop and mobile devices


## 🛠️ Tech Stack
- Frontend: Next.js 14 (App Router), React, Tailwind CSS
- Backend & Database: Appwrite (Authentication, Database, Storage)
- Financial Integration: Plaid API, Dwolla API
- Error Monitoring: Sentry
- Deployment: Vercel

## 🚀 Installation
1. Clone the repository
```
git clone https://github.com/bryanleesantoso/imperium_app.git
cd imperium_app
```
2. Set up environment variables:
```
# Create a .env.local file with the following variables
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_appwrite_database_id
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=your_appwrite_collection_id

# Plaid
NEXT_PUBLIC_PLAID_CLIENT_ID=your_plaid_client_id
NEXT_PUBLIC_PLAID_SECRET=your_plaid_secret
NEXT_PUBLIC_PLAID_ENV=sandbox  # or development/production

# Dwolla
NEXT_PUBLIC_DWOLLA_KEY=your_dwolla_key
NEXT_PUBLIC_DWOLLA_SECRET=your_dwolla_secret
NEXT_PUBLIC_DWOLLA_ENVIRONMENT=sandbox  # or production

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_PROJECT=your_sentry_project
SENTRY_ORG=your_sentry_org

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```
3. Run the development server:
```
npm run dev
```
4. Open http://localhost:3000 in your browser

## 🔌 Third-Party Integrations
### 🔷 Appwrite
Appwrite serves as the backend for NexBank, handling user authentication, database storage, and file management. The app uses Appwrite's:

- Authentication API for user management
- Database API for storing transactions data
- Storage API for document uploads

### 💳 Plaid (SANDBOX)
This application uses Plaid's API for secure bank account connections. The integration flow includes:

1. Creating a link token
2. User authentication with their financial institution
3. Exchanging public token for access token
4. Fetching account and transaction data

### 💸 Dwolla
Dwolla powers the fund transfer functionality, enabling secure account-to-account transfers. The integration includes:

1. Creating and verifying customer accounts
2. Linking funding sources
3. Initiating transfers between accounts
4. Handling transfer webhooks and status updates

### 🚨 Sentry
Sentry provides real-time error tracking and monitoring to ensure app reliability:

1. Automatic capturing of frontend and API errors
2. Performance monitoring
3. User context for easier debugging
4. Custom error boundaries for graceful failure handling

### 🔮 Feature Improvements
1. UI tweaks for better user interface
2. Addition of new pages such as the investments page to project earnings based on potential investments
3. Integration of AI agents

### 🙏 Acknowledgements
1. Appwrite for backend services
2. Plaid for financial data integration
3. Dwolla for payment processing
4. Sentry for error monitoring
5. Next.js for the React framework
6. Adrian JSM for inspiration on project

**Note**: This application is built for demonstration purposes. For production use, ensure compliance with financial regulations and security best practices.
