Feature: TaskPad UI
  Background:
    Given the TaskPad UI is open

  Scenario: Add task shows up in the list
    When I enter "Read book" into the new task field
    And I click "Add"
    Then I should see "Read book" in the task list

  Scenario: Add task with empty title is blocked with validation
    When I enter "" into the new task field
    And I click "Add"
    Then I should see a validation message
    And no new task should be added to the list

  Scenario: Add task with whitespace-only title is blocked with validation
    When I enter "   " into the new task field
    And I click "Add"
    Then I should see a validation message
    And no new task should be added to the list

  Scenario: Deleting a task removes it from the list
    Given a task "To delete" exists in the list
    When I click "Delete" for task "To delete"
    Then I should not see "To delete" in the task list
