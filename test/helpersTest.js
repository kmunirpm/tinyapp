const { assert } = require('chai');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const generateUserHelpers = require('../helpers/userHelper');
const { findUserByEmail} = generateUserHelpers(testUsers);


describe('findUserByEmail', function() {
  it('should return null for invalid email', function() {
    const user = findUserByEmail("user3@example.com")
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });

  it('should return a userid with valid email', function() {
    const user = findUserByEmail("user@example.com")
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });


});