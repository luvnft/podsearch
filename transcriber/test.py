from googlesearch import search
import asyncio

def main():
    print("Hello")
    d = search("Google", sleep_interval=5, num_results=5)
    urls = list(d)
    print(urls)
    

main()