should = require 'should'
spawn = require('child_process').spawn



it "should return the status code 1 if 'no' is given", (done) ->
  confirm = spawn('node', ['bin/confirm.js'])

  confirm.on 'close', (code) ->
    code.should.eql(1)
    done()

  confirm.stdin.write('no\n')



it "should return the status code 0 if 'yes' is given", (done) ->
  confirm = spawn('node', ['bin/confirm.js'])

  confirm.on 'close', (code) ->
    code.should.eql(1)
    done()

  confirm.stdin.write('no\n')



it "should not return at all if an invalid string is passed in", (done) ->
  confirm = spawn('node', ['bin/confirm.js'])

  confirm.on 'close', (code) ->
    should(0, "program closed; should not happen")

  confirm.stdin.write('somethingsomethingdark\n')
  setTimeout(done, 500)
