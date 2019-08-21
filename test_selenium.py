from time import sleep
import locators
from commons import explicit_wait_visibility, clean_download, browser, DOCKERFILE_PATH, read_dockerfile_content
from selenium.webdriver.support.ui import Select


def test_preview(browser):
    """
    | Tests the content of the preview (Advanced mode) if you change the selections

    :param webdriver browser: The browser instance from the webdriver
    :raises AssertionError: If the preview content is not as expected
    :return: None
    """
    browser.refresh()
    image_magick_input = explicit_wait_visibility(browser, locators.pass_checkbox('imagemagick'))
    gpp_input = explicit_wait_visibility(browser, locators.pass_checkbox('g++'))
    # select the two options
    image_magick_input.click()
    gpp_input.click()
    # open advanced mode
    advanced_button = explicit_wait_visibility(browser, locators.ADVANCED_BUTTON)
    advanced_button.click()
    # get the preview content
    preview = explicit_wait_visibility(browser, locators.PREVIEW_INPUT)
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


def test_dockerfile_os_selection(browser):
    """
    | Tests the content of the dockerfile based on OS selections

    :param webdriver browser: The browser instance from the webdriver
    :raises AssertionError: If the content of the dockerfile is not as expected
    :return: None
    """
    browser.refresh()
    # selecting CentOS
    system_select = Select(explicit_wait_visibility(browser, locators.SYSTEM_DROPDOWN))
    system_select.select_by_visible_text('CentOS')
    # try with CentOS
    download_button = explicit_wait_visibility(browser, locators.DOWNLOAD_BUTTON)
    download_button.click()
    content = read_dockerfile_content()
    assert 'FROM educloud:centOS' in content, 'The selected OS was not found in the Dockerfile!'
    clean_download()
    # try with Ubuntu
    system_select.select_by_visible_text('Ubuntu')
    download_button.click()
    content = read_dockerfile_content()
    assert 'FROM educloud:ubuntu' in content, 'The selected OS was not found in the Dockerfile!'
    assert 'FROM educloud:centOS' not in content, 'An OS which was not selected was found in the Dockerfile!'
    clean_download()


def test_dockerfile_module_selection(browser):
    """
    | Tests the content of the dockerfile based on module selections

    :param webdriver browser: The browser instance from the webdriver
    :raises AssertionError: If the content of the dockerfile is not as expected
    :return: None
    """
    browser.refresh()
    # define the expected of each module set
    standard_expected = ('RUN pip3 install requests scrapy wxpython pillow sqlalchemy beautifulsoup '
                         'twisted numpy scipy matplotlib pygame pyglet pyqt pygtk scapy pywin32 '
                         'nltk nose sympy ipython')
    data_science_expected = ('RUN pip3 install numpy thano keras pytorch scipy pandas pybrain '
                             'scikit-learn matplotlib tensorflow seaborn bokeh plotly nltk '
                             'gensim scrapy3 statsmodels kivy pyqt opencv')
    machine_learning_expected = ('RUN pip3 install tensorflow scikit-learn numpy Keras pytorch '
                                 'torchvision lightgbm eli5 scipy Theano pandas')
    mathematics_expected = ('RUN pip3 install numpy pandas scipy matplotlib patsy sympy plotly '
                            'statsmodels adipy matalg27 mlpstyler')
    module_select = Select(explicit_wait_visibility(browser, locators.MODULE_SET_DROPDOWN))
    # try with Data Science module set
    module_select.select_by_visible_text('Data Science')
    download_button = explicit_wait_visibility(browser, locators.DOWNLOAD_BUTTON)
    download_button.click()
    first_content = read_dockerfile_content()  # get the dockerfile content
    assert data_science_expected in first_content, 'The Data Science module set was not found in the Dockerfile!'
    assert standard_expected not in first_content
    assert machine_learning_expected not in first_content
    assert mathematics_expected not in first_content
    clean_download()
    # try the same with Standard module set
    module_select.select_by_visible_text('Standard')
    download_button.click()
    second_content = read_dockerfile_content()
    assert standard_expected in second_content, 'The Standard module set was not found in the Dockerfile!'
    assert data_science_expected not in second_content
    assert machine_learning_expected not in second_content
    assert mathematics_expected not in second_content
    clean_download()
    # try the same with Mathematics module set
    module_select.select_by_visible_text('Mathematics')
    download_button.click()
    third_content = read_dockerfile_content()
    assert mathematics_expected in third_content, 'The Mathematics module set was not found in the Dockerfile!'
    assert data_science_expected not in third_content
    assert standard_expected not in third_content
    assert machine_learning_expected not in third_content
    clean_download()
    # try the same with Machine Learning module set
    module_select.select_by_visible_text('Machine Learning')
    download_button.click()
    fourth_content = read_dockerfile_content()
    assert machine_learning_expected in fourth_content, ('The Machine Learning module set was not found '
                                                         'in the Dockerfile!')
    assert data_science_expected not in fourth_content
    assert standard_expected not in fourth_content
    assert mathematics_expected not in fourth_content
    clean_download()


