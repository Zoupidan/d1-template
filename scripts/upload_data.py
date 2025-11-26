import argparse
import json
import sys
import requests

def run(base_url: str, password: str, file_path: str, api_token: str = ""):
    s = requests.Session()
    u = base_url.rstrip('/')
    if api_token:
        s.headers['Authorization'] = f'Bearer {api_token}'
    else:
        r = s.post(u + '/auth', json={'password': password}, allow_redirects=True, timeout=20)
        if r.status_code not in (200, 204, 302):
            print('login_failed', r.status_code)
            sys.exit(1)
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    pr = s.post(u + '/data', json=data, timeout=60)
    if pr.status_code not in (200, 204):
        print('upload_failed', pr.status_code)
        sys.exit(2)
    gr = s.get(u + '/data', timeout=20)
    if gr.status_code != 200:
        print('verify_failed', gr.status_code)
        sys.exit(3)
    print('ok', len(gr.text))

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--base-url', default='https://kongfuchong.fun')
    p.add_argument('--password', default='114198')
    p.add_argument('--file', default='data.json')
    p.add_argument('--api-token', default='')
    args = p.parse_args()
    run(args.base_url, args.password, args.file, args.api_token)

if __name__ == '__main__':
    main()
