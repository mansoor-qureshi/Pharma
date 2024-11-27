import boto3
import openai
import calendar
import base64
from datetime import datetime, timedelta
from typing import List, Union, Tuple
from django.conf import settings

def get_upcoming_days(day_name):
    # Create a mapping of day names to their corresponding numerical value
    day_mapping = {
        "MON": 0, "TUE": 1, "WED": 2,
        "THU": 3, "FRI": 4, "SAT": 5, "SUN": 6
    }

    # Get the numerical value of the input day name
    day_num = day_mapping.get(day_name.upper())
    if day_num is None:
        raise ValueError("Invalid day name. Please provide a valid day name like 'MON', 'TUE', etc.")

    # Get the current date
    today = datetime.now()

    # Calculate the difference between the input day and the current day
    days_until_next = (day_num - today.weekday() + 7) % 7

    # Create an empty list to store the dates
    upcoming_dates = []

    # Iterate through the next 3 months
    for _ in range(12):
        # Calculate the next occurrence of the input day
        next_day = today + timedelta(days=days_until_next)

        # Add the date to the list
        upcoming_dates.append(next_day.date())

        # Move to the next occurrence in the following week
        days_until_next += 7

        # If the next occurrence is in the next month, adjust the month
        if next_day.month != today.month:
            today = next_day.replace(day=1)  # Move to the first day of the next month
            days_until_next = (day_num - today.weekday() + 7) % 7

    return upcoming_dates

def get_half_hour_slots(start_time, end_time):

    start = datetime.combine(datetime.now().date(), start_time)
    end = datetime.combine(datetime.now().date(), end_time)

    slots = []
    while start < end:
        slot_end = start + timedelta(minutes=30)
        if slot_end > end:
            slot_end = end
        slots.append((start.strftime("%H:%M"), slot_end.strftime("%H:%M")))
        start = slot_end

    return slots

def get_gpt_reponse(prompt:str)->dict:
    openai.api_key = settings.OPENAPI_KEY
    response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    # model="gpt-4",
    # model="gpt-4-turbo",
    messages=[
        {"role": "system", "content": "You are a doctor."},
        {"role": "user", "content": prompt},
    ]
    )
    return response

def get_next_n_months(n=3):
    date_ranges = []
    today = datetime.now()
    current_month_start = today.replace(day=1) 
    current_month_end = (current_month_start.replace(day=calendar.monthrange(today.year,today.month)[1])).date()
    date_ranges.append((today.date(),current_month_end))
    for i in range(n):
        start_date = today.replace(day=1) + timedelta(days=calendar.monthrange(today.year,today.month)[1])
        end_date = start_date.replace(day=calendar.monthrange(start_date.year,start_date.month)[1])
        date_ranges.append((start_date.date(),end_date.date()))
        today = start_date
    return date_ranges

def generate_slots_for_date_range(start_date:datetime, end_date:datetime, day:int, day_start_time:datetime.time, day_end_time:datetime.time)->List:
    # print("KWARGS:",start_date,end_date,day,day_start_time,day_end_time)
    dates = []
    date = start_date
    while date <= end_date:
        if date.weekday() == day-1:
            dates.append(date)
        date+=timedelta(days=1)
    # print(dates)
    slots_for_day = []
    for date in dates:
        slots = []
        current_time = datetime.combine(date, day_start_time)
        end_time = datetime.combine(date, day_end_time)
        # print(current_time,end_time)
        while current_time<end_time:
            slots.append([current_time.strftime("%H:%M"), (current_time+timedelta(minutes=30)).strftime('%H:%M'),True])
            current_time += timedelta(minutes=30)
        slots_for_day.append({'date':date.strftime("%Y-%m-%d"),"slots":slots})
        # print(slots_for_day)
    
    return slots_for_day

################################################################################################

def fetch_bucket_s3(data_storage_type:str)->str:
    if data_storage_type in ['signature','prescription']:
        return settings.BUCKET_NAME

def img_to_obj_s3(base64_img_data:str, object_name:Union[str,None])->Tuple[str, str, str]:
    """
    Accepts base64 encoded str 
    returns minio compatible obj_data, obj_entension, obj_name in mini
    """
    img_format, img_str = base64_img_data.split(';base64,')
    extension = img_format.split('/')[-1]
    image_data = base64.b64decode(img_str)
    if object_name is None:
        current_time = datetime.now().strftime("%Y%m%d%H%M%S")
        object_name = '{}.{}'.format(current_time,extension)
    return image_data,extension,object_name

def fetch_object_path_s3(data_storage_type:str,**kwargs)->Tuple[str,Union[str,None]]:
    if data_storage_type in ['signature']:
        target_folder = kwargs['entity_name']  
        object_name = data_storage_type
    elif data_storage_type in ['prescription']:
        target_folder = kwargs['entity_name']
        object_name = None
    return target_folder,object_name

def fetch_object_data_s3(data_storage_type:str,base64_image_data:str,**kwargs)-> Tuple[str,str,str]:
    """
    Returns Minio Compatible object ContentFile, object extension, object path inside bucket
    """
    target_folder,object_name = fetch_object_path_s3(data_storage_type=data_storage_type,**kwargs)
    img_data, extension, object_name = img_to_obj_s3(base64_image_data, object_name=object_name)
    object_path = target_folder + "/" + object_name
    return img_data, extension, object_path

def upload_to_s3(data_storage_type:str,base64_image_data:str,**kwargs):
    s3_client = boto3.client(
        's3',
        aws_access_key_id = settings.S3_ACCESS_KEY,
        aws_secret_access_key = settings.S3_SECRET_KEY,
        region_name = settings.S3_AWS_REGION
    )
    img_data, extension, object_path = fetch_object_data_s3(
        data_storage_type=data_storage_type,
        base64_image_data=base64_image_data,
        **kwargs
    )
    s3_bucket = fetch_bucket_s3(data_storage_type)
    s3_key = kwargs['user_dir'] + '/' + object_path + '.' + extension

    s3_client.put_object(Body=img_data,Bucket=s3_bucket,Key=s3_key)

    url = s3_client.generate_presigned_url(
        'get_object',
        Params = {'Bucket':s3_bucket, 'Key':s3_key, 'ResponseContentDisposition': 'inline'},
        ExpiresIn = None
    )
    return url
