// AWS Learn — Reference Library

// ── Module Data ─────────────────────────────────────────────────────────────

const MODULES = [

  // ── Amazon S3 ──────────────────────────────────────────────────────────────
  {
    id: 's3',
    title: 'Amazon S3',
    subtitle: 'Simple Storage Service',
    description: 'Learn how AWS object storage works — buckets, objects, presigned URLs, events, and static website hosting.',
    icon: '☁️',
    color: '#ea580c',
    colorBg: 'rgba(234,88,12,.12)',
    tags: ['Storage', 'Events', 'Static Hosting'],
    duration: '15 min',
    image: 'images/s3_architecture.jpg',
    imageCaption: 'GradeSync upload flow: Browser → API Gateway → Lambda → S3',
    sections: [
      {
        heading: 'What is Amazon S3?',
        body: `
<p>Amazon S3 (Simple Storage Service) is AWS's <strong>object storage</strong> service. Unlike a traditional file system, S3 stores data as <em>objects</em> inside <em>buckets</em>. It is infinitely scalable and designed for 99.999999999% (11 nines) of durability.</p>

<p>FocusFlow hosts its entire website on S3. GradeSync stores student JSON records in a <code>records/</code> prefix and triggers a Lambda whenever a new one appears.</p>

<div class="info-box tip">💡 S3 is not just for files — it can host a complete static website (HTML, CSS, JS) directly from a bucket.</div>

<table class="concept-table"><thead><tr><th>Feature</th><th>S3 (Object Storage)</th><th>Traditional File System</th></tr></thead><tbody>
<tr><td>Structure</td><td>Flat — no real folders</td><td>Hierarchical directories</td></tr>
<tr><td>Access</td><td>HTTP/HTTPS URL</td><td>File path (OS level)</td></tr>
<tr><td>Scale</td><td>Virtually unlimited</td><td>Limited by disk</td></tr>
<tr><td>Pricing</td><td>Per GB + requests</td><td>Fixed capacity cost</td></tr>
</tbody></table>`
      },
      {
        heading: 'Key Concepts',
        body: `
<h3>Buckets</h3>
<p>A bucket is the top-level container. Bucket names must be <strong>globally unique</strong> across all AWS accounts. You pick the Region at creation time — objects live there permanently unless you move them.</p>

<h3>Objects & Keys</h3>
<p>An object is any file (JSON, image, HTML, video). Every object has a <strong>Key</strong> — its full "path" inside the bucket. <code>records/abc123.json</code> is just an object whose key starts with <code>records/</code>. Folders are a visual illusion created by key prefixes.</p>

<h3>Storage Classes</h3>
<table class="concept-table"><thead><tr><th>Class</th><th>Use Case</th><th>Retrieval</th></tr></thead><tbody>
<tr><td>Standard</td><td>Frequently accessed</td><td>Milliseconds</td></tr>
<tr><td>Standard-IA</td><td>Infrequent access</td><td>Milliseconds</td></tr>
<tr><td>Intelligent-Tiering</td><td>Unknown access patterns</td><td>Milliseconds</td></tr>
<tr><td>Glacier</td><td>Long-term archive</td><td>Minutes → hours</td></tr>
<tr><td>Glacier Deep Archive</td><td>Cheapest long-term</td><td>Up to 12 hours</td></tr>
</tbody></table>

<h3>Presigned URLs</h3>
<p>A time-limited URL that grants temporary upload or download access to a private S3 object — without exposing your AWS credentials. GradeSync generates presigned URLs via Lambda so the browser can PUT files directly to S3.</p>

<h3>Event Notifications</h3>
<p>S3 can invoke a Lambda function automatically when an object is created or deleted. GradeSync uses this: when a <code>.json</code> file lands in <code>records/</code>, S3 fires the <code>record_processor</code> Lambda.</p>`
      }
    ],
    steps: [
      { n: 1, title: 'Open S3 in the AWS Console', detail: 'Search for "S3" in the AWS search bar and click it.' },
      { n: 2, title: 'Create a Bucket', detail: 'Click <strong>Create bucket</strong>. Enter a globally unique name (e.g. <code>myname-demo-2025</code>). Select your region (e.g. <code>ap-south-1</code>).' },
      { n: 3, title: 'Configure Public Access', detail: 'For a private bucket (like GradeSync records): keep all "Block public access" checkboxes ON. For a public website: uncheck "Block all public access" and confirm.' },
      { n: 4, title: 'Upload a File', detail: 'Click your bucket name → <strong>Upload</strong> → <strong>Add files</strong>. Select a file, then click <strong>Upload</strong>.' },
      { n: 5, title: 'Enable Static Website Hosting (optional)', detail: 'Go to the bucket → <strong>Properties</strong> tab → <strong>Static website hosting</strong> → Enable. Set index document to <code>index.html</code>.' },
      { n: 6, title: 'Add a Bucket Policy (for public website)', detail: 'In <strong>Permissions → Bucket policy</strong>, paste a policy allowing <code>s3:GetObject</code> for all principals (<code>"Principal": "*"</code>) on your bucket ARN.' },
      { n: 7, title: 'Add an Event Notification (to trigger Lambda)', detail: 'Go to <strong>Properties → Event notifications → Create event notification</strong>. Choose event type <em>All object create events</em>, set prefix <code>records/</code> and suffix <code>.json</code>. Select your Lambda function as the destination.' }
    ],
    quiz: [
      { q: 'What type of storage does Amazon S3 use?', options: ['Block storage', 'File system storage', 'Object storage', 'Relational database'], answer: 2 },
      { q: 'What is an S3 "key"?', options: ['An encryption password', 'The full path/name of an object', 'An API access token', 'A bucket identifier'], answer: 1 },
      { q: 'What does a Presigned URL allow?', options: ['Permanent public access to an object', 'Temporary time-limited access without exposing credentials', 'Admin access to the AWS console', 'Encrypted storage'], answer: 1 },
      { q: 'Bucket names in S3 must be...', options: ['Unique within your AWS account', 'Globally unique across all AWS accounts', 'Unique within a Region', 'Unique within a VPC'], answer: 1 }
    ]
  },

  // ── S3 via CLI ─────────────────────────────────────────────────────────────
  {
    id: 's3-cli',
    title: 'S3 via AWS CLI',
    subtitle: 'Command Line Interface',
    description: 'Control S3 from your terminal — list buckets, copy files, sync folders, and generate presigned URLs.',
    icon: '💻',
    color: '#0284c7',
    colorBg: 'rgba(2,132,199,.12)',
    tags: ['CLI', 'Storage', 'Automation'],
    duration: '10 min',
    sections: [
      {
        heading: 'Setting Up the AWS CLI',
        body: `
<h3>Install</h3>
<div class="code-block"><div class="code-label">Windows (PowerShell)</div><pre>msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi</pre></div>
<div class="code-block"><div class="code-label">macOS</div><pre>brew install awscli</pre></div>
<div class="code-block"><div class="code-label">Verify installation</div><pre>aws --version</pre></div>

<h3>Configure Credentials</h3>
<div class="code-block"><pre>aws configure</pre></div>
<p>You'll be prompted for:</p>
<ul>
  <li><strong>AWS Access Key ID</strong> — from IAM → Users → Security credentials</li>
  <li><strong>AWS Secret Access Key</strong> — shown only once at creation</li>
  <li><strong>Default region</strong> — e.g. <code>ap-south-1</code></li>
  <li><strong>Output format</strong> — <code>json</code> recommended</li>
</ul>
<div class="info-box note">📌 Never commit AWS keys to Git. Add <code>.aws/</code> to your <code>.gitignore</code>.</div>`
      },
      {
        heading: 'Essential S3 Commands',
        body: `
<div class="code-block"><pre><span class="comment"># List all your S3 buckets</span>
aws s3 ls

<span class="comment"># List objects in a bucket</span>
aws s3 ls s3://arjuna9005/

<span class="comment"># List objects in a specific prefix</span>
aws s3 ls s3://arjuna9005/records/

<span class="comment"># Create a new bucket</span>
aws s3 mb s3://my-new-bucket --region ap-south-1

<span class="comment"># Upload a single file</span>
aws s3 cp index.html s3://arjuna9005/index.html

<span class="comment"># Upload an entire folder</span>
aws s3 cp ./aws-upload s3://arjuna9005/aws-upload --recursive

<span class="comment"># Sync folder (only uploads changed files)</span>
aws s3 sync ./aws-upload s3://arjuna9005/aws-upload

<span class="comment"># Download a file</span>
aws s3 cp s3://arjuna9005/records/abc.json ./local.json

<span class="comment"># Delete a single object</span>
aws s3 rm s3://arjuna9005/records/abc.json

<span class="comment"># Generate a presigned URL (valid 1 hour)</span>
aws s3 presign s3://arjuna9005/records/abc.json --expires-in 3600</pre></div>

<div class="info-box tip">💡 Add <code>--dryrun</code> to any sync or cp command to preview what would change without executing.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Install the AWS CLI', detail: 'On Windows: download and run the MSI installer from <code>awscli.amazonaws.com/AWSCLIV2.msi</code>. On macOS: run <code>brew install awscli</code>.' },
      { n: 2, title: 'Create an IAM Access Key', detail: 'In the AWS Console → <strong>IAM → Users → your user → Security credentials → Create access key</strong>. Download or copy the key pair. This is shown only once.' },
      { n: 3, title: 'Configure the CLI', detail: 'Run <code>aws configure</code> in your terminal. Paste the Access Key ID, Secret Key, set region to <code>ap-south-1</code> and output format to <code>json</code>.' },
      { n: 4, title: 'Test the connection', detail: 'Run <code>aws s3 ls</code>. You should see a list of your S3 buckets.' },
      { n: 5, title: 'Upload a file', detail: 'Run <code>aws s3 cp myfile.txt s3://your-bucket-name/</code> to upload a file.' },
      { n: 6, title: 'Sync a folder to S3', detail: 'Run <code>aws s3 sync ./my-folder s3://your-bucket-name/my-folder</code>. This only uploads files that have changed.' }
    ],
    quiz: [
      { q: 'Which command creates a new S3 bucket?', options: ['aws s3 create', 'aws s3 new', 'aws s3 mb', 'aws s3 bucket --create'], answer: 2 },
      { q: 'What does `aws s3 sync` do differently from `aws s3 cp --recursive`?', options: ['sync is faster', 'sync only uploads files that changed', 'sync compresses files', 'No difference'], answer: 1 },
      { q: 'How do you list all your S3 buckets via CLI?', options: ['aws s3 list-buckets', 'aws s3 ls', 'aws s3 show', 'aws s3 describe'], answer: 1 },
      { q: 'What does a presigned URL generated by the CLI allow?', options: ['Permanent public access', 'Temporary time-limited access to a private object', 'Admin console access', 'Encrypted storage'], answer: 1 }
    ]
  },

  // ── VPC ─────────────────────────────────────────────────────────────────────
  {
    id: 'vpc',
    title: 'Amazon VPC',
    subtitle: 'Virtual Private Cloud',
    description: 'Set up your own private network in AWS. Create subnets, attach an Internet Gateway, configure routing, and understand security groups.',
    icon: '🌐',
    color: '#059669',
    colorBg: 'rgba(5,150,105,.12)',
    tags: ['Networking', 'Security', 'Infrastructure'],
    duration: '20 min',
    image: 'images/vpc_diagram.jpg',
    imageCaption: 'VPC with public/private subnets, Internet Gateway, and NAT Gateway',
    sections: [
      {
        heading: 'What is a VPC?',
        body: `
<p>A VPC (Virtual Private Cloud) is your own <strong>isolated section of the AWS cloud</strong>. Everything you launch in AWS (EC2, Lambda in a VPC, RDS) lives inside one. You control IP ranges, subnets, routing, and firewall rules.</p>
<p>Every AWS account gets a <strong>default VPC</strong> per region — pre-configured and ready to use. But understanding how to build one manually is essential for production setups.</p>
<div class="info-box tip">💡 GradeSync's Lambda functions run in the default VPC. Understanding VPCs helps you isolate resources and control who can reach what.</div>`
      },
      {
        heading: 'Key Components',
        body: `
<h3>CIDR Blocks</h3>
<p>A CIDR block defines the IP address range for your VPC. <code>10.0.0.0/16</code> gives you 65,536 IP addresses. Subnets are smaller slices of this range.</p>

<h3>Subnets</h3>
<ul>
  <li><strong>Public Subnet</strong> — has a route to an Internet Gateway. Instances here can receive traffic from the internet (e.g. web servers).</li>
  <li><strong>Private Subnet</strong> — no direct internet route. Instances here (databases) are only reachable from inside the VPC.</li>
</ul>

<h3>Internet Gateway (IGW)</h3>
<p>Connects your VPC to the public internet. Without an IGW, nothing inside can communicate with the outside world.</p>

<h3>NAT Gateway</h3>
<p>Lets instances in a <em>private</em> subnet make <em>outbound</em> internet requests (e.g. to download packages) without being directly reachable from the internet.</p>

<h3>Route Tables</h3>
<p>Rules that control where network traffic is directed. Public subnet route table: <code>0.0.0.0/0 → IGW</code>. Private subnet route table: <code>0.0.0.0/0 → NAT Gateway</code>.</p>

<table class="concept-table"><thead><tr><th>Feature</th><th>Security Group</th><th>NACL</th></tr></thead><tbody>
<tr><td>Operates at</td><td>Instance level</td><td>Subnet level</td></tr>
<tr><td>Type</td><td>Stateful</td><td>Stateless</td></tr>
<tr><td>Rules</td><td>Allow only</td><td>Allow and Deny</td></tr>
<tr><td>Default</td><td>Deny all inbound</td><td>Allow all</td></tr>
</tbody></table>
<div class="info-box note">📌 <strong>Stateful</strong> means if you allow inbound traffic, the return response is automatically allowed. NACLs are stateless — you must explicitly allow both directions.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Create the VPC', detail: 'Go to <strong>VPC → Your VPCs → Create VPC</strong>. Name: <code>aws-vpc</code>. IPv4 CIDR: <code>10.0.0.0/16</code>. Click <strong>Create VPC</strong>.' },
      { n: 2, title: 'Create a Public Subnet', detail: 'Go to <strong>Subnets → Create subnet</strong>. Select your VPC. Name: <code>aws-public-subnet1</code>. Pick an Availability Zone. CIDR: <code>10.0.1.0/24</code>.' },
      { n: 3, title: 'Create a Private Subnet', detail: 'Repeat the process. Name: <code>aws-private-subnet1</code>. Pick a different AZ or same. CIDR: <code>10.0.2.0/24</code>.' },
      { n: 4, title: 'Create & Attach an Internet Gateway', detail: 'Go to <strong>Internet Gateways → Create</strong>. Name: <code>aws-IG</code>. Then click <strong>Actions → Attach to VPC</strong> and select your VPC.' },
      { n: 5, title: 'Create Public Route Table', detail: 'Go to <strong>Route Tables → Create</strong>. Name: <code>aws-Default-RT</code>. Associate with your VPC. Click <strong>Edit routes → Add route</strong>: Destination <code>0.0.0.0/0</code>, Target: your Internet Gateway.' },
      { n: 6, title: 'Associate Public Subnet with Route Table', detail: 'In the route table → <strong>Subnet associations → Edit subnet associations</strong>. Check <code>aws-public-subnet1</code>.' },
      { n: 7, title: 'Create Private Route Table', detail: 'Create another route table named <code>aws-Private-RT</code>. Associate <code>aws-private-subnet1</code> with it. (No internet route yet.)' },
      { n: 8, title: 'Launch EC2 instances to test', detail: 'Launch one EC2 in the public subnet (enable Auto-assign public IP). Launch another in the private subnet (no public IP). The public one acts as a Bastion/Jump host.' },
      { n: 9, title: 'Create a NAT Gateway', detail: 'Go to <strong>NAT Gateways → Create</strong>. Place it in the <strong>public</strong> subnet. Allocate a new Elastic IP. Click <strong>Create</strong>.' },
      { n: 10, title: 'Add NAT route to Private Route Table', detail: 'Edit <code>aws-Private-RT</code> → Add route: Destination <code>0.0.0.0/0</code>, Target: your NAT Gateway. Private instances can now download packages.' }
    ],
    quiz: [
      { q: 'What is the main purpose of an Internet Gateway in a VPC?', options: ['Connect two VPCs', 'Connect the VPC to the public internet', 'Encrypt all traffic', 'Route traffic between subnets'], answer: 1 },
      { q: 'A public subnet differs from a private subnet because it has...', options: ['More IP addresses', 'A route to an Internet Gateway', 'A NAT Gateway', 'Better security'], answer: 1 },
      { q: 'Security Groups are...', options: ['Stateless at subnet level', 'Stateful at instance level', 'Stateless at instance level', 'Stateful at subnet level'], answer: 1 },
      { q: 'Which CIDR block gives you the most IP addresses?', options: ['10.0.0.0/28', '10.0.0.0/24', '10.0.0.0/16', '10.0.0.0/8'], answer: 3 }
    ]
  },

  // ── Lambda ──────────────────────────────────────────────────────────────────
  {
    id: 'lambda',
    title: 'AWS Lambda',
    subtitle: 'Serverless Functions',
    description: 'Write event-driven functions that run without managing any servers. Understand handlers, triggers, cold starts, and environment variables.',
    icon: 'λ',
    color: '#7c3aed',
    colorBg: 'rgba(124,58,237,.12)',
    tags: ['Compute', 'Serverless', 'Events'],
    duration: '14 min',
    image: 'images/lambda_diagram.jpg',
    imageCaption: 'Lambda is event-driven: triggers come from S3, API Gateway, SNS and more',
    sections: [
      {
        heading: 'What is AWS Lambda?',
        body: `
<p>AWS Lambda is a <strong>serverless compute service</strong>. You write code in a function, AWS runs it in response to events. No servers to provision, no OS to maintain, no scaling to configure — AWS handles it all automatically.</p>
<p>GradeSync uses two Lambda functions:</p>
<ul>
  <li><strong>gradesync-presign-url</strong> — triggered by API Gateway, generates a secure S3 upload URL</li>
  <li><strong>gradesync-record-processor</strong> — triggered by S3 ObjectCreated, writes to DynamoDB and sends SNS email</li>
</ul>`
      },
      {
        heading: 'Handler, Event & Context',
        body: `
<p>Every Lambda function has a <strong>handler</strong> — the entry point AWS calls when the function is triggered.</p>
<div class="code-block"><div class="code-label">Python — Simple example (from Lambda Simple Example)</div><pre>import json

def lambda_handler(event, context):
    if event['planet'] == 'Earth':
        return 'Moon is the satellite of Earth'
    elif event['planet'] == 'Jupiter':
        return 'Europa is the satellite'
    else:
        return 'Unable to recognize your argument'</pre></div>

<p>To test this, create a Test Event in the Lambda console:</p>
<div class="code-block"><div class="code-label">Test Event JSON</div><pre>{
    "planet": "Earth"
}</pre></div>

<p>The <code>event</code> object contains the trigger data. For an S3 trigger it's the bucket and object key. For API Gateway it's the HTTP request details.</p>
<p>The <code>context</code> object provides runtime info (function name, memory limit, time remaining).</p>

<h3>Cold Starts vs Warm Starts</h3>
<p>On the <strong>first invocation</strong>, AWS creates a container, loads your code, and runs the handler. This is a <strong>cold start</strong> — adds ~100ms–1s of latency. Subsequent calls reuse the container (<strong>warm start</strong>) and are much faster.</p>

<div class="info-box tip">💡 Initialize AWS clients (<code>boto3.client</code>, DB connections) <em>outside</em> the handler — they are reused on warm starts, saving time.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Go to Lambda in the AWS Console', detail: 'Search "Lambda" in the AWS Console search bar. Click <strong>Create function</strong>.' },
      { n: 2, title: 'Choose "Author from scratch"', detail: 'Enter a function name (e.g. <code>my-first-lambda</code>). Select runtime — choose <strong>Python 3.12</strong>.' },
      { n: 3, title: 'Set an Execution Role', detail: 'Select <strong>Create a new role with basic Lambda permissions</strong>. This gives Lambda permission to write CloudWatch logs.' },
      { n: 4, title: 'Click Create function', detail: 'AWS creates the function with a basic "Hello from Lambda" handler.' },
      { n: 5, title: 'Write your handler code', detail: 'In the <strong>Code</strong> tab, edit <code>lambda_function.py</code>. Write your handler. Paste the planet example from above to try it out.' },
      { n: 6, title: 'Deploy the code', detail: 'Click <strong>Deploy</strong> (orange button). Your code is now live.' },
      { n: 7, title: 'Create a Test Event and run it', detail: 'Click the arrow next to <strong>Test → Configure test event</strong>. Enter a name, paste your JSON event (e.g. <code>{"planet": "Earth"}</code>), then click <strong>Test</strong>.' },
      { n: 8, title: 'Add Environment Variables', detail: 'Go to <strong>Configuration → Environment variables → Edit</strong>. Add key-value pairs like <code>TABLE_NAME = student-records</code>. Access in code with <code>os.environ["TABLE_NAME"]</code>.' },
      { n: 9, title: 'Add a Trigger', detail: 'Click <strong>+ Add trigger</strong>. Choose the source (e.g. S3, API Gateway). Configure the event type (e.g. ObjectCreated) and prefix/suffix filters.' }
    ],
    quiz: [
      { q: 'What triggers the gradesync-record-processor Lambda in GradeSync?', options: ['API Gateway HTTP request', 'Scheduled cron job', 'S3 ObjectCreated event', 'DynamoDB stream'], answer: 2 },
      { q: 'What is a Lambda "cold start"?', options: ['A function running in a cold region', 'Initial delay when AWS creates a new execution container', 'A function timeout error', 'Running Lambda in a private subnet'], answer: 1 },
      { q: 'Where should you initialize boto3 clients to optimize for warm starts?', options: ['Inside the handler function', 'In a separate config file', 'Outside the handler function (module/global scope)', 'Never initialize them'], answer: 2 },
      { q: 'What is the maximum execution timeout for a Lambda function?', options: ['1 minute', '5 minutes', '15 minutes', '1 hour'], answer: 2 }
    ]
  },

  // ── DynamoDB ────────────────────────────────────────────────────────────────
  {
    id: 'dynamodb',
    title: 'Amazon DynamoDB',
    subtitle: 'Serverless NoSQL Database',
    description: 'Understand key-value data modeling, partition keys, scan vs query, and the Decimal quirk in Python boto3.',
    icon: '◈',
    color: '#0891b2',
    colorBg: 'rgba(8,145,178,.12)',
    tags: ['Database', 'NoSQL', 'Serverless'],
    duration: '14 min',
    sections: [
      {
        heading: 'What is DynamoDB?',
        body: `
<p>DynamoDB is a fully managed <strong>NoSQL key-value and document database</strong>. It delivers single-digit millisecond performance at any scale — whether you have 10 items or 10 billion.</p>
<p>Unlike SQL databases, DynamoDB is <strong>schema-less</strong>. You only define the primary key structure — each item can have entirely different attributes.</p>

<table class="concept-table"><thead><tr><th>SQL Term</th><th>DynamoDB Equivalent</th></tr></thead><tbody>
<tr><td>Database</td><td>Table</td></tr>
<tr><td>Row</td><td>Item</td></tr>
<tr><td>Column</td><td>Attribute</td></tr>
<tr><td>Primary Key</td><td>Partition Key (+ optional Sort Key)</td></tr>
<tr><td>Index</td><td>GSI / LSI</td></tr>
</tbody></table>`
      },
      {
        heading: 'Keys, Queries & the Decimal Bug',
        body: `
<h3>Partition Key (Hash Key)</h3>
<p>Required. Uniquely identifies each item. In GradeSync's <code>student-records</code> table the partition key is <code>id</code> (a UUID).</p>

<h3>Sort Key (optional)</h3>
<p>Combined with partition key to allow multiple items per partition. Useful for one-to-many relationships (e.g. <code>userId</code> + <code>timestamp</code>).</p>

<h3>Scan vs Query</h3>
<table class="concept-table"><thead><tr><th></th><th>Query</th><th>Scan</th></tr></thead><tbody>
<tr><td>Works by</td><td>Looking up by partition key</td><td>Reading every item in the table</td></tr>
<tr><td>Efficiency</td><td>Fast, efficient</td><td>Slow and expensive</td></tr>
<tr><td>Cost</td><td>Low</td><td>Higher (reads all items)</td></tr>
<tr><td>GradeSync use</td><td>—</td><td>list_records (small table, fine for demo)</td></tr>
</tbody></table>
<div class="info-box note">📌 In production with millions of rows, use a <strong>GSI</strong> on <code>uploadedAt</code> and run a <strong>Query</strong> instead of Scan.</div>

<h3>The Float → Decimal Bug in Python</h3>
<p>boto3 (Python AWS SDK) rejects <code>float</code> values for DynamoDB Number fields. You must use <code>Decimal</code>:</p>
<div class="code-block"><div class="code-label">Python — Wrong vs Correct</div><pre>from decimal import Decimal

# ❌ This FAILS — boto3 raises TypeError
item["percentage"] = 86.5

# ✅ This WORKS
item["percentage"] = Decimal(str(86.5))  # str() avoids floating-point precision issues</pre></div>`
      }
    ],
    steps: [
      { n: 1, title: 'Open DynamoDB in the Console', detail: 'Search "DynamoDB" and click <strong>Create table</strong>.' },
      { n: 2, title: 'Set table name and partition key', detail: 'Table name: <code>student-records</code>. Partition key: <code>id</code>, type <strong>String</strong>.' },
      { n: 3, title: 'Choose billing mode', detail: 'Select <strong>On-demand</strong> (pay per request, great for unpredictable workloads). Click <strong>Create table</strong>.' },
      { n: 4, title: 'Explore the table', detail: 'After creation, click <strong>Explore table items</strong>. At first it is empty. After GradeSync processes a record, you will see items appear here.' },
      { n: 5, title: 'Manually create an item (test)', detail: 'Click <strong>Create item</strong>. Enter an <code>id</code> value (e.g. <code>test-001</code>). Add attributes: <code>name</code> (String), <code>grade</code> (String). Click <strong>Create item</strong>.' },
      { n: 6, title: 'Run a Scan', detail: 'In <strong>Explore table items</strong>, click <strong>Scan/Query items</strong>. Choose <strong>Scan</strong> and click <strong>Run</strong> to see all items.' }
    ],
    quiz: [
      { q: 'Which DynamoDB operation reads every item in the table?', options: ['Query', 'GetItem', 'Scan', 'BatchGetItem'], answer: 2 },
      { q: 'What is required when creating a DynamoDB table?', options: ['Sort Key', 'Partition Key', 'Secondary Index', 'Schema for all attributes'], answer: 1 },
      { q: 'In Python boto3, what data type must be used for floating-point numbers in DynamoDB?', options: ['float', 'double', 'Decimal', 'String'], answer: 2 },
      { q: 'DynamoDB is a...', options: ['Relational SQL database', 'Graph database', 'NoSQL key-value / document database', 'Time-series database'], answer: 2 }
    ]
  },

  // ── SNS ─────────────────────────────────────────────────────────────────────
  {
    id: 'sns',
    title: 'Amazon SNS & SQS',
    subtitle: 'Notification & Queuing',
    description: 'Send email/SMS alerts and decouple services with managed messaging. Learn pub/sub patterns and queue-based processing.',
    icon: '✉️',
    color: '#be185d',
    colorBg: 'rgba(190,24,93,.12)',
    tags: ['Messaging', 'Pub/Sub', 'Notifications'],
    duration: '12 min',
    sections: [
      {
        heading: 'Amazon SNS — Pub/Sub Notifications',
        body: `
<p>Amazon SNS (Simple Notification Service) is a push-based <strong>pub/sub messaging service</strong>. Publishers send messages to a <em>Topic</em>, and all subscribers receive them simultaneously — this is called <strong>fan-out</strong>.</p>
<p>In GradeSync: <code>record_processor</code> Lambda (publisher) → SNS Topic (grade-notifications) → your email (subscriber).</p>

<p><strong>Subscription types:</strong> Email, SMS, HTTP/HTTPS, Lambda, SQS.</p>
<div class="info-box note">📌 Email subscriptions require you to click a <strong>confirmation link</strong> in the first email AWS sends. Until confirmed, no messages are delivered.</div>`
      },
      {
        heading: 'Amazon SQS — Message Queuing',
        body: `
<p>Amazon SQS (Simple Queue Service) is a pull-based message queue. Producers put messages in, consumers pull and process them at their own pace.</p>

<table class="concept-table"><thead><tr><th>Feature</th><th>SNS</th><th>SQS</th></tr></thead><tbody>
<tr><td>Type</td><td>Push / Pub-Sub</td><td>Pull / Queue</td></tr>
<tr><td>Delivery</td><td>Immediate to all subscribers</td><td>Consumer polls the queue</td></tr>
<tr><td>Persistence</td><td>No (fire and forget)</td><td>Up to 14 days</td></tr>
<tr><td>Use case</td><td>Fan-out notifications</td><td>Decoupled async processing</td></tr>
</tbody></table>
<div class="info-box tip">💡 Common pattern: <strong>SNS → SQS fan-out</strong>. SNS publishes to multiple SQS queues, each processed independently by different Lambda functions.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Create an SNS Topic', detail: 'Go to <strong>SNS → Topics → Create topic</strong>. Type: <strong>Standard</strong>. Name: <code>grade-notifications</code>. Click <strong>Create topic</strong>.' },
      { n: 2, title: 'Create a Subscription', detail: 'On the topic page, click <strong>Create subscription</strong>. Protocol: <strong>Email</strong>. Endpoint: your email address. Click <strong>Create subscription</strong>.' },
      { n: 3, title: 'Confirm the subscription', detail: 'Check your inbox (including spam). Click the <strong>Confirm subscription</strong> link in the AWS notification email. Status changes from <em>PendingConfirmation</em> to <em>Confirmed</em>.' },
      { n: 4, title: 'Test with a manual publish', detail: 'On the topic page, click <strong>Publish message</strong>. Enter a Subject and Message body. Click <strong>Publish</strong>. You should receive an email within seconds.' },
      { n: 5, title: 'Grant Lambda permission to publish', detail: 'In your Lambda\'s IAM role, attach a policy allowing <code>sns:Publish</code> on your topic ARN. Or add the topic ARN as an environment variable and use the boto3 SNS client in your Lambda code.' }
    ],
    quiz: [
      { q: 'What delivery model does SNS use?', options: ['Pull-based polling', 'Push-based pub/sub', 'Batch processing', 'Event sourcing'], answer: 1 },
      { q: 'Why did GradeSync not receive SNS emails initially?', options: ['Lambda had the wrong ARN', 'SNS subscription was not confirmed', 'DynamoDB was blocking it', 'The S3 bucket had no CORS'], answer: 1 },
      { q: 'What is fan-out?', options: ['Splitting a message into smaller chunks', 'Publishing one message to multiple subscribers simultaneously', 'Rate limiting outbound messages', 'Compressing messages before sending'], answer: 1 },
      { q: 'SQS messages can be retained for a maximum of...', options: ['1 hour', '24 hours', '7 days', '14 days'], answer: 3 }
    ]
  },

  // ── IAM ─────────────────────────────────────────────────────────────────────
  {
    id: 'iam',
    title: 'AWS IAM',
    subtitle: 'Identity & Access Management',
    description: 'Control who can do what in your AWS account. Learn users, roles, policies, and the principle of least privilege.',
    icon: '🔐',
    color: '#ca8a04',
    colorBg: 'rgba(202,138,4,.12)',
    tags: ['Security', 'Identity', 'Permissions'],
    duration: '14 min',
    sections: [
      {
        heading: 'What is IAM?',
        body: `
<p>IAM (Identity and Access Management) controls <strong>who is allowed to do what</strong> in your AWS account. Every API call in AWS is checked against IAM before it executes.</p>

<table class="concept-table"><thead><tr><th>Concept</th><th>Description</th></tr></thead><tbody>
<tr><td>User</td><td>Human identity with long-term credentials (password, access key)</td></tr>
<tr><td>Group</td><td>Collection of users sharing the same permissions</td></tr>
<tr><td>Role</td><td>Set of permissions assumed temporarily by services or users — no long-term credentials</td></tr>
<tr><td>Policy</td><td>JSON document defining allowed/denied actions on specific resources</td></tr>
</tbody></table>

<div class="info-box good">✅ In GradeSync, the Lambda functions use an <strong>IAM Role</strong> (<code>GradeSyncLambdaRole</code>) to get permission to access S3, DynamoDB, and SNS.</div>`
      },
      {
        heading: 'Policies & Least Privilege',
        body: `
<h3>Policy Structure</h3>
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

<p>Notice the Resource is scoped to <code>records/*</code> — not the entire bucket. This is the <strong>Principle of Least Privilege</strong>: grant <em>only</em> what is needed, nothing more.</p>

<h3>Roles vs Users</h3>
<ul>
  <li><strong>Users</strong> — for humans logging in to the Console or using the CLI. Have permanent credentials.</li>
  <li><strong>Roles</strong> — for AWS services (Lambda, EC2). Assumed temporarily. No long-term credentials to steal.</li>
</ul>
<div class="info-box note">📌 Never hardcode AWS access keys in Lambda function code. Use roles instead — AWS automatically injects temporary credentials.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Create an IAM Role for Lambda', detail: 'Go to <strong>IAM → Roles → Create role</strong>. Trusted entity type: <strong>AWS service</strong>. Use case: <strong>Lambda</strong>. Click <strong>Next</strong>.' },
      { n: 2, title: 'Attach permissions', detail: 'Search for and attach <code>AmazonS3FullAccess</code>, <code>AmazonDynamoDBFullAccess</code>, <code>AmazonSNSFullAccess</code>. For production, use a custom policy with only the specific actions needed.' },
      { n: 3, title: 'Name and create the role', detail: 'Enter role name: <code>GradeSyncLambdaRole</code>. Click <strong>Create role</strong>.' },
      { n: 4, title: 'Attach the role to a Lambda function', detail: 'Open your Lambda function → <strong>Configuration → Permissions → Edit</strong>. Change <em>Existing role</em> to <code>GradeSyncLambdaRole</code>. Click <strong>Save</strong>.' },
      { n: 5, title: 'Create a custom policy (least privilege)', detail: 'Go to <strong>IAM → Policies → Create policy</strong>. Use the JSON editor. Paste a policy that allows only the specific actions and resources you need (e.g. <code>s3:GetObject</code> on <code>arjuna9005/records/*</code>).' },
      { n: 6, title: 'Create an IAM User for CLI access', detail: 'Go to <strong>IAM → Users → Create user</strong>. Enable <strong>Programmatic access</strong>. Attach policies. Download the Access Key CSV — it is shown only once.' }
    ],
    quiz: [
      { q: 'What is the "Principle of Least Privilege"?', options: ['Give all users admin access', 'Grant only the minimum permissions required', 'Use only managed policies', 'Never use IAM roles'], answer: 1 },
      { q: 'Why does GradeSync\'s Lambda use an IAM Role instead of an IAM User?', options: ['Roles are cheaper', 'Roles are assumed temporarily with no long-term credentials to expose', 'Roles support more permissions', 'IAM Users cannot access S3'], answer: 1 },
      { q: 'What does "arn:aws:s3:::arjuna9005/records/*" as a policy Resource mean?', options: ['Access to all S3 buckets', 'Access to all objects in all buckets', 'Access only to objects inside records/ in arjuna9005', 'Access to bucket metadata only'], answer: 2 },
      { q: 'IAM stands for...', options: ['Internet Access Manager', 'Identity and Access Management', 'Integrated Authorization Module', 'Instance and Application Monitor'], answer: 1 }
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

// ── Theme ─────────────────────────────────────────────────────────────────────

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

// ── Progress ──────────────────────────────────────────────────────────────────

function getProgress(moduleId) {
  return STATE.progress[moduleId] || 'none';
}

function setProgress(moduleId, status) {
  STATE.progress[moduleId] = status;
  localStorage.setItem('awslearn-progress', JSON.stringify(STATE.progress));
  renderSidebar();
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function renderSidebar() {
  const nav = document.getElementById('module-nav');
  if (!nav) return;
  nav.innerHTML = MODULES.map(m => {
    const prog = getProgress(m.id);
    const dot = prog === 'done' ? '✓' : prog === 'partial' ? '·' : '';
    const active = STATE.currentModule && STATE.currentModule.id === m.id ? 'active' : '';
    return '<button class="module-nav-item ' + active + '" onclick="openModule(\'' + m.id + '\')">'
      + '<div class="nav-icon" style="background:' + m.colorBg + ';color:' + m.color + '">' + m.icon + '</div>'
      + '<div class="nav-info">'
      + '<div class="nav-title">' + m.title + '</div>'
      + '<div class="nav-duration">' + m.duration + '</div>'
      + '</div>'
      + '<div class="nav-status ' + prog + '">' + dot + '</div>'
      + '</button>';
  }).join('');
}

// ── Sidebar toggle ────────────────────────────────────────────────────────────

let sidebarOpen = true;

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('open', sidebarOpen);
  } else {
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
  window.scrollTo(0, 0);
}

function renderGrid() {
  const grid = document.getElementById('modules-grid');
  if (!grid) return;

  grid.innerHTML = MODULES.map(function(m) {
    const prog = getProgress(m.id);
    let badge = '';
    if (prog === 'done') badge = '<span class="card-badge badge-done">✓ Done</span>';
    else if (prog === 'partial') badge = '<span class="card-badge badge-partial">In Progress</span>';

    const tagsHtml = (m.tags || []).map(function(t) {
      return '<span class="tag">' + t + '</span>';
    }).join('');

    return '<div class="module-card" onclick="openModule(\'' + m.id + '\')" role="button" tabindex="0" style="--card-accent:' + m.color + '">'
      + '<div class="card-top-bar" style="background:' + m.color + '"></div>'
      + '<div class="card-inner">'
      + '<div class="card-head">'
      + '<div class="card-icon" style="background:' + m.colorBg + ';color:' + m.color + '">' + m.icon + '</div>'
      + (badge ? '<div>' + badge + '</div>' : '')
      + '</div>'
      + '<div class="card-title">' + m.title + '</div>'
      + '<div class="card-sub">' + m.subtitle + '</div>'
      + '<p class="card-desc">' + m.description + '</p>'
      + '<div class="card-tags">' + tagsHtml + '</div>'
      + '<div class="card-footer"><span class="card-time">⏱ ' + m.duration + '</span><span class="card-cta">Open Guide →</span></div>'
      + '</div>'
      + '</div>';
  }).join('');
}

// ── Module View ───────────────────────────────────────────────────────────────

function openModule(id) {
  const mod = MODULES.find(function(m) { return m.id === id; });
  if (!mod) return;
  STATE.currentModule = mod;
  STATE.quizAnswers = {};
  STATE.quizSubmitted = false;

  if (getProgress(id) === 'none') setProgress(id, 'partial');

  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('module-view').classList.remove('hidden');
  document.getElementById('breadcrumb-sep').classList.remove('hidden');
  document.getElementById('breadcrumb-module').textContent = mod.title;

  const view = document.getElementById('module-view');

  // Sections
  const sectionsHtml = mod.sections.map(function(s) {
    return '<div class="section"><h2>' + s.heading + '</h2>' + s.body + '</div>';
  }).join('');

  // Image
  let imageHtml = '';
  if (mod.image) {
    imageHtml = '<div class="diagram-wrap"><img src="' + mod.image + '" alt="' + mod.title + ' diagram" loading="lazy"><div class="diagram-caption">' + (mod.imageCaption || '') + '</div></div>';
  }

  // Steps
  const stepsHtml = mod.steps ? buildSteps(mod) : '';

  // Quiz
  const quizHtml = buildQuiz(mod);

  view.innerHTML = '<div class="module-header">'
    + '<div class="module-header-icon" style="background:' + mod.colorBg + ';color:' + mod.color + '">' + mod.icon + '</div>'
    + '<div>'
    + '<h1>' + mod.title + '</h1>'
    + '<p class="mod-sub">' + mod.subtitle + '</p>'
    + '<div class="module-meta">'
    + '<span>⏱ ' + mod.duration + '</span>'
    + '<span>🛠️ ' + (mod.steps ? mod.steps.length : 0) + ' hands-on steps</span>'
    + '<span>❓ ' + mod.quiz.length + ' quiz questions</span>'
    + '</div>'
    + '</div>'
    + '</div>'
    + imageHtml
    + sectionsHtml
    + stepsHtml
    + quizHtml
    + '<div style="margin-top:32px;padding-top:20px;border-top:1px solid var(--border)">'
    + '<button class="nav-footer-btn" onclick="showHome()">← Back to All Guides</button>'
    + '</div>';

  renderSidebar();
  attachCopyButtons();
  window.scrollTo(0, 0);
}

// ── Steps Builder ─────────────────────────────────────────────────────────────

function buildSteps(mod) {
  const stepsItems = mod.steps.map(function(s) {
    return '<div class="step-item">'
      + '<div class="step-num">' + s.n + '</div>'
      + '<div class="step-body">'
      + '<div class="step-title">' + s.title + '</div>'
      + '<div class="step-detail">' + s.detail + '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  return '<div class="steps-section">'
    + '<h2>🛠️ Hands-on Steps</h2>'
    + '<p class="steps-intro">Follow these steps in the AWS Console to set up ' + mod.title + ' yourself.</p>'
    + '<div class="steps-list">' + stepsItems + '</div>'
    + '</div>';
}

// ── Quiz Builder ──────────────────────────────────────────────────────────────

function buildQuiz(mod) {
  const questions = mod.quiz.map(function(q, qi) {
    const opts = q.options.map(function(opt, oi) {
      return '<div class="quiz-option" id="opt-' + mod.id + '-' + qi + '-' + oi + '" onclick="selectOption(\'' + mod.id + '\',' + qi + ',' + oi + ')">'
        + '<div class="quiz-option-dot"></div>'
        + opt
        + '</div>';
    }).join('');

    return '<div class="quiz-question" id="q-' + mod.id + '-' + qi + '">'
      + '<div class="quiz-q-num">Question ' + (qi + 1) + ' of ' + mod.quiz.length + '</div>'
      + '<div class="quiz-q-text">' + q.q + '</div>'
      + '<div class="quiz-options">' + opts + '</div>'
      + '</div>';
  }).join('');

  return '<div class="quiz-section">'
    + '<h2>🧠 Quiz</h2>'
    + '<p class="quiz-subtitle">Test your understanding of ' + mod.title + '.</p>'
    + questions
    + '<button class="quiz-check-btn" id="quiz-check-' + mod.id + '" onclick="checkQuiz(\'' + mod.id + '\')" disabled>Check Answers</button>'
    + '<div id="quiz-result-' + mod.id + '"></div>'
    + '</div>';
}

function selectOption(moduleId, qi, oi) {
  if (STATE.quizSubmitted) return;
  const mod = MODULES.find(function(m) { return m.id === moduleId; });
  if (!mod) return;

  mod.quiz[qi].options.forEach(function(_, idx) {
    const el = document.getElementById('opt-' + moduleId + '-' + qi + '-' + idx);
    if (el) el.classList.remove('selected');
  });

  const chosen = document.getElementById('opt-' + moduleId + '-' + qi + '-' + oi);
  if (chosen) chosen.classList.add('selected');
  STATE.quizAnswers[qi] = oi;

  const allAnswered = mod.quiz.every(function(_, i) { return STATE.quizAnswers[i] !== undefined; });
  const btn = document.getElementById('quiz-check-' + moduleId);
  if (btn) btn.disabled = !allAnswered;
}

function checkQuiz(moduleId) {
  const mod = MODULES.find(function(m) { return m.id === moduleId; });
  if (!mod || STATE.quizSubmitted) return;
  STATE.quizSubmitted = true;

  let score = 0;
  mod.quiz.forEach(function(q, qi) {
    const chosen  = STATE.quizAnswers[qi];
    const correct = q.answer;
    const isRight = chosen === correct;
    if (isRight) score++;

    q.options.forEach(function(_, oi) {
      const el = document.getElementById('opt-' + moduleId + '-' + qi + '-' + oi);
      if (!el) return;
      el.classList.add('locked');
      if (oi === correct) el.classList.add('correct');
      else if (oi === chosen && !isRight) el.classList.add('wrong');
      const dot = el.querySelector('.quiz-option-dot');
      if (dot) dot.textContent = oi === correct ? '✓' : (oi === chosen ? '✕' : '');
    });
  });

  const btn = document.getElementById('quiz-check-' + moduleId);
  if (btn) btn.disabled = true;

  const pct = Math.round((score / mod.quiz.length) * 100);
  const scoreClass = pct >= 75 ? 'great' : pct >= 50 ? 'ok' : 'low';
  const msgs = {
    great: 'Excellent! You\'ve mastered this topic.',
    ok: 'Good effort! Review the sections you missed.',
    low: 'Keep going! Re-read the content above and try again.'
  };

  const resultEl = document.getElementById('quiz-result-' + moduleId);
  if (resultEl) {
    resultEl.innerHTML = '<div class="quiz-result">'
      + '<div class="quiz-score ' + scoreClass + '">' + score + '/' + mod.quiz.length + '</div>'
      + '<div class="quiz-result-msg">' + msgs[scoreClass] + '</div>'
      + '<button class="quiz-retry-btn" onclick="retryQuiz(\'' + moduleId + '\')">↺ Retry</button>'
      + '</div>';
  }

  setProgress(moduleId, pct >= 75 ? 'done' : 'partial');
}

function retryQuiz(moduleId) {
  STATE.quizAnswers = {};
  STATE.quizSubmitted = false;
  openModule(moduleId);
  setTimeout(function() {
    const el = document.querySelector('.quiz-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 50);
}

// ── Copy Buttons ──────────────────────────────────────────────────────────────

function attachCopyButtons() {
  document.querySelectorAll('.code-block').forEach(function(block) {
    if (block.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.onclick = function() {
      const pre = block.querySelector('pre');
      const text = pre ? pre.textContent : '';
      navigator.clipboard.writeText(text).then(function() {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function() { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
      });
    };
    block.style.position = 'relative';
    block.appendChild(btn);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  applyTheme();
  renderSidebar();
  renderGrid();

  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);

  const sidebarClose = document.getElementById('sidebar-close');
  if (sidebarClose) sidebarClose.addEventListener('click', toggleSidebar);

  const homeLink = document.getElementById('home-link');
  if (homeLink) homeLink.addEventListener('click', showHome);

  const bcHome = document.getElementById('breadcrumb-home');
  if (bcHome) bcHome.addEventListener('click', showHome);
});
