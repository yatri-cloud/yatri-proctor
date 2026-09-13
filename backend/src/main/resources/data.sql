-- Seed access codes
INSERT INTO access_codes (id, code, candidate_name, exam_title, exam_code, duration_minutes, question_count, valid_until, created_at)
VALUES
  (1, '123456', 'Yatharth Chauhan',  'AWS Certified Solutions Architect – Associate', 'SAA-C03', 65, 20, TIMESTAMPADD(YEAR, 2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
  (2, '654321', 'Priya Sharma',       'AWS Certified Developer – Associate',            'DVA-C02', 65, 20, TIMESTAMPADD(YEAR, 2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
  (3, '111222', 'Rahul Verma',        'AWS Certified Cloud Practitioner',               'CLF-C02', 65, 20, TIMESTAMPADD(YEAR, 2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
  (4, '999888', 'Anita Patel',        'Microsoft Azure Administrator',                  'AZ-104',  65, 20, TIMESTAMPADD(YEAR, 2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP);

-- Seed questions
INSERT INTO questions (id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, created_at) VALUES
(1,  'IAM & Security',    'MEDIUM', 'A company needs to grant an EC2 instance access to an S3 bucket without embedding credentials. Which solution should be used?',
     'Create an IAM user with S3 permissions and embed the access keys',
     'Attach an IAM role with the required S3 permissions to the EC2 instance',
     'Store access keys in AWS Secrets Manager and retrieve at runtime',
     'Enable S3 bucket public access and remove bucket policies',
     'B', 'IAM roles for EC2 instances provide temporary credentials automatically rotated by AWS — no static keys needed.', CURRENT_TIMESTAMP),

(2,  'Compute',           'EASY',   'Which AWS service allows you to run code without provisioning or managing servers, charging only for compute time consumed?',
     'Amazon EC2 Auto Scaling', 'AWS Elastic Beanstalk', 'AWS Lambda', 'Amazon ECS on EC2',
     'C', 'AWS Lambda is the serverless compute service — you pay per invocation and per GB-second, not for idle time.', CURRENT_TIMESTAMP),

(3,  'Storage',           'MEDIUM', 'A company stores 50 TB of infrequently accessed data that must be retrieved within 12 hours. Which S3 storage class is most cost-effective?',
     'S3 Standard', 'S3 Intelligent-Tiering', 'S3 Glacier Flexible Retrieval', 'S3 One Zone-IA',
     'C', 'S3 Glacier Flexible Retrieval offers the lowest storage cost for data that can tolerate 1–12 hour retrieval times.', CURRENT_TIMESTAMP),

(4,  'Networking',        'MEDIUM', 'An application needs to distribute incoming HTTP/HTTPS traffic across multiple EC2 instances in different Availability Zones. Which service?',
     'Amazon Route 53 with latency-based routing', 'Application Load Balancer (ALB)', 'Network Load Balancer (NLB)', 'AWS Global Accelerator',
     'B', 'ALB operates at Layer 7, supports HTTP/HTTPS routing rules, and distributes across multiple AZs for high availability.', CURRENT_TIMESTAMP),

(5,  'Databases',         'MEDIUM', 'A team requires a fully managed relational database with automated backups, Multi-AZ deployments, and read replicas.',
     'Amazon DynamoDB', 'Amazon Redshift', 'Amazon RDS', 'Amazon ElastiCache',
     'C', 'Amazon RDS is the managed relational database service supporting MySQL, PostgreSQL, Oracle, SQL Server with built-in HA features.', CURRENT_TIMESTAMP),

(6,  'High Availability', 'HARD',   'A company runs a stateless web app and wants automatic scaling based on CPU usage with at least 2 instances across 3 AZs. Minimum ASG config?',
     'Min: 2, Max: 6, Desired: 2', 'Min: 3, Max: 6, Desired: 3', 'Min: 6, Max: 12, Desired: 6', 'Min: 2, Max: 3, Desired: 3',
     'B', 'With 3 AZs and a minimum of 2 per AZ constraint, you need min=3 to guarantee at least 1 per AZ.', CURRENT_TIMESTAMP),

(7,  'IAM & Security',    'EASY',   'Which AWS service provides a centralized view of security alerts and compliance status across multiple AWS accounts?',
     'AWS Shield', 'AWS Security Hub', 'Amazon GuardDuty', 'AWS Config',
     'B', 'AWS Security Hub aggregates security findings from multiple AWS services and third-party tools into a single dashboard.', CURRENT_TIMESTAMP),

(8,  'Cost Optimization', 'MEDIUM', 'A team has EC2 instances running steady-state workloads 24/7 for the next 3 years. Which purchasing option provides the greatest discount?',
     'On-Demand Instances', 'Spot Instances', '1-year Standard Reserved Instances (all upfront)', '3-year Standard Reserved Instances (all upfront)',
     'D', '3-year all-upfront Standard Reserved Instances provide up to 72% discount compared to On-Demand.', CURRENT_TIMESTAMP),

(9,  'Compute',           'HARD',   'An application processes video files asynchronously. Jobs arrive in bursts and can tolerate interruption. Which EC2 option minimizes cost?',
     'On-Demand Instances with Auto Scaling', 'Spot Instances with a Spot Fleet', 'Reserved Instances with Convertible type', 'Dedicated Hosts with On-Demand pricing',
     'B', 'Spot Instances offer up to 90% savings vs On-Demand. A Spot Fleet with diversified instance types minimizes interruption risk.', CURRENT_TIMESTAMP),

(10, 'Networking',        'MEDIUM', 'A company wants to restrict outbound internet traffic from private subnets while allowing instances to receive inbound connections. Which component?',
     'Internet Gateway', 'NAT Gateway', 'VPC Peering', 'Egress-Only Internet Gateway',
     'B', 'NAT Gateway allows instances in private subnets to initiate outbound internet connections while preventing unsolicited inbound connections.', CURRENT_TIMESTAMP),

(11, 'Databases',         'EASY',   'Which AWS service provides a fully managed, scalable NoSQL database with single-digit millisecond performance at any scale?',
     'Amazon Aurora', 'Amazon RDS for MySQL', 'Amazon DynamoDB', 'Amazon ElastiCache for Redis',
     'C', 'DynamoDB is AWS''s fully managed NoSQL database service designed for consistent single-digit millisecond performance at any scale.', CURRENT_TIMESTAMP),

(12, 'Monitoring',        'MEDIUM', 'An operations team needs to automatically restart an EC2 instance when CPU utilization drops to 0% (OS frozen). Which service enables this?',
     'AWS CloudTrail with Lambda triggers', 'Amazon CloudWatch Alarms with EC2 Recover action', 'AWS Systems Manager Automation', 'Amazon EventBridge with EC2 state change rules',
     'B', 'CloudWatch Alarms can trigger EC2 Recover or Reboot actions automatically when metric thresholds are breached.', CURRENT_TIMESTAMP),

(13, 'IAM & Security',    'HARD',   'A security team must ensure no S3 bucket in the organization can be made public, even by bucket owners. Which approach enforces this at org level?',
     'Enable S3 Block Public Access on each account individually',
     'Apply an SCP denying s3:PutBucketPublicAccessBlock',
     'Apply an SCP denying s3:PutBucketAcl and s3:PutBucketPolicy actions',
     'Enable AWS Config rule s3-bucket-public-read-prohibited',
     'C', 'An SCP applied at the organization or OU root level restricts all member accounts from performing the specified actions.', CURRENT_TIMESTAMP),

(14, 'Databases',         'MEDIUM', 'A read-heavy application uses Amazon RDS MySQL. Which feature reduces load on the primary instance without changing the connection string?',
     'Multi-AZ standby instance', 'Read Replicas with DNS-based routing', 'Amazon RDS Proxy', 'ElastiCache for Redis in front of the primary',
     'C', 'RDS Proxy maintains a connection pool, automatically routes read-only queries to replicas via reader endpoints, and reduces failover time.', CURRENT_TIMESTAMP),

(15, 'Compute',           'EASY',   'Which service enables you to run containerized applications without managing the underlying EC2 infrastructure?',
     'Amazon ECS on EC2', 'AWS Fargate', 'Amazon EC2 with Docker installed', 'AWS Elastic Beanstalk (Docker platform)',
     'B', 'AWS Fargate is the serverless compute engine for containers — AWS provisions and manages the underlying infrastructure.', CURRENT_TIMESTAMP),

(16, 'High Availability', 'MEDIUM', 'After enabling Auto Scaling on a stateless web app storing session data in memory, users are randomly logged out. What is the root cause?',
     'Auto Scaling terminates instances during scale-in events',
     'The ALB does not support sticky sessions',
     'Session data is not shared across EC2 instances',
     'IAM permissions prevent cross-instance communication',
     'C', 'In-memory sessions are instance-local. With multiple instances, requests may hit different instances that don''t have the session. Use ElastiCache.', CURRENT_TIMESTAMP),

(17, 'Cost Optimization', 'EASY',   'S3 objects are frequently accessed for 30 days then rarely accessed. Which lifecycle policy is most cost-effective?',
     'Transition to S3 Glacier Instant Retrieval after 30 days',
     'Transition to S3 Standard-IA after 30 days',
     'Transition to S3 Glacier Flexible Retrieval after 7 days',
     'Enable S3 Intelligent-Tiering on day 0',
     'B', 'S3 Standard-IA is cheaper for objects not accessed frequently but still needs millisecond retrieval.', CURRENT_TIMESTAMP),

(18, 'Monitoring',        'HARD',   'A team needs to trace requests from API Gateway through Lambda to DynamoDB to identify performance bottlenecks. Which service?',
     'Amazon CloudWatch Logs Insights', 'AWS X-Ray', 'AWS CloudTrail', 'Amazon Kinesis Data Firehose',
     'B', 'AWS X-Ray provides end-to-end distributed tracing, showing a service map and latency breakdown across each component.', CURRENT_TIMESTAMP),

(19, 'Networking',        'HARD',   'A hybrid cloud setup requires consistent, low-latency connectivity between an on-premises data center and an AWS VPC with guaranteed bandwidth.',
     'AWS Site-to-Site VPN', 'AWS Direct Connect', 'AWS Transit Gateway with VPN attachment', 'Amazon VPC Peering over the internet',
     'B', 'AWS Direct Connect provides a dedicated private network connection from on-premises to AWS, offering consistent latency and bandwidth.', CURRENT_TIMESTAMP),

(20, 'IAM & Security',    'MEDIUM', 'Which AWS feature encrypts data in transit between EC2 instances and S3, and between EC2 instances within a VPC, without code changes?',
     'AWS Certificate Manager (ACM) with private CAs',
     'S3 server-side encryption with KMS (SSE-KMS)',
     'VPC encryption using AWS Nitro System',
     'Amazon Macie data classification and encryption enforcement',
     'C', 'The AWS Nitro System provides automatic in-transit encryption for supported instance types within a VPC and to S3 — transparent to the application.', CURRENT_TIMESTAMP);

ALTER TABLE questions ALTER COLUMN id RESTART WITH 100;
ALTER TABLE access_codes ALTER COLUMN id RESTART WITH 100;
ALTER TABLE exam_sessions ALTER COLUMN id RESTART WITH 100;
