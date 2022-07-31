import os
import json
import requests

app_version = '2.0'
parse = json.loads
stringify = json.dumps


def download_file(url, filename):
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8000):
                f.write(chunk)
    print(f'File {filename} downloaded.')


def trim_str(string=''):
    bad = ['', ' ', '\n']
    if '  ' in string:
        split = string.split(' ')
        split = [s.strip() for s in split if s not in bad]
        string = " ".join(split)
    if '\n' in string:
        split = string.split('\n')
        split = [s.strip() for s in split if s not in bad]
        string = " ".join(split)
    return string


def to_path(category=''):
    split = category.split('\n')[1:]
    split = [s.replace(' ', '_').strip().lower() for s in split]
    return "/".join(split)


def handle_content(content: dict):
    content_type = content['type']
    product_name = content['productName']
    product_category = content['category']
    category_path = to_path(product_category)
    images = content['content']
    product_has_shades = len(images) > 1
    is_shade = 'shade' in content_type
    is_product = 'product' in content_type
    path_prefix = './'
    if is_shade:
        path_prefix += 'shades'
    elif is_product:
        path_prefix += 'products'
    is_nested_path = is_product and product_has_shades
    for image in images:
        name = image['name']
        name = trim_str(name).title()
        path = f'{path_prefix}/{category_path}/{product_name}'
        if is_nested_path:
            path = f'{path}/{name}'
        source = image['src']
        if not os.path.exists(path):
            os.makedirs(path)
        if type(source) is str:
            filename = f'{path}/{name}.jpg'
            download_file(source, filename)
        elif type(source) is list:
            for i, url in enumerate(source):
                filename = f'{path}/{name} {i + 1}.jpg'
                download_file(url, filename)
        else:
            print('Невідомий тип', type(source), source)


try:
    print(f'Hello World v{app_version}')
    cwd = os.getcwd()
    for _, _, files in os.walk(cwd):
        json_files = [f for f in files if '.json' in f]
        print(f'Знайдено {len(json_files)} файл(ів).')
        for jf in json_files:
            with open(jf, 'r', encoding='utf-8') as f:
                parsed = parse(f.read())
                handle_content(parsed)
        downloaded = './downloaded'
        if not os.path.exists(downloaded):
            os.makedirs(downloaded)
        for df in json_files:
            os.rename(df, f'{downloaded}/{df}')
        break
    input("Роботу завершено.")
except Exception as e:
    print('Не вдалося завантажити через помилку!', e, sep='\n')
    input("Зробіть скріншот та повідомте про помилку.")
