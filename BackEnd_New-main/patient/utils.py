import boto3
from django.conf import settings

def upload_prescription_to_s3(patient_id:str,appointment_id:str,pdf_obj):
    s3_client = boto3.client(
                            's3',
                            aws_access_key_id = settings.S3_ACCESS_KEY,
                            aws_secret_access_key = settings.S3_SECRET_KEY,
                            region_name = settings.S3_AWS_REGION
                        )
    s3_bucket = settings.BUCKET_NAME
    s3_key = f"patient/{patient_id}/prescription_{str(appointment_id)}.pdf"
    s3_client.put_object(Body=pdf_obj,Bucket=s3_bucket,Key=s3_key)
    url = s3_client.generate_presigned_url(
        'get_object',
        Params = {'Bucket':s3_bucket, 'Key':s3_key , 'ResponseContentDisposition': 'inline'},
        ExpiresIn = None
    )
    return url