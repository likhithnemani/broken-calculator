from flask import Flask, request, jsonify
import psycopg2
import hashlib
import os

from database import create_connection


app = Flask(__name__)

@app.route("/")
def home():
    return "CS161 - Broken Calculator Project (Likhith Nemani)"

def hash_password(password):
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt, key

# Signup API
@app.route('/signup', methods=['POST'])
def signup():
    print(request.get_json())
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    cursor = create_connection.cursor()

    try:
        salt, hashed_password = hash_password(password)
        cursor.execute(
            'INSERT INTO "user" (email, password_hash, salt, first_name, last_name) VALUES (%s, %s, %s, %s, %s)',
            (email, hashed_password, salt, first_name, last_name)
        )
        create_connection.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except psycopg2.IntegrityError:
        create_connection.rollback()
        return jsonify({'error': 'User with this email already exists'}), 400
    finally:
        create_connection.close()

# Login API
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT salt, password_hash FROM users WHERE email = %s', (email,))
    user_data = cursor.fetchone()
    conn.close()

    if user_data:
        salt, stored_password = user_data
        _, hashed_password = hash_password(password)
        if stored_password == hashed_password:
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid password'}), 401
    else:
        return jsonify({'error': 'User not found'}), 404