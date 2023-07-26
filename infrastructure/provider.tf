variable "TF_STATE_S3_BUCKET" {
  type = string
  description = "S3 bucket name for the tf-state. Provide as an env var like `TF_VAR_TF_STATE_S3_BUCKET=your-bucket-name`"
}

variable "TF_STATE_KEY" {
  type = string
  description = "Key for the tf-state. Provide as an env var like `TF_VAR_TF_STATE_KEY=your-state-key`"
}

variable "TF_REGION" {
  type = string
  description = "AWS region. Provide as an env var like `TF_VAR_TF_REGION=your-aws-region`"
}

terraform {
  required_version = ">= 0.13"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }
  backend "s3" {
    bucket = var.TF_STATE_S3_BUCKET
    key    = var.TF_STATE_KEY
    region = var.TF_REGION
  }
}

provider "aws" {
  region = var.TF_REGION
}
