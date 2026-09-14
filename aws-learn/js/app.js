// ─── AWS Learn — Module Data & App Logic ──────────────────────────────────

// ── Module Definitions ──────────────────────────────────────────────────────

const MODULES = [
  {
    id: 's3',
    title: 'Amazon S3',
    subtitle: 'Simple Storage Service',
    icon: '☁️',
    color: '#ea580c',
    colorBg: 'rgba(234,88,12,.1)',
    duration: '15 min',
    sections: [
      {
        heading: 'What is Amazon S3?',
        content: `
          <p>Amazon S3 (Simple Storage Service) is AWS's <strong>object storage</strong> service. Unlike a traditional file system, S3 stores data as <em>objects</em> inside <em>buckets</em>.</p>
          <p>Think of a bucket as a container (like a Google Drive folder) and an object as any file you put in it — an image, a PDF, a JSON file, a video, or even an entire website's HTML.</p>
          <div class="info-box tip">💡 <strong>FocusFlow uses S3</strong> to host its static website and GradeSync stores student records as JSON files in the <code>records/</code> prefix.</div>
          <h3>S3 vs Traditional Storage</h3>
          <div class="concept-table-wrap">
            <table class="concept-table">
              <thead><tr><th>Feature</th><th>S3 (Object Storage)</th><th>Traditional (File System)</th></tr></thead>
              <tbody>
                <tr><td>Structure</td><td>Flat — no real folders</td><td>Hierarchical folders</td></tr>
                <tr><td>Access</td><td>HTTP/HTTPS URL</td><td>File path</td></tr>
                <tr><td>Scale</td><td>Unlimited</td><td>Limited by disk</td></tr>
                <tr><td>Pricing</td><td>Per GB stored + requests</td><td>Fixed capacity cost</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        heading: 'Core Concepts',
        content: `
          <h3>Buckets</h3>
          <p>A bucket is the top-level container in S3. Rules: names must be <strong>globally unique</strong> across all AWS accounts, 3–63 characters, lowercase only, no underscores. Each bucket exists in a specific <strong>AWS Region</strong>.</p>
          <h3>Objects</h3>
          <p>An object is any file stored in S3. Each object has:</p>
          <ul>
            <li><strong>Key</strong> — the full "path" (e.g. <code>records/abc123.json</code>)</li>
            <li><strong>Value</strong> — the actual file content</li>
            <li><strong>Metadata</strong> — content type, size, custom tags</li>
            <li><strong>Version ID</strong> — if versioning is enabled</li>
          </ul>
          <div class="info-box note">📌 Folders in S3 are an illusion — <code>records/abc.json</code> is just an object whose key starts with <code>records/</code>. The console shows it as a folder for convenience.</div>
          <h3>Storage Classes</h3>
          <div class="concept-table-wrap">
            <table class="concept-table">
              <thead><tr><th>Class</th><th>Use Case</th><th>Retrieval</th></tr></thead>
              <tbody>
                <tr><td>S3 Standard</td><td>Frequently accessed data</td><td>Milliseconds</td></tr>
                <tr><td>S3 Standard-IA</td><td>Infrequently accessed</td><td>Milliseconds</td></tr>
                <tr><td>S3 Intelligent-Tiering</td><td>Unknown access patterns</td><td>Milliseconds</td></tr>
                <tr><td>S3 Glacier</td><td>Long-term archival</td><td>Minutes to hours</td></tr>
                <tr><td>S3 Glacier Deep Archive</td><td>Cheapest long-term</td><td>Up to 12 hours</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        heading: 'Permissions & Access',
        content: `
          <h3>Bucket Policies</h3>
          <p>JSON documents attached to a bucket that define who can do what. For example, FocusFlow's bucket has a policy allowing anyone to <code>GetObject</code> so the website is publicly readable.</p>
          <h3>Presigned URLs</h3>
          <p>A time-limited URL that grants temporary access to a private S3 object. GradeSync uses presigned URLs to let the browser upload directly to S3 without exposing AWS credentials.</p>
          <div class="info-box good">✅ <strong>Best practice:</strong> Keep buckets private by default. Use presigned URLs for uploads and CloudFront for public website delivery.</div>
          <h3>Event Notifications</h3>
          <p>S3 can trigger other AWS services when objects are created or deleted. GradeSync uses this: when a JSON file lands in <code>records/</code>, S3 automatically invokes the <code>record_processor</code> Lambda.</p>
        `
      }
    ],
    quiz: [
      {
        q: 'What type of storage does Amazon S3 use?',
        options: ['Block storage', 'File storage', 'Object storage', 'Database storage'],
        answer: 2
      },
      {
        q: 'What is an S3 "key"?',
        options: ['An encryption password', 'The full path/name of an object', 'An API access token', 'A bucket identifier'],
        answer: 1
      },
      {
        q: 'Which S3 storage class is cheapest but has the slowest retrieval time?',
        options: ['S3 Standard', 'S3 Standard-IA', 'S3 Glacier', 'S3 Glacier Deep Archive'],
        answer: 3
      },
      {
        q: 'Bucket names in S3 must be...',
        options: ['Unique within your AWS account', 'Globally unique across all AWS accounts', 'Unique within a region', 'Unique within a VPC'],
        answer: 1
      }
    ]
  },

  {
    id: 's3-cli',
    title: 'S3 via AWS CLI',
    subtitle: 'Command Line Interface',
    icon: '💻',
    color: '#0284c7',
    colorBg: 'rgba(2,132,199,.1)',
    duration: '12 min',
    sections: [
      {
        heading: 'Setting Up the AWS CLI',
        content: `
          <p>The AWS CLI lets you manage S3 (and all AWS services) directly from your terminal.</p>
          <h3>Install</h3>
          <div class="code-block"><div class="code-label">Windows (PowerShell)</div><pre>msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi</pre></div>
          <div class="code-block"><div class="code-label">macOS</div><pre>brew install awscli</pre></div>
          <div class="code-block"><div class="code-label">Verify</div><pre>aws --version</pre></div>
          <h3>Configure Credentials</h3>
          <p>Run this and enter your Access Key ID, Secret Access Key, region, and output format:</p>
          <div class="code-block"><pre>aws configure</pre></div>
          <div class="info-box note">📌 Get your Access Key from <strong>IAM → Users → Security credentials → Create access key</strong>. Never commit keys to Git.</div>
        `
      },
      {
        heading: 'Essential S3 Commands',
        content: `
          <h3>List buckets and objects</h3>
          <div class="code-block"><pre><span class="comment"># List all your S3 buckets</span>
aws s3 ls

<span class="comment"># List objects inside a bucket</span>
aws s3 ls s3://arjuna9005

<span class="comment"># List objects in a prefix (folder)</span>
aws s3 ls s3://arjuna9005/records/</pre></div>

          <h3>Create a bucket</h3>
          <div class="code-block"><pre><span class="comment"># Create in a specific region</span>
aws s3 mb s3://my-new-bucket --region ap-south-1</pre></div>

          <h3>Upload files</h3>
          <div class="code-block"><pre><span class="comment"># Upload a single file</span>
aws s3 cp index.html s3://arjuna9005/index.html

<span class="comment"># Upload an entire folder</span>
aws s3 cp ./aws-upload s3://arjuna9005/aws-upload --recursive

<span class="comment"># Sync folder (only uploads changed files)</span>
aws s3 sync ./aws-upload s3://arjuna9005/aws-upload</pre></div>

          <h3>Download files</h3>
          <div class="code-block"><pre><span class="comment"># Download a single file</span>
aws s3 cp s3://arjuna9005/records/abc.json ./abc.json

<span class="comment"># Download entire folder</span>
aws s3 cp s3://arjuna9005/records ./local-records --recursive</pre></div>

          <h3>Delete files</h3>
          <div class="code-block"><pre><span class="comment"># Delete a single object</span>
aws s3 rm s3://arjuna9005/records/abc.json

<span class="comment"># Delete everything in a prefix</span>
aws s3 rm s3://arjuna9005/records/ --recursive</pre></div>

          <h3>Generate a presigned URL</h3>
          <div class="code-block"><pre><span class="comment"># Create a URL valid for 1 hour (3600 seconds)</span>
aws s3 presign s3://arjuna9005/records/abc.json --expires-in 3600</pre></div>

          <div class="info-box tip">💡 <strong>Tip:</strong> Use <code>--dryrun</code> with sync/cp commands to preview what would change without actually running the operation.</div>
        `
      }
    ],
    quiz: [
      {
        q: 'Which command creates a new S3 bucket?',
        options: ['aws s3 create', 'aws s3 new', 'aws s3 mb', 'aws s3 bucket --create'],
        answer: 2
      },
      {
        q: 'What does `aws s3 sync` do differently from `aws s3 cp --recursive`?',
        options: ['sync is faster', 'sync only uploads files that have changed', 'sync compresses files before uploading', 'There is no difference'],
        answer: 1
      },
      {
        q: 'How do you list all S3 buckets in your account?',
        options: ['aws s3 list-buckets', 'aws s3 ls', 'aws s3 show', 'aws s3 describe'],
        answer: 1
      },
      {
        q: 'What does a presigned URL allow?',
        options: ['Permanent public access to a private object', 'Temporary time-limited access to a private S3 object', 'Admin access to the AWS console', 'Encrypted storage of objects'],
        answer: 1
      }
    ]
  },

  {
    id: 'vpc',
    title: 'VPC',
    subtitle: 'Virtual Private Cloud',
    icon: '🌐',
    color: '#059669',
    colorBg: 'rgba(5,150,105,.1)',
    duration: '18 min',
    sections: [
      {
        heading: 'What is a VPC?',
        content: `
          <p>A VPC (Virtual Private Cloud) is your own <strong>private, isolated section of the AWS cloud</strong>. Think of it as your own private data center inside AWS — you control the IP ranges, subnets, routing, and who can reach what.</p>
          <p>Every AWS account gets a <strong>default VPC</strong> in each region, already set up and ready to use. When you launch an EC2 instance, it goes inside a VPC.</p>
          <div class="arch-diagram">
            <div class="arch-node" style="border-color:#059669;color:#059669">🌐 Internet</div>
            <div class="arch-arrow">→</div>
            <div class="arch-node" style="border-color:#059669;color:#059669">Internet Gateway</div>
            <div class="arch-arrow">→</div>
            <div class="arch-node" style="border-color:#059669;color:#059669">Public Subnet</div>
            <div class="arch-arrow">→</div>
            <div class="arch-node" style="border-color:#94a3b8;color:#94a3b8">Private Subnet</div>
          </div>
        `
      },
      {
        heading: 'Key Components',
        content: `
          <h3>Subnets</h3>
          <p>A subnet is a range of IP addresses within your VPC. Resources (like EC2 instances) live in subnets.</p>
          <ul>
            <li><strong>Public subnet</strong> — has a route to the Internet Gateway. Resources here can be reached from the internet (e.g. web servers).</li>
            <li><strong>Private subnet</strong> — no direct internet access. Resources here (e.g. databases) are only reachable from within the VPC.</li>
          </ul>
          <h3>CIDR Blocks</h3>
          <p>CIDR notation defines IP ranges. A VPC with <code>10.0.0.0/16</code> gives you 65,536 IP addresses. A subnet with <code>10.0.1.0/24</code> gives you 256.</p>
          <h3>Internet Gateway (IGW)</h3>
          <p>Connects your VPC to the public internet. Without an IGW, nothing inside your VPC can communicate with the outside world.</p>
          <h3>Route Tables</h3>
          <p>Rules that determine where network traffic goes. A public subnet's route table has a rule: <code>0.0.0.0/0 → Internet Gateway</code> (send all traffic to the internet). A private subnet doesn't have this rule.</p>
          <h3>Security Groups vs NACLs</h3>
          <div class="concept-table-wrap">
            <table class="concept-table">
              <thead><tr><th>Feature</th><th>Security Group</th><th>NACL</th></tr></thead>
              <tbody>
                <tr><td>Operates at</td><td>Instance level</td><td>Subnet level</td></tr>
                <tr><td>Type</td><td>Stateful</td><td>Stateless</td></tr>
                <tr><td>Default</td><td>Deny all inbound</td><td>Allow all</td></tr>
                <tr><td>Rules</td><td>Allow only</td><td>Allow and Deny</td></tr>
              </tbody>
            </table>
          </div>
          <div class="info-box tip">💡 <strong>Stateful</strong> means if you allow inbound traffic, the response is automatically allowed out. <strong>Stateless</strong> (NACL) means you must explicitly allow both directions.</div>
        `
      }
    ],
    quiz: [
      {
        q: 'What is the main purpose of an Internet Gateway in a VPC?',
        options: ['To connect two VPCs together', 'To connect the VPC to the public internet', 'To encrypt all traffic inside the VPC', 'To route traffic between subnets'],
        answer: 1
      },
      {
        q: 'A public subnet differs from a private subnet because it has...',
        options: ['More IP addresses', 'A route to an Internet Gateway', 'A NAT Gateway', 'Better security'],
        answer: 1
      },
      {
        q: 'Security Groups are...',
        options: ['Stateless firewall at subnet level', 'Stateful firewall at instance level', 'Stateless firewall at instance level', 'Stateful firewall at subnet level'],
        answer: 1
      },
      {
        q: 'Which CIDR block gives you the most IP addresses?',
        options: ['10.0.0.0/28', '10.0.0.0/24', '10.0.0.0/16', '10.0.0.0/8'],
        answer: 3
      }
    ]
  },

  {
    id: 'lambda',
    title: 'AWS Lambda',
    subtitle: 'Serverless Functions',
    icon: 'λ',
    color: '#7c3aed',
    colorBg: 'rgba(124,58,237,.1)',
    duration: '14 min',
    sections: [
      {
        heading: 'What is AWS Lambda?',
        content: `
          <p>AWS Lambda is a <strong>serverless compute service</strong> — you write code (a function), and AWS runs it in response to events. You don't manage any servers, OS, or infrastructure.</p>
          <p>Lambda is <strong>event-driven</strong>: it only runs when triggered. Triggers can be: an HTTP request (API Gateway), a file uploaded to S3, a message in an SNS topic, a DynamoDB table update, and many more.</p>
          <div class="info-box good">✅ GradeSync uses two Lambda functions: <strong>presign-url</strong> (triggered by API Gateway) and <strong>record-processor</strong> (triggered by S3).</div>
        `
      },
      {
        heading: 'How Lambda Works',
        content: `
          <h3>The Handler</h3>
          <p>Every Lambda function has a handler — the entry point AWS calls when the function is triggered:</p>
          <div class="code-block"><div class="code-label">Python Lambda handler</div><pre>def lambda_handler(event, context):
    <span class="comment"># event: the trigger data (S3 event, API Gateway request, etc.)</span>
    <span class="comment"># context: runtime info (function name, timeout remaining, etc.)</span>
    return {
        "statusCode": 200,
        "body": "Hello from Lambda!"
    }</pre></div>
          <h3>Cold Starts vs Warm Starts</h3>
          <p>The first time a Lambda runs, AWS spins up a container to run it (<strong>cold start</strong>) — this adds latency (typically 100ms–1s). Subsequent calls reuse the container (<strong>warm start</strong>) and are much faster.</p>
          <div class="concept-table-wrap">
            <table class="concept-table">
              <thead><tr><th>Setting</th><th>Details</th></tr></thead>
              <tbody>
                <tr><td>Max timeout</td><td>15 minutes (900 seconds)</td></tr>
                <tr><td>Max memory</td><td>10,240 MB</td></tr>
                <tr><td>Runtimes</td><td>Python, Node.js, Java, Go, Ruby, .NET</td></tr>
                <tr><td>Pricing</td><td>Per invocation + per 1ms of duration</td></tr>
                <tr><td>Free tier</td><td>1 million invocations/month free</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Environment Variables</h3>
          <p>Store config (bucket names, table names, ARNs) as env vars — never hardcode them in your function code. Access them with <code>os.environ["KEY"]</code> in Python.</p>
        `
      }
    ],
    quiz: [
      {
        q: 'What triggers an AWS Lambda function in GradeSync\'s record_processor?',
        options: ['An API Gateway HTTP request', 'A scheduled cron job', 'An S3 ObjectCreated event', 'A DynamoDB stream'],
        answer: 2
      },
      {
        q: 'What is a Lambda "cold start"?',
        options: ['A function that runs in a cold region', 'The initial delay when a container is created for the first invocation', 'A function timeout error', 'Running Lambda in a private subnet'],
        answer: 1
      },
      {
        q: 'What is the maximum execution timeout for a Lambda function?',
        options: ['1 minute', '5 minutes', '15 minutes', '1 hour'],
        answer: 2
      },
      {
        q: 'Which parameter in the Lambda handler contains the trigger data (e.g. S3 event details)?',
        options: ['context', 'event', 'request', 'payload'],
        answer: 1
      }
    ]
  },

  {
    id: 'dynamodb',
    title: 'DynamoDB',
    subtitle: 'NoSQL Database',
    icon: '◈',
    color: '#0891b2',
    colorBg: 'rgba(8,145,178,.1)',
    duration: '14 min',
    sections: [
      {
        heading: 'What is DynamoDB?',
        content: `
          <p>Amazon DynamoDB is a fully managed <strong>NoSQL key-value and document database</strong>. It's designed for single-digit millisecond performance at any scale — no matter if you have 10 or 10 billion items.</p>
          <p>Unlike SQL databases (MySQL, PostgreSQL), DynamoDB has <strong>no fixed schema</strong>. Each item can have different attributes.</p>
          <div class="concept-table-wrap">
            <table class="concept-table">
              <thead><tr><th>SQL Term</th><th>DynamoDB Equivalent</th></tr></thead>
              <tbody>
                <tr><td>Database</td><td>Table</td></tr>
                <tr><td>Row</td><td>Item</td></tr>
                <tr><td>Column</td><td>Attribute</td></tr>
                <tr><td>Primary Key</td><td>Partition Key (+ optional Sort Key)</td></tr>
                <tr><td>Index</td><td>GSI / LSI</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        heading: 'Keys, Queries & Scans',
        content: `
          <h3>Partition Key</h3>
          <p>Every DynamoDB table requires a <strong>partition key</strong> (also called hash key). It uniquely identifies each item. In GradeSync, the partition key is <code>id</code> (a UUID).</p>
          <h3>Sort Key (optional)</h3>
          <p>A secondary key that, combined with the partition key, makes a composite primary key. Useful for one-to-many relationships (e.g. <code>userId</code> + <code>timestamp</code>).</p>
          <h3>Scan vs Query</h3>
          <div class="concept-table-wrap">
            <table class="concept-table">
              <thead><tr><th></th><th>Query</th><th>Scan</th></tr></thead>
              <tbody>
                <tr><td>How it works</td><td>Looks up by partition key</td><td>Reads entire table</td></tr>
                <tr><td>Efficiency</td><td>Fast, efficient</td><td>Slow, expensive</td></tr>
                <tr><td>Cost</td><td>Low</td><td>Higher (reads all items)</td></tr>
                <tr><td>Use when</td><td>You know the key</td><td>Exploring / small tables</td></tr>
              </tbody>
            </table>
          </div>
          <div class="info-box note">📌 GradeSync's <code>list_records</code> Lambda uses <strong>Scan</strong> to get recent records. This is fine for a demo, but in production you'd use a GSI on <code>uploadedAt</code> and use Query instead.</div>
          <h3>Important: Floats → Decimal</h3>
          <p>boto3 (Python AWS SDK) requires DynamoDB Number fields to be <code>Decimal</code>, not <code>float</code>. Always convert: <code>Decimal(str(my_float))</code>.</p>
          <div class="code-block"><div class="code-label">Python</div><pre>from decimal import Decimal

<span class="comment"># Wrong — boto3 will raise TypeError</span>
item["percentage"] = 86.5

<span class="comment"># Correct</span>
item["percentage"] = Decimal("86.5")</pre></div>
        `
      }
    ],
    quiz: [
      {
        q: 'What is required when creating a DynamoDB table?',
        options: ['Sort Key', 'Partition Key', 'GSI', 'Both Partition Key and Sort Key'],
        answer: 1
      },
      {
        q: 'Which DynamoDB operation reads the entire table?',
        options: ['Query', 'GetItem', 'Scan', 'BatchGet'],
        answer: 2
      },
      {
        q: 'DynamoDB is what type of database?',
        options: ['Relational SQL', 'Graph database', 'NoSQL key-value / document', 'Time-series'],
        answer: 2
      },
      {
        q: 'Why does boto3 (Python) reject Python float values for DynamoDB?',
        options: ['DynamoDB only supports strings', 'DynamoDB requires Decimal type for numbers', 'Float precision is too high', 'DynamoDB is schema-less'],
        answer: 1
      }
    ]
  },

  {
    id: 'sns',
    title: 'SNS & SQS',
    subtitle: 'Messaging & Queuing',
    icon: '✉️',
    color: '#be185d',
    colorBg: 'rgba(190,24,93,.1)',
    duration: '12 min',
    sections: [
      {
        heading: 'Amazon SNS — Simple Notification Service',
        content: `
          <p>SNS is a fully managed <strong>push-based pub/sub messaging service</strong>. Publishers send messages to a <em>Topic</em>, and all <em>Subscribers</em> of that topic receive the message simultaneously (fan-out).</p>
          <div class="arch-diagram">
            <div class="arch-node" style="border-color:#be185d;color:#be185d">Lambda (publisher)</div>
            <div class="arch-arrow">→</div>
            <div class="arch-node" style="border-color:#be185d;color:#be185d">SNS Topic</div>
            <div class="arch-arrow">→</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              <div class="arch-node" style="border-color:#94a3b8;color:#64748b;font-size:.75rem">📧 Email subscriber</div>
              <div class="arch-node" style="border-color:#94a3b8;color:#64748b;font-size:.75rem">λ Lambda subscriber</div>
              <div class="arch-node" style="border-color:#94a3b8;color:#64748b;font-size:.75rem">📱 SMS subscriber</div>
            </div>
          </div>
          <h3>Subscription Types</h3>
          <ul>
            <li><strong>Email</strong> — sends a formatted email (used in GradeSync)</li>
            <li><strong>SMS</strong> — text message</li>
            <li><strong>Lambda</strong> — invokes another Lambda function</li>
            <li><strong>SQS</strong> — puts the message into a queue</li>
            <li><strong>HTTP/HTTPS</strong> — sends a POST to a webhook URL</li>
          </ul>
          <div class="info-box note">📌 Email subscriptions require the recipient to <strong>click a confirmation link</strong> before they receive any messages. Check spam!</div>
        `
      },
      {
        heading: 'Amazon SQS — Simple Queue Service',
        content: `
          <p>SQS is a fully managed <strong>pull-based message queue</strong>. Producers put messages in, consumers pull them out and process them.</p>
          <div class="concept-table-wrap">
            <table class="concept-table">
              <thead><tr><th>Feature</th><th>SNS</th><th>SQS</th></tr></thead>
              <tbody>
                <tr><td>Type</td><td>Push / Pub-Sub</td><td>Pull / Queue</td></tr>
                <tr><td>Delivery</td><td>Immediate to all subscribers</td><td>Consumer polls the queue</td></tr>
                <tr><td>Persistence</td><td>No (fire and forget)</td><td>Yes (up to 14 days)</td></tr>
                <tr><td>Use case</td><td>Fan-out notifications</td><td>Decoupled async processing</td></tr>
                <tr><td>GradeSync uses?</td><td>✅ Yes (email)</td><td>No</td></tr>
              </tbody>
            </table>
          </div>
          <div class="info-box tip">💡 <strong>Common pattern:</strong> SNS + SQS together — SNS fans-out to multiple SQS queues, each processed independently by different Lambda functions.</div>
        `
      }
    ],
    quiz: [
      {
        q: 'What delivery model does SNS use?',
        options: ['Pull-based polling', 'Push-based pub/sub', 'Batch processing', 'Event sourcing'],
        answer: 1
      },
      {
        q: 'In GradeSync, what triggers the SNS email?',
        options: ['The browser directly publishing to SNS', 'The presign-url Lambda', 'The record_processor Lambda after saving to DynamoDB', 'The API Gateway'],
        answer: 2
      },
      {
        q: 'SQS messages can be retained for a maximum of...',
        options: ['1 hour', '24 hours', '7 days', '14 days'],
        answer: 3
      },
      {
        q: 'Why would you use SQS instead of SNS?',
        options: ['When you need instant push to all subscribers', 'When you need a persistent queue where consumers pull messages at their own pace', 'When you want to send SMS messages', 'When you need to fan-out to multiple services'],
        answer: 1
      }
    ]
  },

  {
    id: 'iam',
    title: 'IAM',
    subtitle: 'Identity & Access Management',
    icon: '🔐',
    color: '#ca8a04',
    colorBg: 'rgba(202,138,4,.1)',
    duration: '16 min',
    sections: [
      {
        heading: 'What is IAM?',
        content: `
          <p>AWS IAM (Identity and Access Management) is how you control <strong>who can do what</strong> in your AWS account. Every API call in AWS is checked against IAM policies.</p>
          <div class="concept-table-wrap">
            <table class="concept-table">
              <thead><tr><th>Concept</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td>User</td><td>A person with long-term credentials (access key + password)</td></tr>
                <tr><td>Group</td><td>A collection of users that share the same permissions</td></tr>
                <tr><td>Role</td><td>A set of permissions that can be assumed by a service or person temporarily</td></tr>
                <tr><td>Policy</td><td>A JSON document defining allowed/denied actions on resources</td></tr>
              </tbody>
            </table>
          </div>
          <div class="info-box good">✅ <strong>GradeSync uses a Role</strong> (<code>GradeSyncLambdaRole</code>) — Lambda assumes this role to get permission to access S3, DynamoDB, and SNS.</div>
        `
      },
      {
        heading: 'Policies & Least Privilege',
        content: `
          <h3>Policy Structure</h3>
          <p>IAM policies are JSON documents with statements that allow or deny specific actions on specific resources:</p>
          <div class="code-block"><div class="code-label">IAM Policy JSON</div><pre>{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::arjuna9005/records/*"
    }
  ]
}</pre></div>
          <h3>Principle of Least Privilege</h3>
          <p>Always grant the <strong>minimum permissions needed</strong> — nothing more. The GradeSync IAM policy only allows S3 access on the <code>records/*</code> prefix, not the entire bucket. This limits blast radius if credentials are ever compromised.</p>
          <h3>Roles vs Users</h3>
          <ul>
            <li><strong>Users</strong> are for humans logging into the console or using the CLI</li>
            <li><strong>Roles</strong> are for AWS services (Lambda, EC2) and are assumed temporarily — no long-term credentials</li>
          </ul>
          <div class="info-box tip">💡 <strong>Best practice:</strong> Never use the root account for daily tasks. Create an IAM user with only the permissions you need, and use roles for all AWS services.</div>
          <h3>Resource-Based Policies</h3>
          <p>Some AWS services (S3, Lambda, SNS) also support <strong>resource-based policies</strong> attached directly to the resource. For example, S3 bucket policies allow/deny access from specific users or the public.</p>
        `
      }
    ],
    quiz: [
      {
        q: 'What is the "Principle of Least Privilege" in IAM?',
        options: ['Give all users admin access', 'Grant only the minimum permissions required to perform a task', 'Use only managed policies', 'Never use IAM roles'],
        answer: 1
      },
      {
        q: 'Why does GradeSync\'s Lambda use an IAM Role instead of an IAM User?',
        options: ['Roles are cheaper', 'Roles are assumed temporarily by services with no long-term credentials to expose', 'Roles support more permissions', 'IAM Users cannot access S3'],
        answer: 1
      },
      {
        q: 'What does "arn:aws:s3:::arjuna9005/records/*" in a policy Resource field mean?',
        options: ['Access to all S3 buckets', 'Access to all objects in all buckets', 'Access only to objects inside the records/ prefix of arjuna9005', 'Access to the arjuna9005 bucket metadata only'],
        answer: 2
      },
      {
        q: 'IAM stands for...',
        options: ['Internet Access Manager', 'Identity and Access Management', 'Integrated Authorization Module', 'Instance and Application Monitor'],
        answer: 1
      }
    ]
  }
];

// ── State ────────────────────────────────────────────────────────────────────

const STATE = {
  currentModule: null,
  theme: localStorage.getItem('awslearn-theme') || 'dark',
  progress: JSON.parse(localStorage.getItem('awslearn-progress') || '{}'),
  quizAnswers: {},
  quizSubmitted: false,
};

// ── Theme ────────────────────────────────────────────────────────────────────

function applyTheme() {
  document.documentElement.setAttribute('data-theme', STATE.theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = STATE.theme === 'dark' ? '☀️ Light' : '🌙 Dark';
}

function toggleTheme() {
  STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('awslearn-theme', STATE.theme);
  applyTheme();
}

// ── Progress ─────────────────────────────────────────────────────────────────

function getProgress(moduleId) {
  return STATE.progress[moduleId] || 'none'; // 'none' | 'partial' | 'done'
}

function setProgress(moduleId, status) {
  STATE.progress[moduleId] = status;
  localStorage.setItem('awslearn-progress', JSON.stringify(STATE.progress));
  renderSidebar();
  updateProgressBar();
}

function updateProgressBar() {
  const done = MODULES.filter(m => getProgress(m.id) === 'done').length;
  const pct  = Math.round((done / MODULES.length) * 100);
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = `${done}/${MODULES.length} completed`;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function renderSidebar() {
  const nav = document.getElementById('module-nav');
  if (!nav) return;
  nav.innerHTML = MODULES.map(m => {
    const prog  = getProgress(m.id);
    const icon  = prog === 'done' ? '✓' : prog === 'partial' ? '…' : '○';
    const active = STATE.currentModule?.id === m.id ? 'active' : '';
    return `
      <button class="module-nav-item ${active}" onclick="openModule('${m.id}')" aria-label="${m.title}">
        <div class="nav-icon" style="background:${m.colorBg};color:${m.color}">${m.icon}</div>
        <div class="nav-info">
          <div class="nav-title">${m.title}</div>
          <div class="nav-duration">${m.duration}</div>
        </div>
        <div class="nav-status ${prog}">${icon}</div>
      </button>
    `;
  }).join('');
}

// ── Sidebar toggle ────────────────────────────────────────────────────────────

let sidebarOpen = true;

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('main');
  sidebar.classList.toggle('open', sidebarOpen);
  if (window.innerWidth > 768) {
    sidebar.classList.toggle('collapsed', !sidebarOpen);
    main.classList.toggle('full', !sidebarOpen);
  }
}

// ── Home View ─────────────────────────────────────────────────────────────────

function showHome() {
  STATE.currentModule = null;
  document.getElementById('home-view').classList.remove('hidden');
  document.getElementById('module-view').classList.add('hidden');
  document.getElementById('breadcrumb-module').textContent = '';
  document.getElementById('breadcrumb-sep').classList.add('hidden');
  renderSidebar();
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('modules-grid');
  if (!grid) return;
  grid.innerHTML = MODULES.map(m => {
    const prog  = getProgress(m.id);
    const badge = prog === 'done' ? `<span class="card-badge badge-done">✓ Complete</span>`
                : prog === 'partial' ? `<span class="card-badge badge-partial">In Progress</span>`
                : `<span class="card-badge badge-none">Not Started</span>`;
    return `
      <div class="module-card" onclick="openModule('${m.id}')" role="button" tabindex="0" aria-label="Open ${m.title} module">
        <div class="module-card-icon" style="background:${m.colorBg};color:${m.color}">${m.icon}</div>
        <div class="module-card-title">${m.title}</div>
        <div class="module-card-sub">${m.subtitle}</div>
        <div class="module-card-meta">
          <span>⏱ ${m.duration}</span>
          ${badge}
        </div>
      </div>
    `;
  }).join('');
}

// ── Module View ───────────────────────────────────────────────────────────────

function openModule(id) {
  const mod = MODULES.find(m => m.id === id);
  if (!mod) return;
  STATE.currentModule = mod;
  STATE.quizAnswers   = {};
  STATE.quizSubmitted = false;

  // Mark as at least partial
  if (getProgress(id) === 'none') setProgress(id, 'partial');

  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('module-view').classList.remove('hidden');

  // Breadcrumb
  document.getElementById('breadcrumb-sep').classList.remove('hidden');
  document.getElementById('breadcrumb-module').textContent = mod.title;

  // Build content
  const view = document.getElementById('module-view');
  const idx  = MODULES.indexOf(mod);

  const sections = mod.sections.map(s => `
    <div class="section">
      <h2>${s.heading}</h2>
      ${s.content}
    </div>
  `).join('');

  const quizHtml = buildQuiz(mod);

  const prevMod = MODULES[idx - 1];
  const nextMod = MODULES[idx + 1];

  view.innerHTML = `
    <div class="module-header">
      <div class="module-header-icon" style="background:${mod.colorBg};color:${mod.color}">${mod.icon}</div>
      <div>
        <h1>${mod.title}</h1>
        <p>${mod.subtitle}</p>
        <div class="module-meta">
          <span>⏱ ${mod.duration}</span>
          <span>❓ ${mod.quiz.length} quiz questions</span>
        </div>
      </div>
    </div>

    ${sections}
    ${quizHtml}

    <div class="module-nav-footer">
      ${prevMod
        ? `<button class="nav-footer-btn" onclick="openModule('${prevMod.id}')">← ${prevMod.title}</button>`
        : `<button class="nav-footer-btn" onclick="showHome()">← All Modules</button>`
      }
      ${nextMod
        ? `<button class="nav-footer-btn primary" onclick="openModule('${nextMod.id}')">${nextMod.title} →</button>`
        : `<button class="nav-footer-btn primary" onclick="showHome()">🏠 All Modules</button>`
      }
    </div>
  `;

  renderSidebar();
  attachCopyButtons();
  window.scrollTo(0, 0);
}

// ── Quiz Builder ──────────────────────────────────────────────────────────────

function buildQuiz(mod) {
  const questions = mod.quiz.map((q, qi) => `
    <div class="quiz-question" id="q-${mod.id}-${qi}">
      <div class="quiz-q-num">Question ${qi + 1} of ${mod.quiz.length}</div>
      <div class="quiz-q-text">${q.q}</div>
      <div class="quiz-options">
        ${q.options.map((opt, oi) => `
          <div class="quiz-option" id="opt-${mod.id}-${qi}-${oi}" onclick="selectOption('${mod.id}', ${qi}, ${oi})">
            <div class="quiz-option-dot"></div>
            ${opt}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="quiz-section">
      <h2>🧠 Quiz</h2>
      <p class="quiz-subtitle">Test your understanding of ${mod.title}. Select an answer for each question, then click Check Answers.</p>
      ${questions}
      <button class="quiz-check-btn" id="quiz-check-${mod.id}" onclick="checkQuiz('${mod.id}')" disabled>
        Check Answers
      </button>
      <div id="quiz-result-${mod.id}"></div>
    </div>
  `;
}

function selectOption(moduleId, qi, oi) {
  if (STATE.quizSubmitted) return;

  const mod = MODULES.find(m => m.id === moduleId);
  if (!mod) return;

  // Deselect all in this question
  mod.quiz[qi].options.forEach((_, idx) => {
    document.getElementById(`opt-${moduleId}-${qi}-${idx}`)?.classList.remove('selected');
  });

  // Select chosen
  document.getElementById(`opt-${moduleId}-${qi}-${oi}`)?.classList.add('selected');
  STATE.quizAnswers[qi] = oi;

  // Enable check button if all questions answered
  const allAnswered = mod.quiz.every((_, i) => STATE.quizAnswers[i] !== undefined);
  const btn = document.getElementById(`quiz-check-${moduleId}`);
  if (btn) btn.disabled = !allAnswered;
}

function checkQuiz(moduleId) {
  const mod = MODULES.find(m => m.id === moduleId);
  if (!mod || STATE.quizSubmitted) return;
  STATE.quizSubmitted = true;

  let score = 0;

  mod.quiz.forEach((q, qi) => {
    const chosen  = STATE.quizAnswers[qi];
    const correct = q.answer;
    const isRight = chosen === correct;
    if (isRight) score++;

    // Lock all options and show result
    q.options.forEach((_, oi) => {
      const el = document.getElementById(`opt-${moduleId}-${qi}-${oi}`);
      if (!el) return;
      el.classList.add('locked');
      if (oi === correct) el.classList.add('correct');
      else if (oi === chosen && !isRight) el.classList.add('wrong');
      el.querySelector('.quiz-option-dot').textContent = oi === correct ? '✓' : (oi === chosen ? '✕' : '');
    });
  });

  // Disable check button
  const btn = document.getElementById(`quiz-check-${moduleId}`);
  if (btn) btn.disabled = true;

  // Show result
  const pct = Math.round((score / mod.quiz.length) * 100);
  const scoreClass = pct >= 75 ? 'great' : pct >= 50 ? 'ok' : 'low';
  const msgs = {
    great: 'Excellent! You\'ve got a solid understanding.',
    ok: 'Good effort! Review the sections you missed.',
    low: 'Keep studying! Re-read the content above and try again.'
  };

  const resultEl = document.getElementById(`quiz-result-${moduleId}`);
  if (resultEl) {
    resultEl.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-score ${scoreClass}">${score}/${mod.quiz.length}</div>
        <div class="quiz-result-msg">${msgs[scoreClass]}</div>
        <button class="quiz-retry-btn" onclick="retryQuiz('${moduleId}')">↺ Retry Quiz</button>
      </div>
    `;
  }

  // Update progress
  const status = pct >= 75 ? 'done' : 'partial';
  setProgress(moduleId, status);
}

function retryQuiz(moduleId) {
  STATE.quizAnswers   = {};
  STATE.quizSubmitted = false;
  openModule(moduleId);
  // Scroll to quiz
  setTimeout(() => document.querySelector('.quiz-section')?.scrollIntoView({ behavior: 'smooth' }), 50);
}

// ── Copy buttons ──────────────────────────────────────────────────────────────

function attachCopyButtons() {
  document.querySelectorAll('.code-block').forEach(block => {
    if (block.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.onclick = () => {
      const text = block.querySelector('pre')?.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
      });
    };
    block.style.position = 'relative';
    block.appendChild(btn);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  renderSidebar();
  renderGrid();
  updateProgressBar();

  document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);
  document.getElementById('menu-btn')?.addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-close')?.addEventListener('click', toggleSidebar);
  document.getElementById('home-link')?.addEventListener('click', showHome);

  // Keyboard support for module cards
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('module-card')) {
      e.target.click();
    }
  });
});
