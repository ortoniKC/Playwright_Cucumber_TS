Feature: Register User

@test
Scenario: Register new User
Given I navigate to the register page
When I created a new user
Then I conform user registeration is success
