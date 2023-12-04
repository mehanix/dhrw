import requests

def get_code(gitlab_link, access_token):
    req_headers = {
        "Private-Token": access_token
    }
    req = requests.get(gitlab_link, headers=req_headers)
    print("Req", req)
    if req.status_code == 200:
        return req.text
    else:
        raise Exception