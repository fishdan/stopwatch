import time
import jwt
import requests
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import subprocess
import os

# Configuration from secrets/config.txt or hardcoded if necessary
APP_ID = "2461425"
INSTALLATION_ID = "99312625"
PRIVATE_KEY_PATH = "secrets/ai-codex-dan.2025-12-12.private-key.pem"

def get_installation_token():
    with open(PRIVATE_KEY_PATH, 'rb') as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password=None,
            backend=default_backend()
        )

    payload = {
        'iat': int(time.time()),
        'exp': int(time.time()) + 600,
        'iss': APP_ID
    }
    encoded_jwt = jwt.encode(payload, private_key, algorithm='RS256')

    headers = {
        'Authorization': f'Bearer {encoded_jwt}',
        'Accept': 'application/vnd.github.v3+json'
    }
    url = f'https://api.github.com/app/installations/{INSTALLATION_ID}/access_tokens'
    response = requests.post(url, headers=headers)
    response.raise_for_status()
    return response.json()['token']

def run_command(cmd, shell=False):
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=shell, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    return result.stdout

token = get_installation_token()

# Configure git
run_command(["git", "config", "user.name", "ai-codex-dan[bot]"])
run_command(["git", "config", "user.email", f"{APP_ID}+ai-codex-dan[bot]@users.noreply.github.com"])

# Create askpass script
askpass_path = "/tmp/git-askpass.sh"
with open(askpass_path, "w") as f:
    f.write(f'#!/bin/sh\necho "{token}"\n')
os.chmod(askpass_path, 0o700)

env = os.environ.copy()
env["GIT_ASKPASS"] = askpass_path

# Add, commit, and push
run_command(["git", "add", "."], shell=False)
run_command(["git", "commit", "-m", "Implement and polish Android System Overlay (SK-4, SK-6, SK-8)"], shell=False)
print(run_command(["git", "push", "origin", "master"], shell=False)) # Assuming master branch based on previous status

print("Push complete.")
