import os.path as path
from os import listdir, remove
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.support import expected_conditions as ec
import pytest
from selenium import webdriver
from time import sleep

DOWNLOAD_PATH = path.abspath(path.join(__file__, '../downloads'))
DOCKERFILE_PATH = path.abspath(path.join(DOWNLOAD_PATH, 'DOCKERFILE.txt'))


@pytest.fixture(scope='module', autouse=True)
def browser():
    """
    | Pytest Fixture to initiate the browser instance

    :return: browser
    :rtype: webdriver
    """
    clean_download()
    chrome_options = webdriver.ChromeOptions()
    preferences = {
        'window-size': '1920,1080',
        'download.default_directory': DOWNLOAD_PATH
    }
    chrome_options.add_experimental_option('prefs', preferences)
    browser = webdriver.Chrome(options=chrome_options)
    browser.maximize_window()
    browser.implicitly_wait(10)
    browser.get("https://romanpulgrabja.github.io/FTP_POC/")  # go to URL of the index.html website
    yield browser


def clean_download():
    """
    | Cleans the download directory to ensure to check the current downloaded file

    :return: None
    """
    download_directory = path.abspath(path.join(__file__, '../downloads'))
    all_txt_files = [x for x in listdir(download_directory) if x.endswith('.txt')]
    for file in all_txt_files:
        remove(download_directory + '/' + file)
    sleep(0.5)  # time to have the file truly removed


def explicit_wait_visibility(browser, element, return_bool=False):
    """
    | A common method to explicitly check for an element with the condition of visibility

    :param bool return_bool: Set this to True if you want to return boolean values instead of the element,
        True for visible, False for not visible
    :param webdriver browser: The browser instance from the webdriver
    :param by element: The XPATH/ID of the element to look for
    :raises WebDriverException: If the desired element is not visible
    :return: element
    :rtype: webdriver element
    """
    if return_bool:
        waiting_time = 1
    else:
        waiting_time = 3
    try:
        x = WebDriverWait(browser, waiting_time).until(ec.visibility_of_element_located(element))
        if return_bool:
            return True
    except WebDriverException:
        if return_bool:
            return False
        raise WebDriverException('The desired element was not visible!')
    return x


def read_dockerfile_content():
    sleep(0.5)  # time to have the file truly downloaded and ready
    with open(DOCKERFILE_PATH, 'r') as f:
        content = f.read()
        return content
