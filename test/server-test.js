const assert = require('assert');
const app = require('../index');
const request = require('request');

describe('Server', () => {

  before((done) => {
    this.port = 9876;

    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    });
  });

  after(() => {
    this.server.close();
  });

  it('should exist', () => {
    assert(app);
  });

  describe('GET /', () => {
    it('should return a 200', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should have a body with the name of the application', (done) => {
      var title = 'Welcome to Inter-Personal Time';

      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(title),
            `"${response.body}" does not include "${title}".`);
        done();
      });
    });
  });

  describe('GET /admin-dashboard', () => {
    it('should return a 200', (done) => {
      this.request.get('/admin-dashboard', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should have a body with the page title', (done) => {
      var title = 'Admin Dashboard';
      var formTitle = 'Create New Time Slot'

        this.request.get('/admin-dashboard', (error, response) => {
          if (error) { done(error); }
          assert(response.body.includes(title),
              `"${response.body}" does not include "${title}".`);
          assert(response.body.includes(formTitle),
              `"${response.body}" does not include "${formTitle}".`);
          done();
        });
    });
  });

  describe('GET /admin-dashboard/schedule-id', () => {
    it('should return a 200', (done) => {

      var slot = {
        start: "3pm",
        end: "2pm",
        date: "1/2/16",
        comments: "meet with ian",
        scheduleId: "97de4a6ac8bea261037eae55794218b612730aec"
      };

      this.request.post('/admin-dashboard/slots', { form: slot }, function (error, response) {
      });

      this.request.get('/admin-dashboard/97de4a6ac8bea261037eae55794218b612730aec', function (error, response) {
        assert(response.body.includes("3pm"), "it should say the start");
        assert(response.body.includes("1/2/16"), "it should say the data");
        assert.equal(response.statusCode, 200);
        done();
      });

    });
  });

  describe('GET /scheduling-page/schedule-id', () => {
    it('should return a 200', (done) => {
      this.request.get('/scheduling-page/0166991a734ae5b1ef7a5cb31d52cbb595182899', function (error, response) {

        assert(response.body.includes("Start Time: a"), "it shoud say the start time");
        assert.equal(response.statusCode, 200);
        done();
      });
    });
  });
});
