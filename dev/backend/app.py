import os
import jwt
import psycopg2
from flask_cors import CORS
from flask import Flask, request
from dotenv import load_dotenv
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
@app.before_request
def read_jwt_from_header():
	if request.path == '/savegame':
		auth_token = request.headers.get('auth-token')
		if auth_token:
			try:
				decoded_token = jwt.decode(auth_token, options={"verify_signature": False})
				request.decoded_token = decoded_token

			except jwt.exceptions.InvalidTokenError as error:
				print(f"Error decoding JWT: {error}")
				return {'message': 'Invalid auth-token'}, 401
		else:
			return {'message': 'auth-token not found'}, 401


# Define the savegame route
@app.route('/savegame', methods=['POST'])
def saveGame():
    
	print(request.decoded_token)

	connection, cursor = connect_to_db()
	
	if connection is None or cursor is None:
		return {'message': 'Error connecting to the database'}, 500
	
	try:
		# Get the game data from the request body
		body = request.get_json()
		
		if not body:
			return {'message': 'body required'}, 500
		
		if not body.get('score'):
			return {'message': 'Invalid body'}, 500
		
		data = [(request.decoded_token.get('sub'), request.decoded_token.get('name'), request.decoded_token.get('picture'), body.get('score'))]
		print(data)
		cursor.executemany("INSERT INTO users (user_id, user_name, user_pic, score) VALUES (%s, %s, %s, %s)", data)
		connection.commit()
		
		return {'message': 'Game data saved successfully'}, 200
	
	except (Exception, psycopg2.Error) as error:
		print(f"Error saving game data: {error}")
		return {'message': 'Error saving game data'}, 500
	finally:
		# Close the database connection
		close_db_connection(connection, cursor)


# Define the leaderboard route
@app.route('/leaderboard')
def leaderboard():
	
	connection, cursor = connect_to_db()
	if connection is None or cursor is None:
		return {'message': 'Error connecting to the database'}, 500

	try:
		# Execute the query to fetch data from the numrecall table
		cursor.execute("SELECT user_id, user_name, user_pic, score FROM users ORDER BY score DESC LIMIT 10")
		# Fetch all the rows from the result set
		rows = cursor.fetchall()
		# Create a list to store the leaderboard data
		leaderboard = []
		# Iterate over the rows and create a dictionary for each row
		for row in rows:
			leaderboard.append({
				'user_id': row[0],
				'user_name': row[1],
    			'user_pic': row[2],
    			'score': row[3]
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
        app.run(host='0.0.0.0', port=4000, debug=False)
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