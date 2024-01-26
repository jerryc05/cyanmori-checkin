import requests
import re

REGEX_TR = re.compile(r"<tr>\s*((?:.|\s)+?)\s*<\/tr>", re.UNICODE)
REGEX_TD = re.compile(r"<td>\s*(.+?)\s*<\/td>", re.UNICODE)


def main():
    with requests.Session() as sess:
        for page in range(1, 10):
            r = sess.post(
                url="https://srh.bankofchina.com/search/whpj/search_cn.jsp",
                data={"pjname": "美元", "page": page},
            )
            html = r.text
            for tr in REGEX_TR.findall(html):
                td_list = REGEX_TD.findall(tr)
                if not td_list:
                    continue
                print(td_list)
            break


if __name__ == "__main__":
    main()
