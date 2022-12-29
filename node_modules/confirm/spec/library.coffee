jscov = require 'jscov'
should = require 'should'
bufferstream = require 'bufferstream'
confirm = require(jscov.cover('..', 'lib', 'confirm'))



describe 'exports.confirm', ->

  it "respons ok given valid values", (done) ->

    output = new bufferstream()
    output.on 'data', (buffer) ->
      buffer.toString().should.eql 'This is a question '

    input = new bufferstream()
    confirm {
      stdin: input
      stdout: output
      query: 'This is a question'
      positive: 'yeah'
      negative: 'nay'
    }, (err, result) ->
      should.not.exist err
      result.should.eql false
      done()

    input.write("nay\n")
    input.end()
