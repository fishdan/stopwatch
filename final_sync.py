import time
import jwt
import requests
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import subprocess
import os

APP_ID = "2461425"
INSTALLATION_ID = "99312625"
PRIVATE_KEY_PATH = "secrets/ai-codex-dan.2025-12-12.private-key.pem"

def get_installation_token():
    with open(PRIVATE_KEY_PATH, 'rb') as f:
        private_key = serialization.load_pem_private_key(f.read(), password=None, backend=default_backend())
    payload = {'iat': int(time.time()), 'exp': int(time.time()) + 600, 'iss': APP_ID}
    encoded_jwt = jwt.encode(payload, private_key, algorithm='RS256')
    headers = {'Authorization': f'Bearer {encoded_jwt}', 'Accept': 'application/vnd.github.v3+json'}
    url = f'https://api.github.com/app/installations/{INSTALLATION_ID}/access_tokens'
    response = requests.post(url, headers=headers)
    response.raise_for_status()
    return response.json()['token']

token = get_installation_token()
askpass_path = "/tmp/git-askpass-final.sh"
with open(askpass_path, "w") as f: f.write(f'#!/bin/sh\necho "{token}"\n')
os.chmod(askpass_path, 0o700)
os.environ["GIT_ASKPASS"] = askpass_path

# Commit everything first
subprocess.run("git add .", shell=True)
subprocess.run('git commit -m "Auto-launch and final progress updates"', shell=True)

# Pull with rebase
subprocess.run("git pull --rebase origin master", shell=True)
# Push
subprocess.run("git push origin master", shell=True)
print("Final git sync complete.")
