import os
import psycopg2

create_connection = psycopg2.connect(host='localhost',
                            database='postgres',
                            user='postgres',
                            password='postgrespw',
                            port=55000,
                            )

print(create_connection)