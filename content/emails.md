# Acting Office Email System -  Documentation

## Table of Contents
1. [Overview](#1-overview)
2. [Data Flow Diagram (DFD)](#2-data-flow-diagram-dfd)
3. [Process Flow](#3-process-flow)
4. [ER Diagram](#4-er-diagram)
5. [Entity Definition](#5-entity-definition)
6. [APIs](#6-apis)
7. [Testing Guide](#7-testing-guide)
8. [References](#8-references)

---

## 1. Overview

### 1.1 System Introduction

The Acting Office Email System is a multi-provider email management platform that integrates with both Microsoft Outlook and Google Gmail. The system comprises two primary modules with distinct backend services but similar frontend capabilities.

### 1.2 Architecture Components

#### Backend Services

| Service | Purpose | Responsibilities |
|---------|---------|------------------|
| **Acting Office APIs** | Authentication & Communication Backend | • User authentication and authorization<br>• Email provider linking/unlinking operations<br>• Communication (Scheduling) module backend<br>• Token management and storage<br>• Scheduled email delivery tracking<br>• Retry logic for failed deliveries |
| **Acting Office Email Service** | Real-time Email Operations Backend | • Real-time email operations (inbox, sent, drafts)<br>• Email retrieval and display<br>• Email sending and management<br>• Provider-specific API routing (Outlook/Gmail)<br>• Email filtering and categorization |

#### Frontend Modules

| Module                   | Route              | Backend Service             | Features                                                                                                                                                                                                                                                                               |
| ------------------------ | ------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Emails Module**        | `/admin/emails`    | Acting Office Email Service | • View inbox, sent items, drafts<br>• Send and receive emails<br>• Organize folders/labels<br>• Search and filter emails<br>• Immediate email operations                                                                                                                               |
| **Communication Module** | `admin/clients`    | Acting Office APIs          | • **Same features as Emails Module**<br>• View inbox, sent items, drafts<br>• Send and receive emails<br>• **Additional:** Schedule emails for future delivery<br>• **Additional:** Track scheduled email status<br>• **Additional:** Automatic retry on failures                      |
| **AI Features**          | `/admin/emails` | Acting Office AI Service    | • Translate emails (**any language → English**)<br>• Summarize email content<br>• Tone analysis (professional, neutral, urgent, etc.)<br>• Generate auto-complete suggestions while composing<br>• Generate contextual replies<br>• Generate automatic responses based on email intent |


### 1.3 Key Module Characteristics

**Emails Module:**
- Backend: Acting Office Email Service
- Purpose: Real-time email management
- Provider Support: Both Outlook and Gmail
- Features: Standard email operations (view, send, organize, search)

**Communication Module:**
- Backend: Acting Office APIs Service
- Purpose: Email management with scheduling capabilities
- Provider Support: Both Outlook and Gmail
- Features: **All features from Emails Module** + scheduling, tracking, and retry logic
- Unique Capability: Schedule emails for future delivery with automatic retry on failures

### 1.4 System Architecture Diagram

```mermaid
graph TB

    %% ───────── Frontend ─────────
    subgraph "Frontend Layer"
        A[User Login]
        B[Email Module]
        C[Communication Module]
    end

    %% ───────── Backend ─────────
    subgraph "Backend Services"
        D[Acting Office APIs]
        E[Email Orchestration Service]
        AS[Authentication Service]
    end

    %% ───────── AI Layer (Emails Only) ─────────
    subgraph "AI Features Layer"
        AI[AI Email Processing Service]
    end

    %% ───────── External Providers ─────────
    subgraph "External Email Providers"
        F[Microsoft Outlook Graph API]
        G[Google Gmail API]
    end

    %% Frontend auth success
    A edge1@-->|Auth Success| B
    A edge2@-->|Auth Success| C

    %% Module interactions
    B edge3@-->|Email Actions| E
    C edge4@-->|Email Operations Scheduling| D

    %% Authentication
    E edge5@-->|Validate Token| AS
    AS edge6@-->|Auth OK| E

    D edge7@-->|Validate Token| AS
    AS edge8@-->|Auth OK| D

    %% AI features flow (single clean path)
    E edge16@-->|AI Email Enhancements| AI
    AI edge17@-->|Processed AI Output| E

    %% Provider resolution
    E edge9@-->|Resolve Provider| D
    E edge10@-->|Outlook Flow| F
    E edge11@-->|Gmail Flow| G

    %% API operations
    D edge12@-->|Account Link| F
    D edge13@-->|Account Link| G
    D edge14@-->|Email Ops| F
    D edge15@-->|Email Ops| G

    %% Animations
    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge3@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge6@{ animate: fast }
    edge7@{ animate: fast }
    edge8@{ animate: fast }
    edge9@{ animate: fast }
    edge10@{ animate: fast }
    edge11@{ animate: fast }
    edge12@{ animate: fast }
    edge13@{ animate: fast }
    edge14@{ animate: fast }
    edge15@{ animate: fast }
    edge16@{ animate: fast }
    edge17@{ animate: fast }



```

---

## 2. Data Flow Diagram (DFD)



### 2.1 Level 1 - Email Module Data Flow

```mermaid
graph LR

    %% External / UI
    FE[Frontend Email Section]

    %% Core Services
    ES[Acting Office Email Service]
    AS[Authentication Service]

    %% AI Layer
    AI[AI Email Processing Service]

    %% Decision
    C{Check Provider}

    %% Providers
    MS[Microsoft Graph API]
    GM[Gmail API]

    %% Result
    R[Return Email Data]

    %% Flow
    FE edge1@--> ES

    %% Auth flow
    ES edge2@--> AS
    AS edge3@--> ES

    %% AI processing
    ES edge11@--> AI
    AI edge12@--> ES

    %% Provider decision
    ES edge4@--> C
    C edge5@-->|Outlook| MS
    C edge6@-->|Gmail| GM

    MS edge7@--> R
    GM edge8@--> R

    R edge9@--> ES
    ES edge10@--> FE

    %% Animations
    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge3@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge6@{ animate: fast }
    edge7@{ animate: fast }
    edge8@{ animate: fast }
    edge9@{ animate: fast }
    edge10@{ animate: fast }
    edge11@{ animate: fast }
    edge12@{ animate: fast }


```

### 2.2 Level 1 - Communication Module Data Flow

```mermaid
graph TD
    %% Actors
    U[User]
    FE[Frontend Communication]

    %% Core Services
    API[Acting Office APIs]
    AS[Authentication Service]

    %% Infrastructure
    DB[(Database)]
    Q[Email Queue]
    S[Scheduler]

    %% Providers
    P{Provider Check}
    O[Outlook API]
    G[Gmail API]

    %% Notification
    NS[Notification Service]

    %% User flow
    U edge1@--> FE
    FE edge2@--> API

    %% 🔐 Authentication (same pattern)
    API edge3@--> AS
    AS edge4@--> API

    %% Data access
    API edge5@--> DB
    DB edge6@--> API

    %% Queue processing
    API edge7@--> Q
    Q edge8@--> S

    %% Provider selection
    S edge9@--> P
    P edge10@-->|Outlook| O
    P edge11@-->|Gmail| G

    %% Provider responses
    O edge12@-->|Success| API
    G edge13@-->|Success| API

    O edge14@-->|Failure| NS
    G edge15@-->|Failure| NS

    %% Notification + response
    NS edge16@--> U
    API edge17@--> FE
    FE edge18@--> U

    %% Animations
    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge3@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge6@{ animate: fast }
    edge7@{ animate: fast }
    edge8@{ animate: fast }
    edge9@{ animate: fast }
    edge10@{ animate: fast }
    edge11@{ animate: fast }
    edge12@{ animate: fast }
    edge13@{ animate: fast }
    edge14@{ animate: fast }
    edge15@{ animate: fast }
    edge16@{ animate: fast }
    edge17@{ animate: fast }
    edge18@{ animate: fast }
```

### 2.3 Provider Initialization Data Flow

```mermaid
flowchart TD
    A[Admin Initialize User] edge1@--> B[Initialize Create User]
    B edge2@--> C[Initialize Practice Id]
    C edge3@--> D[Set Email Provider]
    D edge4@--> E[Store User Configuration]
    E edge5@--> F[User Account Created]
    F edge6@--> G[Email Provider Configured Not Linked]

    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge3@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge6@{ animate: fast }

```

---

## 3. Process Flow

### 3.1 User Login and Routing

```mermaid
flowchart TD
    A[User Login] edge1@--> B{Check Login Response}
    B edge2@--> C{Email Provider Is Google}
    
    C edge3@-->|Yes Google| D[Navigate Admin Emails Google]
    C edge4@-->|No Outlook| E[Navigate Admin Emails Outlook]
    
    E edge5@--> F{Check Link Status}
    F edge6@-->|Unlinked| G[Show Link Button]
    F edge7@-->|Linked| H[Show Unlink Button]
    
    D edge8@--> F

    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge3@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge6@{ animate: fast }
    edge7@{ animate: fast }
    edge8@{ animate: fast }

```

**Login Routing Logic:**
- If provider is Google (0): Navigate to `/admin/emails/google`
- If provider is Outlook: Navigate to `/admin/emails`
- Display Link button if account is unlinked
- Display Unlink button if account is linked

### 3.2 Microsoft Outlook Link Process

```mermaid
graph TD

A[User Clicks Outlook Link] --> B[Frontend Request Link]
B --> C[API Start Microsoft Link]
C --> D[Azure AD Auth Challenge]
D --> E[User Microsoft Login]
E --> F[Azure Callback to API]
F --> G[Fetch User Tokens]
G --> H[Save New Subscription]
H --> I[Create Inbox Subscription]
I --> J[Create Sent Subscription]
J --> K[Update User Tokens]
K --> L[Requeue Failed Emails]
L --> M[Redirect User Success]

%% Animate ALL links
linkStyle default stroke-width:2px,animation:dash 0.8s linear infinite;

```

**Process Steps:**
1. User initiates link from profile settings
2. System redirects to Azure AD authentication
3. User authorizes application permissions
4. System receives authorization callback
5. Creates email subscriptions (Inbox and Sent folders)
6. Re-queues failed emails from past 15 days
7. Redirects to profile with success message

### 3.3 Microsoft Outlook Unlink Process

```mermaid
graph LR

    subgraph Client
        U[User]
    end

    subgraph Backend
        API[Acting Office APIs]
    end

    subgraph Storage
        DB[(Database)]
    end

    subgraph Microsoft
        G[Microsoft Graph]
    end

    U edge1@--> |POST Microsoft Unlink| API

    API edge2@--> |GetAsync userId Outlook| DB
    DB edge3@--> |User Access Tokens| API

    API edge4@--> |Get Authenticated Client| G

    API edge5@--> |Get All Subscriptions| DB
    DB edge6@--> |Subscription List| API
    API edge7@--> |Delete Subscription by Id| G

    API edge8@--> |Delete All Subscriptions| DB
    API edge9@--> |Revoke SignIn Sessions| G
    API edge10@--> |Delete User Access Tokens| DB
    API edge11@--> |Set Email Status Not Connected| DB

    API edge12@--> |Unlink Successful| U

    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge3@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge6@{ animate: fast }
    edge7@{ animate: fast }
    edge8@{ animate: fast }
    edge9@{ animate: fast }
    edge10@{ animate: fast }
    edge11@{ animate: fast }
    edge12@{ animate: fast }

```

**Process Steps:**
1. User initiates unlink from profile
2. System retrieves user access tokens
3. Deletes all Microsoft subscriptions
4. Revokes user sign-in sessions
5. Removes authentication tokens from database
6. Updates user email status to "Not Connected"
7. Sends reconnection notification email

### 3.4 Communication Module - Scheduled Email Workflow

```mermaid
graph TD
    U[User] edge1@--> FE[Frontend]
    FE edge2@--> API[Acting Office APIs]

    %% DECISION
    API --> D{data.isSchedule?}

    %% SCHEDULE FLOW (clean)
    D -- Yes --> Q[Email Queue]
    S[Scheduler] edge5@--> Q
    S edge7@--> P[Email Provider]

    %% IMMEDIATE SEND FLOW
    D -- No --> P

    %% SUCCESS FLOW
    P edge8@-->|Success| API
    API edge9@--> U

    %% FAILURE FLOW
    P edge10@-->|Failure| NS[Notification Service]
    NS edge11@--> U
    S edge12@--> Q

    %% FRONTEND CALLBACK
    API edge4@--> FE

    %% ANIMATIONS
    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge7@{ animate: fast }
    edge8@{ animate: fast }
    edge9@{ animate: fast }
    edge10@{ animate: fast }
    edge11@{ animate: fast }
    edge12@{ animate: fast }

```

**Workflow Steps:**
1. User creates an email in the **Communication module** and submits it from the Frontend.
2. Frontend sends the request to **Acting Office APIs** with `data.isSchedule` flag.
3. Acting Office APIs evaluate the request:

   * If `data.isSchedule = true`, the email is **added to the Email Queue** with the scheduled time.
   * If `data.isSchedule = false`, the email is **sent immediately to the Email Provider**.
4. **Scheduler continuously monitors the Email Queue** for pending scheduled emails.
5. When the scheduled time is reached, the Scheduler **picks the email from the queue** and sends it to the Email Provider.
6. On successful delivery, the Email Provider returns a success response and the email is **removed from the Email Queue**, and the user is updated accordingly.
7. On failure, the Email Provider returns an error, a **notification is sent to the user**, and the email is **re-queued for automatic retry** based on the retry policy.

### 3.5 Communication Flow States

```mermaid
stateDiagram-v2
    [*] --> Created: User creates scheduled email
    Created --> Queued: Email added to queue
    Queued --> Processing: Scheduler picks up email
    Processing --> Sent: Send successful
    Processing --> Failed: Send failed
    Failed --> Retry: Automatic retry
    Retry --> Processing: Retry attempt
    Retry --> PermanentFailure: Max retries exceeded
    Sent --> [*]: Email delivered & deleted from queue
    PermanentFailure --> [*]: User notified
```

### 3.6 Token Refresh & Error Handling

```mermaid
flowchart TD

    %% ───────────── Phase 1 : Request Entry ─────────────
    subgraph Phase1["Request Validation"]
        A[API Request] edge1@--> B{Token Valid}
    end

    %% ───────────── Phase 2 : Token Handling ─────────────
    subgraph Phase2["Token Handling"]
        B edge2@-->|Yes| C[Execute Request]
        B edge3@-->|No| D{Refresh Available}

        D edge4@-->|Yes| E[Refresh Token]
        E edge5@--> F{Refresh Success}

        F edge6@-->|Yes| C
        F edge7@-->|No| G[Need Approval]

        D edge8@-->|No| G
    end

    %% ───────────── Phase 3 : User Action ─────────────
    subgraph Phase3["User Re-Link Flow"]
        G edge9@--> H[Send Notification]
        H edge10@--> I[User Re Link]
    end

    %% ───────────── Phase 4 : Execution Result ─────────────
    subgraph Phase4["Request Result"]
        C edge11@--> J{Request Success}
        J edge12@-->|Yes| K[Return Data]
        J edge13@-->|No| L{Error Type}

        L edge14@-->|Auth Error| G
        L edge15@-->|Other Error| M[Return Error]
    end

    %% ───────────── Animations ─────────────
    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge3@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge6@{ animate: fast }
    edge7@{ animate: fast }
    edge8@{ animate: fast }
    edge9@{ animate: fast }
    edge10@{ animate: fast }
    edge11@{ animate: fast }
    edge12@{ animate: fast }
    edge13@{ animate: fast }
    edge14@{ animate: fast }
    edge15@{ animate: fast }

```

**Token Management Strategy:**
- Automatic token validation before each request
- Proactive refresh before expiration (8-minute buffer for Google)
- User notification sent when re-authorization required
- Failed operations queued for retry after re-linking

### 3.7 Inbox Retrieval Process Flow

```mermaid
graph LR
    FE[Frontend Inbox] edge1@--> ES[Email Service or APIs]

    ES edge2@--> P{Email Provider}

    P edge3@-->|Outlook| MS[Microsoft Graph API]
    P edge4@-->|Gmail| GM[Gmail API]

    MS edge5@--> ES
    GM edge6@--> ES

    ES edge7@--> FE

    edge1@{ animate: fast }
    edge2@{ animate: fast }
    edge3@{ animate: fast }
    edge4@{ animate: fast }
    edge5@{ animate: fast }
    edge6@{ animate: fast }
    edge7@{ animate: fast }
```

**Note:** 
- **Email Module:** Routes through Acting Office Email Service
- **Communication Module:** Routes through Acting Office APIs (provides same features)

---

## 4. ER Diagram

### 4.1 Core Entity Relationships

```mermaid
erDiagram
    ApplicationPractices ||--o{ ApplicationUserAccessTokens : "has many"
    ApplicationUser ||--o{ ApplicationUserAccessTokens : "owns"

    ApplicationUserAccessTokens ||--|| UserGoogleAccessToken : "contains"
    ApplicationUserAccessTokens ||--|| UserMicrosoftAccessToken : "contains"
    ApplicationUserAccessTokens ||--o{ EmailQueueItem : "creates"

    ApplicationUserAccessTokens {
        string Id PK
        string UserId FK
        enum EmailProvider
        string EmailAddress
        DateTime LastTokenRefresh
        DateTime GoogleWatchUpdate
        ulong GmailHistoryId
    }

    UserGoogleAccessToken {
        string AccessToken
        string TokenType
        long ExpiresInSeconds
        string RefreshToken
        string Scope
        string IdToken
        DateTime IssuedUtc
        enum Status
        string LastError
    }

    UserMicrosoftAccessToken {
        string TenantId
        string ObjectId
        string Environment
        string TokenCache
        string SubscriptionIdInbox
        string SubscriptionIdSent
        DateTime SubscriptionUpdateInbox
        DateTime SubscriptionUpdateSent
        enum Status
        string LastError
    }

    ApplicationPractices {
        int Id PK
        string Name
        string Email
        string AppUrl
        bool EnableCacheFirst
        int CacheExpirationTime
    }

    EmailQueueItem {
        string Id PK
        string UserId FK
        string Provider
        DateTime ScheduledTime
        string Status
        int RetryCount
    }

```

---

## 5. Entity Definition

### 5.1 ApplicationUserAccessTokens

Stores authentication tokens and provider-specific credentials for users.

**Collection Name:** `UserAccessTokens`

| Field | Type | Description |
|-------|------|-------------|
| `Id` | string | Primary Key |
| `User` | IdNameModel | User reference (Id, Name) |
| `EmailProvider` | enum | Provider type (Outlook=1, Gmail=0) |
| `Google` | UserGoogleAccessToken | Google token object |
| `Microsoft` | UserMicrosoftAccessToken | Microsoft token object |
| `LastTokenRefresh` | DateTime | Last token refresh timestamp |
| `EmailAddress` | string | User's email address |
| `GoogleWatchUpdate` | DateTime | Google watch notification update |
| `GmailHistoryId` | ulong | Gmail history tracking ID |
| `Meta` | Dictionary | Additional metadata |
| `PracticeId` | int | Practice reference |

**Purpose:** Central storage for OAuth tokens and provider-specific authentication data.

### 5.2 UserMicrosoftAccessToken

Stores Microsoft-specific authentication and subscription data.

| Field | Type | Description |
|-------|------|-------------|
| `TenantId` | string | Azure AD tenant identifier |
| `ObjectId` | string | Unique account ID |
| `Environment` | string | Identity provider (e.g., login.microsoftonline.com) |
| `TokenCache` | string | Serialized token cache |
| `SubscriptionIdInbox` | string | Inbox notification subscription ID |
| `SubscriptionIdSent` | string | Sent items notification subscription ID |
| `SubscriptionUpdateInbox` | DateTime | Inbox subscription last update |
| `SubscriptionUpdateSent` | DateTime | Sent subscription last update |
| `Status` | UserAccessTokenStatus | Token status (Active, Deleted, NeedApproval) |
| `LastError` | string | Last error message |

**Purpose:** Manages Microsoft Graph API authentication and webhook subscriptions.
---

### 5.3 UserGoogleAccessToken

Stores Google-specific authentication and authorization data used for Gmail integration.

| Field              | Type                  | Description                                               |
| ------------------ | --------------------- | --------------------------------------------------------- |
| `AccessToken`      | string                | OAuth 2.0 access token issued by Google                   |
| `TokenType`        | string                | Token type (e.g., `Bearer`)                               |
| `ExpiresInSeconds` | long                  | Lifetime of the access token in seconds                   |
| `RefreshToken`     | string                | OAuth 2.0 refresh token used to obtain new access tokens  |
| `Scope`            | string                | OAuth scopes granted to the application                   |
| `IdToken`          | string                | JWT ID token issued by Google                             |
| `IssuedUtc`        | DateTime              | UTC timestamp when the token was issued                   |
| `Status`           | UserAccessTokenStatus | Current state of the token (Active, Expired, Error)       |
| `LastError`        | string                | Last error encountered during token refresh or API access |

**Purpose:**
Manages Gmail API authentication using OAuth 2.0. This entity stores all Google-specific token metadata required to securely access Gmail APIs, handle token refresh cycles, and track authentication failures in alignment with the system’s email provider abstraction.

---
### 5.4 ApplicationPractices

Stores practice-level configuration.

**Collection Name:** `ApplicationPractices`

| Field | Type | Description |
|-------|------|-------------|
| `Id` | int | Primary Key |
| `PracticeId` | int | Practice identifier |
| `Name` | string | Practice name |
| `Email` | string | Practice email address |
| `EnableCacheFirst` | bool | Enable cache priority |
| `CacheExpirationTime` | int | Cache expiration (seconds) |

**Purpose:** Organization/tenant configuration and settings.

### 5.5 EmailQueueItem

Stores scheduled emails for the Communication module.

**Collection Name:** `EmailQueueItems`

| Field | Type | Description |
|-------|------|-------------|
| `Id` | string | Primary Key |
| `UserId` | string | User who scheduled email |
| `PracticeId` | int | Practice reference |
| `Provider` | ApplicationEmailServiceProviders | Email provider |
| `ScheduledTime` | DateTime | Scheduled delivery time |
| `Recipients` | List<string> | Email recipients |
| `Subject` | string | Email subject |
| `Body` | string | Email body content |
| `Status` | string | Queue status (Queued, Processing, Sent, Failed) |
| `RetryCount` | int | Number of retry attempts |
| `ErrorType` | EmailQueueItemErrorTypes | Error classification |
| `CreatedBy` | AuditInfo | Creation audit info |

**Purpose:** Queue management for scheduled email delivery in Communication module.

### 5.6 EmailQueueItemError

Tracks failed email delivery attempts.

**Collection Name:** `EmailQueueItemErrors`

| Field | Type | Description |
|-------|------|-------------|
| `Id` | string | Primary Key |
| `UserId` | string | User reference |
| `PracticeId` | int | Practice reference |
| `Provider` | ApplicationEmailServiceProviders | Email provider |
| `ErrorType` | EmailQueueItemErrorTypes | Error type (Reauthorize, etc.) |
| `Date` | DateTime | Error occurrence date |
| `ErrorMessage` | string | Error details |
| `CreatedBy` | AuditInfo | Creation audit info |

**Purpose:** Track failed emails for retry after account re-linking (15-day retention).

### 5.7 Enumerations

#### ApplicationEmailServiceProviders
- `Gmail = 0`
- `Outlook = 1`

#### UserAccessTokenStatus
- `Active` - Token valid and operational
- `Deleted` - Token revoked or removed
- `NeedApproval` - User action required

#### EmailQueueItemErrorTypes
- `Reauthorize` - Authentication required
- `InvalidRecipient` - Invalid email address
- `QuotaExceeded` - Provider quota limit reached
- `NetworkError` - Network connectivity issue
- `Unknown` - Unclassified error

#### ApplicationUserEmailStatus
- `NotConnected` - No provider linked
- `Connected` - Provider successfully linked
- `NeedApproval` - Re-authorization required

---



## 6. APIs

### 6.1 API Overview

The Acting Office Email System provides RESTful APIs organized into two main categories:

**Authentication APIs (Acting Office APIs Service):**
- Microsoft/Google account linking
- Account unlinking
- Token management
- Status updates

**Email Operation APIs:**
- Inbox retrieval (Email Service for Email Module)
- Email operations with scheduling (APIs Service for Communication Module)
- Email sending and management
- Search and filtering

### 6.2 Microsoft Outlook API Endpoints

**Authentication Endpoints:**

| Endpoint                                                                                                                  | Method | Purpose                                           |
| ------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------- |
| [`/Addons/Microsoft/Link`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+Addons)   | GET    | Initiates OAuth flow to link Outlook account      |
| [`/Addons/Microsoft/Unlink`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+Addons) | POST   | Unlinks Outlook account and removes subscriptions |

**Key Features:**
- Anonymous access for Link and Callback (OAuth flow)
- Role-based authorization for Unlink (ADMIN, MANAGER, STAFF)
- Automatic subscription management
- Failed email re-queuing on successful link

### 7.3 Google Gmail API Endpoints

**Authentication Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| [`/Addons/Google/Link`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+Addons) | GET | Initiates OAuth 2.0 flow to link Gmail account |
| [`/Addons/Google/Unlink`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+Addons) | POST | Unlinks Gmail account and stops watch |

**Key Features:**
- OAuth 2.0 authorization flow
- Push notification watch management
- Token refresh handling
- Account status synchronization

### 6.4 Email Service API Endpoints

**Email Module (Acting Office Email Service):**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| [`/Emails/Inbox`](https://emails.servicesuat.actingoffice.com/swagger/index.html) | GET | Retrieve inbox emails with filtering |
| [`/Emails/Send`](https://emails.servicesuat.actingoffice.com/swagger/index.html) | POST | Send email immediately |
| [`/Emails/Draft`](https://emails.servicesuat.actingoffice.com/swagger/index.html) | POST | Save email as draft |
| [`/Emails/Delete`](https://emails.servicesuat.actingoffice.com/swagger/index.html) | DELETE | Delete email |
| [`/Emails/Move`](https://emails.servicesuat.actingoffice.com/swagger/index.html) | POST | Move email to folder |
| [`/Emails/Search`](https://emails.servicesuat.actingoffice.com/swagger/index.html) | GET | Search emails |

**Communication Module (Acting Office APIs):**

| **Endpoint**            | **HTTP Method** | **Purpose**                                     |
| ----------------------- | --------------- | ----------------------------------------------- |
| [`/SendEmail`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)            | POST            | Send an email immediately                       |
| [`/CannedMessages`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)       | GET             | Retrieve predefined (canned) email messages     |
| [`/SaveDraft`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)            | POST            | Create a new email draft                        |
| [`/SaveDraft/{id}`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)       | POST            | Update an existing email draft                  |
| [`/GetDraftMails`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)        | GET             | Fetch all saved draft emails                    |
| [`/DraftFileDownload`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)    | GET             | Download attachment from a draft email          |
| [`/GetScheduleMails`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)     | GET             | Retrieve all scheduled emails                   |
| [`/SaveSchedule`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)         | POST            | Create a new email schedule                     |
| [`/SaveSchedule/{id}`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)    | POST            | Update an existing scheduled email              |
| [`/UpdateSchedule/{id}`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)  | POST            | Modify schedule details (status/content/timing) |
| [`/schedule/{id}`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)        | GET             | Fetch scheduled email details by ID             |
| [`/SendSchedule/{id}`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM)    | POST            | Trigger sending of a scheduled email            |
| [`/ScheduleFileDownload`](https://apiuat.actingoffice.com/api-docs/index.html?urls.primaryName=Acting+Office+-+CRM) | GET             | Download attachment from a scheduled email      |



**AI Features (Acting Office AI Services – ConvoMail)**
| **Endpoint**                                                                                                                               | **HTTP Method** | **Purpose**                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------- |
| [`/translate`](https://ai.servicesuat.actingoffice.com/swagger/?urls.primaryName=Acting+Office+-+Convomail#/default/suggest_suggest_post)  | POST            | Translate email content from any language to the target language (default Hindi) |
| [`/summarize`](https://ai.servicesuat.actingoffice.com/swagger/?urls.primaryName=Acting+Office+-+Convomail#/default/suggest_suggest_post)  | POST            | Generate a concise or detailed summary of email content                          |
| [`/tone`](https://ai.servicesuat.actingoffice.com/swagger/?urls.primaryName=Acting+Office+-+Convomail#/default/suggest_suggest_post)       | POST            | Analyze the tone of an email (professional, neutral, urgent, etc.)               |
| [`/draftMail`](https://ai.servicesuat.actingoffice.com/swagger/?urls.primaryName=Acting+Office+-+Convomail#/default/suggest_suggest_post)  | POST            | Generate an automatic email response based on the provided content               |
| [`/replies`](https://ai.servicesuat.actingoffice.com/swagger/?urls.primaryName=Acting+Office+-+Convomail#/default/suggest_suggest_post)    | POST            | Generate contextual reply suggestions for an email                               |
| [`/completion`](https://ai.servicesuat.actingoffice.com/swagger/?urls.primaryName=Acting+Office+-+Convomail#/default/suggest_suggest_post) | POST            | Provide auto-complete suggestions while composing an email                       |



### 6.5 Common API Features

**Authentication:**
- JWT Bearer token authentication
- Role-based access control
- User context validation

**Filtering and Pagination:**
- Start/length pagination
- View type filters (unread, read, all)
- Importance/starred filters
- Attachment filters
- Date range filters
- Category filters
- Sort options

**Provider Routing:**
- Automatic provider detection from user tokens
- Dynamic routing to Outlook or Gmail APIs
- Unified response format regardless of provider

**Error Handling:**
- Standardized error response structure
- HTTP status codes
- Detailed error messages
- Error type classification

### 6.6 Provider Comparison

| Feature | Microsoft Outlook | Google Gmail |
|---------|------------------|--------------|
| **Provider Value** | 1 | 0 |
| **Auth Method** | Azure AD OpenID Connect | OAuth 2.0 |
| **API** | Microsoft Graph API | Gmail API |
| **Real-time Notifications** | Webhook subscriptions | Push notifications |
| **Token Expiration** | Standard OAuth | 8-minute buffer |
| **Supported Features** | All email operations + scheduling | All email operations + scheduling |

### 6.7 Response Format

All APIs return responses in a standardized format:

**Success Response:**
- `result`: Response data (type varies by endpoint)
- `isSuccess`: true
- `errors`: Empty array

**Error Response:**
- `result`: null or partial data
- `isSuccess`: false
- `errors`: Array of error objects with code and message

---

## 7. Testing Guide

### 7.1 Testing Strategy

**Test Levels:**
1. Unit Testing - Individual components and functions
2. Integration Testing - API endpoints and database operations
3. End-to-End Testing - Complete user workflows
4. Performance Testing - Load and stress testing
5. Security Testing - Authentication and authorization

### 7.2 Key Test Scenarios

#### Authentication Testing

**Scenario 1: Link Microsoft Outlook Account**
- Objective: Verify successful account linking
- Steps: Login → Navigate to profile → Click Link button → Authorize → Verify success
- Expected: Token stored, status "Connected", subscriptions created

**Scenario 2: Unlink Microsoft Outlook Account**
- Objective: Verify successful account unlinking
- Steps: Click Unlink → Confirm → Verify status update
- Expected: Subscriptions deleted, tokens removed, notification sent

**Scenario 3: Link Google Gmail Account**
- Objective: Verify Gmail account linking
- Steps: Similar to Outlook with Google OAuth flow
- Expected: Token stored, watch created, status updated

#### Email Module Testing

**Scenario 4: View Inbox**
- Objective: Verify inbox retrieval for both providers
- Steps: Navigate to emails → View inbox → Apply filters
- Expected: Emails displayed, filters work, pagination functional

**Scenario 5: Send Email**
- Objective: Verify immediate email sending
- Steps: Compose email → Add recipients → Send
- Expected: Email sent successfully, appears in sent folder

**Scenario 6: Search and Filter**
- Objective: Verify search and filter functionality
- Steps: Apply various filters and search terms
- Expected: Relevant results returned, filters applied correctly

#### Communication Module Testing

**Scenario 7: Schedule Email**
- Objective: Verify email scheduling functionality
- Steps: Navigate to communication → Schedule email → Set future time
- Expected: Email queued, appears in scheduled list

**Scenario 8: Scheduled Email Delivery**
- Objective: Verify scheduled email sent at correct time
- Steps: Wait for scheduled time → Verify delivery
- Expected: Email sent at scheduled time, removed from queue

**Scenario 9: Failed Email Retry**
- Objective: Verify automatic retry logic
- Steps: Unlink account → Schedule email → Re-link → Verify retry
- Expected: Failed email re-queued and sent after re-link

#### Token Management Testing

**Scenario 10: Token Refresh**
- Objective: Verify automatic token refresh
- Steps: Use expired/near-expired token → Make API request
- Expected: Token automatically refreshed, request succeeds

**Scenario 11: Token Expiration Handling**
- Objective: Verify handling of expired tokens
- Steps: Use expired token → Verify notification sent
- Expected: User notified to re-link account

### 7.3 Performance Testing

**Load Test Scenarios:**

1. **Concurrent Inbox Requests**
   - 100 concurrent users requesting inbox
   - Target response time: < 2 seconds
   - Success rate: > 99%

2. **Bulk Email Scheduling**
   - Schedule 1000 emails across multiple users
   - Verify queue processing efficiency
   - Monitor system resource usage

3. **Token Refresh Under Load**
   - Multiple users with near-expired tokens
   - Simultaneous requests triggering refresh
   - Verify all refreshes succeed

### 7.4 Security Testing

**Test Cases:**

1. **Unauthorized Access Prevention**
   - Attempt access without authentication
   - Expected: 401 Unauthorized

2. **Cross-User Access Prevention**
   - User A tries to access User B's emails
   - Expected: 403 Forbidden

3. **Token Validation**
   - Use invalid or expired tokens
   - Expected: Proper error handling

4. **Input Validation**
   - Test with malicious inputs
   - Expected: Input sanitized, no vulnerabilities

### 7.5 Testing Tools

**Recommended Tools:**
- Postman/Insomnia - API testing
- JMeter/k6 - Load testing
- Selenium - End-to-end testing
- xUnit/NUnit - Unit testing (.NET)
- MongoDB Compass - Database verification

### 7.6 Test Data Management

**Test Accounts:**
- Create dedicated test accounts for Outlook and Gmail
- Use sandbox/test environments when available
- Maintain separate test practice IDs
- Clean up test data after testing

**Database Verification:**
- Monitor token storage and updates
- Verify queue item creation and deletion
- Check subscription/watch status
- Validate audit trails

---

## 8. References

### 8.1 External Documentation

**Microsoft Resources:**
- Microsoft Graph API Documentation
- Azure AD Authentication Documentation
- Outlook Mail API Reference
- Microsoft Identity Platform

**Google Resources:**
- Gmail API Documentation
- Google OAuth 2.0 Documentation
- Gmail Push Notifications Guide
- Google Cloud Platform Console

### 8.2 Technology Stack

| Technology | Purpose |
|------------|---------|
| .NET 8.0 | Backend framework |
| MongoDB | Database storage |
| Redis | Distributed caching |
| Microsoft.Identity.Web | Azure AD authentication |
| Google.Apis.Gmail.v1 | Gmail API client |
| Microsoft.Graph | Graph API client |

### 8.3 Database Collections

| Collection | Purpose |
|------------|---------|
| `ApplicationPractices` | Practice/tenant configuration |
| `UserAccessTokens` | Authentication tokens |
| `ApplicationUserOutlookSubscription` | Outlook webhook subscriptions |
| `EmailQueueItems` | Scheduled emails queue |
| `EmailQueueItemErrors` | Failed email tracking |

### 8.4 Common Workflows Summary

| Workflow | Services Involved | User Impact |
|----------|------------------|-------------|
| User Login & Routing | Acting Office APIs | Automatic redirect based on provider |
| Link Email Account | Acting Office APIs → Provider OAuth | Enable email features |
| Unlink Email Account | Acting Office APIs → Provider API | Disable email features |
| View Inbox (Email Module) | Email Service → Provider API | Real-time email access |
| View Inbox (Communication Module) | Acting Office APIs → Provider API | Email access with scheduling |
| Send Email Immediately | Email Service or APIs → Provider API | Instant delivery |
| Schedule Email | Acting Office APIs → Queue → Provider API | Future delivery with retry |
| Token Refresh | Automatic (Background Service) | Seamless operation |
| Failed Email Recovery | Acting Office APIs (on re-link) | Automatic retry |

### 8.5 System Characteristics

**Scalability:**
- Practice-level data isolation
- Distributed caching for performance
- Queue-based scheduling architecture
- Horizontal scaling capability

**Reliability:**
- Automatic token refresh
- Failed email retry mechanism
- 15-day error retention
- Comprehensive error handling

**Security:**
- OAuth 2.0 / OpenID Connect
- Encrypted token storage
- Role-based access control
- Audit trail for operations

**Maintainability:**
- Modular architecture
- Clear separation of concerns
- Standardized API responses
- Comprehensive logging

---

*Document Version: 1.0*  
*Last Updated: December 2025*  
*Acting Office Email System - Technical Documentation*