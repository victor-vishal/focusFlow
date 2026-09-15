# FocusFlow Platform — Entire Project Architecture

This diagram illustrates the macro-architecture of the entire **FocusFlow repository**, showing how the main application and its sub-projects (GradeSync and AWS Learn) fit together into a unified platform.

```mermaid
flowchart TD
    %% Styling
    classDef user fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef client fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:white;
    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:white;
    classDef learn fill:#10b981,stroke:#047857,stroke-width:2px,color:white;
    
    USER(("👤 User / Teacher")):::user

    subgraph PLATFORM ["FocusFlow Platform (Repository Root)"]
        direction TB

        %% 1. FocusFlow Core
        subgraph CORE ["1. FocusFlow Core (Productivity PWA)"]
            UI_CORE["📱 Main Dashboard<br/>(index.html)"]:::client
            LOCAL_STORAGE[("💾 localStorage<br/>(Tasks, Settings, Stats)")]:::client
            AUDIO(("🔊 Web Audio API<br/>(Ambient Sounds)")):::client
            
            UI_CORE <--> LOCAL_STORAGE
            UI_CORE --> AUDIO
        end

        %% 2. GradeSync
        subgraph GRADESYNC ["2. GradeSync (aws-upload/)"]
            UI_GS["🎓 Teacher Portal<br/>(aws-upload/index.html)"]:::client
            
            subgraph AWS_BACKEND ["☁️ Serverless AWS Backend"]
                API{"API Gateway"}:::aws
                LAMBDAS["λ Lambda Functions<br/>(presign, process, list)"]:::aws
                DYNAMO[("🗄️ DynamoDB<br/>(Student Records)")]:::aws
                S3["🪣 Amazon S3<br/>(File Storage)"]:::aws
                SNS["📬 Amazon SNS<br/>(Email Notifications)"]:::aws
            end
            
            UI_GS <-->|"HTTP Requests"| API
            UI_GS -.->|"Direct File Upload"| S3
            
            API <--> LAMBDAS
            LAMBDAS <--> DYNAMO
            LAMBDAS -.-> S3
            LAMBDAS -.-> SNS
        end

        %% 3. AWS Learn
        subgraph AWS_LEARN ["3. AWS Learn (aws-learn/)"]
            UI_LEARN["📚 Reference Library<br/>(aws-learn/index.html)"]:::learn
            GUIDES[("Interactive Guides & Quizzes")]:::learn
            
            UI_LEARN --> GUIDES
        end
    end

    %% User Interaction
    USER --> UI_CORE
    USER --> UI_GS
    USER --> UI_LEARN

    %% Cross-Linking (Navigation)
    UI_CORE -. "Navigates to" .-> UI_GS
    UI_CORE -. "Navigates to" .-> UI_LEARN
    UI_GS -. "Back to" .-> UI_CORE
    UI_LEARN -. "Back to" .-> UI_CORE
```

### Sub-Project Breakdown:

1. **FocusFlow Core (`/`)**: The main Progressive Web App (PWA) handling Pomodoro timers, task tracking, and ambient sounds. It runs entirely on the client-side without a traditional backend, relying on `localStorage` and Service Workers for offline capabilities.
2. **GradeSync (`/aws-upload/`)**: A teacher-facing grading application demonstrating a fully serverless AWS architecture. The client directly uploads JSON records to S3, triggering Lambda functions to process data, store it in DynamoDB, and dispatch SNS emails.
3. **AWS Learn (`/aws-learn/`)**: An educational module containing interactive reference guides and quizzes to help users understand the AWS services powering GradeSync.
