import subprocess
import time
import socket
import requests
import os
import sys

UVICORN_CMD = [
    sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8001"
]

def wait_for_port(host, port, timeout=10.0):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection((host, port), timeout=1.0):
                return True
        except Exception:
            time.sleep(0.2)
    return False

def main():
    print("Starting uvicorn:", " ".join(UVICORN_CMD))
    proc = subprocess.Popen(UVICORN_CMD, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    try:
        if not wait_for_port('127.0.0.1', 8001, timeout=15.0):
            print("ERROR: server did not open port 8001 within timeout")
            # capture stderr
            out, err = proc.communicate(timeout=1)
            print("--- uvicorn stdout ---")
            print(out)
            print("--- uvicorn stderr ---")
            print(err)
            proc.kill()
            return 1

        print("Server is up. Sending POST /generate_quiz")
        try:
            r = requests.post('http://127.0.0.1:8001/generate_quiz', json={'url':'https://en.wikipedia.org/wiki/Alan_Turing'}, timeout=30)
            print('STATUS', r.status_code)
            print(r.text)
        except Exception as e:
            print('Request failed:', e)

        # give server a moment to write logs
        time.sleep(0.5)
        # collect logs
        try:
            out, err = proc.communicate(timeout=1)
        except subprocess.TimeoutExpired:
            proc.kill()
            out, err = proc.communicate()

        print("--- uvicorn stdout ---")
        print(out)
        print("--- uvicorn stderr ---")
        print(err)

    finally:
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except Exception:
                proc.kill()

    return 0

if __name__ == '__main__':
    sys.exit(main())
