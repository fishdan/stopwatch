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
TAG = "v1.0.1"

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
askpass_path = "/tmp/git-askpass-v101.sh"
with open(askpass_path, "w") as f: f.write(f'#!/bin/sh\necho "{token}"\n')
os.chmod(askpass_path, 0o700)
os.environ["GIT_ASKPASS"] = askpass_path

# Commit and Push
subprocess.run("git add . && git commit -m \"Bump version to 1.0.1 and fix package name\" && git push origin master", shell=True)

# Create Release
headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}
release_data = {
    "tag_name": TAG,
    "target_commitish": "master",
    "name": TAG,
    "body": "Version 1.0.1\n\n- Added auto-launch functionality for system overlay.\n- Standardized versioning across package.json and Android build config.\n- Fixed package name lint warning.",
    "draft": False,
    "prerelease": False
}
requests.post("https://api.github.com/repos/fishdan/stopwatch/releases", headers=headers, json=release_data)

# Upload APK
release = requests.get(f"https://api.github.com/repos/fishdan/stopwatch/releases/tags/{TAG}", headers=headers).json()
upload_url = release['upload_url'].split('{')[0]
with open("StopwatchApp/android/app/build/outputs/apk/release/app-release.apk", 'rb') as f:
    requests.post(upload_url, headers={'Authorization': f'token {token}', 'Content-Type': 'application/vnd.android.package-archive'}, params={'name': f'stopwatch-{TAG}.apk'}, data=f.read())

print(f"Release {TAG} successfully published.")
