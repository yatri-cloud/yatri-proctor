import { Question } from '@/contexts/ExamSessionContext'

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1, topic: 'IAM & Security', difficulty: 'medium',
    question: 'A company needs to grant an EC2 instance access to an S3 bucket without embedding credentials in the application code. Which solution should be used?',
    options: [
      { key: 'A', text: 'Create an IAM user with S3 permissions and embed the access keys in the application' },
      { key: 'B', text: 'Attach an IAM role with the required S3 permissions to the EC2 instance' },
      { key: 'C', text: 'Store access keys in AWS Secrets Manager and retrieve them at runtime' },
      { key: 'D', text: 'Enable S3 bucket public access and remove bucket policies' },
    ],
    correctAnswer: 'B',
    explanation: 'IAM roles for EC2 instances provide temporary credentials automatically rotated by AWS — no static keys needed.',
  },
  {
    id: 2, topic: 'Compute', difficulty: 'easy',
    question: 'Which AWS service allows you to run code without provisioning or managing servers, charging only for the compute time consumed?',
    options: [
      { key: 'A', text: 'Amazon EC2 Auto Scaling' },
      { key: 'B', text: 'AWS Elastic Beanstalk' },
      { key: 'C', text: 'AWS Lambda' },
      { key: 'D', text: 'Amazon ECS on EC2' },
    ],
    correctAnswer: 'C',
    explanation: 'AWS Lambda is the serverless compute service — you pay per invocation and per GB-second, not for idle time.',
  },
  {
    id: 3, topic: 'Storage', difficulty: 'medium',
    question: 'A company stores 50 TB of infrequently accessed data that must be retrieved within 12 hours. Which S3 storage class is most cost-effective?',
    options: [
      { key: 'A', text: 'S3 Standard' },
      { key: 'B', text: 'S3 Intelligent-Tiering' },
      { key: 'C', text: 'S3 Glacier Flexible Retrieval' },
      { key: 'D', text: 'S3 One Zone-IA' },
    ],
    correctAnswer: 'C',
    explanation: 'S3 Glacier Flexible Retrieval offers the lowest storage cost for data that can tolerate 1–12 hour retrieval times.',
  },
  {
    id: 4, topic: 'Networking', difficulty: 'medium',
    question: 'An application needs to distribute incoming HTTP/HTTPS traffic across multiple EC2 instances in different Availability Zones. Which service should be used?',
    options: [
      { key: 'A', text: 'Amazon Route 53 with latency-based routing' },
      { key: 'B', text: 'Application Load Balancer (ALB)' },
      { key: 'C', text: 'Network Load Balancer (NLB)' },
      { key: 'D', text: 'AWS Global Accelerator' },
    ],
    correctAnswer: 'B',
    explanation: 'ALB operates at Layer 7, supports HTTP/HTTPS routing rules, and distributes across multiple AZs for high availability.',
  },
  {
    id: 5, topic: 'Databases', difficulty: 'medium',
    question: 'A team requires a fully managed relational database with automated backups, Multi-AZ deployments, and read replicas. Which service should they use?',
    options: [
      { key: 'A', text: 'Amazon DynamoDB' },
      { key: 'B', text: 'Amazon Redshift' },
      { key: 'C', text: 'Amazon RDS' },
      { key: 'D', text: 'Amazon ElastiCache' },
    ],
    correctAnswer: 'C',
    explanation: 'Amazon RDS is the managed relational database service supporting MySQL, PostgreSQL, Oracle, SQL Server with built-in HA features.',
  },
  {
    id: 6, topic: 'High Availability', difficulty: 'hard',
    question: 'A company runs a stateless web application and wants automatic scaling based on CPU usage. The deployment must maintain at least 2 instances across 3 AZs. Which is the minimum Auto Scaling group configuration?',
    options: [
      { key: 'A', text: 'Min: 2, Max: 6, Desired: 2' },
      { key: 'B', text: 'Min: 3, Max: 6, Desired: 3' },
      { key: 'C', text: 'Min: 6, Max: 12, Desired: 6' },
      { key: 'D', text: 'Min: 2, Max: 3, Desired: 3' },
    ],
    correctAnswer: 'B',
    explanation: 'With 3 AZs and a minimum of 2 per AZ constraint, you need min=3 to guarantee at least 1 per AZ. Min=2 with 3 AZs could put both instances in the same AZ.',
  },
  {
    id: 7, topic: 'IAM & Security', difficulty: 'easy',
    question: 'Which AWS service provides a centralized view of security alerts and compliance status across multiple AWS accounts?',
    options: [
      { key: 'A', text: 'AWS Shield' },
      { key: 'B', text: 'AWS Security Hub' },
      { key: 'C', text: 'Amazon GuardDuty' },
      { key: 'D', text: 'AWS Config' },
    ],
    correctAnswer: 'B',
    explanation: 'AWS Security Hub aggregates security findings from multiple AWS services and third-party tools into a single dashboard.',
  },
  {
    id: 8, topic: 'Cost Optimization', difficulty: 'medium',
    question: 'A team has EC2 instances running steady-state workloads 24/7 for the next 3 years. Which purchasing option provides the greatest discount?',
    options: [
      { key: 'A', text: 'On-Demand Instances' },
      { key: 'B', text: 'Spot Instances' },
      { key: 'C', text: '1-year Standard Reserved Instances (all upfront)' },
      { key: 'D', text: '3-year Standard Reserved Instances (all upfront)' },
    ],
    correctAnswer: 'D',
    explanation: '3-year all-upfront Standard Reserved Instances provide up to 72% discount compared to On-Demand for predictable, long-running workloads.',
  },
  {
    id: 9, topic: 'Compute', difficulty: 'hard',
    question: 'An application processes video files asynchronously. Jobs arrive in bursts and can tolerate interruption. Which EC2 option minimizes cost?',
    options: [
      { key: 'A', text: 'On-Demand Instances with Auto Scaling' },
      { key: 'B', text: 'Spot Instances with a Spot Fleet' },
      { key: 'C', text: 'Reserved Instances with Convertible type' },
      { key: 'D', text: 'Dedicated Hosts with On-Demand pricing' },
    ],
    correctAnswer: 'B',
    explanation: 'Spot Instances offer up to 90% savings vs On-Demand. A Spot Fleet with diversified instance types minimizes interruption risk for batch workloads.',
  },
  {
    id: 10, topic: 'Networking', difficulty: 'medium',
    question: 'A company wants to restrict outbound internet traffic from private subnets while allowing instances to receive inbound connections. Which component provides this?',
    options: [
      { key: 'A', text: 'Internet Gateway' },
      { key: 'B', text: 'NAT Gateway' },
      { key: 'C', text: 'VPC Peering' },
      { key: 'D', text: 'Egress-Only Internet Gateway' },
    ],
    correctAnswer: 'B',
    explanation: 'NAT Gateway allows instances in private subnets to initiate outbound internet connections while preventing unsolicited inbound connections.',
  },
  {
    id: 11, topic: 'Storage', difficulty: 'easy',
    question: 'Which AWS service provides a fully managed, scalable NoSQL database with single-digit millisecond performance at any scale?',
    options: [
      { key: 'A', text: 'Amazon Aurora' },
      { key: 'B', text: 'Amazon RDS for MySQL' },
      { key: 'C', text: 'Amazon DynamoDB' },
      { key: 'D', text: 'Amazon ElastiCache for Redis' },
    ],
    correctAnswer: 'C',
    explanation: 'DynamoDB is AWS\'s fully managed NoSQL database service designed for consistent single-digit millisecond performance at any scale.',
  },
  {
    id: 12, topic: 'Monitoring', difficulty: 'medium',
    question: 'An operations team needs to automatically restart an EC2 instance when CPU utilization drops to 0% (indicating the OS has frozen). Which service enables this?',
    options: [
      { key: 'A', text: 'AWS CloudTrail with Lambda triggers' },
      { key: 'B', text: 'Amazon CloudWatch Alarms with EC2 Recover action' },
      { key: 'C', text: 'AWS Systems Manager Automation' },
      { key: 'D', text: 'Amazon EventBridge with EC2 state change rules' },
    ],
    correctAnswer: 'B',
    explanation: 'CloudWatch Alarms can trigger EC2 Recover or Reboot actions automatically when metric thresholds are breached, without human intervention.',
  },
  {
    id: 13, topic: 'IAM & Security', difficulty: 'hard',
    question: 'A security team must ensure that no S3 bucket in the organization can be made public, even by bucket owners. Which approach enforces this at the organization level?',
    options: [
      { key: 'A', text: 'Enable S3 Block Public Access on each account individually' },
      { key: 'B', text: 'Apply an AWS Organizations Service Control Policy (SCP) denying s3:PutBucketPublicAccessBlock' },
      { key: 'C', text: 'Apply an SCP denying s3:PutBucketAcl and s3:PutBucketPolicy actions' },
      { key: 'D', text: 'Enable AWS Config rule s3-bucket-public-read-prohibited' },
    ],
    correctAnswer: 'C',
    explanation: 'An SCP applied at the organization or OU root level restricts all member accounts — even root users — from performing the specified actions.',
  },
  {
    id: 14, topic: 'Databases', difficulty: 'medium',
    question: 'A read-heavy application uses Amazon RDS MySQL. Which feature reduces load on the primary instance without changing the application connection string?',
    options: [
      { key: 'A', text: 'Multi-AZ standby instance' },
      { key: 'B', text: 'Read Replicas with DNS-based routing' },
      { key: 'C', text: 'Amazon RDS Proxy' },
      { key: 'D', text: 'ElastiCache for Redis in front of the primary' },
    ],
    correctAnswer: 'C',
    explanation: 'RDS Proxy maintains a connection pool, automatically routes read-only queries to replicas via reader endpoints, and reduces failover time.',
  },
  {
    id: 15, topic: 'Compute', difficulty: 'easy',
    question: 'Which service enables you to run containerized applications without managing the underlying EC2 infrastructure?',
    options: [
      { key: 'A', text: 'Amazon ECS on EC2' },
      { key: 'B', text: 'AWS Fargate' },
      { key: 'C', text: 'Amazon EC2 with Docker installed' },
      { key: 'D', text: 'AWS Elastic Beanstalk (Docker platform)' },
    ],
    correctAnswer: 'B',
    explanation: 'AWS Fargate is the serverless compute engine for containers — you define CPU/memory, and AWS provisions and manages the underlying infrastructure.',
  },
  {
    id: 16, topic: 'High Availability', difficulty: 'medium',
    question: 'An application stores user session data in memory on a single EC2 instance. After enabling Auto Scaling, users are randomly logged out. What is the root cause?',
    options: [
      { key: 'A', text: 'Auto Scaling terminates instances during scale-in events' },
      { key: 'B', text: 'The ALB does not support sticky sessions' },
      { key: 'C', text: 'Session data is not shared across EC2 instances' },
      { key: 'D', text: 'IAM permissions prevent cross-instance communication' },
    ],
    correctAnswer: 'C',
    explanation: 'In-memory sessions are instance-local. With multiple instances behind an ALB, requests may hit different instances that don\'t have the session. Use ElastiCache or DynamoDB for distributed session storage.',
  },
  {
    id: 17, topic: 'Cost Optimization', difficulty: 'easy',
    question: 'A company has S3 objects that are frequently accessed for 30 days and then rarely accessed. Which lifecycle policy is most cost-effective?',
    options: [
      { key: 'A', text: 'Transition to S3 Glacier Instant Retrieval after 30 days' },
      { key: 'B', text: 'Transition to S3 Standard-IA after 30 days' },
      { key: 'C', text: 'Transition to S3 Glacier Flexible Retrieval after 7 days' },
      { key: 'D', text: 'Enable S3 Intelligent-Tiering on day 0' },
    ],
    correctAnswer: 'B',
    explanation: 'S3 Standard-IA is cheaper for objects not accessed frequently but still needs millisecond retrieval. Glacier has a 90-day minimum storage charge, making it suboptimal for a 30-day active phase.',
  },
  {
    id: 18, topic: 'Monitoring', difficulty: 'hard',
    question: 'A team needs to trace requests from an API Gateway through Lambda to DynamoDB to identify performance bottlenecks. Which service provides distributed tracing?',
    options: [
      { key: 'A', text: 'Amazon CloudWatch Logs Insights' },
      { key: 'B', text: 'AWS X-Ray' },
      { key: 'C', text: 'AWS CloudTrail' },
      { key: 'D', text: 'Amazon Kinesis Data Firehose' },
    ],
    correctAnswer: 'B',
    explanation: 'AWS X-Ray provides end-to-end distributed tracing, showing a service map and latency breakdown across each component of a request.',
  },
  {
    id: 19, topic: 'Networking', difficulty: 'hard',
    question: 'A hybrid cloud setup requires consistent, low-latency connectivity between an on-premises data center and an AWS VPC with guaranteed bandwidth. Which service should be used?',
    options: [
      { key: 'A', text: 'AWS Site-to-Site VPN' },
      { key: 'B', text: 'AWS Direct Connect' },
      { key: 'C', text: 'AWS Transit Gateway with VPN attachment' },
      { key: 'D', text: 'Amazon VPC Peering over the internet' },
    ],
    correctAnswer: 'B',
    explanation: 'AWS Direct Connect provides a dedicated private network connection from on-premises to AWS, offering consistent latency and bandwidth without traversing the public internet.',
  },
  {
    id: 20, topic: 'IAM & Security', difficulty: 'medium',
    question: 'Which AWS feature encrypts data in transit between EC2 instances and S3, and between EC2 instances within a VPC, without requiring application code changes?',
    options: [
      { key: 'A', text: 'AWS Certificate Manager (ACM) with private CAs' },
      { key: 'B', text: 'S3 server-side encryption with KMS (SSE-KMS)' },
      { key: 'C', text: 'VPC encryption using AWS Nitro System' },
      { key: 'D', text: 'Amazon Macie data classification and encryption enforcement' },
    ],
    correctAnswer: 'C',
    explanation: 'The AWS Nitro System provides automatic in-transit encryption for supported instance types within a VPC and to S3 — transparent to the application.',
  },
]

// Shuffle array using Fisher-Yates
export function shuffleQuestions(questions: Question[]): Question[] {
  const arr = [...questions]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
