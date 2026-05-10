# VET-SOURCE AWS Infrastructure
# Provisions: ECS (backend), RDS (PostgreSQL), ElastiCache (Redis), S3, ALB

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "vetsource-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region"    { default = "eu-west-1" }
variable "environment"   { default = "production" }
variable "db_password"   { sensitive = true }
variable "jwt_secret"    { sensitive = true }

locals {
  name = "vetsource-${var.environment}"
  tags = { Project = "VET-SOURCE", Environment = var.environment, ManagedBy = "Terraform" }
}

# ─── VPC ─────────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name}-vpc"
  cidr = "10.0.0.0/16"

  azs              = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets   = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = var.environment != "production"

  tags = local.tags
}

# ─── S3 (Document Storage) ─────────────────────────────
resource "aws_s3_bucket" "documents" {
  bucket = "vetsource-documents-${var.environment}"
  tags   = local.tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket                  = aws_s3_bucket.documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── RDS (PostgreSQL) ──────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-db-subnet"
  subnet_ids = module.vpc.private_subnets
  tags       = local.tags
}

resource "aws_security_group" "rds" {
  name   = "${local.name}-rds-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
  tags = local.tags
}

resource "aws_db_instance" "main" {
  identifier        = "${local.name}-postgres"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
  storage_encrypted = true

  db_name  = "vetsource_db"
  username = "vetsource"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  deletion_protection     = var.environment == "production"
  skip_final_snapshot     = var.environment != "production"

  tags = local.tags
}

# ─── ElastiCache (Redis) ───────────────────────────────
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name}-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name   = "${local.name}-redis-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
  tags = local.tags
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${local.name}-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  tags                 = local.tags
}

# ─── ECS (Backend API) ────────────────────────────────
resource "aws_security_group" "ecs" {
  name   = "${local.name}-ecs-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = local.tags
}

resource "aws_ecs_cluster" "main" {
  name = "${local.name}-cluster"
  tags = local.tags
}

# ─── Outputs ──────────────────────────────────────────
output "api_url"         { value = "https://${aws_lb.main.dns_name}" }
output "s3_bucket"       { value = aws_s3_bucket.documents.bucket }
output "db_endpoint"     { value = aws_db_instance.main.endpoint }
output "redis_endpoint"  { value = aws_elasticache_cluster.main.cache_nodes[0].address }
