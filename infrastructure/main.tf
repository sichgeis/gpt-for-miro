variable "S3_BUCKET_NAME" {
  type = string
  description = "S3 bucket name for the static hosting of the app. Provide as an env var like `TF_VAR_S3_BUCKET=your-bucket-name`"
}

resource "aws_s3_bucket" "this" {
  bucket = var.S3_BUCKET_NAME
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.this.id

  index_document {
    suffix = "index.html"
  }

}

resource "aws_s3_bucket_cors_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_acl" "this" {
  bucket     = aws_s3_bucket.this.id
  acl        = "public-read"
  depends_on = [aws_s3_bucket_ownership_controls.this]
}

resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.this.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
  depends_on = [aws_s3_bucket_public_access_block.this]
}

resource "aws_iam_user" "this" {
  name = var.S3_BUCKET_NAME
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id
  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Principal = "*"
        Action    = [
          "s3:*",
        ]
        Effect   = "Allow"
        Resource = [
          "arn:aws:s3:::${var.S3_BUCKET_NAME}",
          "arn:aws:s3:::${var.S3_BUCKET_NAME}/*"
        ]
      },
      {
        Sid       = "PublicReadGetObject"
        Principal = "*"
        Action    = [
          "s3:GetObject",
        ]
        Effect   = "Allow"
        Resource = [
          "arn:aws:s3:::${var.S3_BUCKET_NAME}",
          "arn:aws:s3:::${var.S3_BUCKET_NAME}/*"
        ]
      },
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.this]
}
