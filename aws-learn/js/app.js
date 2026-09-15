// AWS Learn — Reference Library

// ── Module Data ─────────────────────────────────────────────────────────────

const MODULES = [

  // ── Amazon S3 ──────────────────────────────────────────────────────────────
  {
    id: 's3',
    title: 'Amazon S3',
    subtitle: 'Simple Storage Service',
    description: 'Learn how AWS object storage works — buckets, objects, presigned URLs, versioning, lifecycle policies, and static website hosting.',
    icon: '☁️',
    color: '#ea580c',
    colorBg: 'rgba(234,88,12,.12)',
    tags: ['Storage', 'Events', 'Static Hosting'],
    duration: '20 min',
    image: 'images/s3_architecture.jpg',
    imageCaption: 'GradeSync upload flow: Browser → API Gateway → Lambda → Presigned URL → S3 → Lambda → DynamoDB + SNS',
    sections: [
      {
        heading: 'What is Amazon S3?',
        body: `
<p>Amazon S3 (Simple Storage Service) is AWS's <strong>object storage</strong> service. Unlike a traditional file system or block storage, S3 stores data as flat <em>objects</em> inside <em>buckets</em>, accessed over HTTPS. It is designed for 99.999999999% (11 nines) of durability and virtually unlimited scale.</p>
<p>Common uses: static website hosting, data backup, application asset storage, log archiving, and data lake storage for analytics.</p>
<div class="info-box tip">💡 FocusFlow hosts its entire static website on S3. GradeSync stores student JSON records in a <code>records/</code> prefix inside the same bucket, and triggers a Lambda whenever a new record appears.</div>
<table class="concept-table concept-table-wrap"><thead><tr><th>Feature</th><th>S3 (Object Storage)</th><th>Traditional File System</th></tr></thead><tbody>
<tr><td>Structure</td><td>Flat — no real folders</td><td>Hierarchical directories</td></tr>
<tr><td>Access</td><td>HTTP/HTTPS REST API</td><td>File path (OS level)</td></tr>
<tr><td>Scale</td><td>Virtually unlimited</td><td>Limited by disk size</td></tr>
<tr><td>Durability</td><td>11 nines (99.999999999%)</td><td>Depends on hardware/RAID</td></tr>
<tr><td>Pricing</td><td>Per GB stored + requests</td><td>Fixed capacity cost</td></tr>
</tbody></table>`
      },
      {
        heading: 'Core Concepts: Buckets, Objects & Keys',
        body: `
<h3>Buckets</h3>
<p>A bucket is the top-level container. Rules for naming: <strong>globally unique</strong> across all AWS accounts, 3–63 characters, lowercase letters/numbers/hyphens only, no underscores. Each bucket exists in a specific <strong>AWS Region</strong> — objects don't automatically replicate to other regions.</p>

<h3>Objects & Keys</h3>
<p>An object is any file (JSON, image, HTML, video, binary). Every object has:</p>
<ul>
  <li><strong>Key</strong> — the full "path" (e.g. <code>records/abc123.json</code>). This is the unique identifier inside a bucket.</li>
  <li><strong>Value</strong> — the actual file bytes.</li>
  <li><strong>Metadata</strong> — content type, size, custom tags, cache headers.</li>
  <li><strong>ETag</strong> — an MD5 hash used to verify integrity.</li>
  <li><strong>Version ID</strong> — present only if versioning is enabled on the bucket.</li>
</ul>
<div class="info-box note">📌 <strong>Folders are an illusion.</strong> <code>records/abc.json</code> is just an object whose key starts with <code>records/</code>. The AWS console renders this visually as a folder for convenience. There is no actual folder object.</div>

<h3>Storage Classes</h3>
<table class="concept-table concept-table-wrap"><thead><tr><th>Class</th><th>Use Case</th><th>Retrieval Speed</th><th>Cost</th></tr></thead><tbody>
<tr><td>S3 Standard</td><td>Frequently accessed</td><td>Milliseconds</td><td>Higher</td></tr>
<tr><td>Standard-IA</td><td>Infrequent access</td><td>Milliseconds</td><td>Lower storage, retrieval fee</td></tr>
<tr><td>Intelligent-Tiering</td><td>Unknown access patterns</td><td>Milliseconds</td><td>Small monitoring fee</td></tr>
<tr><td>One Zone-IA</td><td>Non-critical, infrequent</td><td>Milliseconds</td><td>Cheaper, less resilient</td></tr>
<tr><td>Glacier Instant</td><td>Archive, rare access</td><td>Milliseconds</td><td>Very low</td></tr>
<tr><td>Glacier Flexible</td><td>Archive</td><td>Minutes to hours</td><td>Very low</td></tr>
<tr><td>Glacier Deep Archive</td><td>Compliance archive</td><td>Up to 12 hours</td><td>Cheapest</td></tr>
</tbody></table>`
      },
      {
        heading: 'Versioning & Lifecycle Policies',
        body: `
<h3>Versioning</h3>
<p>When versioning is enabled on a bucket, S3 keeps all versions of every object. If you upload <code>report.json</code> again, the old version is preserved with its Version ID. Deleting an object just adds a "delete marker" — old versions can still be restored.</p>
<ul>
  <li>Protects against accidental overwrites and deletions.</li>
  <li>Increases storage cost since all versions are stored.</li>
  <li>Cannot be fully disabled once enabled — only suspended.</li>
</ul>

<h3>Lifecycle Policies</h3>
<p>Lifecycle policies automatically move or expire objects based on rules:</p>
<div class="code-block"><div class="code-label">Example Lifecycle Rule</div><pre>Prefix: logs/
After 30 days  → Transition to Standard-IA
After 90 days  → Transition to Glacier
After 365 days → Permanently delete</pre></div>
<p>This keeps storage costs low for logs and backups without manual intervention.</p>
<div class="info-box tip">💡 For GradeSync, you could add a lifecycle rule to <code>records/</code> prefix: expire (delete) records older than 1 year to avoid indefinite storage growth.</div>`
      },
      {
        heading: 'Security: Permissions & Presigned URLs',
        body: `
<h3>Three Layers of Access Control</h3>
<table class="concept-table concept-table-wrap"><thead><tr><th>Method</th><th>Applied To</th><th>Use When</th></tr></thead><tbody>
<tr><td>IAM Policy</td><td>IAM Users, Roles</td><td>Granting AWS users/services access to S3</td></tr>
<tr><td>Bucket Policy</td><td>The Bucket itself</td><td>Making a bucket public or restricting by IP/VPC</td></tr>
<tr><td>ACL (Legacy)</td><td>Individual objects</td><td>Mostly deprecated; use bucket policies instead</td></tr>
</tbody></table>

<h3>Presigned URLs</h3>
<p>A presigned URL grants <strong>temporary, time-limited access</strong> to a private S3 object without sharing your AWS credentials. It is signed using your IAM credentials and includes the expiry time.</p>
<p>In GradeSync: the browser requests a presigned PUT URL from Lambda. Lambda uses boto3 to generate it, and returns it. The browser then PUTs the file directly to S3 using that URL — without ever touching a password or access key.</p>
<div class="code-block"><div class="code-label">Python — Generate Presigned Upload URL</div><pre>import boto3

s3 = boto3.client('s3')

url = s3.generate_presigned_url(
    'put_object',
    Params={
        'Bucket': 'arjuna9005',
        'Key': f'records/{file_id}.json',
        'ContentType': 'application/json'
    },
    ExpiresIn=300  # URL valid for 5 minutes
)
print(url)</pre></div>

<h3>CORS</h3>
<p>Cross-Origin Resource Sharing (CORS) must be configured on the bucket to allow browsers from a different domain (your website's URL) to PUT/GET objects. Without CORS, browsers block the request.</p>
<div class="code-block"><div class="code-label">CORS Configuration (Bucket → Permissions tab)</div><pre>[{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://arjuna9005.s3.ap-south-1.amazonaws.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
}]</pre></div>

<h3>S3 Event Notifications</h3>
<p>S3 can automatically trigger actions when objects are created, deleted, or restored. Event destinations include Lambda, SNS, and SQS. In GradeSync, creating an object in <code>records/</code> fires the <code>record_processor</code> Lambda.</p>`
      }
    ],
    steps: [
      { n: 1, title: 'Open S3 in the AWS Console', detail: 'Search for "S3" in the AWS search bar at the top. Click on it to open the S3 dashboard.' },
      { n: 2, title: 'Create a Bucket', detail: 'Click <strong>Create bucket</strong>. Enter a globally unique name (e.g. <code>yourname-demo-2025</code>). Select your region (e.g. <code>ap-south-1</code>).' },
      { n: 3, title: 'Configure Public Access', detail: 'For private buckets (like GradeSync records): keep all "Block public access" options ON. For public website hosting: uncheck <em>Block all public access</em>, then confirm.' },
      { n: 4, title: 'Upload a File', detail: 'Click your bucket name → <strong>Upload</strong> → <strong>Add files</strong>. Select a file (e.g. <code>index.html</code>), then click <strong>Upload</strong>.' },
      { n: 5, title: 'Enable Versioning (optional)', detail: 'Go to the bucket → <strong>Properties</strong> tab → <strong>Bucket Versioning</strong> → <strong>Enable</strong>. Now each upload of the same key keeps the old version.' },
      { n: 6, title: 'Enable Static Website Hosting', detail: 'In <strong>Properties → Static website hosting</strong> → Enable. Set index document to <code>index.html</code> and error document to <code>index.html</code> (for SPAs).' },
      { n: 7, title: 'Add a Bucket Policy (for public website)', detail: 'In <strong>Permissions → Bucket policy</strong>, paste a policy allowing <code>s3:GetObject</code> for <code>"Principal": "*"</code> on your bucket ARN + <code>/*</code>.' },
      { n: 8, title: 'Add an Event Notification', detail: 'Go to <strong>Properties → Event notifications → Create event notification</strong>. Choose <em>All object create events</em>, set prefix <code>records/</code>, suffix <code>.json</code>. Set destination to your Lambda function.' },
      { n: 9, title: 'Configure CORS', detail: 'In <strong>Permissions → Cross-origin resource sharing (CORS)</strong>, click Edit. Paste the CORS JSON from the section above, replacing the AllowedOrigins with your website URL.' }
    ],
    quiz: [
      { q: 'What type of storage does Amazon S3 use?', options: ['Block storage', 'File system storage', 'Object storage', 'Relational database'], answer: 2 },
      { q: 'What is an S3 "key"?', options: ['An encryption password', 'The full path/name that uniquely identifies an object', 'An API access token', 'A bucket identifier'], answer: 1 },
      { q: 'What does enabling bucket versioning do?', options: ['Makes all objects public', 'Keeps all previous versions of every object', 'Compresses all files', 'Enables encryption automatically'], answer: 1 },
      { q: 'Bucket names in S3 must be...', options: ['Unique within your AWS account', 'Globally unique across all AWS accounts', 'Unique within a Region only', 'Unique within a VPC'], answer: 1 },
      { q: 'What is a presigned URL?', options: ['A permanent public link to an object', 'A time-limited URL for temporary access without sharing credentials', 'An encrypted URL requiring a key', 'A URL that bypasses CORS'], answer: 1 }
    ]
  },

  // ── S3 via CLI ─────────────────────────────────────────────────────────────
  {
    id: 's3-cli',
    title: 'S3 via AWS CLI',
    subtitle: 'Command Line Interface',
    description: 'Control S3 from your terminal — configure credentials, list/copy/sync buckets, generate presigned URLs, and use the lower-level s3api.',
    icon: '💻',
    color: '#0284c7',
    colorBg: 'rgba(2,132,199,.12)',
    tags: ['CLI', 'Storage', 'Automation'],
    duration: '12 min',
    sections: [
      {
        heading: 'Installing & Configuring the AWS CLI',
        body: `
<h3>Install</h3>
<div class="code-block"><div class="code-label">Windows (PowerShell)</div><pre>msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi</pre></div>
<div class="code-block"><div class="code-label">macOS (Homebrew)</div><pre>brew install awscli</pre></div>
<div class="code-block"><div class="code-label">Verify installation</div><pre>aws --version
# aws-cli/2.x.x Python/3.x.x ...</pre></div>

<h3>Configure Credentials</h3>
<div class="code-block"><pre>aws configure</pre></div>
<p>You will be prompted for:</p>
<ul>
  <li><strong>AWS Access Key ID</strong> — from IAM → Users → your user → Security credentials → Create access key</li>
  <li><strong>AWS Secret Access Key</strong> — shown only once at creation time, store it securely</li>
  <li><strong>Default region name</strong> — e.g. <code>ap-south-1</code></li>
  <li><strong>Default output format</strong> — <code>json</code> recommended</li>
</ul>
<div class="info-box note">📌 Credentials are saved to <code>~/.aws/credentials</code> (Windows: <code>C:\\Users\\YourName\\.aws\\credentials</code>). Never commit this file to Git. Add <code>.aws/</code> to your <code>.gitignore</code>.</div>

<h3>Profiles (multiple accounts)</h3>
<div class="code-block"><div class="code-label">Create a named profile</div><pre>aws configure --profile my-work-account</pre></div>
<div class="code-block"><div class="code-label">Use a specific profile</div><pre>aws s3 ls --profile my-work-account</pre></div>`
      },
      {
        heading: 'High-level S3 Commands (aws s3)',
        body: `
<p>The <code>aws s3</code> commands are high-level wrappers — easy to use, similar to Unix shell commands.</p>
<div class="code-block"><pre><span class="comment"># List all your S3 buckets</span>
aws s3 ls

<span class="comment"># List all objects in a bucket</span>
aws s3 ls s3://arjuna9005/

<span class="comment"># List objects in a prefix (like a folder)</span>
aws s3 ls s3://arjuna9005/records/

<span class="comment"># Create a new bucket</span>
aws s3 mb s3://my-new-bucket --region ap-south-1

<span class="comment"># Upload a single file</span>
aws s3 cp index.html s3://arjuna9005/index.html

<span class="comment"># Upload with content-type header</span>
aws s3 cp index.html s3://arjuna9005/ --content-type "text/html"

<span class="comment"># Upload an entire folder recursively</span>
aws s3 cp ./aws-upload/ s3://arjuna9005/aws-upload/ --recursive

<span class="comment"># Sync a folder (only uploads files that changed)</span>
aws s3 sync ./aws-upload s3://arjuna9005/aws-upload

<span class="comment"># Sync and delete files in S3 that no longer exist locally</span>
aws s3 sync ./aws-upload s3://arjuna9005/aws-upload --delete

<span class="comment"># Download a single file</span>
aws s3 cp s3://arjuna9005/records/abc.json ./local.json

<span class="comment"># Download an entire prefix</span>
aws s3 cp s3://arjuna9005/records/ ./records/ --recursive

<span class="comment"># Delete a single object</span>
aws s3 rm s3://arjuna9005/records/abc.json

<span class="comment"># Delete all objects in a prefix</span>
aws s3 rm s3://arjuna9005/records/ --recursive

<span class="comment"># Generate a presigned URL (valid 1 hour)</span>
aws s3 presign s3://arjuna9005/records/abc.json --expires-in 3600

<span class="comment"># Preview what sync would change (dry run)</span>
aws s3 sync ./aws-upload s3://arjuna9005/aws-upload --dryrun</pre></div>`
      },
      {
        heading: 'Low-level API Commands (aws s3api)',
        body: `
<p>The <code>aws s3api</code> commands map directly to S3 API operations. They give you fine-grained control over bucket/object settings.</p>
<div class="code-block"><pre><span class="comment"># Get an object's metadata</span>
aws s3api head-object --bucket arjuna9005 --key records/abc.json

<span class="comment"># List all object versions (requires versioning enabled)</span>
aws s3api list-object-versions --bucket arjuna9005

<span class="comment"># Get current bucket ACL</span>
aws s3api get-bucket-acl --bucket arjuna9005

<span class="comment"># Get CORS configuration</span>
aws s3api get-bucket-cors --bucket arjuna9005

<span class="comment"># Set a bucket policy from a JSON file</span>
aws s3api put-bucket-policy --bucket arjuna9005 --policy file://policy.json

<span class="comment"># Enable versioning on a bucket</span>
aws s3api put-bucket-versioning \
  --bucket arjuna9005 \
  --versioning-configuration Status=Enabled

<span class="comment"># Restore a specific version</span>
aws s3api copy-object \
  --copy-source arjuna9005/records/abc.json?versionId=xyz123 \
  --bucket arjuna9005 \
  --key records/abc.json</pre></div>`
      }
    ],
    steps: [
      { n: 1, title: 'Install the AWS CLI', detail: 'On Windows: download and run the MSI installer from <code>awscli.amazonaws.com/AWSCLIV2.msi</code>. On macOS: run <code>brew install awscli</code>. Verify with <code>aws --version</code>.' },
      { n: 2, title: 'Create an IAM User with Access Keys', detail: 'In the AWS Console → <strong>IAM → Users → Create user</strong>. Attach <code>AmazonS3FullAccess</code> or a custom policy. Then go to <strong>Security credentials → Create access key → CLI</strong>. Download the CSV — the secret is shown only once.' },
      { n: 3, title: 'Configure the CLI', detail: 'Run <code>aws configure</code>. Paste your Access Key ID and Secret Key. Enter your default region (e.g. <code>ap-south-1</code>). Set output format to <code>json</code>.' },
      { n: 4, title: 'Test the connection', detail: 'Run <code>aws s3 ls</code>. You should see a list of your S3 buckets. If you see an error, check that your region is correct and the IAM user has S3 permissions.' },
      { n: 5, title: 'Upload files to S3', detail: 'Run <code>aws s3 cp myfile.txt s3://your-bucket-name/</code> to upload a single file. Run <code>aws s3 sync ./my-folder s3://your-bucket-name/my-folder</code> to sync a whole folder.' },
      { n: 6, title: 'Add --dryrun to preview changes', detail: 'Before syncing, run the command with <code>--dryrun</code> at the end. It shows you exactly what would be uploaded or deleted without doing anything.' }
    ],
    quiz: [
      { q: 'Which command creates a new S3 bucket?', options: ['aws s3 create', 'aws s3 new', 'aws s3 mb', 'aws s3 bucket --create'], answer: 2 },
      { q: 'What does `aws s3 sync` do differently from `aws s3 cp --recursive`?', options: ['sync is always faster', 'sync only uploads files that have changed or are new', 'sync compresses files automatically', 'No difference at all'], answer: 1 },
      { q: 'Where does `aws configure` save your credentials on Windows?', options: ['C:\\Program Files\\aws\\credentials', 'C:\\Users\\YourName\\.aws\\credentials', 'In the AWS Console only', 'In the Windows Registry'], answer: 1 },
      { q: 'Which command would you use to get detailed metadata about a specific object?', options: ['aws s3 describe-object', 'aws s3api head-object', 'aws s3 info', 'aws s3api get-object-metadata'], answer: 1 },
      { q: 'What flag lets you preview what sync/cp would do without executing?', options: ['--preview', '--test', '--dryrun', '--simulate'], answer: 2 }
    ]
  },

  // ── VPC ─────────────────────────────────────────────────────────────────────
  {
    id: 'vpc',
    title: 'Amazon VPC',
    subtitle: 'Virtual Private Cloud',
    description: 'Build your own isolated network in AWS. Create subnets, Internet Gateways, NAT Gateways, Route Tables, and Security Groups.',
    icon: '🌐',
    color: '#059669',
    colorBg: 'rgba(5,150,105,.12)',
    tags: ['Networking', 'Security', 'Infrastructure'],
    duration: '22 min',
    image: 'images/vpc_diagram.jpg',
    imageCaption: 'VPC with public/private subnets, Internet Gateway, and NAT Gateway',
    sections: [
      {
        heading: 'What is a VPC?',
        body: `
<p>A VPC (Virtual Private Cloud) is your own <strong>isolated, private section of the AWS cloud</strong>. All AWS resources you launch — EC2 instances, Lambda functions (in a VPC), RDS databases — live inside a VPC. You fully control the IP address ranges, subnets, routing, and firewall rules.</p>
<p>Every AWS account gets a <strong>default VPC</strong> in every region, pre-configured so you can launch resources immediately. For production workloads you create a custom VPC with proper segmentation.</p>
<div class="info-box tip">💡 GradeSync's Lambda functions actually run in the default VPC. Understanding VPCs is critical for isolating databases from the internet and for EC2-based architectures.</div>

<h3>CIDR Blocks</h3>
<p>A CIDR (Classless Inter-Domain Routing) block defines the IP address range of a VPC or subnet. Common choices:</p>
<ul>
  <li><code>10.0.0.0/16</code> → 65,536 IP addresses for the VPC</li>
  <li><code>10.0.1.0/24</code> → 256 IPs for a subnet (AWS reserves 5, so 251 usable)</li>
</ul>
<p>The VPC block must be large enough to accommodate all your subnets.</p>`
      },
      {
        heading: 'Subnets, Routing & Gateways',
        body: `
<h3>Public vs Private Subnets</h3>
<ul>
  <li><strong>Public Subnet</strong> — has a route to an Internet Gateway. EC2 instances here can have public IPs and receive inbound internet traffic (e.g. web servers).</li>
  <li><strong>Private Subnet</strong> — no direct internet route. Instances here are only reachable from within the VPC (e.g. databases, application servers).</li>
</ul>

<h3>Internet Gateway (IGW)</h3>
<p>An IGW is attached to the VPC and allows resources in public subnets to communicate with the internet. Without an IGW, nothing inside can reach the outside world at all.</p>

<h3>NAT Gateway</h3>
<p>A NAT Gateway sits in the <em>public</em> subnet and lets instances in <em>private</em> subnets make outbound internet connections (e.g. downloading OS updates, calling external APIs) <strong>without being reachable from the internet</strong>.</p>
<p>Traffic flow for a private instance downloading from the internet:</p>
<div class="code-block"><pre>Private EC2 → Private Route Table → NAT Gateway (in public subnet)
           → Internet Gateway → Internet → Response returns</pre></div>

<h3>Route Tables</h3>
<p>Every subnet is associated with a route table. Route tables contain rules controlling where network traffic is directed:</p>
<table class="concept-table concept-table-wrap"><thead><tr><th>Route Table</th><th>Destination</th><th>Target</th></tr></thead><tbody>
<tr><td>Public RT</td><td>10.0.0.0/16</td><td>local (within VPC)</td></tr>
<tr><td>Public RT</td><td>0.0.0.0/0</td><td>Internet Gateway</td></tr>
<tr><td>Private RT</td><td>10.0.0.0/16</td><td>local</td></tr>
<tr><td>Private RT</td><td>0.0.0.0/0</td><td>NAT Gateway</td></tr>
</tbody></table>`
      },
      {
        heading: 'Security Groups & NACLs',
        body: `
<h3>Security Groups (Instance-level Firewall)</h3>
<p>A Security Group acts as a virtual firewall for an EC2 instance or Lambda. You define inbound and outbound rules specifying allowed traffic.</p>
<ul>
  <li><strong>Stateful</strong> — if you allow inbound traffic on port 80, the return response on an ephemeral port is automatically allowed (no separate outbound rule needed).</li>
  <li>Rules are <em>allow only</em> — you cannot explicitly deny specific IPs.</li>
  <li>Multiple SGs can be attached to one instance.</li>
</ul>
<div class="code-block"><div class="code-label">Example Security Group Rules</div><pre>Inbound:
  Type: HTTP    Protocol: TCP  Port: 80   Source: 0.0.0.0/0 (anyone)
  Type: SSH     Protocol: TCP  Port: 22   Source: 203.x.x.x/32 (your IP only)

Outbound:
  Type: All Traffic  Protocol: All  Port: All  Destination: 0.0.0.0/0</pre></div>

<h3>Network ACLs (Subnet-level Firewall)</h3>
<p>NACLs operate at the subnet boundary. They are evaluated before traffic reaches instances.</p>
<ul>
  <li><strong>Stateless</strong> — you must explicitly allow both the inbound request AND the outbound response (ephemeral ports 1024–65535).</li>
  <li>Support both Allow and Deny rules.</li>
  <li>Rules are evaluated in order, lowest number first. First matching rule wins.</li>
</ul>

<table class="concept-table concept-table-wrap"><thead><tr><th></th><th>Security Group</th><th>NACL</th></tr></thead><tbody>
<tr><td>Level</td><td>Instance</td><td>Subnet</td></tr>
<tr><td>Type</td><td>Stateful</td><td>Stateless</td></tr>
<tr><td>Rules</td><td>Allow only</td><td>Allow + Deny</td></tr>
<tr><td>Evaluation</td><td>All rules checked</td><td>Lowest-number rule wins</td></tr>
<tr><td>Default</td><td>Deny all in</td><td>Allow all</td></tr>
</tbody></table>`
      },
      {
        heading: 'Bastion Hosts & EC2 Connection',
        body: `
<h3>The Bastion / Jump Host Pattern</h3>
<p>Since private EC2 instances have no public IP, you cannot SSH into them directly from the internet. A <strong>Bastion host</strong> (also called a Jump server) is a public EC2 instance that acts as a secure relay:</p>
<div class="code-block"><pre>Your PC (internet)
    → SSH into Bastion (public subnet, public IP)
        → SSH from Bastion to Private EC2 (private IP, same VPC)
</pre></div>
<ul>
  <li>The bastion's Security Group allows SSH (port 22) from <em>your IP only</em>.</li>
  <li>The private instance's Security Group allows SSH from the <em>bastion's private IP</em> only.</li>
  <li>The private instance can still download packages via the NAT Gateway.</li>
</ul>
<div class="info-box note">📌 For production, use <strong>AWS Systems Manager Session Manager</strong> instead of Bastion hosts — it gives you browser-based shell access without opening port 22 at all.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Create the VPC', detail: 'Go to <strong>VPC → Your VPCs → Create VPC</strong>. Select <em>VPC only</em>. Name: <code>aws-vpc</code>. IPv4 CIDR: <code>10.0.0.0/16</code>. Click <strong>Create VPC</strong>.' },
      { n: 2, title: 'Create a Public Subnet', detail: 'Go to <strong>Subnets → Create subnet</strong>. Select your VPC. Name: <code>aws-public-subnet1</code>. Pick an Availability Zone. CIDR: <code>10.0.1.0/24</code>. Click <strong>Create subnet</strong>.' },
      { n: 3, title: 'Create a Private Subnet', detail: 'Repeat. Name: <code>aws-private-subnet1</code>. Different or same AZ. CIDR: <code>10.0.2.0/24</code>.' },
      { n: 4, title: 'Create & Attach an Internet Gateway', detail: 'Go to <strong>Internet Gateways → Create internet gateway</strong>. Name: <code>aws-IG</code>. Click <strong>Create</strong>. Then click <strong>Actions → Attach to VPC</strong> and select your VPC.' },
      { n: 5, title: 'Create Public Route Table', detail: 'Go to <strong>Route Tables → Create route table</strong>. Name: <code>aws-Default-RT</code>. VPC: your VPC. Click <strong>Edit routes → Add route</strong>: Destination <code>0.0.0.0/0</code>, Target: your Internet Gateway.' },
      { n: 6, title: 'Associate Public Subnet to Public Route Table', detail: 'In the route table → <strong>Subnet associations → Edit subnet associations</strong>. Check <code>aws-public-subnet1</code>. Save.' },
      { n: 7, title: 'Create Private Route Table', detail: 'Create another route table: <code>aws-Private-RT</code>. Associate <code>aws-private-subnet1</code>. Leave no internet route for now.' },
      { n: 8, title: 'Launch EC2 Instances to Test', detail: 'Launch one EC2 in the public subnet (enable <em>Auto-assign public IP</em> — this is your Bastion host). Launch another in the private subnet (no public IP). Use the same Key Pair for both.' },
      { n: 9, title: 'Create a NAT Gateway', detail: 'Go to <strong>NAT Gateways → Create NAT gateway</strong>. Subnet: <strong>public</strong> subnet. Allocate a new Elastic IP. Click <strong>Create NAT gateway</strong>. Wait for status: Available.' },
      { n: 10, title: 'Add NAT Route to Private Route Table', detail: 'Edit <code>aws-Private-RT</code> → <strong>Edit routes → Add route</strong>: Destination <code>0.0.0.0/0</code>, Target: your NAT Gateway. Private instances can now download packages.' }
    ],
    quiz: [
      { q: 'What is the purpose of an Internet Gateway?', options: ['Connect two VPCs together', 'Connect a VPC to the public internet', 'Encrypt traffic between subnets', 'Route traffic within the VPC'], answer: 1 },
      { q: 'A private subnet differs from a public subnet because it...', options: ['Has no CIDR block', 'Has a route to an Internet Gateway', 'Has no route to an Internet Gateway', 'Cannot have EC2 instances'], answer: 2 },
      { q: 'Security Groups are...', options: ['Stateless at subnet level', 'Stateful at instance level', 'Stateless at instance level', 'Stateful at subnet level'], answer: 1 },
      { q: 'Why is a NAT Gateway placed in the public subnet?', options: ['Because it is expensive and public subnets are cheaper', 'So it can access the internet via the IGW to forward private instance traffic', 'Because private subnets have no IP addresses', 'Because NAT Gateways only work with public IPs'], answer: 1 },
      { q: 'CIDR block 10.0.0.0/16 provides how many IP addresses?', options: ['256', '1024', '4096', '65536'], answer: 3 }
    ]
  },

  // ── Lambda ──────────────────────────────────────────────────────────────────
  {
    id: 'lambda',
    title: 'AWS Lambda',
    subtitle: 'Serverless Functions',
    description: 'Write event-driven functions without managing servers. Understand handlers, triggers, cold starts, layers, environment variables, and CloudWatch monitoring.',
    icon: 'λ',
    color: '#7c3aed',
    colorBg: 'rgba(124,58,237,.12)',
    tags: ['Compute', 'Serverless', 'Events'],
    duration: '18 min',
    image: 'images/lambda_diagram.jpg',
    imageCaption: 'Lambda: triggered by events (S3, API GW, SNS...) — scales automatically — no servers to manage',
    sections: [
      {
        heading: 'What is AWS Lambda?',
        body: `
<p>AWS Lambda is a <strong>serverless, event-driven compute service</strong>. You write code in a function (Python, Node.js, Go, Java, Ruby, .NET, or a custom runtime). AWS automatically provisions infrastructure, runs your code when triggered, and scales it — from zero to thousands of concurrent executions — with no configuration.</p>
<p>You pay only for the compute time consumed. When the function is not running, you pay nothing.</p>

<p>GradeSync uses two Lambda functions:</p>
<ul>
  <li><strong>gradesync-presign-url</strong> — triggered by API Gateway HTTP request, generates a secure S3 presigned URL for uploading a JSON record</li>
  <li><strong>gradesync-record-processor</strong> — triggered when a JSON file is created in S3, reads it, writes to DynamoDB, and sends an SNS email notification</li>
</ul>

<h3>Lambda Limits (defaults)</h3>
<table class="concept-table concept-table-wrap"><thead><tr><th>Limit</th><th>Default</th></tr></thead><tbody>
<tr><td>Max execution timeout</td><td>15 minutes</td></tr>
<tr><td>Memory</td><td>128 MB – 10,240 MB</td></tr>
<tr><td>Deployment package size (zip)</td><td>50 MB compressed, 250 MB unzipped</td></tr>
<tr><td>Ephemeral storage (/tmp)</td><td>512 MB – 10 GB</td></tr>
<tr><td>Concurrent executions (account)</td><td>1,000 (can be raised)</td></tr>
</tbody></table>`
      },
      {
        heading: 'Handler, Event & Context',
        body: `
<p>Every Lambda function has a <strong>handler function</strong> — the entry point AWS invokes. In Python, the convention is <code>lambda_handler(event, context)</code>.</p>
<div class="code-block"><div class="code-label">Python — Simple planet example (from Lambda Simple Example)</div><pre>import json

def lambda_handler(event, context):
    planet = event.get('planet', '')

    if planet == 'Earth':
        return 'Moon is the satellite of Earth'
    elif planet == 'Jupiter':
        return 'Europa is the satellite'
    elif planet == 'Sun':
        return 'This is not a planet'
    else:
        return 'Unable to recognize your argument'</pre></div>

<p>Test this in the Lambda console by creating Test Events:</p>
<div class="code-block"><div class="code-label">Test Event JSONs</div><pre>{ "planet": "Earth" }      → "Moon is the satellite of Earth"
{ "planet": "Jupiter" }    → "Europa is the satellite"
{ "planet": "ITM Gwalior" } → "Unable to recognize your argument"</pre></div>

<h3>The Event Object</h3>
<p>The <code>event</code> is a Python dictionary containing data about what triggered the function:</p>
<div class="code-block"><div class="code-label">S3 Trigger Event Structure</div><pre>event = {
    "Records": [{
        "eventName": "ObjectCreated:Put",
        "s3": {
            "bucket": {"name": "arjuna9005"},
            "object": {"key": "records/abc123.json", "size": 1024}
        }
    }]
}
# Access it:
bucket = event['Records'][0]['s3']['bucket']['name']
key    = event['Records'][0]['s3']['object']['key']</pre></div>

<h3>Context Object</h3>
<p>The <code>context</code> parameter provides runtime information:</p>
<ul>
  <li><code>context.function_name</code> — name of the Lambda function</li>
  <li><code>context.memory_limit_in_mb</code> — configured memory</li>
  <li><code>context.get_remaining_time_in_millis()</code> — time left before timeout</li>
</ul>`
      },
      {
        heading: 'Cold Starts, Warm Starts & Best Practices',
        body: `
<h3>Execution Environment Lifecycle</h3>
<p>When Lambda receives a trigger it either:</p>
<ol>
  <li><strong>Creates a new execution environment</strong> (cold start) — allocates memory, downloads your code, imports modules, runs global/initialization code, then calls the handler.</li>
  <li><strong>Reuses an existing environment</strong> (warm start) — skips the initialization, calls the handler directly. Much faster.</li>
</ol>
<p>Cold starts add anywhere from ~100ms to ~1s of extra latency depending on your runtime and package size.</p>

<h3>Best Practices</h3>
<div class="code-block"><div class="code-label">Python — Initialize clients OUTSIDE the handler (warm start optimization)</div><pre>import boto3
import os
from decimal import Decimal

<span class="comment"># These run once on cold start and are REUSED on warm starts</span>
s3     = boto3.client('s3')
sns    = boto3.client('sns')
TABLE  = boto3.resource('dynamodb').Table(os.environ['TABLE_NAME'])
TOPIC  = os.environ['SNS_TOPIC_ARN']

def lambda_handler(event, context):
    <span class="comment"># Handler is called on every invocation</span>
    key = event['Records'][0]['s3']['object']['key']
    obj = s3.get_object(Bucket=os.environ['BUCKET_NAME'], Key=key)
    data = json.loads(obj['Body'].read())
    TABLE.put_item(Item=convert_to_decimal(data))
    sns.publish(TopicArn=TOPIC, Message="New record processed: " + key)</pre></div>

<ul>
  <li>Use <strong>environment variables</strong> for bucket names, table names, ARNs — never hardcode them.</li>
  <li>Keep deployment packages small. Avoid bundling large libraries unless necessary.</li>
  <li>Set an appropriate <strong>timeout</strong> — don't leave it at the default 3s if your function needs longer.</li>
  <li>Set <strong>memory</strong> appropriately — more memory also means more CPU.</li>
</ul>`
      },
      {
        heading: 'Monitoring with CloudWatch',
        body: `
<p>Every Lambda function automatically sends logs and metrics to <strong>Amazon CloudWatch</strong>.</p>
<h3>CloudWatch Logs</h3>
<p>All <code>print()</code> statements and exceptions in your Lambda code appear in CloudWatch Logs. Each function has a Log Group (<code>/aws/lambda/function-name</code>) with Log Streams (one per execution environment).</p>
<div class="code-block"><div class="code-label">In your Lambda code</div><pre>def lambda_handler(event, context):
    print("Starting function")       # Shows in CloudWatch
    print(f"Event: {event}")         # Logs the full trigger event
    try:
        result = process(event)
        print(f"Success: {result}")
    except Exception as e:
        print(f"ERROR: {str(e)}")    # Exception details
        raise                        # Re-raise so Lambda marks it as failed</pre></div>

<h3>CloudWatch Metrics</h3>
<p>Lambda automatically publishes these metrics to CloudWatch:</p>
<ul>
  <li><strong>Invocations</strong> — total number of times the function was called</li>
  <li><strong>Errors</strong> — number of failed invocations</li>
  <li><strong>Duration</strong> — execution time in milliseconds</li>
  <li><strong>Throttles</strong> — times the function was rate-limited</li>
  <li><strong>ConcurrentExecutions</strong> — number of simultaneous executions</li>
</ul>
<div class="info-box tip">💡 You can set CloudWatch Alarms on the <em>Errors</em> metric — send an SNS notification if your Lambda starts failing. This is free basic monitoring.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Open Lambda in the AWS Console', detail: 'Search "Lambda" in the AWS Console. Click <strong>Create function</strong>.' },
      { n: 2, title: 'Select "Author from scratch"', detail: 'Enter function name (e.g. <code>my-first-lambda</code>). Runtime: <strong>Python 3.12</strong>. Architecture: x86_64.' },
      { n: 3, title: 'Set execution role', detail: 'Choose <strong>Create a new role with basic Lambda permissions</strong>. This grants CloudWatch Logs access automatically.' },
      { n: 4, title: 'Click "Create function"', detail: 'AWS creates the function with a basic "Hello from Lambda" stub.' },
      { n: 5, title: 'Write your handler code', detail: 'In the <strong>Code</strong> tab, edit <code>lambda_function.py</code>. Paste the planet example above. Always save the handler format: <code>def lambda_handler(event, context):</code>.' },
      { n: 6, title: 'Click "Deploy"', detail: 'Click the orange <strong>Deploy</strong> button. Your code is live. Without deploying, changes are not active.' },
      { n: 7, title: 'Create a Test Event and run it', detail: 'Click the dropdown arrow next to <strong>Test → Configure test event</strong>. Enter event name. Paste JSON (e.g. <code>{"planet": "Earth"}</code>). Click <strong>Test</strong>. View the output and logs.' },
      { n: 8, title: 'Add Environment Variables', detail: 'Go to <strong>Configuration → Environment variables → Edit</strong>. Add key-value pairs: <code>TABLE_NAME = student-records</code>. In your code: <code>os.environ["TABLE_NAME"]</code>.' },
      { n: 9, title: 'Set Timeout and Memory', detail: 'In <strong>Configuration → General configuration → Edit</strong>. Set Timeout to 30 seconds (default 3s is too low). Set Memory as needed (minimum 128 MB).' },
      { n: 10, title: 'Add a Trigger', detail: 'Click <strong>+ Add trigger</strong>. Select trigger source (S3, API Gateway, SNS...). For S3: select your bucket, event type <em>ObjectCreated</em>, prefix/suffix filters. Click <strong>Add</strong>.' }
    ],
    quiz: [
      { q: 'What triggers the record_processor Lambda in GradeSync?', options: ['An API Gateway HTTP request', 'A scheduled CloudWatch cron', 'An S3 ObjectCreated event', 'A DynamoDB stream'], answer: 2 },
      { q: 'What is a Lambda "cold start"?', options: ['A Lambda running in a cold region', 'Initial latency when AWS creates a new execution environment', 'A function that timed out', 'Running Lambda without a VPC'], answer: 1 },
      { q: 'Where should you initialize boto3 clients for best performance?', options: ['Inside the handler function', 'In a separate .env file', 'Outside the handler (module scope), so they are reused', 'You should never reuse them'], answer: 2 },
      { q: 'What is the maximum execution timeout for a Lambda function?', options: ['1 minute', '5 minutes', '15 minutes', '1 hour'], answer: 2 },
      { q: 'Where do Lambda print() statements appear?', options: ['In the S3 access logs', 'In Amazon CloudWatch Logs', 'In the AWS Console terminal', 'In DynamoDB streams'], answer: 1 }
    ]
  },

  // ── DynamoDB ────────────────────────────────────────────────────────────────
  {
    id: 'dynamodb',
    title: 'Amazon DynamoDB',
    subtitle: 'Serverless NoSQL Database',
    description: 'Master key-value and document storage. Learn primary keys, capacity modes, scan vs query, GSIs, TTL, and the float/Decimal issue in Python.',
    icon: '◈',
    color: '#0891b2',
    colorBg: 'rgba(8,145,178,.12)',
    tags: ['Database', 'NoSQL', 'Serverless'],
    duration: '16 min',
    sections: [
      {
        heading: 'What is DynamoDB?',
        body: `
<p>Amazon DynamoDB is a fully managed <strong>serverless NoSQL database</strong>. It provides single-digit millisecond performance at any scale — whether you have 10 records or 10 billion. No OS to patch, no server to manage, no schema migrations.</p>

<table class="concept-table concept-table-wrap"><thead><tr><th>SQL Concept</th><th>DynamoDB Equivalent</th></tr></thead><tbody>
<tr><td>Database</td><td>Table</td></tr>
<tr><td>Row / Record</td><td>Item</td></tr>
<tr><td>Column</td><td>Attribute</td></tr>
<tr><td>Primary Key</td><td>Partition Key (+ optional Sort Key)</td></tr>
<tr><td>Index</td><td>GSI (Global Secondary Index) / LSI</td></tr>
<tr><td>JOIN</td><td>Not supported — model data differently</td></tr>
<tr><td>Schema</td><td>Schema-less (only keys are fixed)</td></tr>
</tbody></table>
<div class="info-box tip">💡 GradeSync's <code>student-records</code> table uses a <code>id</code> (UUID string) as the Partition Key. Each item can have different attributes — some may have <code>percentage</code>, others may not.</div>`
      },
      {
        heading: 'Primary Keys, Capacity & Billing',
        body: `
<h3>Partition Key (Hash Key)</h3>
<p>Required. Uniquely identifies each item. DynamoDB hashes this value to determine which internal partition stores the item. Choosing a high-cardinality partition key (like a UUID) ensures data is spread evenly.</p>

<h3>Sort Key (Range Key)</h3>
<p>Optional. Combined with the partition key it creates a <em>composite primary key</em>. Useful for one-to-many: <code>userId</code> (partition) + <code>timestamp</code> (sort). Within a partition, items are sorted by the sort key.</p>

<h3>Billing Modes</h3>
<table class="concept-table concept-table-wrap"><thead><tr><th>Mode</th><th>How it works</th><th>Best for</th></tr></thead><tbody>
<tr><td><strong>On-Demand</strong></td><td>Pay per read/write request. No capacity planning.</td><td>Unpredictable or new workloads</td></tr>
<tr><td><strong>Provisioned</strong></td><td>Set Read Capacity Units (RCU) and Write Capacity Units (WCU). Pay for reserved capacity.</td><td>Predictable, steady traffic</td></tr>
</tbody></table>
<p><strong>Read Capacity Unit (RCU)</strong>: 1 strongly consistent read per second for items up to 4 KB. <br>
<strong>Write Capacity Unit (WCU)</strong>: 1 write per second for items up to 1 KB.</p>`
      },
      {
        heading: 'Scan vs Query & Global Secondary Indexes',
        body: `
<h3>Query</h3>
<p>Retrieves items by <strong>Partition Key</strong> (required) and optionally filters by Sort Key. Extremely fast and cost-effective — only reads the requested partition.</p>

<h3>Scan</h3>
<p>Reads <strong>every single item</strong> in the table and then optionally filters. Slow and expensive for large tables — you pay for every item read, even those filtered out.</p>
<div class="info-box note">📌 GradeSync's <code>list_records</code> Lambda uses a <code>Scan</code> because the table is small in a demo. In production with millions of records, use a GSI + Query.</div>

<h3>Global Secondary Index (GSI)</h3>
<p>A GSI is an alternate index on different attributes, letting you query on non-primary-key attributes efficiently. You define a new Partition Key (and optional Sort Key) for the GSI.</p>
<div class="code-block"><div class="code-label">Example: GSI to query records by upload date</div><pre>Table: student-records
  Primary Key: id (String)

GSI: uploadedAt-index
  GSI Partition Key: uploadedAt (String, e.g. "2025-09-14")
  GSI Sort Key: id (String)

Query:
  aws dynamodb query \
    --table-name student-records \
    --index-name uploadedAt-index \
    --key-condition-expression "uploadedAt = :d" \
    --expression-attribute-values '{":d":{"S":"2025-09-14"}}'</pre></div>`
      },
      {
        heading: 'TTL, Streams & the Decimal Bug',
        body: `
<h3>TTL — Time to Live</h3>
<p>TTL is a DynamoDB feature that automatically deletes expired items, keeping your table lean without manual cleanup. You designate a Unix timestamp attribute (e.g. <code>expiresAt</code>) and DynamoDB deletes items whose <code>expiresAt</code> is in the past (within ~48 hours of expiry).</p>
<div class="code-block"><div class="code-label">Python — Setting a TTL on an item (expire in 30 days)</div><pre>import time
from decimal import Decimal

expires_at = int(time.time()) + (30 * 24 * 60 * 60)  # 30 days from now

table.put_item(Item={
    'id': 'abc123',
    'name': 'Alice',
    'expiresAt': Decimal(expires_at)
})</pre></div>

<h3>DynamoDB Streams</h3>
<p>Streams capture a time-ordered sequence of item-level changes in a DynamoDB table. Each change (insert, update, delete) produces a stream record. Lambda can read from these streams to trigger downstream processing — a powerful pattern for event-driven architectures.</p>

<h3>The Float → Decimal Bug in Python boto3</h3>
<p>This is a famous gotcha. The Python SDK (<code>boto3</code>) requires numeric values with decimal points to be passed as <code>Decimal</code>, not Python's native <code>float</code>. Passing a float raises a <code>TypeError: Float types are not supported</code>.</p>
<div class="code-block"><div class="code-label">Wrong vs Correct</div><pre>from decimal import Decimal

# ❌ FAILS — boto3 raises TypeError
item['percentage'] = 86.5

# ✅ WORKS — convert to string first to avoid floating-point drift
item['percentage'] = Decimal(str(86.5))

# ── Recursive helper for nested dicts ────────────────────
def to_decimal(obj):
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [to_decimal(i) for i in obj]
    return obj</pre></div>`
      }
    ],
    steps: [
      { n: 1, title: 'Open DynamoDB in the Console', detail: 'Search "DynamoDB" in the AWS Console. Click <strong>Create table</strong>.' },
      { n: 2, title: 'Set table name and partition key', detail: 'Table name: <code>student-records</code>. Partition key: <code>id</code>, type <strong>String</strong>. Leave sort key empty for GradeSync.' },
      { n: 3, title: 'Choose billing mode', detail: 'Expand <strong>Table settings → Capacity mode</strong>. Select <strong>On-demand</strong>. Click <strong>Create table</strong>. Wait ~30 seconds for status: Active.' },
      { n: 4, title: 'Explore the table', detail: 'Click your table → <strong>Explore table items</strong>. Initially empty. After running GradeSync, items will appear here automatically.' },
      { n: 5, title: 'Create an item manually', detail: 'Click <strong>Create item</strong> in the item explorer. Add attributes: <code>id</code> (String, e.g. <code>test-001</code>), <code>name</code> (String), <code>grade</code> (String). Click <strong>Create item</strong>.' },
      { n: 6, title: 'Run a Scan', detail: 'In <strong>Explore table items</strong>, choose <strong>Scan</strong> in the dropdown. Click <strong>Run</strong>. All items are returned. Try adding a filter expression.' },
      { n: 7, title: 'Add a GSI (optional)', detail: 'Go to <strong>Indexes → Create index</strong>. Choose an attribute to index (e.g. <code>uploadedAt</code>). Give it a name. This lets you query by date efficiently.' },
      { n: 8, title: 'Enable TTL (optional)', detail: 'Go to <strong>Additional settings → Time to Live (TTL) → Enable</strong>. Enter the attribute name that holds the expiry timestamp (e.g. <code>expiresAt</code>).' }
    ],
    quiz: [
      { q: 'Which DynamoDB operation reads every item in the table?', options: ['Query', 'GetItem', 'Scan', 'BatchGetItem'], answer: 2 },
      { q: 'What is required when creating a DynamoDB table?', options: ['Sort Key', 'Partition Key', 'A Global Secondary Index', 'A full schema definition'], answer: 1 },
      { q: 'In Python boto3, what type must floating-point DynamoDB values be?', options: ['float', 'double', 'Decimal', 'String'], answer: 2 },
      { q: 'What does TTL (Time to Live) do in DynamoDB?', options: ['Speeds up queries', 'Automatically deletes items after their expiry timestamp passes', 'Encrypts old items', 'Compresses items to save space'], answer: 1 },
      { q: 'A Global Secondary Index (GSI) allows you to...', options: ['Speed up Scans on large tables', 'Query DynamoDB efficiently on non-primary-key attributes', 'Join two DynamoDB tables', 'Replicate data to another region'], answer: 1 }
    ]
  },

  // ── SNS & SQS ───────────────────────────────────────────────────────────────
  {
    id: 'sns',
    title: 'Amazon SNS & SQS',
    subtitle: 'Notifications & Messaging',
    description: 'Send emails and SMS with SNS pub/sub. Decouple services with SQS queues. Learn fan-out, dead-letter queues, and FIFO.',
    icon: '✉️',
    color: '#be185d',
    colorBg: 'rgba(190,24,93,.12)',
    tags: ['Messaging', 'Pub/Sub', 'Notifications'],
    duration: '14 min',
    sections: [
      {
        heading: 'Amazon SNS — Pub/Sub Notifications',
        body: `
<p>Amazon SNS (Simple Notification Service) is a fully managed <strong>push-based pub/sub service</strong>. A <em>publisher</em> sends one message to a <em>Topic</em>, and SNS simultaneously delivers it to all <em>subscribers</em> — this is called <strong>fan-out</strong>.</p>

<p>In GradeSync: <code>record_processor</code> Lambda (publisher) → SNS Topic (grade-notifications) → your email address (subscriber).</p>

<h3>Subscription Protocols</h3>
<table class="concept-table concept-table-wrap"><thead><tr><th>Protocol</th><th>Use Case</th></tr></thead><tbody>
<tr><td>Email / Email-JSON</td><td>Send human-readable notifications to email addresses</td></tr>
<tr><td>SMS</td><td>Send text messages to phone numbers</td></tr>
<tr><td>HTTP / HTTPS</td><td>POST messages to a webhook endpoint</td></tr>
<tr><td>Amazon SQS</td><td>Enqueue messages for async processing</td></tr>
<tr><td>AWS Lambda</td><td>Invoke a Lambda function with the message payload</td></tr>
<tr><td>Amazon Kinesis</td><td>Stream messages for analytics</td></tr>
</tbody></table>

<div class="info-box note">📌 <strong>Email confirmation required.</strong> When you subscribe an email address, AWS sends a confirmation email. The subscription stays in <em>PendingConfirmation</em> until you click the confirmation link. No messages are delivered until confirmed. Check your spam folder!</div>`
      },
      {
        heading: 'Publishing Messages via Python',
        body: `
<p>In GradeSync, the <code>record_processor</code> Lambda uses <code>boto3</code> to publish to SNS after writing to DynamoDB:</p>
<div class="code-block"><div class="code-label">Python — SNS publish in Lambda</div><pre>import boto3, os, json

sns = boto3.client('sns', region_name='ap-south-1')
TOPIC_ARN = os.environ['SNS_TOPIC_ARN']

def lambda_handler(event, context):
    # ... process record, write to DynamoDB ...

    student_name = data.get('name', 'Unknown')
    grade = data.get('grade', 'N/A')

    sns.publish(
        TopicArn=TOPIC_ARN,
        Subject='New Grade Record Added',
        Message=f'Student {student_name} received grade {grade}.\nRecord ID: {record_id}'
    )
    print("SNS notification sent")</pre></div>

<h3>Message Filtering</h3>
<p>You can add a filter policy to a subscription so it only receives messages matching certain attributes. For example, only receive notifications where <code>grade = "A"</code>. This reduces noise for subscribers who only care about specific events.</p>
<div class="code-block"><div class="code-label">Filter policy (applied on the subscription)</div><pre>{
    "grade": ["A", "A+"]
}</pre></div>`
      },
      {
        heading: 'Amazon SQS — Message Queuing',
        body: `
<p>Amazon SQS (Simple Queue Service) is a fully managed <strong>pull-based message queue</strong>. Producers put messages in, consumers poll the queue and process them. Unlike SNS, messages persist in the queue until consumed or expired.</p>

<table class="concept-table concept-table-wrap"><thead><tr><th>Feature</th><th>SNS (Push)</th><th>SQS (Pull)</th></tr></thead><tbody>
<tr><td>Delivery model</td><td>Push to all subscribers immediately</td><td>Consumer polls at its own pace</td></tr>
<tr><td>Persistence</td><td>No — fire and forget</td><td>Yes — up to 14 days</td></tr>
<tr><td>Use case</td><td>Notifications, fan-out</td><td>Decoupled async processing</td></tr>
<tr><td>Multiple consumers</td><td>Yes (all receive same message)</td><td>No — each message delivered to ONE consumer</td></tr>
</tbody></table>

<h3>Queue Types</h3>
<ul>
  <li><strong>Standard Queue</strong> — nearly unlimited throughput, at-least-once delivery, best-effort ordering.</li>
  <li><strong>FIFO Queue</strong> — exactly-once processing, strict ordering. Throughput limited to 3,000 messages/second with batching.</li>
</ul>

<h3>Dead Letter Queues (DLQ)</h3>
<p>A DLQ is a secondary SQS queue that receives messages which failed processing after a maximum number of retries. Instead of messages disappearing silently on failure, they go to the DLQ where you can inspect and reprocess them.</p>
<div class="info-box tip">💡 Common pattern: <strong>SNS → SQS fan-out</strong>. SNS publishes to multiple SQS queues simultaneously, each consumed by a different Lambda function — independent parallel pipelines from one event.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Create an SNS Topic', detail: 'Go to <strong>SNS → Topics → Create topic</strong>. Type: <strong>Standard</strong>. Name: <code>grade-notifications</code>. Click <strong>Create topic</strong>. Copy the Topic ARN.' },
      { n: 2, title: 'Subscribe your email', detail: 'On the topic page, click <strong>Create subscription</strong>. Protocol: <strong>Email</strong>. Endpoint: your email address. Click <strong>Create subscription</strong>.' },
      { n: 3, title: 'Confirm the subscription', detail: 'Check your inbox (and spam). Find the AWS notification email. Click <strong>Confirm subscription</strong>. Status changes to <em>Confirmed</em>.' },
      { n: 4, title: 'Test with a manual publish', detail: 'Click <strong>Publish message</strong> on the topic. Enter a Subject and Message body. Click <strong>Publish</strong>. You should receive an email within seconds.' },
      { n: 5, title: 'Add SNS_TOPIC_ARN to Lambda environment', detail: 'In your Lambda function → <strong>Configuration → Environment variables</strong>. Add key <code>SNS_TOPIC_ARN</code> with the Topic ARN value.' },
      { n: 6, title: 'Grant Lambda permission to publish', detail: 'In your Lambda\'s IAM execution role, attach an inline or managed policy that allows <code>sns:Publish</code> on your specific topic ARN.' },
      { n: 7, title: 'Create an SQS Queue (optional, for decoupling)', detail: 'Go to <strong>SQS → Create queue</strong>. Type: <strong>Standard</strong>. Name your queue. Click <strong>Create queue</strong>. Subscribe the queue to your SNS topic for fan-out.' }
    ],
    quiz: [
      { q: 'What delivery model does SNS use?', options: ['Pull-based polling', 'Push-based pub/sub', 'Batch processing', 'Event sourcing'], answer: 1 },
      { q: 'Why did GradeSync initially not receive SNS emails?', options: ['Lambda had the wrong ARN', 'The SNS email subscription was not confirmed', 'DynamoDB blocked the event', 'The S3 bucket had no CORS configured'], answer: 1 },
      { q: 'What is a Dead Letter Queue (DLQ) used for?', options: ['Permanently deleting old messages', 'Storing messages that failed processing after max retries', 'Encrypting sensitive messages', 'Rate limiting producers'], answer: 1 },
      { q: 'An SQS FIFO queue differs from a Standard queue in that it...', options: ['Is cheaper', 'Delivers each message to all consumers', 'Guarantees exactly-once processing and strict ordering', 'Supports unlimited throughput'], answer: 2 },
      { q: 'In the SNS fan-out pattern, one SNS message is sent to...', options: ['A single Lambda function', 'Multiple SQS queues or subscribers simultaneously', 'Only email endpoints', 'A single DynamoDB table'], answer: 1 }
    ]
  },

  // ── IAM ─────────────────────────────────────────────────────────────────────
  {
    id: 'iam',
    title: 'AWS IAM',
    subtitle: 'Identity & Access Management',
    description: 'Control who can do what in your AWS account. Master users, roles, policies, Least Privilege, and STS assume-role.',
    icon: '🔐',
    color: '#ca8a04',
    colorBg: 'rgba(202,138,4,.12)',
    tags: ['Security', 'Identity', 'Permissions'],
    duration: '16 min',
    sections: [
      {
        heading: 'What is IAM?',
        body: `
<p>IAM (Identity and Access Management) is the global AWS service that controls <strong>who is authenticated (identity) and what they are authorized to do (permissions)</strong>. Every single API call in AWS — creating a bucket, writing to DynamoDB, invoking Lambda — is checked against IAM before it executes.</p>

<table class="concept-table concept-table-wrap"><thead><tr><th>Concept</th><th>Description</th><th>Credential Type</th></tr></thead><tbody>
<tr><td>IAM User</td><td>Human identity (developer, admin) with permanent credentials</td><td>Password + Access Key</td></tr>
<tr><td>IAM Group</td><td>Collection of Users sharing the same policies</td><td>None (inherits from users)</td></tr>
<tr><td>IAM Role</td><td>Set of permissions assumed temporarily by services or users</td><td>Temporary (STS tokens)</td></tr>
<tr><td>IAM Policy</td><td>JSON document defining allowed/denied actions on resources</td><td>N/A — attached to identities</td></tr>
</tbody></table>

<div class="info-box good">✅ In GradeSync, Lambda functions use an <strong>IAM Role</strong> (<code>GradeSyncLambdaRole</code>) to access S3, DynamoDB, and SNS — no hardcoded credentials anywhere in the code.</div>`
      },
      {
        heading: 'Policies in Depth',
        body: `
<h3>Policy Structure</h3>
<div class="code-block"><div class="code-label">IAM Policy JSON</div><pre>{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowRecordsAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::arjuna9005/records/*"
        },
        {
            "Sid": "AllowDynamoDB",
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:Scan",
                "dynamodb:GetItem"
            ],
            "Resource": "arn:aws:dynamodb:ap-south-1:*:table/student-records"
        }
    ]
}</pre></div>

<h3>Policy Types</h3>
<ul>
  <li><strong>AWS Managed Policies</strong> — pre-built by AWS (e.g. <code>AmazonS3FullAccess</code>). Easy to use but often over-permissive.</li>
  <li><strong>Customer Managed Policies</strong> — you create and maintain them. Recommended for production — precise and reusable.</li>
  <li><strong>Inline Policies</strong> — embedded directly in a user/role. One-to-one relationship. Not reusable.</li>
  <li><strong>Resource-based Policies</strong> — attached to the resource itself (e.g. S3 Bucket Policy, SQS Queue Policy). Controls who can access the resource.</li>
</ul>`
      },
      {
        heading: 'Least Privilege & Policy Evaluation',
        body: `
<h3>Principle of Least Privilege</h3>
<p>Grant <em>only</em> the minimum permissions needed to perform a task. Nothing more.</p>
<ul>
  <li>Instead of <code>s3:*</code> on <code>*</code> — use <code>s3:GetObject, s3:PutObject</code> on <code>arjuna9005/records/*</code></li>
  <li>Instead of <code>dynamodb:*</code> — use only <code>PutItem, Scan, GetItem</code> on the specific table ARN</li>
</ul>
<p>This limits the blast radius if credentials are ever leaked or an application is compromised.</p>

<h3>Policy Evaluation Logic (in order)</h3>
<ol>
  <li>Is there an explicit <strong>Deny</strong>? → <strong>Deny</strong> immediately, no exceptions.</li>
  <li>Is there an explicit <strong>Allow</strong>? → <strong>Allow</strong>.</li>
  <li>Otherwise → <strong>Implicit Deny</strong> (default).</li>
</ol>
<div class="info-box note">📌 An explicit Deny always wins — even if another policy grants Allow for the same action.</div>

<h3>IAM Roles vs Users — When to Use What</h3>
<table class="concept-table concept-table-wrap"><thead><tr><th>Scenario</th><th>Use</th></tr></thead><tbody>
<tr><td>Developer logging into the console</td><td>IAM User (or SSO)</td></tr>
<tr><td>CLI access for running scripts</td><td>IAM User with Access Key</td></tr>
<tr><td>Lambda function accessing S3/DynamoDB</td><td>IAM Role (attached to Lambda)</td></tr>
<tr><td>EC2 instance calling AWS APIs</td><td>IAM Role (instance profile)</td></tr>
<tr><td>Cross-account access</td><td>IAM Role assumed via STS</td></tr>
</tbody></table>`
      },
      {
        heading: 'STS — Assume Role & Temporary Credentials',
        body: `
<h3>AWS STS (Security Token Service)</h3>
<p>STS issues <strong>temporary security credentials</strong> (access key + secret key + session token) valid for 15 minutes to 36 hours. AWS services (Lambda, EC2) automatically assume their attached role via STS — credentials are injected into the runtime environment transparently.</p>

<div class="code-block"><div class="code-label">Python — Manually assume a role (for cross-account access)</div><pre>import boto3

sts = boto3.client('sts')

response = sts.assume_role(
    RoleArn='arn:aws:iam::ACCOUNT_ID:role/SomeRole',
    RoleSessionName='MySession',
    DurationSeconds=3600
)

temp_creds = response['Credentials']
s3 = boto3.client(
    's3',
    aws_access_key_id=temp_creds['AccessKeyId'],
    aws_secret_access_key=temp_creds['SecretAccessKey'],
    aws_session_token=temp_creds['SessionToken']
)</pre></div>

<h3>MFA (Multi-Factor Authentication)</h3>
<p>You can enforce MFA for sensitive operations using IAM policies with a condition:</p>
<div class="code-block"><div class="code-label">IAM Policy condition requiring MFA</div><pre>{
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
        "BoolIfExists": {"aws:MultiFactorAuthPresent": "false"}
    }
}</pre></div>
<div class="info-box tip">💡 Always enable MFA on the AWS root account. Use IAM roles + STS for applications instead of long-lived access keys wherever possible.</div>`
      }
    ],
    steps: [
      { n: 1, title: 'Create an IAM Role for Lambda', detail: 'Go to <strong>IAM → Roles → Create role</strong>. Trusted entity: <strong>AWS service</strong>. Use case: <strong>Lambda</strong>. Click <strong>Next</strong>.' },
      { n: 2, title: 'Attach permissions', detail: 'Search and attach <code>AmazonS3FullAccess</code>, <code>AmazonDynamoDBFullAccess</code>, <code>AmazonSNSFullAccess</code>. For production: create a custom policy with only the specific actions.' },
      { n: 3, title: 'Name and create the role', detail: 'Role name: <code>GradeSyncLambdaRole</code>. Click <strong>Create role</strong>.' },
      { n: 4, title: 'Attach role to Lambda function', detail: 'Open your Lambda → <strong>Configuration → Permissions → Edit</strong>. Change Existing role to <code>GradeSyncLambdaRole</code>. Click <strong>Save</strong>.' },
      { n: 5, title: 'Create a custom least-privilege policy', detail: 'Go to <strong>IAM → Policies → Create policy → JSON</strong>. Paste a policy granting only the actions your Lambda needs (e.g. <code>s3:GetObject</code> on <code>arjuna9005/records/*</code>). Name it <code>GradeSyncLambdaPolicy</code>.' },
      { n: 6, title: 'Create an IAM User for CLI access', detail: 'Go to <strong>IAM → Users → Create user</strong>. Attach a policy. In <strong>Security credentials → Create access key → CLI</strong>. Download the CSV. Run <code>aws configure</code> with these keys.' },
      { n: 7, title: 'Enable MFA on your root account', detail: 'Log in as root → click your account name → <strong>Security credentials → Multi-factor authentication → Assign MFA device</strong>. Scan the QR code with an authenticator app.' }
    ],
    quiz: [
      { q: 'What is the Principle of Least Privilege?', options: ['Give all users full admin access for simplicity', 'Grant only the minimum permissions needed to perform a task', 'Use only AWS-managed policies', 'Never use IAM roles — only users'], answer: 1 },
      { q: 'Why does GradeSync\'s Lambda use an IAM Role instead of an IAM User?', options: ['Roles are cheaper', 'Roles provide temporary credentials — no long-term keys to leak', 'Roles support more services', 'IAM Users cannot access S3'], answer: 1 },
      { q: 'What happens if an IAM policy explicitly Denies an action?', options: ['The Deny can be overridden by an Allow in another policy', 'The Deny always wins — no exceptions', 'It logs the attempt but allows it', 'The request is queued for review'], answer: 1 },
      { q: 'What does AWS STS do?', options: ['Stores long-term credentials securely', 'Issues temporary security credentials via assume-role', 'Manages S3 bucket policies', 'Encrypts data at rest'], answer: 1 },
      { q: 'Which of these is a Resource-based Policy?', options: ['An IAM Role', 'An IAM User policy', 'An S3 Bucket Policy', 'An IAM Group policy'], answer: 2 }
    ]
  }

];

// ── State ─────────────────────────────────────────────────────────────────────

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
  nav.innerHTML = MODULES.map(function(m) {
    const prog = getProgress(m.id);
    const dot  = prog === 'done' ? '✓' : prog === 'partial' ? '·' : '';
    const active = STATE.currentModule && STATE.currentModule.id === m.id ? 'active' : '';
    return '<button class="module-nav-item ' + active + '" onclick="openModule(\'' + m.id + '\')">'
      + '<div class="nav-icon" style="background:' + m.colorBg + ';color:' + m.color + '">' + m.icon + '</div>'
      + '<div class="nav-info"><div class="nav-title">' + m.title + '</div><div class="nav-duration">' + m.duration + '</div></div>'
      + '<div class="nav-status ' + prog + '">' + dot + '</div>'
      + '</button>';
  }).join('');
}

// ── Sidebar Toggle ────────────────────────────────────────────────────────────

let sidebarOpen = true;

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('main');
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
    const prog  = getProgress(m.id);
    const badge = prog === 'done'    ? '<span class="card-badge badge-done">✓ Done</span>'
                : prog === 'partial' ? '<span class="card-badge badge-partial">In Progress</span>'
                : '';
    const tags  = (m.tags || []).map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('');
    return '<div class="module-card" onclick="openModule(\'' + m.id + '\')" role="button" tabindex="0">'
      + '<div class="card-top-bar" style="background:' + m.color + '"></div>'
      + '<div class="card-inner">'
      + '<div class="card-head"><div class="card-icon" style="background:' + m.colorBg + ';color:' + m.color + '">' + m.icon + '</div>' + (badge ? '<div>' + badge + '</div>' : '') + '</div>'
      + '<div class="card-title">' + m.title + '</div>'
      + '<div class="card-sub">' + m.subtitle + '</div>'
      + '<p class="card-desc">' + m.description + '</p>'
      + '<div class="card-tags">' + tags + '</div>'
      + '<div class="card-footer"><span class="card-time">⏱ ' + m.duration + '</span><span class="card-cta">Open Guide →</span></div>'
      + '</div></div>';
  }).join('');
}

// ── Module View ───────────────────────────────────────────────────────────────

function openModule(id) {
  const mod = MODULES.find(function(m) { return m.id === id; });
  if (!mod) return;
  STATE.currentModule  = mod;
  STATE.quizAnswers    = {};
  STATE.quizSubmitted  = false;

  if (getProgress(id) === 'none') setProgress(id, 'partial');

  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('module-view').classList.remove('hidden');
  document.getElementById('breadcrumb-sep').classList.remove('hidden');
  document.getElementById('breadcrumb-module').textContent = mod.title;

  const imgHtml  = mod.image
    ? '<div class="diagram-wrap"><img src="' + mod.image + '" alt="' + mod.title + ' diagram" loading="lazy"><div class="diagram-caption">' + (mod.imageCaption || '') + '</div></div>'
    : '';

  const sectHtml = mod.sections.map(function(s) {
    return '<div class="section"><h2>' + s.heading + '</h2>' + s.body + '</div>';
  }).join('');

  const stepsHtml = mod.steps ? buildSteps(mod) : '';
  const quizHtml  = buildQuiz(mod);

  document.getElementById('module-view').innerHTML =
    '<div class="module-header">'
      + '<div class="module-header-icon" style="background:' + mod.colorBg + ';color:' + mod.color + '">' + mod.icon + '</div>'
      + '<div><h1>' + mod.title + '</h1>'
      + '<p class="mod-sub">' + mod.subtitle + '</p>'
      + '<div class="module-meta">'
      + '<span>⏱ ' + mod.duration + '</span>'
      + '<span>🛠️ ' + (mod.steps ? mod.steps.length : 0) + ' steps</span>'
      + '<span>❓ ' + mod.quiz.length + ' questions</span>'
      + '</div></div></div>'
    + imgHtml
    + sectHtml
    + stepsHtml
    + quizHtml
    + '<div style="margin-top:36px;padding-top:20px;border-top:1px solid var(--border)">'
    + '<button class="nav-footer-btn" onclick="showHome()">← All Guides</button>'
    + '</div>';

  renderSidebar();
  attachCopyButtons();
  window.scrollTo(0, 0);
}

// ── Steps Builder ─────────────────────────────────────────────────────────────

function buildSteps(mod) {
  return '<div class="steps-section"><h2>🛠️ Hands-on Steps</h2>'
    + '<p class="steps-intro">Follow these steps in the AWS Console to set up ' + mod.title + ' yourself.</p>'
    + '<div class="steps-list">'
    + mod.steps.map(function(s) {
        return '<div class="step-item">'
          + '<div class="step-num">' + s.n + '</div>'
          + '<div class="step-body"><div class="step-title">' + s.title + '</div><div class="step-detail">' + s.detail + '</div></div>'
          + '</div>';
      }).join('')
    + '</div></div>';
}

// ── Quiz Builder ──────────────────────────────────────────────────────────────

function buildQuiz(mod) {
  const qhtml = mod.quiz.map(function(q, qi) {
    return '<div class="quiz-question" id="q-' + mod.id + '-' + qi + '">'
      + '<div class="quiz-q-num">Question ' + (qi + 1) + ' of ' + mod.quiz.length + '</div>'
      + '<div class="quiz-q-text">' + q.q + '</div>'
      + '<div class="quiz-options">'
      + q.options.map(function(opt, oi) {
          return '<div class="quiz-option" id="opt-' + mod.id + '-' + qi + '-' + oi + '" onclick="selectOption(\'' + mod.id + '\',' + qi + ',' + oi + ')">'
            + '<div class="quiz-option-dot"></div>' + opt + '</div>';
        }).join('')
      + '</div></div>';
  }).join('');

  return '<div class="quiz-section"><h2>🧠 Quiz</h2>'
    + '<p class="quiz-subtitle">Test your understanding of ' + mod.title + '.</p>'
    + qhtml
    + '<button class="quiz-check-btn" id="quiz-check-' + mod.id + '" onclick="checkQuiz(\'' + mod.id + '\')" disabled>Check Answers</button>'
    + '<div id="quiz-result-' + mod.id + '"></div></div>';
}

function selectOption(moduleId, qi, oi) {
  if (STATE.quizSubmitted) return;
  const mod = MODULES.find(function(m) { return m.id === moduleId; });
  if (!mod) return;
  mod.quiz[qi].options.forEach(function(_, idx) {
    const el = document.getElementById('opt-' + moduleId + '-' + qi + '-' + idx);
    if (el) el.classList.remove('selected');
  });
  const el = document.getElementById('opt-' + moduleId + '-' + qi + '-' + oi);
  if (el) el.classList.add('selected');
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
  const cls = pct >= 75 ? 'great' : pct >= 50 ? 'ok' : 'low';
  const msg = pct >= 75 ? 'Excellent! You\'ve mastered this topic.'
            : pct >= 50 ? 'Good effort! Review the sections you missed.'
            : 'Keep going! Re-read the content above and try again.';
  const rEl = document.getElementById('quiz-result-' + moduleId);
  if (rEl) {
    rEl.innerHTML = '<div class="quiz-result">'
      + '<div class="quiz-score ' + cls + '">' + score + '/' + mod.quiz.length + '</div>'
      + '<div class="quiz-result-msg">' + msg + '</div>'
      + '<button class="quiz-retry-btn" onclick="retryQuiz(\'' + moduleId + '\')">↺ Retry</button>'
      + '</div>';
  }
  setProgress(moduleId, pct >= 75 ? 'done' : 'partial');
}

function retryQuiz(moduleId) {
  STATE.quizAnswers   = {};
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
      navigator.clipboard.writeText(pre ? pre.textContent : '').then(function() {
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
  const ids = { 'theme-btn': toggleTheme, 'menu-btn': toggleSidebar, 'sidebar-close': toggleSidebar, 'home-link': showHome, 'breadcrumb-home': showHome };
  Object.keys(ids).forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', ids[id]);
  });
});