def test_dockerfile_sudo_access(browser):
    """
    | Tests the content of the dockerfile based on the Sudo Access selection

    :param webdriver browser: The browser instance from the webdriver
    :raises AssertionError: If the content of the dockerfile is not as expected
    :return: None
    """
    browser.refresh()
    sudo_input = explicit_wait_visibility(browser, locators.pass_checkbox('User has Sudo Access'))
    download_button = explicit_wait_visibility(browser, locators.DOWNLOAD_BUTTON)
    download_button.click()
    first_content = read_dockerfile_content()
    assert 'sudo usermod' not in first_content, 'Sudo could be found in the Dockerfile!'
    clean_download()
    sudo_input.click()  # tick the checkbox of Sudo Access on
    download_button.click()
    second_content = read_dockerfile_content()
    assert 'sudo usermod' in second_content, 'Sudo could not be found in the Dockerfile!'
    clean_download()


def test_dockerfile_packages(browser):
    """
    | Tests the content of the dockerfile based on Debian/Ubuntu package selections

    :param webdriver browser: The browser instance from the webdriver
    :raises AssertionError: If the content of the dockerfile is not as expected
    :return: None
    """
    browser.refresh()
    # find required elements
    libbz_input = explicit_wait_visibility(browser, locators.pass_checkbox('libbz2'))
    automake_input = explicit_wait_visibility(browser, locators.pass_checkbox('automake'))
    download_button = explicit_wait_visibility(browser, locators.DOWNLOAD_BUTTON)
    new_package_input = explicit_wait_visibility(browser, locators.NEW_PACKAGE_INPUT)
    plus_button = explicit_wait_visibility(browser, locators.NEW_PACKAGE_PLUS_BUTTON)
    # make selections
    libbz_input.click()
    automake_input.click()
    download_button.click()
    content = read_dockerfile_content()
    assert 'libbz2' in content, 'Libbz2 was not found in the Dockerfile!'
    assert 'automake' in content, 'Automake was not found in the Dockerfile!'
    clean_download()
    # undo selections
    libbz_input.click()
    automake_input.click()
    download_button.click()
    content = read_dockerfile_content()
    assert 'libbz2' not in content, 'Libbz2 was found in the Dockerfile!'
    assert 'automake' not in content, 'Automake was found in the Dockerfile!'
    clean_download()
    # create new input field
    new_package_input.send_keys('abcdefg')
    plus_button.click()
    new_package_input.send_keys('donotreadthis')
    plus_button.click()
    download_button.click()
    content = read_dockerfile_content()
    assert 'abcdefg' in content, 'The new package abcdefg was not found in the Dockerfile!'
    assert 'donotreadthis' in content, 'The new package donotreadthis was not found in the Dockerfile!'
    clean_download()


def test_dockerfile_port(browser):
    """
    | Tests the content of the dockerfile based on the exposed port

    :param webdriver browser: The browser instance from the webdriver
    :raises AssertionError: If the content of the dockerfile is not as expected
    :return: None
    """
    browser.refresh()
    port_input = explicit_wait_visibility(browser, locators.PORT_INPUT)
    download_button = explicit_wait_visibility(browser, locators.DOWNLOAD_BUTTON)
    # change the port number to 8329
    port_input.clear()
    port_input.send_keys(8329)
    download_button.click()
    content = read_dockerfile_content()
    assert 'EXPOSE 8329' in content, 'The set port was not found in the Dockerfile!'
    assert 'EXPOSE 8080' not in content, 'The default port was found in the Dockerfile!'
    clean_download()
    # try with port 1234
    port_input.clear()
    port_input.send_keys(1234)
    download_button.click()
    content = read_dockerfile_content()
    assert 'EXPOSE 1234' in content, 'The set port was not found in the Dockerfile!'
    assert 'EXPOSE 8080' not in content, 'The default port was found in the Dockerfile!'
    clean_download()
    # check now with default port 8080
    port_input.clear()
    download_button.click()
    content = read_dockerfile_content()
    assert 'EXPOSE 8080' in content, 'The default port was not found in the Dockerfile!'
    clean_download()


def test_preview_reset(browser):
    """
    | Tests the Reset button functionality for the preview in the advanced mode

    :param webdriver browser: The browser instance from the webdriver
    :raises AssertionError: If the content of the preview is not as expected
    :return: None
    """
    advanced_button = explicit_wait_visibility(browser, locators.ADVANCED_BUTTON)
    advanced_button.click()  # open the advanced mode
    reset_button = explicit_wait_visibility(browser, locators.RESET_BUTTON)
    preview_input = explicit_wait_visibility(browser, locators.PREVIEW_INPUT)
    preview_content = preview_input.get_attribute('value')  # get the content of the preview input field
    assert 'ratatatata' not in preview_content, 'Ratatatata was found in the preview unlike expected!'
    preview_input.send_keys('\nratatatata')  # send some keys to it in new line
    preview_content = preview_input.get_attribute('value')  # get new value of preview
    assert 'ratatatata' in preview_content, 'Ratatatata was not found unlike expected!'
    # go to reset the preview input field with the reset button
    reset_button.click()
    explicit_wait_visibility(browser, locators.RESET_POPUP).click()
    preview_content = preview_input.get_attribute('value')  # get content of preview after reset
    assert 'ratatatata' not in preview_content, 'Ratatatata was found in the preview after reset unlike expected!'
