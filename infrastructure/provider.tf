terraform {
  required_version = ">= 0.13"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }
  backend "s3" {
    bucket = "your-tf-state-s3-bucket-name-here"
    key    = "your-tf-state-key-here/terraform.state"
    region = "your-aws-region-here"
  }
}

provider "aws" {
  region = "your-aws-region-here"
}
