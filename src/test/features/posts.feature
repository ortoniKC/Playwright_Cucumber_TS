@api
Feature: Posts API

  Scenario: Retrieve all posts
    When I send a GET request to "/posts"
    Then the response status code should be 200
    And the response should contain a list of posts

  Scenario: Retrieve a single post
    When I send a GET request to "/posts/1"
    Then the response status code should be 200
    And the response should contain the details of the post:
      | id     | 1                   |
      | title  | sunt aut facere repellat provident occaecati excepturi optio reprehenderit |
      | body   | quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto |
      | userId | 1                   |

  Scenario: Create a new post
    When I send a POST request to "/posts" with the following data:
      | title  | foo                 |
      | body   | bar                 |
      | userId | 1                   |
    Then the response status code should be 201
    And the response should contain the newly created post:
      | title  | foo                 |
      | body   | bar                 |
      | userId | 1                   |

  Scenario: Update a post
    When I send a PUT request to "/posts/1" with the following data:
      | id     | 1                   |
      | title  | updated title       |
      | body   | updated body        |
      | userId | 1                   |
    Then the response status code should be 200
    And the response should contain the updated post:
      | id     | 1                   |
      | title  | updated title       |
      | body   | updated body        |
      | userId | 1                   |

  Scenario: Partially update a post
    When I send a PATCH request to "/posts/1" with the following data:
      | id     | 1                   |
      | title  | patched title       |
      | body   | patched body        |
    Then the response status code should be 200
    And the response should contain the partially updated post:
      | id     | 1                   |
      | title  | patched title       |
      | body   | patched body        |
      | userId | 1                   |

  Scenario: Delete a post
    When I send a DELETE request to "/posts/1"
    Then the response status code should be 200