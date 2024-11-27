from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)

        public_domain = 'https://test.medimind.in'
        for key in ['next', 'previous']:
            if response.data.get(key):
                response.data[key] = response.data[key].replace('http://172.31.14.133:8001', public_domain)
        return response