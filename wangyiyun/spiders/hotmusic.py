# -*- coding: utf-8 -*-
import re
import scrapy
from ..jscode import JScode    # 执行JS脚本
from ..items import WangyiyunItem


class HotmusicSpider(scrapy.Spider):

    name = 'hotmusic'

    def start_requests(self):
        urls = ['http://music.163.com/']
        for i, url in enumerate(urls):
            yield scrapy.Request(url=url, meta={'cookiejar': i}, callback=self.parse)


    def parse(self, response):
        #解析主页,获取服务器返回的cookie
        yield scrapy.Request(url='http://music.163.com/discover/toplist?id=3778678',
                             meta={'cookiejar': response.meta['cookiejar']}, callback=self.one_parse)


    def one_parse(self, response):
        """解析云音乐热歌榜,拿到193首歌的ID"""
        reg = re.compile(r'<li><a href="/song\?id=(.*?)"', re.S)
        lis = re.findall(reg, response.text)
        for pid in lis:
            temp = '{"rid":"R_SO_4_' + pid + '","offset":"0","total":"true","limit":"20","csrf_token":""}'
            params, encSecKey = JScode.getrsa(temp)
            url = 'http://music.163.com/weapi/v1/resource/comments/R_SO_4_{0}?csrf_token='.format(pid)
            yield scrapy.FormRequest(url=url, formdata={'params': params, 'encSecKey': encSecKey},
                                     meta={'cookiejar': response.meta['cookiejar'],'page': 1, 'pid': pid}, callback=self.two_parse)


    def two_parse(self, response):
        """疯狂解析函数,解析计算的页数,抓取用户的评论"""
        reg = re.compile('"avatarUrl":"(.*?)".*?"userId":(.*?),"nickname":"(.*?)".*?"time":(.*?),"content":"(.*?)"', re.S)
        lis = re.findall(reg, response.text)
        total = re.search(r'"total":(.*?),', response.text, re.S).group(1)
        aoo = divmod(int(total), 20)
        # 歌曲评论的总页数
        if aoo[1] !=0:
            pages = aoo[0]+1
        else:
            pages = aoo[0]
        item = WangyiyunItem()
        for i in lis:
            item['avatarUrl'] = i[0]
            item['userid'] = i[1].partition(',')[0]
            item['nickname'] = i[2]
            item['time'] = i[3].partition(',')[0]
            item['content'] = i[4]

        yield item
        if response.meta['page']< pages:
            pid = response.meta['pid']
            temp = '{"rid":"R_SO_4_%s","offset":"%s","total":"false","limit":"20","csrf_token":""}' %(pid, response.meta['page']*20)
            params, encSecKey = JScode.getrsa(temp)
            url = 'http://music.163.com/weapi/v1/resource/comments/R_SO_4_{0}?csrf_token='.format(pid)
            response.meta['page'] += 1
            yield scrapy.FormRequest(url=url, formdata={'params': params, 'encSecKey': encSecKey},
                                     meta={'cookiejar': response.meta['cookiejar'], 'page': response.meta['page'], 'pid': pid},
                                     callback=self.two_parse)
