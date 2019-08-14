from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import WebDriverException, StaleElementReferenceException
from selenium.webdriver.support import expected_conditions as ec
import pytest
from time import sleep

# Locators collection
PACKAGE_DROPDOWN = (By.ID, 'selectionPackage')
STUDENT_RADIO = (By.ID, 'student')
PROFESSOR_RADIO = (By.ID, 'professor')
WORKER_RADIO = (By.ID, 'mitarbeiter')
PORT_INPUT = (By.ID, 'port')
BUILD_BUTTON = (By.ID, 'buildButton')
RESET_BUTTON = (By.XPATH, '//button[@type="reset"]')
ADVANCED_BUTTON = (By.ID, 'advancedButton')
CUSTOM_BUILD_BUTTON = (By.XPATH, '//button[@name="customBuild"]')
PREVIEW_INPUT = (By.ID, 'recipe')
GPP = (By.ID, 'g++')
IMAGEMAGICK = (By.ID, 'imagemagick')


# Common functions

@pytest.fixture(scope='module', autouse=True)
def browser():
    """
    | Pytest Fixture to initiate the browser instance

    :return: browser
    :rtype: webdriver
    """
    chrome_options = webdriver.ChromeOptions()
    preferences = {
        'window-size': '1920,1080'
    }
    browser = webdriver.Chrome(options=chrome_options)
    browser.maximize_window()
    browser.implicitly_wait(10)
    browser.get("https://romanpulgrabja.github.io/FTP_POC/")  # go to URL of the index.html website
    yield browser


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


# PyTest test functions

def test_buttons(browser):
    """
    | Tests if the buttons are visible as expected

    :param webdriver browser: The browser instance from the webdriver
    :raises AssertionError: If one of the buttons does not behave as expected
    :return: None
    """
    build_button = explicit_wait_visibility(browser, BUILD_BUTTON)
    explicit_wait_visibility(browser, RESET_BUTTON)
    advanced_button = explicit_wait_visibility(browser, ADVANCED_BUTTON)
    # check the advanced build button is not visible
    assert explicit_wait_visibility(browser, CUSTOM_BUILD_BUTTON, return_bool=True) is False, (
        'Custom Build Button was visible unlike expected!'
    )
    # now click Advanced button and check it is visible
    advanced_button.click()
    assert explicit_wait_visibility(browser, CUSTOM_BUILD_BUTTON, return_bool=True), (
        'Custom Build Button was not visible unlike expected!'
    )
    # check that the normal build button is disabled when the custom build button is visible
    assert build_button.get_attribute('disabled') == 'true', (
        'Normal Build Button was enabled unlike expected!'
    )
    # now check that the build button is enabled again and the custom build button not visible
    # once you click on advanced again
    advanced_button.click()
    sleep(0.5)  # wait for the button disappear animation
    assert explicit_wait_visibility(browser, CUSTOM_BUILD_BUTTON, return_bool=True) is False, (
        'Custom Build Button was visible unlike expected!'
    )
    assert build_button.get_attribute('dislabed') is None, (
        'Normal Build Button was disabled unlike expected!'
    )


def test_preview(browser):
    """
    | Tests the content of the preview if you change the selections

    :param webdriver browser: The browser instance from the webdriver
    :return: None
    """
    image_magick_input = explicit_wait_visibility(browser, IMAGEMAGICK)
    gpp_input = explicit_wait_visibility(browser, GPP)
    # select the two options
    image_magick_input.click()
    gpp_input.click()
    # open advanced mode
    advanced_button = explicit_wait_visibility(browser, ADVANCED_BUTTON)
    advanced_button.click()
    # get the preview content
    preview = explicit_wait_visibility(browser, PREVIEW_INPUT)
    preview_content = preview.get_attribute('value')
    # check that g++ and imagemagick are mentioned in it as selected
    assert 'g++' in preview_content, 'g++ was not in the preview content unlike expected!'
    assert 'imagemagick' in preview_content, 'imagemagick was not in the preview content unlike expected!'
    # unselect imagemagick again
    image_magick_input.click()
    # close and reopen advanced mode for refresh purposes
    advanced_button.click()
    sleep(0.5)
    advanced_button.click()
    # get current value of preview
    preview_content = preview.get_attribute('value')
    assert 'imagemagick' not in preview_content, 'imagemagick was in the preview content unlike expected!'


