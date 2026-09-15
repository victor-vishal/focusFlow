# GradeSync — AWS Cloud Architecture Documentation

> **Project:** GradeSync (inside the FocusFlow platform)
> **Purpose:** A teacher-facing tool to submit student grades through a fully serverless AWS pipeline.
> **Region:** `ap-south-1` (Mumbai)

---

## Table of Contents

1. [What Does GradeSync Do?](#1-what-does-gradesync-do)
2. [Full Architecture — End to End](#2-full-architecture--end-to-end)
3. [Project File Structure](#3-project-file-structure)
4. [AWS Services Used and Why](#4-aws-services-used-and-why)
5. [Frontend — How the Form Works](#5-frontend--how-the-form-works)
6. [Lambda 1 — presign_url](#6-lambda-1--presign_url)
7. [Lambda 2 — record_processor](#7-lambda-2--record_processor)
8. [Lambda 3 — list_records](#8-lambda-3--list_records)
9. [Amazon DynamoDB Configuration](#9-amazon-dynamodb-configuration)
10. [Amazon SNS Configuration](#10-amazon-sns-configuration)
11. [API Gateway Configuration](#11-api-gateway-configuration)
12. [IAM Role and Permissions](#12-iam-role-and-permissions)
13. [S3 Bucket Configuration](#13-s3-bucket-configuration)
14. [CORS — Why It Was Tricky](#14-cors--why-it-was-tricky)
15. [Key Design Decisions and Reasoning](#15-key-design-decisions-and-reasoning)
16. [Complete Data Flow Walkthrough](#16-complete-data-flow-walkthrough)
17. [Environment Variables Reference](#17-environment-variables-reference)
18. [How to Demo in the AWS Console](#18-how-to-demo-in-the-aws-console)

---

## 1. What Does GradeSync Do?

GradeSync allows a teacher to fill in a student's details and subject marks through a web form. On submission:

1. The data is packaged into a **JSON file**
2. That file is uploaded directly to **Amazon S3**
3. The upload automatically triggers an **AWS Lambda** function
4. Lambda reads the data, calculates the grade, and writes it to **DynamoDB**
5. An **SNS email notification** is sent to the teacher confirming the submission

No traditional server is involved. The entire backend is serverless — AWS manages everything automatically.

---

## 2. Full Architecture — End to End

```
Teacher (Browser)
        |
        |  Step 1: Fill form -> click Submit
        v
  [Frontend JS]  ---- GET /presign?filename=<uuid>.json ---->  [API Gateway]
                                                                      |
                                                                      v
                                                              [Lambda: presign_url]
                                                                      |
                                                             Generates Presigned URL
                                                                      |
                <---- Returns { url, key } ----------------------------
        |
        |  Step 2: PUT JSON directly to S3 using Presigned URL
        v
  [Amazon S3 Bucket: arjuna9005]
  +-- records/<uuid>.json   <-- file lands here
        |
        |  S3 Event Notification fires automatically
        v
  [Lambda: record_processor]
        |
        +-- Reads JSON from S3
        +-- Validates required fields
        +-- Computes percentage & grade (server-side)
        +-- Writes enriched record to DynamoDB
        +-- Publishes email via SNS
        |
        +----> [Amazon DynamoDB: student-records table]
        |         Stores the full student record permanently
        |
        +----> [Amazon SNS: grade-notifications topic]
                  Sends email to subscribed teacher

Teacher's Inbox <--- Email: "New Student Record — Alice (A)"

        |
        |  (Separately) Teacher views submitted records
        v
  [Frontend JS]  ---- GET /records?limit=10 ---->  [API Gateway]
                                                          |
                                                          v
                                                 [Lambda: list_records]
                                                          |
                                                   Scans DynamoDB
                                                          |
                <---- Returns JSON array of records -------
        |
        v
  Records displayed in table on screen
```

---

## 3. Project File Structure

```
aws-upload/
|
+-- index.html                     # Main frontend UI (form + records table)
|
+-- js/
|   +-- config.js                  # API Gateway URL, region, demo mode flag
|   +-- app.js                     # All frontend logic: form, upload, display
|
+-- css/                           # Styling for the frontend
|
+-- aws-backend/                   # All AWS backend code & configs (for reference)
    +-- iam_policy.json            # IAM policy attached to the Lambda execution role
    +-- lambdas/
        +-- presign_url/
        |   +-- lambda_function.py  # Lambda 1: generates S3 presigned upload URL
        +-- record_processor/
        |   +-- lambda_function.py  # Lambda 2: reads S3 -> DynamoDB -> SNS
        +-- list_records/
            +-- lambda_function.py  # Lambda 3: reads DynamoDB -> returns records list
```

---

## 4. AWS Services Used and Why

| Service | Role in GradeSync | Why This Service? |
|---------|-------------------|-------------------|
| Amazon S3 | Stores uploaded student JSON files; also hosts the static website | Cheap, durable, event-capable object storage. No server needed. |
| API Gateway | Provides HTTP endpoints (/presign, /records) that the browser calls | Managed, scalable HTTP layer. Connects browser to Lambda securely. |
| AWS Lambda | All backend logic (3 functions) | Serverless — runs only when triggered. Zero cost when idle. |
| Amazon DynamoDB | Permanent storage of all student records | Serverless NoSQL, millisecond reads, scales automatically. |
| Amazon SNS | Sends email notification after each record is processed | Managed pub/sub. Sending an email is just one API call. |
| IAM | Controls what each Lambda function is allowed to do | Security — Least Privilege prevents accidental or malicious misuse. |

---

## 5. Frontend — How the Form Works

**File:** `js/app.js` | **Config:** `js/config.js`

### Config (config.js)

```javascript
const CONFIG = {
  API_BASE_URL: "https://q3t4kjyuna.execute-api.ap-south-1.amazonaws.com",
  AWS_REGION:   "ap-south-1",
  DEMO_MODE:    false,   // false = real AWS calls
};
```

The `API_BASE_URL` is the API Gateway Invoke URL — set once here so it does not need to be repeated across the codebase.

### Upload Flow (inside app.js)

When the teacher clicks Submit, the JavaScript does this in two stages:

**Stage 1 — Get a Presigned URL:**
```
GET https://q3t4kjyuna.execute-api.ap-south-1.amazonaws.com/presign?filename=<uuid>.json
```
Response:
```json
{ "url": "https://arjuna9005.s3.amazonaws.com/records/<uuid>.json?X-Amz-...", "key": "records/<uuid>.json" }
```

**Stage 2 — Upload the JSON directly to S3:**
```
PUT <presigned_url>
Content-Type: application/json
Body: { "id": "...", "name": "Alice", "marks": { "math": 85, ... }, ... }
```

Why upload directly to S3? To avoid routing large files through API Gateway and Lambda.
S3 accepts the upload directly using the pre-signed credentials. Lambda is only used
to *generate* the URL — it never touches the actual file data during upload.

---

## 6. Lambda 1 — presign_url

**File:** `aws-backend/lambdas/presign_url/lambda_function.py`
**Trigger:** API Gateway — GET /presign?filename=<uuid>.json
**Returns:** `{ url: <presigned PUT URL>, key: "records/<uuid>.json" }`

### What It Does

1. Reads the `filename` query parameter from the API Gateway event
2. Validates it: must end in `.json`, no path traversal (`..` or `/` in name)
3. Prepends `records/` to create the S3 object key: `records/<uuid>.json`
4. Calls boto3's `generate_presigned_url()` with `put_object`
5. Returns the URL (valid for **300 seconds / 5 minutes**)

### Key Configuration Choices

| Setting | Value | Reason |
|---------|-------|--------|
| ExpiresIn | 300 seconds | Short window — form submission takes <30s, 5 min is safe but not permanently exposed |
| ContentType | application/json | Locks the presigned URL to only allow JSON uploads — prevents misuse for other file types |
| Key prefix | records/ | Isolates student records from the website files in the same bucket |
| Filename validation | Rejects `..` and `/` | Prevents path traversal attacks |

### Environment Variables Required

| Key | Value |
|-----|-------|
| BUCKET_NAME | arjuna9005 |
| ALLOWED_ORIGIN | https://arjuna9005.s3.ap-south-1.amazonaws.com |

---

## 7. Lambda 2 — record_processor

**File:** `aws-backend/lambdas/record_processor/lambda_function.py`
**Trigger:** S3 Event Notification — `s3:ObjectCreated:*` on prefix `records/`, suffix `.json`
**Actions:** Read S3 -> Validate -> Enrich -> Write DynamoDB -> Send SNS email

### What It Does (step by step)

**Step 1 — Identify the uploaded file**

```python
bucket = s3_record["s3"]["bucket"]["name"]
key    = urllib.parse.unquote_plus(s3_record["s3"]["object"]["key"])
```

`unquote_plus` is used because S3 URL-encodes the key in the event payload
(spaces become `+`, special characters become `%xx`).

**Step 2 — Read the JSON from S3**

```python
response = s3_client.get_object(Bucket=bucket, Key=key)
student  = json.loads(response["Body"].read().decode("utf-8"))
```

**Step 3 — Validate required fields**

```python
required = ["id", "name", "rollNo", "classSection", "academicYear", "marks", "teacher"]
```

If any field is missing, the function raises a ValueError and logs the error —
the record is skipped without crashing the entire function.

**Step 4 — Server-side grade computation**

```python
percentage = round(sum(subject_scores) / len(subject_scores), 1)
grade      = compute_grade(percentage)   # A+/A/B/C/D
```

Why compute grade on the server? The client-side calculation cannot be trusted —
a user could manipulate browser JavaScript to send a fake grade. Lambda recomputes
it from the raw marks and overwrites any client-submitted value.

**Step 5 — Write to DynamoDB**

```python
dynamo_item = _to_decimal(student)   # Convert float -> Decimal
table.put_item(Item=dynamo_item)
```

The Decimal bug: DynamoDB via boto3 does not accept Python `float` types.
The `_to_decimal()` helper recursively walks the dictionary and converts every
`float` to `Decimal(str(value))`. Using `str()` first avoids floating-point
precision drift (e.g. 86.5 becoming 86.4999999999).

**Step 6 — Send SNS email**

```python
sns_client.publish(
    TopicArn=SNS_TOPIC_ARN,
    Subject=f"New Student Record -- {name} ({grade})",
    Message=message
)
```

The email body includes student details, all subject marks, percentage, grade,
timestamp in IST, and the S3 key where the file is stored.

> Important: SNS failure is caught and logged but does NOT prevent the DynamoDB
> write from succeeding. This is intentional — the data must always be saved
> even if the notification fails.

### Environment Variables Required

| Key | Value |
|-----|-------|
| BUCKET_NAME | arjuna9005 |
| TABLE_NAME | student-records |
| SNS_TOPIC_ARN | arn:aws:sns:ap-south-1:865526619615:grade-notifications |

---

## 8. Lambda 3 — list_records

**File:** `aws-backend/lambdas/list_records/lambda_function.py`
**Trigger:** API Gateway — GET /records?limit=<n>
**Returns:** JSON array of the most recent student records

### What It Does

1. Reads the `limit` query parameter (default: 10, max: 50)
2. Runs a DynamoDB Scan to fetch all records (sufficient for demo scale)
3. Sorts results by `uploadedAt` descending (newest first)
4. Returns the top `limit` records as a JSON array
5. Converts Decimal values back to float/int for JSON serialization

### Key Configuration Choices

| Setting | Reason |
|---------|--------|
| Scan operation | The table is small for a demo. In production, a GSI on uploadedAt + Query would be more efficient. |
| Max limit = 50 | Prevents accidentally returning thousands of records and hitting Lambda's 6 MB response limit. |
| Pagination handling | If DynamoDB returns a LastEvaluatedKey, the code loops to fetch remaining pages. |
| ProjectionExpression | Only fetches the columns needed — avoids transferring unnecessary data. |
| ExpressionAttributeNames | `id` and `name` are reserved words in DynamoDB. The #id, #name aliases are required to use them in expressions. |

### Environment Variables Required

| Key | Value |
|-----|-------|
| TABLE_NAME | student-records |
| ALLOWED_ORIGIN | https://arjuna9005.s3.ap-south-1.amazonaws.com |

---

## 9. Amazon DynamoDB Configuration

**Table name:** `student-records`
**Region:** `ap-south-1`
**Billing mode:** On-demand (pay-per-request)

### Table Schema

| Attribute | Type | Role |
|-----------|------|------|
| id | String (UUID) | Partition Key — uniquely identifies each student record |
| name | String | Student full name |
| rollNo | String | Roll number |
| classSection | String | E.g. "10-A" |
| academicYear | String | E.g. "2025-26" |
| marks | Map | { math, science, english, social, cs } — all out of 100 |
| percentage | Number | Server-computed average |
| grade | String | A+/A/B/C/D — server-computed |
| teacher | String | Submitting teacher's name |
| uploadedAt | String | ISO 8601 timestamp from the browser |
| processedAt | String | ISO 8601 timestamp when Lambda processed it |
| fileKey | String | The S3 key, e.g. records/<uuid>.json |
| remarks | String | Optional teacher notes |

### Why UUID as Partition Key?

- Globally unique — no two submissions can ever clash
- High cardinality — distributes data evenly across DynamoDB's internal partitions (avoids hot partitions)
- Generated in the browser — `crypto.randomUUID()` requires no server round-trip

### Why On-Demand Billing?

GradeSync is a demo/low-traffic app. On-demand means:
- No capacity planning required
- No cost when no records are being submitted
- Scales automatically if traffic spikes

---

## 10. Amazon SNS Configuration

**Topic name:** `grade-notifications`
**Topic ARN:** `arn:aws:sns:ap-south-1:865526619615:grade-notifications`
**Type:** Standard (not FIFO — order does not matter for email notifications)

### Subscription

| Protocol | Endpoint |
|----------|----------|
| Email | Teacher's email address |

### Why SNS instead of SES (Simple Email Service)?

SNS is much simpler for basic email notifications — a single `publish()` API call and it is done.
SES is more powerful (templates, deliverability tools) but overkill for one notification email per record.

### The Confirmation Gotcha

When an email is subscribed to SNS, AWS sends a confirmation email first. The subscription
stays in PendingConfirmation and will NOT deliver any messages until the link in that email
is clicked.

During testing, the confirmation email landed in spam. After marking it as "not spam"
and clicking confirm, notifications worked correctly.

---

## 11. API Gateway Configuration

**API ID:** `q3t4kjyuna`
**Type:** HTTP API (not REST API — simpler, cheaper, lower latency)
**Invoke URL:** `https://q3t4kjyuna.execute-api.ap-south-1.amazonaws.com`

### Routes

| Method | Route | Lambda |
|--------|-------|--------|
| GET | /presign | gradesync-presign-url |
| OPTIONS | /presign | gradesync-presign-url (handles CORS preflight) |
| GET | /records | gradesync-list-records |
| OPTIONS | /records | gradesync-list-records (handles CORS preflight) |

### Why HTTP API instead of REST API?

| Feature | HTTP API | REST API |
|---------|----------|----------|
| Cost | ~$1/million requests | ~$3.50/million |
| Latency | Lower | Higher |
| CORS support | Built-in | Manual |
| Usage plans / API Keys | No | Yes |

For GradeSync, we do not need usage plans or advanced features — HTTP API is faster and cheaper.

### CORS Configuration on API Gateway

| Setting | Value | Reason |
|---------|-------|--------|
| Access-Control-Allow-Origin | https://arjuna9005.s3.ap-south-1.amazonaws.com | Restrict to only our S3 website |
| Access-Control-Allow-Methods | GET, OPTIONS | Only these methods are used |
| Access-Control-Allow-Headers | Content-Type, X-Amz-Date, Authorization, X-Api-Key | Required for API requests |
| Access-Control-Max-Age | 300 | Browser caches preflight for 5 min — reduces OPTIONS request overhead |

---

## 12. IAM Role and Permissions

**Role name:** `GradeSyncLambdaRole`
**Trusted entity:** AWS Lambda (all 3 functions use this role)

### Policy (aws-backend/iam_policy.json)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ReadWrite",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::arjuna9005/records/*"
    },
    {
      "Sid": "DynamoDBReadWrite",
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:GetItem"],
      "Resource": "arn:aws:dynamodb:ap-south-1:865526619615:table/student-records"
    },
    {
      "Sid": "SNSPublish",
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "arn:aws:sns:ap-south-1:865526619615:grade-notifications"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Why Each Permission Is Needed

| Permission | Used By | Why |
|------------|---------|-----|
| s3:PutObject on records/* | presign_url Lambda | To generate a valid presigned PUT URL |
| s3:GetObject on records/* | record_processor Lambda | To read the uploaded JSON file |
| dynamodb:PutItem | record_processor Lambda | To save the student record |
| dynamodb:Scan | list_records Lambda | To fetch all records |
| dynamodb:GetItem | Reserved for future single-record lookup | |
| sns:Publish | record_processor Lambda | To send email notification |
| logs:* | All 3 Lambdas | To write logs to CloudWatch for debugging |

### Principle of Least Privilege

Notice what is NOT allowed:
- s3:* is NOT granted — only GetObject and PutObject
- Only the records/* prefix — not the entire bucket
- Only the specific DynamoDB table ARN — not all tables
- Only sns:Publish — not subscribe or delete
- Only the specific SNS topic ARN — not all topics

This limits the blast radius if Lambda code were ever compromised.

---

## 13. S3 Bucket Configuration

**Bucket name:** `arjuna9005`
**Region:** `ap-south-1` (Mumbai)

### Uses in GradeSync

| Prefix | Contents |
|--------|----------|
| (root) | index.html, CSS, JS — the FocusFlow static website |
| aws-upload/ | The GradeSync frontend files |
| aws-learn/ | The AWS Learn platform files |
| records/ | Student JSON files uploaded by teachers |

### Static Website Hosting

Enabled on the bucket. This allows the bucket to serve HTML/CSS/JS directly over HTTP:
- **Index document:** index.html
- **Website URL:** https://arjuna9005.s3-website.ap-south-1.amazonaws.com

### CORS Configuration on the Bucket

Required so the browser can PUT files directly to S3:

```json
[{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://arjuna9005.s3.ap-south-1.amazonaws.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
}]
```

### S3 Event Notification

Configured on the bucket to trigger record_processor Lambda:

| Setting | Value |
|---------|-------|
| Event type | s3:ObjectCreated:* (any create — PUT, POST, Copy, Multipart) |
| Prefix filter | records/ |
| Suffix filter | .json |
| Destination | Lambda: gradesync-record-processor |

The prefix + suffix filters ensure ONLY student JSON files trigger the Lambda,
not any other files uploaded to the bucket (like website assets).

---

## 14. CORS — Why It Was Tricky

CORS (Cross-Origin Resource Sharing) needs to be configured in THREE separate places
for GradeSync to work. Getting any one wrong causes a "Failed to fetch" error in
the browser with no specific indication of which one is the problem.

### The Three Places

| Where | What It Controls |
|-------|-----------------|
| API Gateway | Allows the browser to call the API Gateway endpoints |
| Lambda response headers | Each Lambda must return Access-Control-Allow-Origin in its response |
| S3 Bucket CORS | Allows the browser to PUT files directly to S3 using the presigned URL |

### The Common Mistake

Initially, ALLOWED_ORIGIN was set to * (wildcard) during development. When changed
to the specific origin URL, all three places had to be updated consistently.
Missing any one of them caused CORS failures.

### Why Not Keep * (Wildcard)?

Using * means any website in the world could call your API or upload to your S3 bucket.
Restricting to your specific origin ensures only your deployed FocusFlow site can
interact with the backend.

---

## 15. Key Design Decisions and Reasoning

### 1. Presigned URL instead of uploading through Lambda

**Alternative:** POST the JSON to API Gateway -> Lambda -> S3
**Chosen:** GET presign URL -> PUT directly from browser to S3

**Why:** API Gateway has a 10 MB payload limit and Lambda has a 6 MB response limit.
Routing uploads through them wastes resources and can hit limits. With presigned URLs,
the browser uploads directly to S3 — Lambda only generates a small URL string.

---

### 2. Server-side grade computation in Lambda

**Alternative:** Trust the percentage and grade submitted by the browser
**Chosen:** Lambda recomputes percentage and grade from raw marks

**Why:** Client-side JavaScript can be modified by anyone using browser DevTools.
A teacher could manually change the grade before submission. By computing it in Lambda
from the raw marks, the result is always accurate and trustworthy.

---

### 3. UUID as the record ID

**Alternative:** Auto-increment numbers, roll number as ID
**Chosen:** crypto.randomUUID() in the browser

**Why:**
- UUIDs are globally unique — no chance of collision even with concurrent submissions
- Roll number can change (e.g. student repeats a year)
- No server round-trip needed to generate the ID
- High cardinality distributes DynamoDB data evenly

---

### 4. DynamoDB over RDS (MySQL/PostgreSQL)

**Alternative:** Traditional relational database
**Chosen:** DynamoDB (NoSQL)

**Why:**
- Fully serverless — no DB server to manage
- No schema migrations when adding new fields
- Native integration with Lambda (same IAM role)
- On-demand pricing — zero cost when not querying
- Millisecond performance regardless of table size

---

### 5. Python 3.12 as Lambda runtime

**Alternative:** Node.js, Go
**Chosen:** Python 3.12

**Why:** The boto3 SDK (AWS SDK for Python) is mature, well-documented, and is
the most common choice for Lambda + AWS service integrations. boto3 comes
pre-installed in the Lambda runtime — no deployment package needed.

---

### 6. SNS for email over SES

**Alternative:** Amazon SES (Simple Email Service)
**Chosen:** Amazon SNS with Email subscription

**Why:** SNS is dramatically simpler — one publish() call sends the email.
SES requires domain verification, email templates, and sender reputation management.
For a notification-style email (not marketing), SNS is sufficient.

---

### 7. HTTP API Gateway over REST API

**Alternative:** API Gateway REST API
**Chosen:** API Gateway HTTP API

**Why:** HTTP API is ~70% cheaper, has lower latency, and has built-in CORS support.
GradeSync does not need REST API features like usage plans, API keys, or
request/response transformation.

---

## 16. Complete Data Flow Walkthrough

Here is the exact sequence of events when a teacher submits a form:

```
1. Teacher fills form -> clicks "Submit"

2. Browser generates UUID:
   id       = crypto.randomUUID()    -> "f4d9c71f-eecb-445e-8e4c-84d8d26302e1"
   filename = id + ".json"           -> "f4d9c71f-eecb-445e-8e4c-84d8d26302e1.json"

3. Browser calls API Gateway:
   GET /presign?filename=f4d9c71f-eecb-445e-8e4c-84d8d26302e1.json

4. API Gateway invokes Lambda: presign_url
   - Validates filename (must end .json, no / or ..)
   - Calls s3.generate_presigned_url("put_object", Key="records/f4d9c71f....json")
   - Returns: { "url": "https://arjuna9005.s3.amazonaws.com/records/f4d9c71f....json?X-Amz-...", "key": "records/..." }

5. Browser receives presigned URL.
   Browser constructs JSON payload:
   {
     "id": "f4d9c71f-...",
     "name": "Alice",
     "rollNo": "42",
     "classSection": "10-A",
     "academicYear": "2025-26",
     "marks": { "math": 85, "science": 90, "english": 78, "social": 82, "cs": 95 },
     "teacher": "Mr. Sharma",
     "uploadedAt": "2025-09-14T15:33:58.000Z"
   }

6. Browser PUTs JSON to presigned URL:
   PUT https://arjuna9005.s3.amazonaws.com/records/f4d9c71f....json?X-Amz-...
   Content-Type: application/json
   Body: { above JSON }
   S3 returns HTTP 200.

7. S3 creates object at key: records/f4d9c71f-eecb-445e-8e4c-84d8d26302e1.json
   S3 fires Event Notification -> invokes Lambda: record_processor

8. Lambda: record_processor
   - Reads JSON from s3://arjuna9005/records/f4d9c71f....json
   - Validates required fields
   - Computes: percentage = (85+90+78+82+95)/5 = 86.0, grade = "A"
   - Enriches item: adds percentage, grade, fileKey, fileSize, processedAt
   - Converts floats to Decimal: Decimal("86.0")
   - Writes to DynamoDB table: student-records (PutItem)
   - Publishes SNS: "New Student Record -- Alice (A)"

9. DynamoDB stores item permanently.

10. SNS delivers email to teacher:
    Subject: "New Student Record -- Alice (A)"
    Body includes:
      Name          : Alice
      Roll Number   : 42
      Class/Section : 10-A
      Mathematics   : 85/100
      Science       : 90/100
      English       : 78/100
      Social Studies: 82/100
      Computer Sci  : 95/100
      Percentage    : 86.0%
      Grade         : A
      Record ID     : f4d9c71f-eecb-445e-8e4c-84d8d26302e1

11. Teacher clicks "View Records" tab.
    Browser calls: GET /records?limit=10

12. API Gateway invokes Lambda: list_records
    - Scans student-records DynamoDB table
    - Sorts by uploadedAt descending
    - Returns top 10 records as JSON array
    - Converts Decimal back to float for JSON serialization

13. Browser renders records in the table on screen.
```

---

## 17. Environment Variables Reference

All sensitive configuration is stored as Lambda environment variables — never hardcoded in source code.

### Lambda: gradesync-presign-url

| Key | Value |
|-----|-------|
| BUCKET_NAME | arjuna9005 |
| ALLOWED_ORIGIN | https://arjuna9005.s3.ap-south-1.amazonaws.com |

### Lambda: gradesync-record-processor

| Key | Value |
|-----|-------|
| BUCKET_NAME | arjuna9005 |
| TABLE_NAME | student-records |
| SNS_TOPIC_ARN | arn:aws:sns:ap-south-1:865526619615:grade-notifications |

### Lambda: gradesync-list-records

| Key | Value |
|-----|-------|
| TABLE_NAME | student-records |
| ALLOWED_ORIGIN | https://arjuna9005.s3.ap-south-1.amazonaws.com |

---

## 18. How to Demo in the AWS Console

Use this sequence when walking your teacher through the project:

### Step 1 — Show the Live App

Open the GradeSync URL in a browser. Show the form — student name, roll number, class, subject marks. Explain that clicking Submit will trigger a multi-service AWS pipeline.

### Step 2 — Show the S3 Bucket

Open S3 -> arjuna9005 -> records/. Note the JSON files already uploaded. Show that each file is a student record, named with a UUID. Open one to show its raw JSON content.

### Step 3 — Show the S3 Event Notification

In S3 -> arjuna9005 -> Properties -> Event notifications. Show the rule:
- Prefix: records/
- Suffix: .json
- Destination: Lambda gradesync-record-processor

Explain: every time a .json file lands in records/, S3 automatically calls this Lambda.

### Step 4 — Show the Lambda Functions

Open Lambda. Show all three functions. Click gradesync-presign-url:
- Show the Code tab — presigned URL generation
- Show the Environment Variables tab
- Show the Triggers tab — API Gateway

Click gradesync-record-processor:
- Show the code — S3 -> DynamoDB -> SNS pipeline
- Point out the _to_decimal() helper and explain the Decimal bug
- Show the Triggers tab — S3
- Show Monitor -> CloudWatch Logs -> click a recent log stream to show real execution output

### Step 5 — Show the DynamoDB Table

Open DynamoDB -> student-records -> Explore table items -> Scan -> Run.
Show the submitted student records with all fields including `percentage` and `grade`
computed by Lambda (not trusted from the browser).

### Step 6 — Show the SNS Topic

Open SNS -> grade-notifications. Show:
- The confirmed email subscription
- The Topic ARN that matches the Lambda environment variable

### Step 7 — Live Demo

Fill in the form and submit. Then show in real time:
1. S3 records/ prefix — the new JSON file appears
2. CloudWatch Logs — the Lambda ran and logged all steps (read, validate, DynamoDB, SNS)
3. DynamoDB — the new item appears in the table
4. Email inbox — the SNS notification arrives within seconds

### Step 8 — Show the IAM Role

Open IAM -> Roles -> GradeSyncLambdaRole. Show:
- The Trust Policy: AWS Lambda service can assume this role
- The custom policy: only the specific permissions needed (Least Privilege)
- Point out: only records/* prefix in S3, only this specific DynamoDB table, only this specific SNS topic

### Step 9 — Show API Gateway

Open API Gateway -> q3t4kjyuna. Show:
- The two routes: /presign and /records
- The CORS configuration
- The integrations (each route connects to a Lambda function)

---

*Documentation written for GradeSync — part of the FocusFlow project.*
*AWS Region: ap-south-1 (Mumbai) | Runtime: Python 3.12 | Architecture: Fully Serverless*
