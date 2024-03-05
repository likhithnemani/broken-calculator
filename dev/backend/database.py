import os
import psycopg2

create_connection = psycopg2.connect(host='ep-sparkling-wind-a4tod41r-pooler.us-east-1.aws.neon.tech',
                            database='verceldb',
                            user='default',
                            password='Nq8pxr9IWKAh',
                            port=5432,
                            )

print(create_connection)