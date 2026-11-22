"""Generate a strong random SECRET_KEY for JWT signing.

Usage:  python generate_secret_key.py
"""
import secrets

print(secrets.token_hex(32))
