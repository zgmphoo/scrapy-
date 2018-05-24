import execjs
import re

class JScode(object):
    """要执行的JS的类"""
    @classmethod
    def getrsa(cls, content):
        f = open(r'ceshi.js', 'rb').read().decode()
        result = execjs.compile(f).call('getAsrsea', content)
        params = re.search(r'params=(.*?)&', result, re.S).group(1)
        encSecKey = re.search(r'encSecKey=(.*?)&', result, re.S).group(1)
        return params, encSecKey
