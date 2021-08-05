const shell = require('../quantum/python').PythonShell;
const assert = require('chai').assert;
const dedent = require('dedent-js');

const NAME_ERROR = dedent(`
  Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
  NameError: name 'x' is not defined`);


describe('PythonShell', function() {
  describe('#constructor', function() {
    it('python path is default', async function() {
      assert.match(shell.path, /venv\/bin\/python|venv\/Scripts\/python.exe/);
    });

    it('process starts empty', async function() {
      assert.isUndefined(shell.process);
    });

    it('script starts empty', async function() {
      assert.strictEqual(shell.script, '');
    });
  });

  describe('#start', function() {
    afterEach(() => {
      shell.stop();
    });

    it('start new process', async function() {
      await shell.start();
      assert.isNotNull(shell.process);
    });

    it('no-op if process is already running', async function() {
      await shell.start();
      let process = shell.process;
      await shell.start();
      assert.strictEqual(shell.process, process);
    });

    it('return welcome message', async function() {
      let msg = await shell.start();
      assert.match(msg, /^Python 3./);
    });
  });

  describe('#stop', function() {
    beforeEach(async () => {
      await shell.start();
    });

    it('stop current process', function() {
      shell.stop();
      assert.isNull(shell.process);
    });

    it('no-op if process has already stopped', function() {
      shell.stop();
      let process = shell.process;
      shell.stop();
      assert.strictEqual(shell.process, process);
    });

    it('reset script', function() {
      shell.script = 'text';
      shell.stop();
      assert.strictEqual(shell.script, '');
    });
  });

  describe('#restart', function() {
    beforeEach(async () => {
      await shell.start();
    });
    afterEach(() => {
      shell.stop();
    });

    it('stop current process and start new process', async function() {
      let process = shell.process;
      await shell.restart();
      assert.notStrictEqual(shell.process, process);
    });

    it('start new process', async function() {
      shell.stop();
      await shell.restart();
      assert.isNotNull(shell.process);
    });

    it('reset script', async function() {
      shell.script = 'text';
      await shell.restart();
      assert.strictEqual(shell.script.trim(), '');
    });

    it('return welcome message', async function() {
      let msg = await shell.restart();
      assert.match(msg, /^Python 3./);
    });
  });

  describe('#execute', function() {
    beforeEach(async () => {
      await shell.start();
    });
    afterEach(() => {
      shell.stop();
    });

    it('return none on empty statement', async function() {
      let output = await shell.execute();
      assert.strictEqual(output, '');
    });

    it('return output on statement command', async function() {
      let output = await shell.execute('print("Text")');
      assert.strictEqual(output, 'Text');
    });

    it('return output on expression command', async function() {
      let output = await shell.execute('10 + 10');
      assert.strictEqual(output, '20');
    });

    it('return none on no-output command', async function() {
      let output = await shell.execute('x = 10');
      assert.strictEqual(output, '');
    });

    it('return output on multiple-statements command', async function() {
      let output = await shell.execute('print("Text"); print("More")');
      assert.strictEqual(output, 'Text\nMore');
    });

    it('return output on sequential commands', async function() {
      await shell.execute('x = 10');
      let output = await shell.execute('print(x)');
      assert.strictEqual(output, '10');
    });

    it('return output on block command', async function() {
      let input = `
        x = 10
        if x < 20:
          print(x)
        
        `;
      let output = await shell.execute(input);
      assert.strictEqual(output, '10');
    });

    it('return output on loop command', async function() {
      let input = `
        for i in range(3):
          print(i)
        
        print(i+1)
        `;
      let output = await shell.execute(input);
      assert.strictEqual(output, '0\n1\n2\n3');
    });

    xit('return error on invalid command', async function() {
      let output = await shell.execute('print(x)');
      assert.strictEqual(output, NAME_ERROR);
    });

    it('return output with callback', async function() {
      await shell.execute('print(10)', (err, data) => {
        assert.isNull(err);
        assert.strictEqual(data, '10');
      });
    });

    xit('return error with callback', async function() {
      await shell.execute('print(x)', (err, data) => {
        assert.strictEqual(err, NAME_ERROR);
        assert.isNull(data);
      });
    });

    it('return output with promise', async function() {
      let promise = shell.execute('print(10)');
      await promise
          .then((data) => {
            assert.strictEqual(data, '10');
          });
    });

    xit('return error with promise', async function() {
      let promise = shell.execute('print(x)');
      await promise
          .then((err) => {
            assert.strictEqual(err, NAME_ERROR);
          });
    });

    it('return outputs on parallel statement commands', async function() {
      let outputs = await Promise.all([
        shell.execute('print(1)'),
        shell.execute('print(2)'),
        shell.execute('print(3)'),
      ]);
      assert.deepEqual(outputs, ['1', '2', '3']);
    });

    it('return outputs on parallel loop commands', async () => {
      let outputs = await Promise.all([
        shell.execute('for i in range(0, 3): print(i)'),
        shell.execute('for i in range(3, 6): print(i)'),
        shell.execute('for i in range(6, 9): print(i)'),
      ]);
      assert.deepEqual(outputs, ['0\n1\n2', '3\n4\n5', '6\n7\n8']);
    });

    xit('return errors on parallel invalid commands', async () => {
      let outputs = await Promise.all([
        shell.execute('print(x)'),
        shell.execute('print(x)'),
      ]);
      assert.deepEqual(outputs, [NAME_ERROR, NAME_ERROR]);
    });

    xit('return errors and outputs on parallel mixed commands', async () => {
      let outputs = await Promise.all([
        shell.execute('print(x)'),
        shell.execute('x = 10'),
        shell.execute('print(x)'),
      ]);
      assert.deepEqual(outputs, [NAME_ERROR, '', '10']);
    });
  });
});
