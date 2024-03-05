from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import hashlib

app = Flask(__name__)

# Replace 'your_username', 'your_password', 'your_host' and 'your_database' with your PostgreSQL credentials
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://default:Nq8pxr9IWKAh@ep-sparkling-wind-a4tod41r.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"
db = SQLAlchemy(app)

# Define your models (tables) here
class User(db.Model):
    email = db.Column(db.String, primary_key=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    salt = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<User %r>' % self.email

    # Custom hashing function
    def hash_password(self, password):
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return salt, key

    # Helper method to set password using the custom hashing function
    def set_password(self, password):
        self.salt, self.password_hash = self.hash_password(password)

    # Helper method to check password using the custom hashing function
    def check_password(self, password):
        _, key_to_check = self.hash_password(password)
        return self.password_hash == key_to_check



# Create tables


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        app.run(debug=True)
