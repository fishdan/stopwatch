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
run_command = lambda cmd: subprocess.run(cmd, shell=True, capture_output=True, text=True)

# Update git with askpass
askpass_path = "/tmp/git-askpass-auto.sh"
with open(askpass_path, "w") as f: f.write(f'#!/bin/sh\necho "{token}"\n')
os.chmod(askpass_path, 0o700)
os.environ["GIT_ASKPASS"] = askpass_path

subprocess.run("git add . && git commit -m \"Add auto-launch logic for system overlay\" && git push origin master", shell=True)

# Update Release Asset (Delete and re-upload is easiest via API)
headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}
release = requests.get("https://api.github.com/repos/fishdan/stopwatch/releases/tags/v1.0.0", headers=headers).json()
for asset in release['assets']:
    if asset['name'] == 'stopwatch-v1.0.0.apk':
        requests.delete(asset['url'], headers=headers)

upload_url = release['upload_url'].split('{')[0]
with open("StopwatchApp/android/app/build/outputs/apk/release/app-release.apk", 'rb') as f:
    requests.post(upload_url, headers={'Authorization': f'token {token}', 'Content-Type': 'application/vnd.android.package-archive'}, params={'name': 'stopwatch-v1.0.0.apk'}, data=f.read())

print("Update complete.")
