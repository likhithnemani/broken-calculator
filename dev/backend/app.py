import os
import jwt
import psycopg2
from flask_cors import CORS
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import json
import random
import itertools
# Load environment variables from .env file
load_dotenv()

# Defining database connection parameters
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DATABASE = os.getenv("POSTGRES_DATABASE")

# Initialize Flask application
app = Flask(__name__)
CORS(app)

# Define database connection parameters
db_params = {
    "host": POSTGRES_HOST,
    "database": POSTGRES_DATABASE,
    "user": POSTGRES_USER,
    "password": POSTGRES_PASSWORD,
    "port": "5432"
}

# Define a function to connect to the database
def connect_to_db():
    try:
        connection = psycopg2.connect(**db_params)
        cursor = connection.cursor()
        print("Connected to the database.")
        return connection, cursor
    except (Exception, psycopg2.Error) as error:
        print(f"Error connecting to the database: {error}")
        return None, None

# Define a function to close the database connection
def close_db_connection(connection, cursor):
    if connection:
        cursor.close()
        connection.close()
        print("Database connection closed.")


# Define the home route
@app.route('/')
def home():
    return {'message': 'Hello World'}, 200


# Define the middleware to read JWT from header
def read_jwt_from_header():
    print(request.headers)
    auth_token = request.headers.get('Auth-Token') or request.headers.get('auth-token') 
    
    if auth_token:
        try:
            # Decode the JWT
            decoded_token = jwt.decode(auth_token, options={"verify_signature": False})
            
            # Set the decoded token on the request object
            request.decoded_token = decoded_token

        except jwt.exceptions.InvalidTokenError as error:
            # Handle invalid token error
            print(f"Error decoding JWT: {error}")
            return {'message': 'Invalid auth-token'}, 500
    else:
        # Return an error if auth-token is not found in the headers
        return {'message': 'auth-token not found'}, 500


# Define the savegame route
@app.route('/login', methods=['POST'])
def login():
    read_jwt_from_header()
    connection, cursor = connect_to_db()

    if connection is None or cursor is None:
        return {'message': 'Error connecting to the database'}, 500

    try:
        # data = [(request.decoded_token.get('sub'), request.decoded_token.get('name'), request.decoded_token.get('picture'), body.get('score'))]
        # print(data)
        print(request.decoded_token.get('sub'))
        user_id = str(request.decoded_token.get('sub'))
        user_id_pattern = f'%{user_id}%'

        cursor.execute("SELECT * FROM users WHERE user_id LIKE %s", (user_id_pattern,))
        rows = cursor.fetchone()
        print(rows)

        if rows:
            data = {
                "user_id": str(rows[0]),
                "user_name": str(rows[1]),
                "email": str(rows[2]),
                "profile_pic": str(rows[3])
            }
            print(data)
            return {'data': data}, 200
        
        try:
            user_name = str(request.decoded_token.get('name'))
            user_name_pattern = f'%{user_name}%'

            email = request.decoded_token.get('email')
            email_pattern = f'%{email}'
            
            pic = request.decoded_token.get('picture')
            pic_pattern = f'%{pic}'

            cursor.execute("INSERT INTO users (user_id, user_name, email, profile_pic) VALUES (%s, %s, %s, %s)",
                       (user_id_pattern, user_name_pattern, email_pattern, pic_pattern))
            # Commit the transaction to persist the changes
            cursor.connection.commit()
        except Exception as e:
            # Handle exceptions (e.g., duplicate key violation)
            print("Error creating user:", e)
            cursor.connection.rollback()  # Rollback the transaction
            return None

        # Retrieve the newly created user details
        cursor.execute("SELECT * FROM users WHERE user_id LIKE %s", (user_id_pattern))
        new_user = cursor.fetchone()
        
        data = {
            "user_id": str(new_user[0]),
            "user_name": str(new_user[1]),
            "email": str(new_user[2]),
            "profile_pic": str(new_user[3])
        }

        print(data)

        return {'data': data}, 200

    except (Exception, psycopg2.Error) as error:
        print(f"Error checking for user: {error}")
        return {'message': 'Error logging user in'}, 500

    finally:
        # Close the database connection
        close_db_connection(connection, cursor)


def generate_expression(level):
    while True:
        if level == 'easy':
            target = random.randint(10, 50)
            numbers = random.sample(range(1, 10), 7)
            operators = ['*', '/', '+', '-']
        elif level == 'medium':
            target = random.randint(50, 100)
            numbers = random.sample(range(1, 10), 6)
            operators = ['*', '/', '-']
        else:
            target = random.randint(10, 100)
            numbers = random.sample(range(1, 10), 5)
            operators = ['*', '/']
    
        for combo in itertools.permutations(numbers):
            for ops in itertools.product(operators, repeat=3):
                expression = f"{combo[0]} {ops[0]} {combo[1]} {ops[1]} {combo[2]} {ops[2]} {combo[3]}"
                try:
                    result = eval(expression)
                    if result == target:
                        return expression, result, numbers, operators, target
                except ZeroDivisionError:
                    pass

