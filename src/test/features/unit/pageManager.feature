@disable:video @unit @pageless @only
Feature: PageManager

  Background: 
    Given I have created multiple pages with the following URLs and titles:
      | url                       | title          |
      | https://www.google.com    | Google         |
      | https://www.example.com   | Example Domain |
      | https://www.wikipedia.org | Wikipedia      |

  Scenario Outline: Select a page by index
    When I select a page by index <index>
    Then the selected page should be on the expected URL "<url>"
    And the selected page should have the expected title "<title>"

    Examples: 
      | index | url                       | title          |
      |     0 | https://www.google.com    | Google         |
      |     1 | https://www.example.com   | Example Domain |
      |     2 | https://www.wikipedia.org | Wikipedia      |

  Scenario Outline: Close page
    When I close pages with indexes "<indexes>"
    Then the closed pages should be closed
    And the page manager should have <remainingPages> pages remaining

    Examples: 
      | indexes | remainingPages |
      |       1 |              2 |
      |     0,1 |              1 |

  Scenario: Close all pages
    When I close all pages
    Then all pages should be closed
    And the page manager should be empty
    And the current page should be set to null

  Scenario: Close all other pages
    When I select a page by index <index>
    And I close all other pages except the current page
    Then all other pages should be closed
    And the page manager should only contain the current page

    Examples: 
      | index |
      |     0 |
      |     1 |
      |     2 |

  Scenario Outline: Get page by URL
    When I get a page by URL "<url>"
    Then the page with the matching URL should be returned

    Examples: 
      | url                       |
      | https://www.google.com    |
      | https://www.example.com   |
      | https://www.wikipedia.org |

  Scenario: Get page by title
    When I get a page by title "<title>"
    Then the page with the matching title "<title>" should be returned

    Examples: 
      | title          |
      | Google         |
      | Example Domain |
      | Wikipedia      |

  Scenario Outline: Select page by URL
    When I select a page by URL "<url>"
    Then the page with the matching URL should be selected

    Examples: 
      | url                       |
      | https://www.google.com    |
      | https://www.example.com   |
      | https://www.wikipedia.org |

  Scenario Outline: Select page by title
    When I select a page by title "<title>"
    Then the page with the matching title "<title>" should be selected

    Examples: 
      | title          |
      | Google         |
      | Example Domain |
      | Wikipedia      |

  Scenario: Get page count
    When I get the page count
    Then the page count should be 3

  Scenario Outline: Get current page index
    When I select a page by index <index>
    And I get the current page index
    Then the current page index should be <index>

    Examples: 
      | index |
      |     0 |
      |     1 |
      |     2 |

  Scenario Outline: Get page index by page object
    When I select a page by index <index>
    And I get the page index by page object
    Then the page index should be <index>

    Examples: 
      | index |
      |     0 |
      |     1 |
      |     2 |

  Scenario Outline: Switch to next page
    When I select a page by index <initialIndex>
    And I switch to the next page
    Then the current page should be at index <nextIndex>

    Examples: 
      | initialIndex | nextIndex |
      |            0 |         1 |
      |            1 |         2 |
      |            2 |         0 |

  Scenario Outline: Switch to previous page
    When I select a page by index <initialIndex>
    And I switch to the previous page
    Then the current page should be at index <previousIndex>

    Examples: 
      | initialIndex | previousIndex |
      |            0 |             2 |
      |            1 |             0 |
      |            2 |             1 |
