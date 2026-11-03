"""Smoke test S3-compatible storage (Silo/MinIO): bucket, upload, download."""
from __future__ import annotations

import os
import sys

import boto3

endpoint = os.environ.get("MINIO_ENDPOINT", "http://localhost:19000")
key = os.environ.get("MINIO_ACCESS_KEY", "minioadmin")
secret = os.environ.get("MINIO_SECRET_KEY", "minioadmin")
bucket = os.environ.get("MINIO_BUCKET_PROTOCOLS", "protocols")

s3 = boto3.client(
    "s3",
    endpoint_url=endpoint,
    aws_access_key_id=key,
    aws_secret_access_key=secret,
    region_name="us-east-1",
)
try:
    s3.create_bucket(Bucket=bucket)
except Exception as exc:  # noqa: BLE001 - BucketAlreadyOwnedByYou is fine
    print(f"create_bucket note: {exc}")

s3.put_object(Bucket=bucket, Key="smoke/test.txt", Body=b"vigistock-s3-ok")
data = s3.get_object(Bucket=bucket, Key="smoke/test.txt")["Body"].read()
assert data == b"vigistock-s3-ok", data
buckets = [b["Name"] for b in s3.list_buckets()["Buckets"]]
print(f"S3 PUT/GET OK: {data.decode()}")
print(f"BUCKETS: {buckets}")
sys.exit(0)