@app.route('/target', methods=['POST'])
def findTarget():
    data = request.json
    level = data['level']
    expression, result, numbers, operators, target = generate_expression(level)
    response = {'expression': expression, 'result': result, 'target': target, 'operators': operators, 'numbers': numbers}
    return jsonify(response)


# Define the savegame route
@app.route('/savegame', methods=['POST'])
def saveGame():
    read_jwt_from_header()
    print(request.decoded_token)

    connection, cursor = connect_to_db()

    if connection is None or cursor is None:
        return {'message': 'Error connecting to the database'}, 500

    try:
        # Get the game data from the request body
        body = request.get_json()

        if not body:
            return {'message': 'Body required'}, 400

        if not all(key in body for key in ['duration', 'level', 'solved']):
            return {'message': 'Invalid body'}, 400

        # Prepare data for insertion
        data = (request.decoded_token.get('sub'), body['duration'], body['level'], body['solved'])

        # Execute the query
        cursor.execute("INSERT INTO leaderboard (user_id, duration, level, solved) VALUES (%s, %s, %s, %s)", data)
        connection.commit()

        return {'message': 'Game data saved successfully'}, 200

    except psycopg2.Error as error:
        print(f"Error saving game data: {error}")
        return {'message': 'Error saving game data'}, 500

    finally:
        # Close the database connection
        close_db_connection(connection, cursor)


# Define the leaderboard route
@app.route('/leaderboard', methods=['POST'])
def leaderboard():

    connection, cursor = connect_to_db()
    if connection is None or cursor is None:
        return {'message': 'Error connecting to the database'}, 500

    try:
        body = request.get_json()

        if not body:
            return {'message': 'Body required'}, 400

        if not all(key in body for key in ['level']):
            return {'message': 'Invalid body'}, 400
        
        data = (body['level'])

        
        # Execute the query to fetch data from the numrecall table
        
        print(data)
            
        cursor.execute("SELECT u.user_id, u.user_name, u.email, u.profile_pic, l.duration, l.level, l.solved FROM users u JOIN leaderboard l ON u.user_id = l.user_id WHERE l.level = (%s) ORDER BY l.duration ASC LIMIT 10", (data,))
        # Fetch all the rows from the result set
        rows = cursor.fetchall()
        # Create a list to store the leaderboard data
        leaderboard = []
        # Iterate over the rows and create a dictionary for each row
        for row in rows:
            leaderboard.append({
                'user_id': row[0],
                'user_name': row[1],
                'email': row[2],
                'profile_pic': row[3],
                'duration': row[4],
                'level': row[5],
                'solved': row[6]
            })
        # Return the leaderboard data as JSON
        return {'leaderboard': leaderboard}, 200
    except (Exception, psycopg2.Error) as error:
        print(f"Error fetching data from the database: {error}")
        return {'message': 'Error fetching data from the database'}, 500
    finally:
        # Close the database connection
        close_db_connection(connection, cursor)

# Run the Flask application
if __name__ == '__main__':
    connection, cursor = connect_to_db()    
    try:
        app.run(host='0.0.0.0', port=4000, debug=True)
    finally:
        close_db_connection(connection, cursor)











# from flask import Flask, request, jsonify
# import psycopg2
# import hashlib
# import os

# from database import create_connection


# app = Flask(__name__)

# @app.route("/")
# def home():
#     return "CS161 - Broken Calculator Project (Likhith Nemani)"

# def hash_password(password):
#     salt = os.urandom(32)
#     key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
#     return salt, key

# # Signup API
# @app.route('/signup', methods=['POST'])
# def signup():
#     print(request.get_json())
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')
#     first_name = data.get('first_name')
#     last_name = data.get('last_name')

#     cursor = create_connection.cursor()

#     try:
#         salt, hashed_password = hash_password(password)
#         cursor.execute(
#             'INSERT INTO "user" (email, password_hash, salt, first_name, last_name) VALUES (%s, %s, %s, %s, %s)',
#             (email, hashed_password, salt, first_name, last_name)
#         )
#         create_connection.commit()
#         return jsonify({'message': 'User registered successfully'}), 201
#     except psycopg2.IntegrityError:
#         create_connection.rollback()
#         return jsonify({'error': 'User with this email already exists'}), 400
#     finally:
#         create_connection.close()

# # Login API
# @app.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')

#     conn = create_connection()
#     cursor = conn.cursor()

#     cursor.execute('SELECT salt, password_hash FROM users WHERE email = %s', (email,))
#     user_data = cursor.fetchone()
#     conn.close()

#     if user_data:
#         salt, stored_password = user_data
#         _, hashed_password = hash_password(password)
#         if stored_password == hashed_password:
#             return jsonify({'message': 'Login successful'}), 200
#         else:
#             return jsonify({'error': 'Invalid password'}), 401
#     else:
#         return jsonify({'error': 'User not found'}), 404