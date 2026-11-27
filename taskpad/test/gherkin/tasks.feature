Feature: Task API
  Background:
    Given the TaskPad API is running

  Scenario: Create task with a valid title
    When I create a task with title "Buy milk"
    Then the response status should be 201
    And the response body should include an id
    And the response body title should be "Buy milk"

  Scenario: Create task with missing title
    When I create a task with title null
    Then the response status should indicate validation failure

  Scenario: Create task with empty title
    When I create a task with title ""
    Then the response status should indicate validation failure

  Scenario: Create task with whitespace-only title
    When I create a task with title "   "
    Then the response status should indicate validation failure

  Scenario: Create task trims leading/trailing spaces
    When I create a task with title "  Walk dog  "
    Then the response status should be 201
    And the created task title should be "Walk dog"

  Scenario: List tasks returns tasks in descending id order
    Given I have created tasks:
      | title     |
      | First     |
      | Second    |
    When I list tasks
    Then the response status should be 200
    And the response should be a JSON array
    And the first item title should be "Second"

  Scenario: Delete an existing task
    Given I have created a task with title "Temp"
    When I delete that task
    Then the response status should be 204
    And listing tasks should not include title "Temp"

  Scenario: Delete a non-existent task id is idempotent
    When I delete task id 999999
    Then the response status should be 204
