@disable:video @disable:screenshot @api @only
Feature: Posts API

  Scenario: Retrieve all posts
    When I send a GET request to "/posts"
    Then the response status code should be 200
    And the response should contain a list of posts

  Scenario: Retrieve a single post
    When I send a GET request to "/posts/18"
    Then the response status code should be 200
    And the response should contain the details of the post:
      | id     |                                                                                                                 18 |
      | title  | voluptate et itaque vero tempora molestiae                                                                         |
      | body   | eveniet quo quis\nlaborum totam consequatur non dolor\nut et est repudiandae\nest voluptatem vel debitis et magnam |
      | userId |                                                                                                                  2 |

  Scenario: Create a new post
    When I send a POST request to "/posts" with the following data:
      | title  | foo |
      | body   | bar |
      | userId |   1 |
    Then the response status code should be 201
    And the response should contain the newly created post:
      | title  | foo |
      | body   | bar |
      | userId |   1 |

  Scenario: Update a post
    When I send a PUT request to "/posts/1" with the following data:
      | id     |             1 |
      | title  | updated title |
      | body   | updated body  |
      | userId |             1 |
    Then the response status code should be 200
    And the response should contain the updated post:
      | id     |             1 |
      | title  | updated title |
      | body   | updated body  |
      | userId |             1 |

  Scenario: Partially update a post
    When I send a PATCH request to "/posts/1" with the following data:
      | id    |             1 |
      | title | patched title |
      | body  | patched body  |
    Then the response status code should be 200
    And the response should contain the partially updated post:
      | id     |             1 |
      | title  | patched title |
      | body   | patched body  |
      | userId |             1 |

  Scenario: Delete a post
    When I send a DELETE request to "/posts/1"
    Then the response status code should be 200
