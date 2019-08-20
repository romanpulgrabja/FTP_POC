from selenium.webdriver.common.by import By

MODULE_SET_DROPDOWN = (By.ID, 'selectionPackage')
PORT_INPUT = (By.ID, 'port')
DOWNLOAD_BUTTON = (By.ID, 'downloadButton')
RESET_BUTTON = (By.XPATH, '//button[@type="reset"]')
ADVANCED_BUTTON = (By.ID, 'advancedButton')
PREVIEW_INPUT = (By.ID, 'recipe')
SYSTEM_DROPDOWN = (By.ID, 'selectionSystem')
NEW_PACKAGE_INPUT = (By.ID, 'chkBoxInput')
NEW_PACKAGE_PLUS_BUTTON = (By.XPATH, '//img[contains(@src, "plus")]')


def pass_checkbox(label_name):
    return By.XPATH, '//label[child::input[@type="checkbox"] and contains(., "{name}")]'.format(name=label_name)
